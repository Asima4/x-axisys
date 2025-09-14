import React from "react";
import './Layout.css'
import { Outlet } from "react-router-dom";
import NavBar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Helmet } from "react-helmet-async";

const Layout = () => {
    return (
        <>
            <Helmet>
                <script type="application/ld+json">
                    {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Axisys Global Engineering",
              "url": "https://axisysglobal.com",
              "logo": "https://axisysglobal.com/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9992266250",
                "contactType": "Customer Service"
              },
              "sameAs": [
                "https://www.linkedin.com/company/axisysglobal",
                "https://twitter.com/axisysglobal"
              ]
            }
          `}
                </script>
            </Helmet>
            <div className="layout_container pt-5">
                <div>
                    <NavBar />
                </div>
                <div className="w-100">
                    <Outlet />
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Layout;