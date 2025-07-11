import { Route, Routes } from "react-router-dom";
import Layout from "./Components/Layout/Layout";
import Services from "./Pages/Services/Services";
import Home from "./Pages/Home/Home";
import Blog from "./Pages/Blogs/Blogs";
import Contact from "./Pages/Contact/Contact";
import AboutUs from "./Pages/AboutUs/About";
import "./App.css";
import Projects from "./Pages/Projects/Projects";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="services" element={<Services />} />
          <Route path="blogs" element={<Blog />} />
          <Route path="contact-us" element={<Contact />} />
          <Route path="about-us" element={<AboutUs />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
