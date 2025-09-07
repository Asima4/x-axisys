import React from "react";
// import { projects } from "../data/projects";
import "./FeaturedProjects.css";
import { FillButton } from "../../Components/Button/Buttons";
import { useNavigate } from "react-router-dom";

const FeaturedProjects = ({ projects = [] }) => {
    const navigate = useNavigate()
    return (
        <section className="py-5 featured-projects">
            <div className="container">
                {/* Section Header */}
                <div className="text-center mb-5">
                    <h2 className="section-title display-5">Featured Projects</h2>
                    <p className="section-subtitle text-center mx-auto w-75">
                        Showcasing our expertise across residential, commercial, and
                        industrial projects in India, USA, and Canada.
                    </p>
                </div>

                {/* Projects Grid */}
                <div className="row g-4 opacity-75">
                    {projects.map((project) => (
                        <div key={project._id} className="col-md-6">
                            <div className="card project-card h-100 border-0 shadow-sm">
                                <div className="card-img-wrapper">
                                    <img
                                        src={project.projectImages}
                                        alt={project.projectName}
                                        className="card-img-top"
                                    />
                                    <span className="badge bg-primary project-badge">
                                        {project.projectType}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title fw-semibold">
                                        {project.projectName}
                                    </h5>
                                    <p className="card-text text-muted">
                                        {project.projectDescription}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Button */}
                <div className="text-center mt-5">
                    <FillButton text={
                        <span className="d-flex gap-2">
                            View All Projects
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                            </svg>
                        </span>
                    } onClick={() => navigate('/projects')} />
                </div>
            </div>
        </section>
    );
};

export default FeaturedProjects;
