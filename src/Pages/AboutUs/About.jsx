import React from "react";
import LandingAboutSection from "./LandingAboutSection";
import './About.css'
import OurStory from "./OurStory";
import GlobalLocations from "./GlobalLocations";
import DynamicCTA from "../../Components/DynamicCTA/DynamicCTA";

const AboutUs=()=>{
    return(
        <>
            <div className="about_us">
                <LandingAboutSection/>
                <OurStory/>
                <GlobalLocations/>
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