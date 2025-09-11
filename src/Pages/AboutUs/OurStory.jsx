import React from "react";
import { Card, Badge, Container, Row, Col } from "react-bootstrap";
import { Globe, Target, Eye, Lightbulb, Award, Leaf, Users, Shield, Telescope } from "lucide-react";
import "./About.css";

// Data
const services = [
  "Structural Engineering", "Architecture", "MEP Engineering", "BIM Services",
  "Project Management", "Sustainability Consulting", "Geotechnical Engineering",
  "Fire Safety Engineering", "Facade Engineering", "Infrastructure Design", "AI Integration"
];

// Example TeamMembers
const teamMembers = [
  {
    _id: "1",
    name: "Aasim",
    role: "CEO & Structure Engineer",
    bio: "As the visionary founder of Axisys Global Engineering, Aasim brings deep expertise in structural design and multidisciplinary engineering. With extensive experience in U.S. and international projects, he leads the company’s mission to transform the AEC industry through AI-driven workflows, BIM innovation, and sustainable practices. Under his leadership, Axisys delivers cutting-edge structural, MEP, and architectural solutions with a focus on precision, speed, and future-ready technologies. Aasim is committed to cross-functional collaboration and empowering global clients with intelligent engineering.",
    photo: "https://static.wixstatic.com/media/d8cf84_713abf79d5f04ad1a6bdd7ff5783a4d6~mv2.png",
    linkedinUrl: "#",
    areaOfExpertise: `Strategic Leadership, AI Integration, Global Expansion`
  },
  {
  _id: "2",
  name: "Taufique Ali",
  role: "IT Senior Executive & Developer",
  bio: "A seasoned IT Senior Executive and Full-Stack Developer with extensive experience in building scalable digital solutions. Proficient in MERN & MEAN stacks with strong expertise in blockchain technologies, he has successfully led and delivered innovative platforms across diverse industries. With a proven track record of driving enterprise-level transformations, he combines technical excellence with strategic insight to deliver solutions that enhance business performance, foster innovation, and enable sustainable digital growth.",
  photo: "https://static.wixstatic.com/media/d8cf84_713abf79d5f04ad1a6bdd7ff5783a4d6~mv2.png",
  linkedinUrl:"",
  areaOfExpertise: "Full-Stack Development, MERN Stack, MEAN Stack, Blockchain Solutions, System Design"
}
];

const OurStory = () => {
  return (
    <div className="about-page">
      {/* Company Story */}
      <section className="section-dark">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5">
              <h2 className="section-heading">Our Story</h2>
              <p className="section-text">
                Founded in 2018, Axisys Global Engineering emerged from a vision to revolutionize 
                the engineering industry through intelligent integration of technology and sustainable practices.
              </p>
              <p className="section-text">
                What started as a small team of passionate engineers in India has grown into a 
                global powerhouse, serving clients across three continents with cutting-edge solutions.
              </p>
              <p className="section-text">
                Today, we stand at the forefront of AI-powered engineering, delivering projects 
                that not only meet today's needs but anticipate tomorrow's challenges.
              </p>
            </Col>
            <Col lg={6}>
              <Card className="theme-card p-4 text-center">
                <div className="icon_wrapper">
                  <Globe size={40} color="white" />
                </div>
                <h3 className="stat-number">2018</h3>
                <p className="stat-label">Founded</p>
                <Row className="pt-3">
                  <Col>
                    <h4 className="stat-number">500+</h4>
                    <p className="stat-label">Projects</p>
                  </Col>
                  <Col>
                    <h4 className="stat-number">3</h4>
                    <p className="stat-label">Countries</p>
                  </Col>
                  <Col>
                    <h4 className="stat-number">200+</h4>
                    <p className="stat-label">Team</p>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="section-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Mission & Vision</h2>
            <p className="section-subtitle">Driving the future of engineering through innovation, sustainability, and global collaboration.</p>
          </div>
          <Row>
            <Col lg={6} className="mb-4">
              <Card className="mission_card p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon_wrapper rounded mx-0">
                    <Target size={28} color="white" />
                  </div>
                  <h3 className="ms-3">Our Mission</h3>
                </div>
                <p className="section-text">
                  To transform the engineering landscape by delivering intelligent, sustainable solutions 
                  that exceed client expectations and contribute to a better world.
                </p>
              </Card>
            </Col>
            <Col lg={6} className="mb-4">
              <Card className="mission_card p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon_wrapper rounded mx-0">
                    <Eye size={28} color="white" />
                  </div>
                  <h3 className="ms-3">Our Vision</h3>
                </div>
                <p className="section-subtitle">
                  To be the world's leading AI-powered engineering firm, setting new standards for 
                  innovation, sustainability, and client success.
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* XI Services */}
      <section className="section-dark">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">The XI: 11 Integrated Services</h2>
            <p className="section-subtitle">Our comprehensive approach integrates eleven core engineering disciplines.</p>
          </div>
          <Row>
            {services.map((service, i) => (
              <Col xs={6} md={4} lg={3} key={i} className="mb-3">
                <Card className="theme-card text-center p-3 service-card">
                  <div className="circle-icon">{i + 1}</div>
                  <h6 className="service-title">{service}</h6>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Team */}
      {teamMembers.length > 0 && (
        <section className="section-light">
          <Container>
            <div className="text-center mb-5">
              <h2 className="section-title">Leadership Team</h2>
              <p className="section-subtitle">Meet the visionaries driving innovation.</p>
            </div>
            <Row>
              {teamMembers.map(member => (
                <Col md={6} lg={4} key={member._id} className="mb-4">
                  <Card className="member_Card team-card">
                    <div className="team-photo"></div>
                    <Card.Body>
                      <h5>{member.name}</h5>
                      <p className="text-primary">{member.role}</p>
                      <p className="section-text">{member.bio}</p>
                      <div className="d-flex flex-wrap gap-2">
                        {member.areaOfExpertise.split(",").map((exp, idx) => (
                          <Badge bg="secondary" key={idx}>{exp.trim()}</Badge>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
};

export default OurStory;
