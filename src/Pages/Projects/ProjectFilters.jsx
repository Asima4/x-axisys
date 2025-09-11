// import React, { useState, useMemo } from "react";
// import { Card, Badge, Row, Col, Button, Form } from "react-bootstrap";
// import { Calendar3, GeoAlt, BoxArrowUpRight, Funnel } from "react-bootstrap-icons";
// import "./ProjectFilters.css";
// import { projects } from "./Constant";

// const ProjectsFilter = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedType, setSelectedType] = useState("all");
//   const [selectedLocation, setSelectedLocation] = useState("all");

//   // ✅ Extract unique types and locations
//   const uniqueTypes = [...new Set(projects.map((p) => p.projectType))];
//   const uniqueLocations = [...new Set(projects.map((p) => p.projectLocation))];

//   // ✅ Filter projects based on search, type, location
//   const filteredProjects = useMemo(() => {
//     return projects.filter((project) => {
//       const matchesSearch =
//         project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         project.projectDescription.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesType =
//         selectedType === "all" || project.projectType.toLowerCase() === selectedType;

//       const matchesLocation =
//         selectedLocation === "all" || project.projectLocation.toLowerCase() === selectedLocation;

//       return matchesSearch && matchesType && matchesLocation;
//     });
//   }, [searchTerm, selectedType, selectedLocation]);

//   return (
//     <section className="py-5 projects-section">
//       <div className="container">
//         {/* 🔎 Filters Section */}
//         <div className="mb-4 p-3 border rounded">
//           <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3">
//             <div className="d-flex align-items-center fw-semibold text-secondary">
//               <Funnel className="me-2" size={18} /> Filter Projects:
//             </div>

//             {/* Search */}
//             <Form.Control
//               type="text"
//               placeholder="Search projects..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="flex-grow-1"
//             />

//             {/* Project Type Filter */}
//             <Form.Select
//               value={selectedType}
//               onChange={(e) => setSelectedType(e.target.value)}
//               className="w-auto"
//             >
//               <option value="all">All Types</option>
//               {uniqueTypes.map((type) => (
//                 <option key={type} value={type.toLowerCase()}>
//                   {type}
//                 </option>
//               ))}
//             </Form.Select>

//             {/* Location Filter */}
//             <Form.Select
//               value={selectedLocation}
//               onChange={(e) => setSelectedLocation(e.target.value)}
//               className="w-auto"
//             >
//               <option value="all">All Locations</option>
//               {uniqueLocations.map((loc) => (
//                 <option key={loc} value={loc.toLowerCase()}>
//                   {loc}
//                 </option>
//               ))}
//             </Form.Select>

//             <div className="text-muted small">
//               {filteredProjects.length} of {projects.length} projects
//             </div>
//           </div>
//         </div>

//         {/* 🖼 Project Cards */}
//         <Row xs={1} md={2} lg={3} className="g-4">
//           {filteredProjects.map((project) => (
//             <Col key={project.id}>
//               <Card className="project-card h-100">
//                 <div className="project-img-wrapper">
//                   <Card.Img
//                     variant="top"
//                     src={project.projectImages}
//                     alt={project.projectName}
//                     className="project-img"
//                   />
//                   <div className="overlay-gradient"></div>

//                   {/* Project Type Badge */}
//                   <Badge bg="primary" className="project-badge left">
//                     {project.projectType}
//                   </Badge>

//                   {/* Location Badge */}
//                   <Badge bg="dark" className="project-badge right">
//                     <GeoAlt className="me-1" size={14} />
//                     {project.projectLocation}
//                   </Badge>
//                 </div>

//                 <Card.Body>
//                   <Card.Title className="project-title">
//                     {project.projectName}
//                   </Card.Title>
//                   <Card.Text className="project-desc">
//                     {project.projectDescription}
//                   </Card.Text>

