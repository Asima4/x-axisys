import React from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { FillButton, OuterButton } from "../../Components/Button/Buttons";
import AnimatedBackground from "../../Components/StyleTool/AnimatedBackground";
import '../../Components/LandingComponent/LandingComponent.css'

const ProjectLanding=()=>{
    const navigate = useNavigate();
    return(
        <>
            <div className="main_landingComponent py-4 pb-5">
                <AnimatedBackground />
                <Container className="hero-text-container text-center">
                    <OuterButton 
                        className={'mx-auto'}
                        text={
                            <>
                            
                                <i class="bi bi-building"></i>
                                <span> Our Portfolio</span>
                            </>
                        }
                    />
                    <h1 className="hero-heading mt-3">
                        Engineering Excellence
                        <br />
                        <span class="gradient-text">Across the Globe</span>
                    </h1>
                    <p className="hero-subtitle fs-5">
                       Explore our diverse portfolio of successful projects spanning residential, commercial, and industrial sectors across three continents.
                    </p>
                </Container>
                <div className="d-flex align-items-center gap-3 justify-content-center flex-wrap">
                    <FillButton 
                        text={
                            <span className="d-flex gap-2">
                                Browse Projects
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                </svg>
                            </span>
                        }
                        onClick={()=>navigate('/projects')} 
                    />
                    <OuterButton onClick={()=>navigate('/contact-us')} text={'Start Your Project'} />          
                </div>
            </div>
        </>
    )
}

export default ProjectLanding