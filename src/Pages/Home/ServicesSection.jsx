import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./ServicesSection.css";
import { FillButton } from "../../Components/Button/Buttons";

const ServicesSection = ({ services = [] }) => {
    const navigate = useNavigate()
    return (
        <section className="services-section py-5">
            <Container>
                {/* Section Title */}
                <div className="text-center mb-5">
                    <h2 className="services-title">
                        Our Core Services
                    </h2>
                    <p className="services-subtitle mx-auto">
                        Comprehensive engineering solutions spanning 11 integrated
                        disciplines, powered by cutting-edge technology and sustainable
                        practices.
                    </p>
                </div>

                <div className="services-wrapper position-relative">
                    {/* Coming Soon Overlay */}
                    {/* <div className="overlay d-flex flex-column align-items-center justify-content-center text-center">
                        <div className="icon-wrapper mb-3">
                            <i className="bi bi-cpu text-white"></i>
                        </div>
                        <h3 className="overlay-title">Services Coming Soon</h3>
                        <p className="overlay-text mx-auto">
                            We're preparing our comprehensive service offerings. Stay tuned
                            for exciting updates!
                        </p>
                        <FillButton onClick={() => navigate('/contact')} text={'Get Notified'} />
                    </div> */}

                    {/* Services Grid (Blurred) */}
                    <Row className="g-4 opacity-75">
                        {services?.map((service) => (
                            <Col key={service._id} xs={12} md={6} lg={4}>
                                <Card className="service-card h-100">
                                    <Card.Body>
                                        <div className="icon-box mb-3">
                                            <i className="bi bi-building text-white"></i>
                                        </div>
                                        <h3 className="service-name">{service.serviceName}</h3>
                                        <p className="service-desc">{service.serviceDescription}</p>
                                        {service.relatedTools && (
                                            <div className="d-flex flex-wrap gap-2">
                                                {service.relatedTools
                                                    ?.split(",")
                                                    ?.slice(0, 3)
                                                    ?.map((tool, index) => (
                                                        <Badge bg="secondary" key={index}>
                                                            {tool.trim()}
                                                        </Badge>
                                                    ))}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                <div className="text-center mt-4">
                    <FillButton text={
                        <span className="d-flex gap-2">
                            View All Services
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                            </svg>
                        </span>
                    } onClick={()=>navigate('/services')} />
                </div>
            </Container>
        </section>
    );
};

export default ServicesSection;
