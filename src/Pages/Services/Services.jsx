import React from "react";
import LandingComponent from "../../Components/LandingComponent/LandingComponent";
import LandingSection from "./LandingSection";
import CoreServices from "./CoreServices";
import ServiceDetails from "./ServiceDetails";
import ServiceCategories from "./ServiceCategories";
import OurProcess from "./OurProcess";
import CTASection from "./CTASection";
import '../../Components/DynamicCTA/DynamicCTA.css'

const Services=()=>{
    return (
        <>
            <div className="service_main">
               <LandingSection/>
               <CoreServices/>
               <ServiceDetails/>
               <ServiceCategories/>
               <OurProcess/>
               <CTASection/>
            </div>
        </>
    )
}

export default Services;