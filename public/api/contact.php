<?php
/**
 * Form handler for the Axisys website (quote requests and job applications).
 * Runs on Hostinger shared hosting using PHP's mail().
 */
declare(strict_types=1);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
// Where submissions are delivered. This mailbox must exist in Hostinger → Emails.
const RECIPIENT = 'info@axisysglobal.com';
// Sender address. Must be a real mailbox on axisysglobal.com, or messages may be rejected as spam.
const FROM_ADDRESS = 'info@axisysglobal.com';
const SITE_NAME = 'Axisys Global Engineering';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const RATE_LIMIT_PER_HOUR = 5;
const MIN_FILL_SECONDS = 3;

// ---------------------------------------------------------------------------

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function respond(bool $ok, string $error = '', int $status = 200): void
{
    global $wantsJson;
    http_response_code($status);

    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
        exit;
    }

    if ($ok) {
        header('Location: /thank-you/', true, 303);
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    $msg = htmlspecialchars($error, ENT_QUOTES, 'UTF-8');
    echo "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
        . "<title>Form error</title><body style='font-family:system-ui,sans-serif;max-width:560px;margin:80px auto;padding:0 16px'>"
        . "<h1>We couldn’t send your message</h1><p>{$msg}</p><p><a href='javascript:history.back()'>&larr; Go back and try again</a></p>";
    exit;
}

/** Trim, remove control characters (keeping newlines if allowed) and cap length. */
function clean(string $key, int $max = 200, bool $multiline = false): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    $value = str_replace("\r\n", "\n", $value);
    $pattern = $multiline ? '/[\x00-\x09\x0B-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u';
    $value = trim((string) preg_replace($pattern, ' ', $value));
    return mb_substr($value, 0, $max, 'UTF-8');
}

function encodeHeader(string $text): string
{
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

function rateLimited(): bool
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = sys_get_temp_dir() . '/axisys_rl_' . sha1($ip) . '.json';
    $now = time();
    $hits = [];

    if (is_file($file)) {
        $hits = json_decode((string) file_get_contents($file), true) ?: [];
        $hits = array_values(array_filter($hits, fn($t) => is_int($t) && $t > $now - 3600));
    }
    if (count($hits) >= RATE_LIMIT_PER_HOUR) {
        return true;
    }
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

// ---------------------------------------------------------------------------
// Request checks
// ---------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Method not allowed.', 405);
}

// A request larger than post_max_size arrives with an empty $_POST.
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    respond(false, 'Your upload is too large. Please attach a file under 5 MB.', 413);
}

// Spam traps: hidden field filled in, or form submitted implausibly fast. Pretend success.
$started = (int) ($_POST['started'] ?? 0);
if (clean('website') !== '' || ($started > 0 && time() - $started < MIN_FILL_SECONDS)) {
    respond(true);
}

$type = clean('form_type', 20);
if (!in_array($type, ['quote', 'application'], true)) {
    respond(false, 'Invalid form submission.', 400);
}

$name = clean('name', 120);
$email = clean('email', 160);
$phone = clean('phone', 40);
$location = clean('location', 160);
$message = clean('message', 5000, true);

$errors = [];
if ($name === '') {
    $errors[] = 'Please enter your name.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

$fields = ['Name' => $name, 'Email' => $email, 'Phone' => $phone];
$attachment = null;

if ($type === 'quote') {
    $service = clean('service', 120);
    if ($service === '') {
        $errors[] = 'Please choose the service you need.';
    }
    if (mb_strlen($message, 'UTF-8') < 20) {
        $errors[] = 'Please add a little more detail about your project.';
    }
    $fields += [
        'Company' => clean('company', 160),
        'Service' => $service,
        'Timeline' => clean('timeline', 60),
        'Location' => $location,
    ];
    $subject = "New quote request — {$service} — {$name}";
} else {
    $role = clean('role', 120);
    $portfolio = clean('portfolio', 300);
    if ($role === '') {
        $errors[] = 'Please choose the role you are applying for.';
    }
    if ($portfolio !== '' && (!filter_var($portfolio, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $portfolio))) {
        $errors[] = 'Please enter a full portfolio link starting with https://';
    }

    $file = $_FILES['cv'] ?? null;
    if (!$file || !is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        $errors[] = 'Please attach your CV.';
    } elseif (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) || $file['size'] > MAX_UPLOAD_BYTES) {
        $errors[] = 'Your CV is too large. Please upload a file under 5 MB.';
    } elseif ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
        $errors[] = 'Your CV could not be uploaded. Please try again.';
    } else {
        $ext = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        $allowed = [
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword', 'application/CDFV2', 'application/x-ole-storage', 'application/vnd.ms-office'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        ];
        $mimeOk = true;
        if (isset($allowed[$ext]) && class_exists('finfo')) {
            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']) ?: '';
            $mimeOk = in_array($mime, $allowed[$ext], true);
        }
        if (!isset($allowed[$ext]) || !$mimeOk) {
            $errors[] = 'Please upload your CV as a PDF or Word document.';
        } else {
            $slug = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower($name)), '-') ?: 'applicant';
            $attachment = [
                'name' => "CV-{$slug}.{$ext}",
                'mime' => $allowed[$ext][0],
                'data' => (string) file_get_contents($file['tmp_name']),
            ];
        }
    }

    $fields += [
        'Role' => $role,
        'Experience' => clean('experience', 40),
        'Location' => $location,
        'Portfolio' => $portfolio,
    ];
    $subject = "New job application — {$role} — {$name}";
}

if ($errors) {
    respond(false, implode(' ', $errors), 422);
}

// Only valid submissions count towards the limit.
if (rateLimited()) {
    respond(false, 'Too many submissions from your connection. Please try again later.', 429);
}

// ---------------------------------------------------------------------------
// Build and send the email
// ---------------------------------------------------------------------------

$lines = [];
foreach ($fields as $label => $value) {
    if ($value !== '') {
        $lines[] = str_pad($label . ':', 12) . $value;
    }
}
$body = implode("\n", $lines);
if ($message !== '') {
    $body .= "\n\n" . ($type === 'quote' ? 'Project details' : 'Message') . ":\n" . $message;
}
$body .= "\n\n—\nSent from the " . SITE_NAME . ' website on ' . gmdate('Y-m-d H:i') . " UTC\nIP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

$headers = [
    'From: ' . encodeHeader(SITE_NAME . ' Website') . ' <' . FROM_ADDRESS . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'X-Mailer: PHP',
];

if ($attachment) {
    $boundary = 'axisys_' . bin2hex(random_bytes(12));
    $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";
    $content = "--{$boundary}\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($body)) . "\r\n"
        . "--{$boundary}\r\n"
        . "Content-Type: {$attachment['mime']}; name=\"{$attachment['name']}\"\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . "Content-Disposition: attachment; filename=\"{$attachment['name']}\"\r\n\r\n"
        . chunk_split(base64_encode($attachment['data'])) . "\r\n"
        . "--{$boundary}--";
} else {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: base64';
    $content = chunk_split(base64_encode($body));
}

$sent = mail(RECIPIENT, encodeHeader($subject), $content, implode("\r\n", $headers), '-f' . FROM_ADDRESS);

if (!$sent) {
    error_log('Axisys form: mail() failed for ' . $type);
    respond(false, 'Sorry, your message could not be sent right now. Please try again in a few minutes.', 500);
}

respond(true);
