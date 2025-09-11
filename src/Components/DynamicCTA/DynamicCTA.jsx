import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FillButton, OuterButton } from "../Button/Buttons";
import "./DynamicCTA.css";

const DynamicCTA = ({
  title,
  description,
  primaryBtnText,
  primaryBtnLink,
  secondaryBtnText,
  secondaryBtnLink,
}) => {
  return (
    <section className="cta-wrapper py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="cta-card text-center p-5">
              <Card.Body>
                <h2 className="section-title mb-4">{title}</h2>
                <p className="section-subtitle mb-5">{description}</p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  {primaryBtnText && (
                    <FillButton
                      text={primaryBtnText}
                      as={Link}
                      to={primaryBtnLink}
                    />
                  )}
                  {secondaryBtnText && (
                    <OuterButton
                      text={secondaryBtnText}
                      as={Link}
                      to={secondaryBtnLink}
                    />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default DynamicCTA;
