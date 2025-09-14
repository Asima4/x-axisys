import React from "react";
import DynamicCTA from "../../Components/DynamicCTA/DynamicCTA";
import LandingAboutUsSection from "./LandingAboutUsSection";
import RequestQuote from "./RequestQuote";
import './Contact.css'
import ContactInformation from "./ContactInformation";
import { Helmet } from "react-helmet-async";

const Contact = () => {
    return (
        <>
            <Helmet>
                <title>Contact Axisys Global Engineering</title>
                <meta name="description" content="Get in touch with Axisys Global Engineering for inquiries, services, partnerships, and collaborations in structural and AI-driven engineering solutions." />
                <meta name="keywords" content="contact Axisys, engineering support, engineering inquiries, structural engineering company contact" />
                <meta property="og:title" content="Contact Axisys Global" />
                <meta property="og:description" content="Reach out to our engineering team for projects and collaborations." />
                <meta property="og:url" content="https://axisysglobal.com/contact-us" />
            </Helmet>

            <div className="contact_main">
                <LandingAboutUsSection />
                <RequestQuote />
                <ContactInformation />
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