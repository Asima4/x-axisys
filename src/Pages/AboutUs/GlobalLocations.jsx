import React from "react";
import { Card, Badge, Container, Row, Col } from "react-bootstrap";
import { Globe } from "react-bootstrap-icons"; // Bootstrap icon

import "./About.css"; // custom CSS

const GlobalLocations = () => {
  return (
    <section className="global-locations-section py-5">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <h2 className="section-title">Global Locations</h2>
          <p className="section-subtitle">
            Strategically positioned across three continents to serve our global
            clientele.
          </p>
        </div>

        {/* Locations Grid */}
        <Row className="g-4">
          {/* India Headquarters */}
          <Col xs={12} md={4}>
            <Card className="location-card text-center shadow-sm h-100">
              <div className="icon-wrapper mx-auto">
                <Globe size={32} className="icon" />
              </div>
              <Card.Body>
                <h5 className="location-title">India Headquarters</h5>
                <p className="location-text">
                  Primary engineering center with 200+ professionals and
                  state-of-the-art facilities.
                </p>
                <Badge bg="primary">Established 2018</Badge>
              </Card.Body>
            </Card>
          </Col>

          {/* USA Operations */}
          <Col xs={12} md={4}>
            <Card className="location-card text-center shadow-sm h-100">
              <div className="icon-wrapper mx-auto">
                <Globe size={32} className="icon" />
              </div>
              <Card.Body>
                <h5 className="location-title">USA Operations</h5>
                <p className="location-text">
                  Strategic operations center serving North American markets
                  with local expertise.
                </p>
                <Badge bg="danger">LLC Formation</Badge>
              </Card.Body>
            </Card>
          </Col>

          {/* Canada Expansion */}
          <Col xs={12} md={4}>
            <Card className="location-card text-center shadow-sm h-100">
              <div className="icon-wrapper mx-auto">
                <Globe size={32} className="icon" />
              </div>
              <Card.Body>
                <h5 className="location-title">Canada Expansion</h5>
                <p className="location-text">
                  Growing presence in Canadian engineering and construction
                  markets.
                </p>
                <Badge bg="secondary">Expanding 2024</Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default GlobalLocations;
