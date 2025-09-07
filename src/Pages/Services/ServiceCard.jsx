import React from "react";
import "./ServiceCard.css";

export default function ServiceCard({ service, selectedService, IconComponent }) {
  const isSelected = selectedService?._id === service._id;

  return (
    <div className="service-card">
      <div className="card-content text-center">
        <div
          className={`icon-box ${isSelected ? "selected" : "gradient"}`}
        >
          <IconComponent className="icon" />
        </div>

        <h3 className={`title ${isSelected ? "selected-text" : ""}`}>
          {service.serviceName}
        </h3>

        <div className="order-text">
          Order: {service.serviceOrder}
        </div>
      </div>
    </div>
  );
}
