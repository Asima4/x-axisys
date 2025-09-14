import React from "react";
import LandingAboutSection from "./LandingAboutSection";
import './About.css'
import OurStory from "./OurStory";
import GlobalLocations from "./GlobalLocations";
import DynamicCTA from "../../Components/DynamicCTA/DynamicCTA";
import { Helmet } from "react-helmet-async";

const AboutUs = () => {
    return (
        <>
            <Helmet>
                <title>About Axisys Global Engineering – Who We Are</title>
                <meta name="description" content="Learn about Axisys Global Engineering, our mission, vision, and expertise in delivering AI-powered structural and construction engineering solutions." />
                <meta name="keywords" content="about Axisys, structural engineering team, engineering experts, AI-driven engineering" />
                <meta property="og:title" content="About Axisys Global Engineering" />
                <meta property="og:description" content="Discover our mission to revolutionize the AEC industry with advanced technology." />
                <meta property="og:url" content="https://axisysglobal.com/about-us" />
            </Helmet>

            <div className="about_us">
                <LandingAboutSection />
                <OurStory />
                <GlobalLocations />
                <DynamicCTA
                    title="Join Our Journey"
                    description="Be part of the future of engineering. Whether you're a client, partner, or potential team member, we'd love to hear from you."
                    primaryBtnText="Join Our Team"
                    primaryBtnLink="/career"
                    secondaryBtnText="Apply Now"
                    secondaryBtnLink="/career"
                />
            </div>
        </>
    )
}

export default AboutUs;