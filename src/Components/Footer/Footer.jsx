import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Phone, MailboxFlag, PinMap } from "react-bootstrap-icons";
import "./Footer.css";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="footer shadow border-top pt-5">
      <Container>
        <Row className="gy-4">
          {/* Company Info */}
          <Col md={6} lg={3}>
            <div className="d-flex align-items-center mb-3">
              <div className="logo-box">AX</div>
              <span className="fw-bold ms-2">AXISYS GLOBAL ENGINEERING</span>
            </div>
            <p className="section-subtitle ">
              Where Future-Ready Engineering Begins. Delivering intelligent,
              cross-disciplinary solutions powered by AI, BIM, and sustainable
              innovation.
            </p>
          </Col>

          {/* Quick Links */}
          <Col md={6} lg={3}>
            <h5 className="fw-semibold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              {navigation.slice(0, 4).map((item, index) => (
                <li key={index} className="mb-2">
                  <Link to={item.href} className="footer-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Services */}
          <Col md={6} lg={3}>
            <h5 className="fw-semibold mb-3">Services</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/services" className="footer-link">
                  Structural Engineering
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services" className="footer-link">
                  Architecture
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services" className="footer-link">
                  MEP Engineering
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services" className="footer-link">
                  BIM Services
                </Link>
              </li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col md={6} lg={3}>
            <h5 className="fw-semibold mb-3">Contact</h5>
            <ul className="list-unstyled footer-contact">
              <li className="d-flex align-items-center mb-2">
                <PinMap className="me-2 text-primary" size={16} />
                <span className="small">India HQ</span>
              </li>
              <li className="d-flex align-items-center mb-2">
                <Phone className="me-2 text-primary" size={16} />
                <span className="small">+91 XXX XXX XXXX</span>
              </li>
              <li className="d-flex align-items-center mb-2">
                <MailboxFlag className="me-2 text-primary" size={16} />
                <span className="small">info@axisysglobal.com</span>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 border-light" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="small mb-2 mb-md-0">
            © 2025 Axisys Global Engineering. All rights reserved.
          </p>
          <div className="d-flex gap-4">
            <Link to="/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <Link to="/terms" className="footer-link">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
