import React from "react";
import './Home.css';
import Service from "./Services";
// import videoBG from '../../Assets/AdobeStock_397243019_Video_HD_Preview.mov';
// import videoBG from '../../Assets/AdobeStock_715978812_Video_HD_Preview.mov';
import videoBG from '../../Assets/Untitled ‑ Made with FlexClip (1).mp4';
// import videoBG from '../../Assets/3045163-hd_1920_1080_25fps.mp4';

const Home = () => {
    return (
        <>
            <div className="home_container container-fluid pt-5">
                <video className='bg_video' autoPlay loop muted playsInline>
                    <source src={videoBG} type='video/mp4' />
                </video>

                <div className="container para_content mt-3 d-flex align-items-center justify-content-start flex-column gap-5">
                    {/* <h1>This is Axisys</h1> */}
                    <div className="typewriter">
                        <p>Beyond Boundaries, Beyond Blueprints</p>
                    </div>
                </div>
            </div>

            <Service />
        </>
    );
};

export default Home;
