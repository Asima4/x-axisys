import React from "react";
import './Layout.css'
import { Outlet } from "react-router-dom";
import NavBar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

const Layout=()=>{
    return (
        <>
            <div className="layout_container pt-5">
                <div>
                    <NavBar/>
                </div>
                <div className="w-100">
                    <Outlet/>
                </div>
                <Footer/>
            </div>
        </>
    )
}

export default Layout;