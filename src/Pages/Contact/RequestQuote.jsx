import React, { useState } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import Select from "react-select";
import { CheckCircleFill, SendFill, Clock } from "react-bootstrap-icons";
import { FillButton } from "../../Components/Button/Buttons";
import './Contact.css'

export default function RequestQuote() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
  });

  const handleInputChange = (field, value) => {
    setApplicationForm({ ...applicationForm, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  // Data sources
  const services = [
    "Structural Engineering",
    "Architecture",
    "MEP Engineering",
    "Piping Engineering",
    "BIM Services",
    "3D Rendering & Animation",
    "Drone & Laser Scanning",
    "AI-Assisted Design",
    "AR/VR Integration",
    "Sustainability Consulting",
    "3D Printing & Prototypes",
    "General Inquiry",
  ];

  const budgetOptions = [
    { value: "under-10k", label: "Under $10,000" },
    { value: "10k-50k", label: "$10,000 - $50,000" },
    { value: "50k-100k", label: "$50,000 - $100,000" },
    { value: "100k-500k", label: "$100,000 - $500,000" },
    { value: "over-500k", label: "Over $500,000" },
    { value: "discuss", label: "Prefer to Discuss" },
  ];

  const timelineOptions = [
    { value: "urgent", label: "Urgent (1-2 weeks)" },
    { value: "short", label: "Short term (1-3 months)" },
    { value: "medium", label: "Medium term (3-6 months)" },
    { value: "long", label: "Long term (6+ months)" },
    { value: "flexible", label: "Flexible" },
  ];

  return (
    <div className="RequestQuote_main">
      <Container>
        <div className="mb-4">
          <h1 className="section-title text-center">Request a Quote</h1>
          <p className="section-subtitle text-center">
            Fill in your project details and we’ll get back to you soon.
          </p>
        </div>

        <Card className="application-card">
          <Card.Body className="p-4">
            {isSubmitted ? (
              <div className="text-center py-5">
                <CheckCircleFill className="success-icon mb-3" />
                <h3 className="text-white fw-bold mb-3">Message Sended!</h3>
                <p className="text-muted">
                  Thank you for reaching out. We’ll review your request and respond within 2–3 business days.
                </p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                <h1 className="section-title fs-5">Contact Information</h1>
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
                    <Form.Group controlId="company">
                      <Form.Label className="text-white">Company/Organization</Form.Label>
                      <Form.Control
                        type="text"
                        value={applicationForm.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h1 className="section-title fs-5 mt-4">Project Details</h1>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="projectType">
                      <Form.Label className="text-white">Service Required *</Form.Label>
                      <Select
                        options={services.map((s) => ({ value: s, label: s }))}
                        onChange={(opt) => handleInputChange("projectType", opt.value)}
                        placeholder="Select a service"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="budget">
                      <Form.Label className="text-white">Project Type</Form.Label>
                      <Select
                        options={budgetOptions}
                        onChange={(opt) => handleInputChange("budget", opt.value)}
                        placeholder="Select budget range"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="timeline">
                      <Form.Label className="text-white">Project Timeline</Form.Label>
                      <Select
                        options={timelineOptions}
                        onChange={(opt) => handleInputChange("timeline", opt.value)}
                        placeholder="Select timeline"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="timeline">
                      <Form.Label className="text-white">Project Timeline</Form.Label>
                      <Select
                        options={timelineOptions}
                        onChange={(opt) => handleInputChange("timeline", opt.value)}
                        placeholder="Select timeline"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label className="text-white">Project Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={applicationForm.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-center">
                  <FillButton
                    disabled={isSubmitting}
                    text={
                      isSubmitting ? (
                        <>
                          <Clock className="me-2 spin" /> Sending Message...
                        </>
                      ) : (
                        <>
                          <SendFill className="me-2" /> Send Message
                        </>
                      )
                    }
                  />
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