//                   {/* Services */}
//                   <div className="mt-3">
//                     <small className="text-muted d-block mb-2">Services:</small>
//                     <div className="d-flex flex-wrap gap-2">
//                       {project.serviceTags.map((tag, index) => (
//                         <Badge
//                           key={index}
//                           bg="outline-secondary"
//                           className="service-badge"
//                         >
//                           {tag}
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>
//                 </Card.Body>

//                 <Card.Footer className="d-flex justify-content-between align-items-center">
//                   <span className="text-muted small">
//                     <Calendar3 className="me-1" size={14} />
//                     {project.year}
//                   </span>
//                   {project.caseStudyUrl && (
//                     <Button
//                       variant="link"
//                       size="sm"
//                       href={project.caseStudyUrl}
//                       target="_blank"
//                       className="case-study-link"
//                     >
//                       Case Study <BoxArrowUpRight size={14} className="ms-1" />
//                     </Button>
//                   )}
//                 </Card.Footer>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       </div>
//     </section>
//   );
// };

// export default ProjectsFilter;


import React, { useState, useMemo } from "react";
import { Card, Badge, Row, Col, Button, Form } from "react-bootstrap";
import { Calendar3, GeoAlt, BoxArrowUpRight, Funnel } from "react-bootstrap-icons";
import "./ProjectFilters.css"; // 👈 unique CSS file
import { projects } from "./Constant";

const ProjectsFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const uniqueTypes = [...new Set(projects.map((p) => p.projectType))];
  const uniqueLocations = [...new Set(projects.map((p) => p.projectLocation))];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "all" || project.projectType.toLowerCase() === selectedType;

      const matchesLocation =
        selectedLocation === "all" || project.projectLocation.toLowerCase() === selectedLocation;

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [searchTerm, selectedType, selectedLocation]);

  return (
    <section className="py-5 projects-section-theme">
      <div className="container">
        {/* 🔎 Filters Section */}
        <div className="filters-box-theme d-flex flex-column flex-lg-row align-items-lg-center gap-3">
          <div className="filters-title-theme">
            <Funnel className="me-2" size={18} /> Filter Projects:
          </div>

          {/* Search */}
          <Form.Control
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input-theme flex-grow-1"
          />

          {/* Project Type Filter */}
          <Form.Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select-theme w-auto"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type.toLowerCase()}>
                {type}
              </option>
            ))}
          </Form.Select>

          {/* Location Filter */}
          <Form.Select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="filter-select-theme w-auto"
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc.toLowerCase()}>
                {loc}
              </option>
            ))}
          </Form.Select>

          {/* Counter */}
          <div className="filter-count-theme">
            {filteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {/* Project Cards */}
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredProjects.map((project) => (
            <Col key={project.id}>
              <Card className="project-card-theme h-100">
                <div className="project-img-wrapper-theme">
                  <Card.Img
                    variant="top"
                    src={project.projectImages}
                    alt={project.projectName}
                    className="project-img-theme"
                  />
                  <div className="overlay-gradient-theme"></div>

                  <Badge bg="primary" className="project-badge-theme left">
                    {project.projectType}
                  </Badge>

                  <Badge bg="dark" className="project-badge-theme right">
                    <GeoAlt className="me-1" size={14} />
                    {project.projectLocation}
                  </Badge>
                </div>

                <Card.Body>
                  <Card.Title className="project-title-theme">
                    {project.projectName}
                  </Card.Title>
                  <Card.Text className="project-desc-theme">
                    {project.projectDescription}
                  </Card.Text>

                  <div className="mt-3">
                    <small className="text-muted d-block mb-2">Services:</small>
                    <div className="d-flex flex-wrap gap-2">
                      {project.serviceTags.map((tag, index) => (
                        <Badge
                          key={index}
                          bg="outline-secondary"
                          className="service-badge-theme"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    <Calendar3 className="me-1" size={14} />
                    {project.year}
                  </span>
                  {project.caseStudyUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      href={project.caseStudyUrl}
                      target="_blank"
                      className="case-study-link-theme"
                    >
                      Case Study <BoxArrowUpRight size={14} className="ms-1" />
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default ProjectsFilter;
