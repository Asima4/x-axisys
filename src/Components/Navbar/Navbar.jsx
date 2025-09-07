// import React from "react";
// import { Navbar as BootstrapNavbar, Nav } from "react-bootstrap";
// // import axisysLogo from '../../Assets/AXISYSLogo.png'
// import axisysLogo from '../../Assets/logoxxxx.png'
// import './Navbar.css';
// import { Link } from "react-router-dom";
// import { FillButton, OuterButton } from "../Button/Buttons";
// import Logo from "../Logo/Logo";

// const NavBar = () => {
  
//   return (
//     <>
//       <div className="navbar_container">
//         <BootstrapNavbar className="pt-0" expand="lg">
//         {/* <BootstrapNavbar bg="dark" variant="dark" expand="lg"> */}
//           <div className="container-xxl">
//             <BootstrapNavbar.Brand as={Link} to="/">
//             <Logo/>
//               {/* <img className="brand_logo" src={axisysLogo} alt="axisys logo" /> */}
//             </BootstrapNavbar.Brand>
//             <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
//             <BootstrapNavbar.Collapse id="basic-navbar-nav">
//               <Nav className="mx-auto navItems_style gap-2">
//                 <Nav.Link as={Link} to="/">Home</Nav.Link>
//                 <Nav.Link as={Link} to="/services">Our Services</Nav.Link>
//                 <Nav.Link as={Link} to="/projects">Projects</Nav.Link>
//                 <Nav.Link as={Link} to="/blogs">AI & Innovation</Nav.Link>
//                 <Nav.Link as={Link} to="/blogs">Careers</Nav.Link>
//                 <Nav.Link as={Link} to="/about-us">About Us</Nav.Link>
//                 <Nav.Link as={Link} to="/contact-us">Contact</Nav.Link>
//               </Nav>
//               <div className="d-flex align-items-center gap-2">
//                 <OuterButton text={'Request Quote'}/>
//                 <FillButton text={'Book Consultation'}/>
//               </div>
//             </BootstrapNavbar.Collapse>
//           </div>
//         </BootstrapNavbar>
//       </div>
//     </>
//   );
// };

// export default NavBar;

import React from "react";
import { Navbar as BootstrapNavbar, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";  // <-- use NavLink
import './Navbar.css';
import { FillButton, OuterButton } from "../Button/Buttons";
import Logo from "../Logo/Logo";

const NavBar = () => {
  return (
    <div className="navbar_container">
      <BootstrapNavbar className="pt-0" expand="lg">
        <div className="container-xxl">
          <BootstrapNavbar.Brand as={NavLink} to="/">
            <Logo />
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto navItems_style gap-2">
              <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
              <Nav.Link as={NavLink} to="/services">Our Services</Nav.Link>
              <Nav.Link as={NavLink} to="/projects">Projects</Nav.Link>
              <Nav.Link as={NavLink} to="/blogs">AI & Innovation</Nav.Link>
              <Nav.Link as={NavLink} to="/careers">Careers</Nav.Link>
              <Nav.Link as={NavLink} to="/about-us">About Us</Nav.Link>
              <Nav.Link as={NavLink} to="/contact-us">Contact</Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-2">
              <OuterButton text={'Request Quote'} />
              <FillButton text={'Book Consultation'} />
            </div>
          </BootstrapNavbar.Collapse>
        </div>
      </BootstrapNavbar>
    </div>
  );
};

export default NavBar;
