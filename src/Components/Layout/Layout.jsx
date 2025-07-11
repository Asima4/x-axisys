import React from "react";
import './Layout.css'
import { Outlet } from "react-router-dom";
import NavBar from "../Navbar/Navbar";

const Layout=()=>{
    return (
        <>
            <div className="layout_container">
                <div>
                    <NavBar/>
                </div>
                <div className="container-xxl">
                    <Outlet/>
                </div>

            </div>
        </>
    )
}

export default Layout;