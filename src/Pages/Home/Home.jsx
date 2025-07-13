import React from "react";
import './Home.css'
import Service from "./Services";

const Home=()=>{
    return (
        <>
            <div className="home_container container-fluid  pt-5">
                <div className="container para_content mt-3 d-flex align-items-center justify-content-start flex-column gap-5">
                    <h1 className="">This is Axisys</h1>
                   <div className="typewriter">
                   <p>Beyond Boundaries, Beyond Blueprints </p>
                    </div>
                </div>
            </div>
            <Service/>
        </>
    )
}


export default Home;