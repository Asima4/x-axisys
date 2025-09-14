import React from "react";
import LandingComponent from "../../Components/LandingComponent/LandingComponent";
import LandingSection from "./LandingSection";
import CoreServices from "./CoreServices";
import ServiceDetails from "./ServiceDetails";
import ServiceCategories from "./ServiceCategories";
import OurProcess from "./OurProcess";
import CTASection from "./CTASection";
import '../../Components/DynamicCTA/DynamicCTA.css'
import { Helmet } from "react-helmet-async";

const Services = () => {
    return (
        <>
            <Helmet>
                <title>Engineering Services – Axisys Global</title>
                <meta name="description" content="Explore our range of structural engineering and AI-driven construction services designed to deliver high-quality, efficient, and innovative solutions." />
                <meta name="keywords" content="engineering services, construction solutions, AI engineering services, AEC industry services" />
                <meta property="og:title" content="Axisys Global Services" />
                <meta property="og:description" content="Providing world-class structural engineering and AI-driven services." />
                <meta property="og:url" content="https://axisysglobal.com/services" />
            </Helmet>

            <div className="service_main">
                <LandingSection />
                <CoreServices />
                <ServiceDetails />
                <ServiceCategories />
                <OurProcess />
                <CTASection />
            </div>
        </>
    )
}

export default Services;