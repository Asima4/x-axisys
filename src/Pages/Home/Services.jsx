import React from "react";
import StructuralDesignImg from '../../Assets/services/StructuralDesigner.jpg'
import mechanicalEnggImg from '../../Assets/services/Mechanical-HVAC.png'
import architectureBuilding from '../../Assets/services/architecture-building.jpg'
import electricalDesigner from '../../Assets/services/electricalDesigner.jpg'
import threedPrinterandHouseBuilding from '../../Assets/services/3dPrinter-andHouseBuilding.jpg'
import greenBuildingAndEnvSolu from '../../Assets/services/greenBuildingAndEnvSolu.jpg'
import itNSoftwareDeveImg from '../../Assets/services/Software-Development.jpg'
import building_information_modling from '../../Assets/services/building_information_modling.png'
import './Home.css'

const services = [
    {
        title: "Structural Engineering",
        image: architectureBuilding
    },
    {
        title: "Architectural Design",
        image: StructuralDesignImg
    },
    {
        title: "Mechanical Engineering (HVAC Design)",
        image: mechanicalEnggImg
    },
    {
        title: "Electrical Engineering",
        image: electricalDesigner
    },
    {
        title: "3D Printing Home Design",
        image: threedPrinterandHouseBuilding
    },
    {
        title: "Green Building & Environmental Solutions",
        image: greenBuildingAndEnvSolu
    },
    {
        title: "IT and Software Development",
        image: itNSoftwareDeveImg
    },
    {
        title: "BIM Modeling & Coordination",
        image: building_information_modling
    }
];

const Service = () => {
    return (
        <div className="servives_main p-3">
            <h1 className="pt-3 text-center mb-4">
                The "XI" in Axisys proudly represents our 11 specialized services.
            </h1>
            <div className="card_container">
                {services.map((service, index) => (
                    <div key={index} className="serve_card d-flex align-items-center justify-content-center gap-2 flex-column">
                        <img src={service.image} alt={service.title} />
                        <h2>{index+1}. {service.title}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Service;
