import React from "react";
import './LandingComponent.css'
import AnimatedBackground from "../StyleTool/AnimatedBackground";
import { FillButton, OuterButton } from "../Button/Buttons";
import { Container } from "react-bootstrap";

const LandingComponent = () => {
    return (
        <>
            <div className="main_landingComponent py-4 pb-5">
                <AnimatedBackground />
                <Container className="hero-text-container text-center">
                    <h1 className="hero-heading">
                        BEYOND BOUNDARIES BEYOND BLUEPRINTS
                    </h1>
                    <p className="hero-subtitle">
                        Axisys Global Engineering delivers intelligent, cross-disciplinary
                        solutions for modern buildings — from concept to construction — powered
                        by AI, BIM, and sustainable innovation.
                    </p>
                </Container>
                <div className="d-flex align-items-center gap-3 justify-content-center flex-wrap">
                    <FillButton text={
                        <span className="d-flex gap-2">
                            Explore Services
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                            </svg>
                        </span>
                    } />
                    <OuterButton text={'Request a Quote'} />
                    <OuterButton text={'Book Consultation'} />
                </div>
            </div>
        </>
    )
}

export default LandingComponent;