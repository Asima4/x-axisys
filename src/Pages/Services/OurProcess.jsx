import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./Services.css";

const steps = [
  {
    number: 1,
    title: "Consultation",
    description:
      "Understanding your requirements, goals, and project constraints through detailed discussions.",
  },
  {
    number: 2,
    title: "Planning",
    description:
      "Developing comprehensive project plans with timelines, resources, and deliverables.",
  },
  {
    number: 3,
    title: "Execution",
    description:
      "Implementing solutions using cutting-edge technology and industry best practices.",
  },
  {
    number: 4,
    title: "Delivery",
    description:
      "Providing complete deliverables with ongoing support and maintenance options.",
  },
];

const OurProcess = () => {
  return (
    <section className="py-5">
      <Container>
        {/* Section Title */}
        <div className="text-center mb-5">
          <h2 className="section-title">Our Process</h2>
          <p className="section-subtitle">
            A streamlined approach that ensures quality, efficiency, and client satisfaction
            from initial consultation to project completion.
          </p>
        </div>

        {/* Steps */}
        <Row className="g-4">
          {steps.map((step) => (
            <Col key={step.number} xs={12} md={6} lg={3}>
              <Card className="process-card text-center h-100">
                <div className="step-circle mx-auto">{step.number}</div>
                <Card.Body>
                  <Card.Title className="process-title">{step.title}</Card.Title>
                  <Card.Text className="process-text">{step.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default OurProcess;
