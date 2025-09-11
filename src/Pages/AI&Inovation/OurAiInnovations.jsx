import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import {
  Brain,
  Cpu,
  Eye,
  Plane,
  Mic,
  Leaf,
  Layers,
  Cog,
} from "lucide-react";
import "./AIandInovations.css";

export default function OurAiInnovations() {
  const serviceCategories = [
    {
      icon: Mic,
      title: "Voice-Driven 3D Modeling",
      description:
        "Revolutionary voice commands for creating and modifying 3D models, making design more intuitive and accessible.",
      items: [
        "Natural language processing",
        "Real-time model generation",
        "Voice command recognition",
        "Hands-free operation",
      ],
    },
    {
      icon: Plane,
      title: "Digital Solutions",
      description:
        "Cutting-edge digital solutions that streamline workflows and improve efficiency.",
      items: [
        "BIM Services",
        "3D Rendering & Animation",
        "AR/VR Integration",
        "3D Printing & Prototypes",
      ],
    },
    {
      icon: Leaf,
      title: "Advanced Technology",
      description:
        "Leverage advanced tools and automation for smarter, faster, and safer engineering.",
      items: [
        "AI-Assisted Design",
        "Drone & Laser Scanning",
        "Automation Solutions",
        "Smart Building Systems",
      ],
    },
    {
      icon: Eye,
      title: "Sustainability",
      description:
        "Green innovations ensuring long-term energy efficiency and eco-friendly construction.",
      items: [
        "Sustainability Consulting",
        "Green Building Design",
        "Energy Efficiency",
        "Carbon Analysis",
      ],
    },
  ];

  return (
    <div className="aiInnovations_main py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title">Our AI Innovations</h2>
          <p className="section-subtitle">
            Pioneering technologies that are transforming how we approach
            engineering challenges and deliver superior solutions to our clients.
          </p>
        </div>
        <Row>
          {serviceCategories.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Col key={index} xs={12} md={6} lg={3} className="mb-4">
                <Card className="aiInnovations_card h-100">
                  <Card.Body className="text-center">
                    <div className="aiInnovations_iconWrapper mb-3">
                      <IconComponent size={28} className="aiInnovations_icon" />
                    </div>
                    <Card.Title className="aiInnovations_cardTitle">
                      {service.title}
                    </Card.Title>
                    <Card.Text className="aiInnovations_cardDesc">
                      {service.description}
                    </Card.Text>
                    <ul className="aiInnovations_list">
                      {service.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
}
