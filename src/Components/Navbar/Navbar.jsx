import React from "react";
import { Navbar as BootstrapNavbar, Nav } from "react-bootstrap";
import axisysLogo from '../../Assets/AXISYSLogo.png'
import './Navbar.css';
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <>
      <div className="navbar_container">
        <BootstrapNavbar className="pt-0" expand="lg">
        {/* <BootstrapNavbar bg="dark" variant="dark" expand="lg"> */}
          <div className="container-xxl">
            <BootstrapNavbar.Brand as={Link} to="/home">
              <img className="brand_logo" src={axisysLogo} alt="axisys logo" />
            </BootstrapNavbar.Brand>
            <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
            <BootstrapNavbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto navItems_style">
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
      </div>
    </>
  );
};

export default NavBar;
