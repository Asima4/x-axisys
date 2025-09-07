import React from "react";
import LandingComponent from "../../Components/LandingComponent/LandingComponent";
import './Services.css'
import LandingSection from "./LandingSection";
import CoreServices from "./CoreServices";

const Services=()=>{
    return (
        <>
            <div className="service_main">
               <LandingSection/>
               <CoreServices/>
            </div>
        </>
    )
}

export default Services;