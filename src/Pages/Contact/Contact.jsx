import React from "react";
import DynamicCTA from "../../Components/DynamicCTA/DynamicCTA";
import LandingAboutUsSection from "./LandingAboutUsSection";
import RequestQuote from "./RequestQuote";
import './Contact.css'
import ContactInformation from "./ContactInformation";

const Contact = () => {
    return (
        <>
            <div className="contact_main">
               <LandingAboutUsSection/>
               <RequestQuote/>
               <ContactInformation/>
                <DynamicCTA
                    title="Ready to Start Your Project?"
                    description="Don't wait to bring your vision to life. Contact us today for a free consultation and discover how Axisys can transform your engineering challenges into innovative solutions."
                    primaryBtnText="Get Free Consultation"
                    primaryBtnLink="/contact-us"
                    secondaryBtnText="Call Us Now"
                    secondaryBtnLink="/about-us"
                />
            </div>
        </>
    )
}

export default Contact;