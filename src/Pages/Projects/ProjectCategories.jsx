import React, { useMemo } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import './ProjectFilters.css'
import { Badge } from 'lucide-react'
import { projects } from './Constant';

export default function ProjectCategories() {

      const filteredProjects = useMemo(() => {
        return projects
      }, []);

const projectCategories = [
  {
    id: 1,
    title: "Residential",
    icon: "bi bi-house-door", // Bootstrap Icon
    description:
      "From luxury homes to multi-family developments, we create living spaces that combine comfort, efficiency, and sustainability.",
    projects: 0,
  },
  {
    id: 2,
    title: "Commercial",
    icon: "bi bi-building", // Bootstrap Icon
    description:
      "Office buildings, retail spaces, and mixed-use developments designed for optimal functionality and business success.",
    projects: 0,
  },
  {
    id: 3,
    title: "Industrial",
    icon: "bi bi-factory", // Bootstrap Icon
    description:
      "Manufacturing facilities, warehouses, and industrial complexes engineered for efficiency and safety.",
    projects: 0,
  },
];


    return (
        <>
            <div className="projectCategories_main py-5">
                <Container>
                    <div className="text-center">
                        <h2 className="section-title">Service Categories</h2>
                        <p className="section-subtitle">
                            Our services are organized into key categories, each addressing
                            specific aspects of modern engineering and construction challenges.
                        </p>
                    </div>

                     {/* Project Cards */}
        <Row xs={1} md={2} lg={3} className="g-4">
          {projectCategories.map((project, idx) => (
            <Col key={idx}>
              <Card className="project-card-theme h-100 py-4">
                <div className='icon_wrapper'>
                     <i className={`${project.icon}`}/>
                </div>
                <Card.Body>
                  <Card.Title className="project-title-theme text-center fs-5">
                    {project.title}
                  </Card.Title>
                  <Card.Text className="project-desc-theme text-center">
                    {project.description}
                  </Card.Text>
                  <Card.Text className='text-center'>Projects: {project?.projects}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
                </Container>
            </div>

        </>
    )
}
