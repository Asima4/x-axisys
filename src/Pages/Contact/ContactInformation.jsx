
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
    Phone,
    //   Mail,
    //   MessageSquare,
    Clock,
    //   ExternalLink,
    //   MapPin,
    Map,
    MapFill,
} from "react-bootstrap-icons";
import './ContactInformation.css'
import { ExternalLinkIcon, MailIcon, MapPinIcon, MessageSquareDot } from "lucide-react";

export default function ContactInformation() {
    const contactInfo = [
        {
            title: "India Office",
            icon: Map,
            details: [
                "123 Business Street, Mumbai",
                "Maharashtra, India",
                "+91 98765 43210",
            ],
        },
        {
            title: "USA Office",
            icon: MapFill,
            details: [
                "456 Corporate Ave, New York",
                "NY, USA",
                "+1 (212) 555-1234",
            ],
        },
    ];

    return (
        <>
            {/* Contact Info Section */}
            <section id="contact-info" className="contact-info-section py-5">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="section-title">Contact Information</h2>
                        <p className="section-subtitle">
                            Reach out to us through multiple channels. We're here to help with
                            your engineering needs across our global operations.
                        </p>
                    </div>

                    <Row>
                        {/* Contact Details */}
                        <Col lg={6} className="mb-4 bg-transparent">
                            <Card className="info-card">
                                <Card.Body>
                                    <h3 className="card-heading">Get in Touch</h3>

                                    <div className="info-item">
                                        <div className="icon-box">
                                            <Phone className="icon" />
                                        </div>
                                        <div>
                                            <p className="info-title">Phone</p>
                                            <p className="info-text">+91 XXX XXX XXXX</p>
                                            <p className="info-sub">Mon-Fri, 9 AM - 6 PM IST</p>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="icon-box">
                                            <MailIcon className="icon" />
                                        </div>
                                        <div>
                                            <p className="info-title">Email</p>
                                            <p className="info-text">info@axisys.com</p>
                                            <p className="info-sub">We respond within 24 hours</p>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="icon-box">
                                            <MessageSquareDot className="icon" />
                                        </div>
                                        <div>
                                            <p className="info-title">WhatsApp</p>
                                            <p className="info-text">+91 XXX XXX XXXX</p>
                                            <p className="info-sub">Quick inquiries & support</p>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="icon-box">
                                            <Clock className="icon" />
                                        </div>
                                        <div>
                                            <p className="info-title">Business Hours</p>
                                            <p className="info-text">
                                                Monday - Friday: 9:00 AM - 6:00 PM
                                            </p>
                                            <p className="info-sub">Saturday: 10:00 AM - 2:00 PM</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 text-center">
                                        <Button
                                            href="https://wa.me/91XXXXXXXXX"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-100 chat-btn"
                                        >
                                            {/* <ContactInformation className="me-2" /> */}
                                            Chat on WhatsApp
                                            <ExternalLinkIcon className="ms-2" />
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Company Details */}
                            <Card className="info-card mt-4 bg-transparent">
                                <Card.Body>
                                    <h3 className="card-heading">Company Details</h3>
                                    <div className="company-details">
                                        <p>
                                            <span>Company:</span> Axisys Global Engineering
                                        </p>
                                        <p>
                                            <span>PAN:</span> XXXXX0000X
                                        </p>
                                        <p>
                                            <span>GST:</span> 00XXXXX0000X0XX
                                        </p>
                                        <p>
                                            <span>CIN:</span> U00000XX0000XXX000000
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Global Locations */}
                        <Col lg={6}>
                            <h3 className="card-heading text-center mb-4">
                                Our Global Presence
                            </h3>
                            {contactInfo.map((location, index) => {
                                const IconComponent = location.icon;
                                return (
                                    <Card key={index} className="info-card mb-4">
                                        <Card.Body>
                                            <div className="d-flex align-items-center mb-3">
                                                <IconComponent className="icon-lg text-primary me-3" />
                                                <h4 className="info-title mb-0">{location.title}</h4>
                                            </div>
                                            <ul className="list-unstyled ms-4">
                                                {location.details.map((detail, idx) => (
                                                    <li key={idx} className="info-text">
                                                        • {detail}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                );
                            })}

                            {/* Map Placeholder */}
                            <Card className="info-card">
                                <Card.Body>
                                    <h4 className="card-heading">Location Map</h4>
                                    {/* <div className="map-placeholder">
                    <MapPinIcon className="map-icon" />
                    <p>Interactive map coming soon</p>
                  </div> */}
                                    <div className="map-container">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83924974074!2d77.06889991185785!3d28.527280345216634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3c5a1b1f03%3A0xf12ecf572c3b7d2f!2sDelhi!5e0!3m2!1sen!2sin!4v1694284598435!5m2!1sen!2sin"
                                            width="100%"
                                            height="350"
                                            style={{ border: 0, borderRadius: "12px" }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Delhi Location Map"
                                        ></iframe>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* FAQ Section */}
            <section className="faq-section py-5">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="section-title">Frequently Asked Questions</h2>
                        <p className="section-subtitle max-width text-center mx-auto">
                            Quick answers to common questions about our services and
                            processes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "How quickly can you start my project?",
                                a: "We can typically begin initial consultations within 24-48 hours of your inquiry. Project start times depend on scope and current capacity, but we strive to accommodate urgent requirements.",
                            },
                            {
                                q: "Do you work with international clients?",
                                a: "Yes, we serve clients globally with operations in India, expanding to the USA, and plans for Canada. We're experienced in working across time zones and international building standards.",
                            },
                            {
                                q: "What makes your AI-powered solutions different?",
                                a: "Our AI tools are specifically developed for engineering applications, including voice-driven modeling, automated inspections, and predictive analytics that significantly improve efficiency and accuracy.",
                            },
                            {
                                q: "Can you handle both small and large-scale projects?",
                                a: "Absolutely. Our scalable team and integrated services allow us to efficiently handle projects ranging from small residential designs to large industrial complexes.",
                            },
                        ].map((faq, i) => (
                            <Card key={i} className="faq-card mb-3">
                                <Card.Body>
                                    <h5 className="faq-question">{faq.q}</h5>
                                    <p className="faq-answer">{faq.a}</p>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>
        </>
    );
}
