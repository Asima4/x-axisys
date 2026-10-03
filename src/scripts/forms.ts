// Progressive enhancement for forms posting to /api/contact.php.
// Without JavaScript the form still posts normally and the PHP handler redirects.

const successIcon =
  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function fieldLabel(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const label = el.id ? document.querySelector(`label[for="${el.id}"]`) : null;
  return (label?.textContent ?? 'This field').replace('*', '').trim();
}

function clearErrors(form: HTMLFormElement) {
  form.querySelectorAll('.field__error').forEach((e) => e.remove());
  form.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
}

function showError(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, message: string) {
  el.setAttribute('aria-invalid', 'true');
  const err = document.createElement('p');
  err.className = 'field__error';
  err.id = `${el.id}-error`;
  err.textContent = message;
  el.setAttribute('aria-describedby', err.id);
  el.closest('.field')?.append(err);
}

function validate(form: HTMLFormElement) {
  clearErrors(form);
  let first: HTMLElement | null = null;

  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((el) => {
    if (el.type === 'hidden' || el.closest('.form__hp')) return;

    let message = '';
    const v = el.validity;
    if (v.valueMissing) message = `Please complete “${fieldLabel(el)}”.`;
    else if (v.typeMismatch && el.type === 'email') message = 'Enter a valid email address.';
    else if (v.typeMismatch && el.type === 'url') message = 'Enter a full link starting with https://';
    else if (v.tooShort) message = `Please add a little more detail (at least ${(el as HTMLTextAreaElement).minLength} characters).`;
    else if (!v.valid) message = `Check ${fieldLabel(el).toLowerCase()}.`;

    if (!message && el instanceof HTMLInputElement && el.type === 'file' && el.files?.[0]) {
      const maxMb = Number(el.dataset.maxMb || 5);
      const file = el.files[0];
      if (file.size > maxMb * 1024 * 1024) message = `File is too large — maximum ${maxMb} MB.`;
      else if (!/\.(pdf|docx?)$/i.test(file.name)) message = 'Upload a PDF or Word document.';
    }

    if (message) {
      showError(el, message);
      first ??= el;
    }
  });

  (first as HTMLElement | null)?.focus();
  return !first;
}

document.querySelectorAll<HTMLFormElement>('form[data-ajax-form]').forEach((form) => {
  const started = form.querySelector<HTMLInputElement>('[data-started]');
  if (started) started.value = String(Math.floor(Date.now() / 1000));

  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const button = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const label = button.querySelector<HTMLElement>('[data-label]')!;
  const idleLabel = label.textContent;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    if (!validate(form)) return;

    button.disabled = true;
    label.textContent = 'Sending…';

    let serverError = '';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        serverError = typeof data?.error === 'string' ? data.error : '';
        throw new Error('send-failed');
      }

      const isApplication = form.querySelector<HTMLInputElement>('[name="form_type"]')?.value === 'application';
      const wrap = document.createElement('div');
      wrap.className = 'form-success';
      wrap.setAttribute('tabindex', '-1');
      wrap.innerHTML = `
        <div class="form-success__icon">${successIcon}</div>
        <h3></h3>
        <p></p>`;
      wrap.querySelector('h3')!.textContent = isApplication ? 'Application received' : 'Thank you — your enquiry is in';
      wrap.querySelector('p')!.textContent = isApplication
        ? 'Thanks for your interest in Axisys. Our team reviews every application and will contact you if your profile matches a current need.'
        : 'Our engineering team will review your project and get back to you within one to two business days.';
      form.replaceWith(wrap);
      wrap.focus();
    } catch {
      status.textContent = serverError || 'Sorry, your message could not be sent right now. Please try again in a few minutes.';
      button.disabled = false;
      label.textContent = idleLabel;
    }
  });
});
