import React from "react";
import './Projects.css'
import ProjectLanding from "./ProjectLanding";
import ProjectFilters from "./ProjectFilters";
import { Card, Col, Container, Row } from "react-bootstrap";
import ProjectCategories from "./ProjectCategories";
import DynamicCTA from "../../Components/DynamicCTA/DynamicCTA";

const Projects = () => {

    const stats = [
        { number: "5", label: "Total Projects" },
        { number: "3", label: "Project Types" },
        { number: "5", label: "Locations" },
        { number: "100%", label: "Success Rate" },
    ];

    return (
        <>
            <div className="Projects_main">
                <ProjectLanding />
                <ProjectFilters />
                <section className="project-stats-section">
                    <Container>
                        <h2 className="section-title">Project Statistics</h2>
                        <p className="section-subtitle">
                            Our portfolio spans multiple sectors and geographies, showcasing our
                            versatility and global reach in engineering excellence.
                        </p>
                        <Row className="justify-content-center">
                            {stats.map((item, index) => (
                                <Col key={index} xs={12} sm={6} md={3} className="mb-4">
                                    <Card className="stats-card">
                                        <Card.Body>
                                            <h3 className="stats-number">{item.number}</h3>
                                            <p className="stats-label">{item.label}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>
                <ProjectCategories />
                <DynamicCTA
                    title="Ready to Start Your Project?"
                    description="Join our portfolio of successful projects. Let's discuss how we can bring your vision to life with our comprehensive engineering solutions."
                    primaryBtnText="Discuss Your Project"
                    primaryBtnLink="/contact-us"
                    secondaryBtnText="Explore Our Services"
                    secondaryBtnLink="/services"
                />

            </div>
        </>
    )
}

export default Projects;