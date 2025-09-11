import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Services.css";
import { FillButton, OuterButton } from "../../Components/Button/Buttons";

const CTASection = () => {
  return (
    <section className="cta-wrapper py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="cta-card text-center p-5">
              <Card.Body>
                <h2 className="section-title mb-4">
                  Ready to Get Started?
                </h2>
                <p className="section-subtitle mb-5">
                  Let's discuss how our comprehensive engineering services can bring your project to life. 
                  Our team of experts is ready to provide customized solutions for your specific needs.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <FillButton 
                        text={`Request Consultation`}
                        as={Link}
                        to="/contact"
                    />
                  <OuterButton 
                    text={`View Our Portfolio`}
                     as={Link}
                    to="/projects"
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CTASection;
