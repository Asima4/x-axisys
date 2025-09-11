import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
// import { BsArrowRight } from "react-icons/bs";
import { BsArrowRight } from "react-icons/bs";
import "./ServiceDetails.css"; // custom styles
import { FillButton, OuterButton } from "../../Components/Button/Buttons";

const ServiceDetails = () => {
    const navigate = useNavigate();
    const selectedService = {
        serviceOrder: 1,
        serviceName: "Structural Engineering",
        serviceDescription:
            "Specializing in the design and analysis of building structures, bridges, and infrastructure. We ensure safety, stability, and cost-effectiveness using advanced analytical methods and software.",
        relatedTools: ["Revit", "Tekla Structures", "ETABS", "SAFE", "RISA-3D"],
        keyBenefits: [
            "Industry-leading expertise and experience",
            "Cutting-edge technology and tools",
            "Sustainable and efficient solutions",
            "Global standards and best practices",
        ],
    };

    return (
        <section className="py-5 service-section">
            {/* <hr className="border-light pt-5 my-0" /> */}
            <div className="container px-2">
                <div className="row align-items-center g-5">
                    {/* Left Content */}
                    <div className="col-lg-6">
                        <div className="mb-3">
                            <FillButton text={<span>Service #{selectedService.serviceOrder}</span>}/>
                        </div>
                        <h2 className="fw-bold section-title display-5">
                            {selectedService.serviceName}
                        </h2>

                        <p className="section-subtitle fw-normal fs-6">
                            {selectedService.serviceDescription}
                        </p>

                        {/* Related Tools */}
                        <div className="mt-4">
                            <h5 className="fw-semibold section-subtitle">
                                Related Tools &amp; Technologies
                            </h5>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {selectedService.relatedTools.map((tool, index) => (
                                    <span key={index} className="badge bg-secondary px-3 py-2">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Key Benefits */}
                        <div className="mt-4">
                            <h5 className="fw-semibold section-subtitle">Key Benefits</h5>
                            <ul className="list-unstyled mt-3">
                                {selectedService.keyBenefits.map((benefit, index) => (
                                    <li key={index} className="d-flex align-items-center mb-2">
                                        <FaCheckCircle className="text-primary me-2" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Buttons */}
                        <div className="mt-4 d-flex flex-wrap gap-3">
                            <FillButton text={
                                <span className="d-flex gap-2">
                                    Get Started <BsArrowRight className="ms-2" />
                                </span>
                            } 
                            onClick={() => navigate('/contact')}
                            />
                            <OuterButton 
                                text={`View Related Projects` }
                                 onClick={() => navigate('/projects')}
                            />
                        </div>
                    </div>

                    {/* Right Icon Section */}
                    <div className="col-lg-6">
                        <div className="service-card-details text-center p-5">
                            <div className="icon-circle mx-auto mb-4">
                                <i className="bi bi-building text-white fs-1"></i>
                            </div>
                            <h4 className="fw-bold">{selectedService.serviceName}</h4>
                            <p className="text-muted">
                                Service #{selectedService.serviceOrder} of 11
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServiceDetails;
