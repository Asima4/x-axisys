import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import "./CustomeCard.css";

const CustomeCard = ({
    cardDataList = [],
    title = "Service Categories",
    subTitle = "Our services are organized into key categories, each addressing specific aspects of modern engineering and construction challenges."
}) => {
    return (
        <section className="customeCard_section py-5">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="section-title">{title}</h2>
                    <p className="customeCard_subtitle">{subTitle}</p>
                </div>

                <Row className="d-flex justify-content-center flex-wrap">
                    {cardDataList.map((service, index) => (
                        <Col key={index} xs={12} md={6} lg={3} className="mb-4">
                            <Card className="customeCard_card h-100 shadow-sm">
                                <Card.Body className="text-center">
                                    <div className="icon_wrapper">{service.icon}</div>
                                    <Card.Title className="customeCard_cardTitle mt-3">
                                        {service.title}
                                    </Card.Title>
                                    {service?.description?.length > 0 &&
                                        <Card.Title className="customeCard_desciption text-center mt-3">
                                            {service.description}
                                        </Card.Title>
                                    }
                                    {service.items?.length > 0 &&
                                        <ul className="customeCard_list">
                                            {service.items.map((item, i) => (
                                                <li key={i}>• {item}</li>
                                            ))}
                                        </ul>
                                    }
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default CustomeCard;
