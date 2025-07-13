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
                <div className="w-100">
                    <Outlet/>
                </div>

            </div>
        </>
    )
}

export default Layout;