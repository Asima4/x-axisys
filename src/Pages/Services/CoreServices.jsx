import React, { useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap';
import { Building, Cpu, Wrench, Layers } from "react-bootstrap-icons";
import ServiceCard from './ServiceCard';
import { coreServices } from './Constant';
import './Services.css'


export default function CoreServices() {
      const [selectedService, setSelectedService] = useState(1);


    const services = [
        { id: 1, title: "Structural Engineering", order: 1, icon: <Building size={28} /> },
        { id: 2, title: "Architecture", order: 2, icon: <Building size={28} /> },
        { id: 3, title: "Mechanical, Electrical & Plumbing (MEP)", order: 3, icon: <Wrench size={28} /> },
        { id: 4, title: "Piping Engineering", order: 4, icon: <Cpu size={28} /> },
        { id: 5, title: "BIM Services", order: 5, icon: <Layers size={28} /> },
    ];
    return (
        <>
            <div className="coreservice_main py-4">
                <h1 className='section-title text-center'>Our Core Services</h1>
                <p className='section-subtitle text-center'>Eleven specialized services working in perfect harmony to deliver complete engineering solutions for projects of any scale and complexity.</p>
                <Row className="g-4 w-100 px-4 mt-4">
                    {services.map((service) => (
                        <Col key={service.id} xs={12} sm={6} md={4} lg={3}>
                            <Card onClick={()=>setSelectedService(service?.id)} className={`service-card h-100 text-center ${service.id === selectedService && 'border-primary selected-border'}`}>
                                <div className={`icon-wrappers mx-auto ${service.id === selectedService && 'selected-icon-wrappers'}`}>{service.icon}</div>
                                <Card.Body>
                                    <Card.Title className="service-title">{service.title}</Card.Title>
                                    <Card.Text className="service-order">Order: {service.order}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
        
            </div>
        </>
    )
}
