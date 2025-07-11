import React from "react";
import { Navbar as BootstrapNavbar, Nav } from "react-bootstrap";
import './Navbar.css';
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <>
      <BootstrapNavbar bg="dark" variant="dark" expand="lg">
        <div className="container-xxl">
          <BootstrapNavbar.Brand as={Link} to="#home">Axisys</BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/projects">Our Projects</Nav.Link>
              <Nav.Link as={Link} to="/services">Services</Nav.Link>
              <Nav.Link as={Link} to="/blogs">Blogs</Nav.Link>
              <Nav.Link as={Link} to="/about-us">About Us</Nav.Link>
              <Nav.Link as={Link} to="/contact-us">Contact Us</Nav.Link>
            </Nav>
          </BootstrapNavbar.Collapse>
        </div>
      </BootstrapNavbar>
    </>
  );
};

export default NavBar;
