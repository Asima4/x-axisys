import React from "react";
import './Home.css';
import Service from "./Services";
// import videoBG from '../../Assets/AdobeStock_397243019_Video_HD_Preview.mov';
// import videoBG from '../../Assets/AdobeStock_715978812_Video_HD_Preview.mov';
import videoBG from '../../Assets/Untitled ‑ Made with FlexClip (1).mp4';
import AnimatedBackground from "../../Components/StyleTool/AnimatedBackground";
import LandingComponent from "../../Components/LandingComponent/LandingComponent";
import { Col, Container, Row } from "react-bootstrap";
import ServicesSection from "./ServicesSection";
import { globalExcelservices, projects, services, testimonials } from "./Constant";
import FeaturedProjects from "./FeaturedProjects";
import Testimonials from "./Testimonials";
import GlobalExcellence from "./GlobalExcellence";
import { FillButton, OuterButton } from "../../Components/Button/Buttons";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
// import videoBG from '../../Assets/3045163-hd_1920_1080_25fps.mp4';

const Home = () => {
    const navigete = useNavigate()
    return (
        <>
            <Helmet>
                <title>Axisys Global Engineering – AI-Driven Structural Engineering</title>
                <meta name="description" content="Axisys Global Engineering delivers innovative structural engineering solutions with AI-powered workflows, transforming the AEC industry worldwide." />
                <meta name="keywords" content="structural engineering, AI in construction, AEC industry, global engineering solutions" />
                <meta property="og:title" content="Axisys Global Engineering" />
                <meta property="og:description" content="Transforming construction with AI-powered engineering workflows." />
                <meta property="og:url" content="https://axisysglobal.com/" />
                <meta property="og:type" content="website" />
            </Helmet>

            <div className="home_container container-fluid pt-5">
                <LandingComponent />
                {/* <video className='bg_video' autoPlay loop muted playsInline>
                    <source src={videoBG} type='video/mp4' />
                </video> */}
                {/* <AnimatedBackground/> */}

                {/* <div className="container para_content mt-3 d-flex align-items-center justify-content-start flex-column gap-5">
                    <div className="typewriter">
                        <p>Beyond Boundaries, Beyond Blueprints</p>
                    </div>
                </div> */}
                <h1 className="section-title mb-0 text-center pt-5">Our Global Presence</h1>
                <Container className="stats-grid pt-2 mb-5">
                    <Row className="g-4 justify-content-center">
                        <Col xs={6} md={3} className="text-center">
                            <div className="stat-number">11</div>
                            <div className="stat-label">Integrated Services</div>
                        </Col>
                        <Col xs={6} md={3} className="text-center">
                            <div className="stat-number">3</div>
                            <div className="stat-label">Countries</div>
                        </Col>
                        <Col xs={6} md={3} className="text-center">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Projects Delivered</div>
                        </Col>
                        <Col xs={6} md={3} className="text-center">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Global Support</div>
                        </Col>
                    </Row>
                </Container>
                <ServicesSection services={services} />
                <FeaturedProjects projects={projects} />
                <Testimonials testimonials={testimonials} />
                <GlobalExcellence globalExcellence={globalExcelservices} />

                <div className="pt-3 pb-5 d-flex flex-column align-items-center justofy-content-center">
                    <h1 className="section-title mx-auto text-center">Ready to Transform Your Project? </h1>
                    <p className="section-subtitle text-center">Join hundreds of satisfied clients who trust Axisys for their engineering needs. Let's discuss how we can bring your vision to life.</p>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <OuterButton onClick={() => navigete('/contact-us')} text={'Start Your Project'} />
                        <FillButton onClick={() => navigete('/about-us')} text={'Learn More About Us'} />
                    </div>
                </div>
            </div>

            {/* <Service /> */}
        </>
    );
};

export default Home;
