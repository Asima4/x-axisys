// import React from 'react'
// import { Container } from 'react-bootstrap'

// export default function OpenPosition() {
//   return (
//     <>
//         <div className="openPosition_main">
//             <Container>
//                 <div>
//                     <h1 className='section_title'>Open Positions</h1>
//                     <div className='section-subtitle'>Explore current opportunities to join our team and contribute to groundbreaking engineering projects around the world.</div>
//                 </div>
//             </Container>
//         </div>
//     </>
//   )
// }

import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { Calendar, MapPin } from "lucide-react";
import "./Career.css";
import { FillButton } from "../../Components/Button/Buttons";

const jobList = [
    {
        id: 1,
        title: "BIM Modeler - Architectural",
        type: "Full-time/Part time",
        location: "Remote",
        date: "7/15/2024",
        description:
            "Create detailed architectural BIM models for various projects, ensuring accuracy and adherence to project specifications. Collaborate with architects and engineers to resolve design conflicts and optimize workflows using BIM technologies.",
        requirements:
            "Bachelor's degree in Architecture or related field. 3+ years experience in BIM modeling. Expert proficiency in Revit. Strong understanding of architectural design principles and construction documentation.",
    },
    {
        id: 2,
        title: "MEP Design Engineer",
        type: "Full-time/Part time",
        location: "Remote",
        date: "7/10/2024",
        description:
            "Design and analyze mechanical, electrical, and plumbing systems for commercial and industrial projects. Ensure designs comply with relevant codes and standards, focusing on energy efficiency and sustainability.",
        requirements:
            "Bachelor's degree in Mechanical/Electrical Engineering. 5+ years of MEP design experience. Familiarity with AutoCAD and Revit. Strong problem-solving and teamwork skills.",
    },
];

const OpenPositions = () => {
    const [selectedJob, setSelectedJob] = useState(jobList[0]);

    return (
        <section className="openPositions_section py-5">
            <Container>
                <div className="mx-auto mb-5">           
                    <h1 className='section-title text-center'>Open Positions</h1>
                    <div style={{maxWidth:'700px'}} className='section-subtitle text-center mx-auto'>Explore current opportunities to join our team and contribute to groundbreaking engineering projects around the world.</div>
                </div>
                <Row>
                    <Col lg={6}>
                        {jobList.map((job) => (
                            <Card
                                key={job.id}
                                className={`openPositions_card mb-4 ${selectedJob.id === job.id ? "active" : ""
                                    }`}
                                onClick={() => setSelectedJob(job)}
                            >
                                <Card.Body>
                                    <h5 className="job_title">{job.title}</h5>
                                    <div className="d-flex align-items-center flex-wrap gap-3 mb-2">
                                        <Badge bg="primary">{job.type}</Badge>
                                        <span className="job_meta">
                                            <MapPin size={16} className="me-1" /> {job.location}
                                        </span>
                                        <span className="job_meta">
                                            <Calendar size={16} className="me-1" /> {job.date}
                                        </span>
                                    </div>
                                    <p className="job_desc">{job.description}</p>
                                </Card.Body>
                            </Card>
                        ))}
                    </Col>

                    <Col lg={6}>
                        <Card className="openPositions_detail">
                            <Card.Body>
                                <h4 className="job_title">{selectedJob.title}</h4>
                                <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
                                    <Badge bg="primary">{selectedJob.type}</Badge>
                                    <span className="job_meta">
                                        <MapPin size={16} className="me-1" /> {selectedJob.location}
                                    </span>
                                    <span className="job_meta">
                                        <Calendar size={16} className="me-1" /> {selectedJob.date}
                                    </span>
                                </div>
                                <h6 className="fw-bold">Job Description</h6>
                                <p>{selectedJob.description}</p>
                                <h6 className="fw-bold">Requirements</h6>
                                <p>{selectedJob.requirements}</p>
                                <FillButton text={'Apply for This Position'}/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default OpenPositions;
