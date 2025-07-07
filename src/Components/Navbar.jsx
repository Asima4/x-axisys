import React from "react";
import { Nav } from "react-bootstrap";
import './Navbar.css'

const Navbar = () => {
    return (
        <>
            <Nav className="justify-content-end" activeKey="/home">
                <Nav.Item>
                    <Nav.Link href="/home">Our Projects</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-1">Services</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-2">Blogs</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-2">About Us</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-2">Contact Us</Nav.Link>
                </Nav.Item>
            
            </Nav>
        </>
    )
}

export default Navbar;