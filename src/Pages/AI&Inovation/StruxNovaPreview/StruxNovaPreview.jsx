import React from "react";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Lightbulb, ArrowRight, Globe } from "lucide-react";
import "./StruxNovaPreview.css";
import { FillButton } from "../../../Components/Button/Buttons";

const StruxNovaPreview = () => {
    const navigate = useNavigate()
  return (
    <section className="struxnova-section py-5">
      <Container>
        <Row className="align-items-center g-5">
          {/* Left Content */}
          <Col lg={6}>
            <div className="mb-4">
              <Badge bg="danger" className="struxnova-badge">
                <Lightbulb size={16} className="me-2" />
                Coming Soon
              </Badge>
            </div>
            <h2 className="struxnova-heading mb-4">
              Introducing <span className="text-primary fs-3 fw-bold">StruxNova</span>
            </h2>
            <p className="struxnova-description mb-5">
              Our revolutionary integrated platform that combines all AI tools into a unified
              engineering ecosystem. StruxNova will transform how engineers work, collaborate,
              and innovate across all disciplines.
            </p>

            <div className="mb-4">
              <h5 className="fw-bold mb-3">Platform Features:</h5>
              <Row xs={1} sm={2}>
                {[
                  "Unified AI Interface",
                  "Real-time Collaboration",
                  "Cloud-based Processing",
                  "Advanced Analytics",
                  "Cross-platform Integration",
                  "Intelligent Automation",
                ].map((feature, idx) => (
                  <Col key={idx} className="d-flex align-items-center mb-2">
                    <div className="struxnova-dot"></div>
                    <span className="ms-2">{feature}</span>
                  </Col>
                ))}
              </Row>
            </div>

            <FillButton 
                text={
                    <>
                        Join Beta Program
                        <ArrowRight className="ms-2" size={20} />
                    </>
                }
                onClick={()=>navigate('/contact-us')}
            />

            {/* <Button variant="primary" size="lg" as={Link} to="/contact">
              Join Beta Program <ArrowRight className="ms-2" size={20} />
            </Button> */}
          </Col>

          {/* Right Illustration */}
          <Col lg={6}>
            <div className="struxnova-illustration d-flex align-items-center justify-content-center">
              <div className="struxnova-circle animate-pulse">
                <Globe size={64} className="text-white" />
              </div>
              <div className="struxnova-text mt-4 text-center">
                <h3 className="fw-bold text-white">StruxNova</h3>
                <p className="text-muted small">AI Engineering Platform</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default StruxNovaPreview;
