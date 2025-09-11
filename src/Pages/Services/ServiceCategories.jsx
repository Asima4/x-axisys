import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import { Building2, Layers, Brain, Leaf } from "lucide-react";
import "./ServiceCategories.css";

const serviceCategories = [
  {
    icon: <Building2 size={48} className="icon" />,
    title: "Core Engineering",
    items: [
      "Structural Engineering",
      "Architecture",
      "MEP Engineering",
      "Piping Engineering",
    ],
  },
  {
    icon: <Layers size={48} className="icon" />,
    title: "Digital Solutions",
    items: [
      "BIM Services",
      "3D Rendering & Animation",
      "AR/VR Integration",
      "3D Printing & Prototypes",
    ],
  },
  {
    icon: <Brain size={48} className="icon" />,
    title: "Advanced Technology",
    items: [
      "AI-Assisted Design",
      "Drone & Laser Scanning",
      "Automation Solutions",
      "Smart Building Systems",
    ],
  },
  {
    icon: <Leaf size={48} className="icon" />,
    title: "Sustainability",
    items: [
      "Sustainability Consulting",
      "Green Building Design",
      "Energy Efficiency",
      "Carbon Analysis",
    ],
  },
];

const ServiceCategories = () => {
  return (
    <section className="services-section py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title">Service Categories</h2>
          <p className="section-subtitle">
            Our services are organized into key categories, each addressing
            specific aspects of modern engineering and construction challenges.
          </p>
        </div>

        <Row>
          {serviceCategories.map((service, index) => (
            <Col key={index} xs={12} md={6} lg={3} className="mb-4">
              <Card className="service-cardxx h-100 shadow-sm service_card_active_bg">
                <Card.Body className="text-center">
                    <div className="icon_wrapper">
                        {service.icon}
                    </div>
                  <Card.Title className="mt-3 service_title">{service.title}</Card.Title>
                  <ul className="service-list">
                    {service.items.map((item, i) => (
                      <li className="text-light opacity-75" key={i}>• {item}</li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default ServiceCategories;
