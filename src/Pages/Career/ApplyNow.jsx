import React, { useState } from "react";
import { Card, Button, Form, Row, Col, Spinner, Container, CloseButton } from "react-bootstrap";
import { CheckCircleFill, Upload, SendFill, Clock } from "react-bootstrap-icons";
import { FillButton } from "../../Components/Button/Buttons";

const ApplyNow = () => {

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applicationForm, setApplicationForm] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        location: "",
        coverLetter: "",
        resume: null,
    });

    const handleInputChange = (field, value) => {
        setApplicationForm({ ...applicationForm, [field]: value });
    };

    const handleFileChange = (e) => {
        setApplicationForm({ ...applicationForm, resume: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };


    return (
        <>
            <div className="applynow_main pb-5">
                <Container>
                    <div className="mb-4">
                        <h1 className='section-title text-center'>Apply Now</h1>
                        <p className='section-subtitle max-width mx-auto text-center'>Ready to join our team? Submit your application and let's discuss how you can contribute to the future of engineering.</p>
                    </div>
                    <Card className="application-card">
                        <Card.Body className="p-4">
                            {isSubmitted && <CloseButton onClick={() => setIsSubmitted(false)} className="text-light bg-light ms-auto" color="#fff" />}
                            {isSubmitted ? (
                                <div className="text-center py-5">
                                    <CheckCircleFill className="success-icon mb-3" />
                                    <h3 className="text-white fw-bold mb-3">Application Submitted!</h3>
                                    <p className="text-muted">
                                        Thank you for your interest in joining Axisys. We'll review your application
                                        and get back to you within 5-7 business days.
                                    </p>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="name">
                                                <Form.Label className="text-white">Full Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={applicationForm.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="email">
                                                <Form.Label className="text-white">Email Address *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={applicationForm.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="phone">
                                                <Form.Label className="text-white">Phone Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={applicationForm.phone}
                                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="position">
                                                <Form.Label className="text-white">Position of Interest *</Form.Label>
                                                <Form.Select
                                                    value={applicationForm.position}
                                                    onChange={(e) => handleInputChange("position", e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select a position</option>
                                                    <option value="general">General Application</option>
                                                    {/* {careers.map((job) => (
                                                        <option key={job._id} value={job.jobTitle}>
                                                            {job.jobTitle}
                                                        </option>
                                                    ))} */}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="experience">
                                                <Form.Label className="text-white">Years of Experience *</Form.Label>
                                                <Form.Select
                                                    value={applicationForm.experience}
                                                    onChange={(e) => handleInputChange("experience", e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select experience level</option>
                                                    <option value="0-2">0-2 years</option>
                                                    <option value="3-5">3-5 years</option>
                                                    <option value="6-10">6-10 years</option>
                                                    <option value="10+">10+ years</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="location">
                                                <Form.Label className="text-white">Preferred Location</Form.Label>
                                                <Form.Select
                                                    value={applicationForm.location}
                                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                                >
                                                    <option value="">Select location</option>
                                                    <option value="india">India</option>
                                                    <option value="usa">USA</option>
                                                    <option value="canada">Canada</option>
                                                    <option value="remote">Remote</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3" controlId="coverLetter">
                                        <Form.Label className="text-white">Cover Letter *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            value={applicationForm.coverLetter}
                                            onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                                            placeholder="Tell us why you're interested in joining Axisys..."
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="resume">
                                        <Form.Label className="text-white">Resume/CV *</Form.Label>
                                        <div className="file-upload-wrapper">
                                            <Form.Control
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                required
                                            />
                                            <Upload className="upload-icon" />
                                        </div>
                                        <Form.Text className="text-muted">
                                            Accepted formats: PDF, DOC, DOCX (Max 5MB)
                                        </Form.Text>
                                    </Form.Group>
                                    <div className="d-flex justify-content-center">
                                        <FillButton
                                        disabled={isSubmitting}
                                        text=
                                        {isSubmitting ? (
                                            <>
                                                <Clock className="me-2 spin" /> Submitting Application...
                                            </>
                                        ) : (
                                            <>
                                                <SendFill className="me-2" /> Submit Application
                                            </>
                                        )}
                                    />
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Container>

            </div>
        </>
    )
}

export default ApplyNow
