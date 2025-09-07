import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./GlobalExcellence.css";

const GlobalExcellence = ({globalExcellence=[]}) => {
  return (
    <section className="py-5 global-excellence opacity-75">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <h2 className="section-title display-6 mb-3">
            Global Engineering Excellence
          </h2>
          <p className="section-subtitle mx-auto w-75">
            From our India headquarters to our expanding US operations, we
            deliver world-class engineering solutions across continents.
          </p>
        </div>

        {/* Dynamic Cards */}
        <Row className="g-4">
          {globalExcellence.map((service, index) => (
            <Col md={4} key={index}>
              <Card className="text-center h-100 excellence-card">
                <Card.Body>
                  <div className="icon-primary mb-3">{service.icon}</div>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default GlobalExcellence;
