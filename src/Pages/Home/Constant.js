import { Globe } from "react-bootstrap-icons";
export const services = [
  {
    _id: "1",
    serviceName: "Structural Engineering",
    serviceDescription:
      "Designing safe, sustainable, and cost-effective structural systems for commercial, residential, and industrial projects.",
    relatedTools: "ETABS, AutoCAD, Revit"
  },
  {
    _id: "2",
    serviceName: "Mechanical, Electrical & Plumbing (MEP)",
    serviceDescription:
      "Integrated MEP solutions to optimize energy efficiency, safety, and building performance.",
    relatedTools: "Navisworks, AutoCAD MEP, BIM 360"
  },
  {
    _id: "3",
    serviceName: "Building Information Modeling (BIM)",
    serviceDescription:
      "End-to-end BIM services enabling digital twins, clash detection, and collaborative project delivery.",
    relatedTools: "Revit, Navisworks, Dynamo"
  },
  {
    _id: "4",
    serviceName: "Sustainable Design",
    serviceDescription:
      "Green building solutions with a focus on renewable energy, LEED certification, and eco-friendly practices.",
    relatedTools: "DesignBuilder, EnergyPlus, LEED Online"
  },
  {
    _id: "5",
    serviceName: "AI & Smart Automation",
    serviceDescription:
      "Leveraging AI-driven tools to enhance design accuracy, predictive maintenance, and real-time decision-making.",
    relatedTools: "Python, TensorFlow, MATLAB"
  },
  {
    _id: "6",
    serviceName: "Project Management & Consultancy",
    serviceDescription:
      "Comprehensive project management solutions ensuring timely delivery, cost efficiency, and quality assurance.",
    relatedTools: "MS Project, Primavera, Jira"
  }
];


export const projects = [
  {
    _id: 1,
    projectName: "Eco Heights Residential Tower",
    projectType: "Residential",
    projectDescription:
      "A 25-story sustainable residential complex in Bangalore, India, featuring energy-efficient design and smart home automation.",
    projectImages:
      "https://static.wixstatic.com/media/d8cf84_713abf79d5f04ad1a6bdd7ff5783a4d6~mv2.png",
  },
  {
    _id: 2,
    projectName: "Global Tech Park",
    projectType: "Commercial",
    projectDescription:
      "State-of-the-art IT park in Toronto, Canada, designed with BIM workflows and AI-driven planning.",
    projectImages:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: 3,
    projectName: "Industrial Green Plant",
    projectType: "Industrial",
    projectDescription:
      "A large-scale manufacturing plant in Texas, USA, integrating sustainable construction and automation systems.",
    projectImages:
      "https://media.istockphoto.com/id/958709520/photo/eco-friendly-industry-concept-3d-rendering-of-green-factory-icon-on-fresh-spring-meadow-with.jpg?s=612x612&w=0&k=20&c=HVV3iJpIEfvuU4rErErCTQzBEHYn2TEr03nPHCMnqxc=",
  },
  {
    _id: 4,
    projectName: "Smart Office Hub",
    projectType: "Commercial",
    projectDescription:
      "Modern co-working office hub in New Delhi, blending technology, flexibility, and eco-friendly materials.",
    projectImages:
      "https://media.istockphoto.com/id/1436308141/photo/smart-office-concept-modern-open-plan-office-interior-with-tables-office-chairs-computers-and.jpg?s=2048x2048&w=is&k=20&c=4ZucVWwk8U7VnALwxcWxU2aHFI8a1USb894VmUGe0uw=",
  },
];

export const testimonials = [
  {
    id: 1,
    clientName: "Amit Verma",
    clientRole: "Project Manager",
    clientCompany: "Skyline Builders",
    testimonialText:
      "Axisys Global Engineering transformed our residential tower project with unmatched expertise. Their BIM workflows saved us time and costs.",
    rating: 5,
  },
  {
    id: 2,
    clientName: "Sophia Brown",
    clientRole: "Architect",
    clientCompany: "GreenBuild Canada",
    testimonialText:
      "The level of innovation and attention to detail exceeded expectations. Truly a reliable partner for sustainable design.",
    rating: 4,
  },
  {
    id: 3,
    clientName: "Rahul Singh",
    clientRole: "CEO",
    clientCompany: "Future InfraTech",
    testimonialText:
      "Their engineering support was crucial for our industrial plant expansion. We highly recommend them for complex projects.",
    rating: 5,
  },
];

export const globalExcelservices = [
  {
    title: "India HQ",
    description:
      "Our foundation and primary operations center, serving clients across Asia-Pacific.",
    icon: <Globe size={48} />,
  },
  {
    title: "USA Expansion",
    description:
      "Growing presence in North America with local expertise and global standards.",
    icon: <Globe size={48} />,
  },
  {
    title: "Canada Operations",
    description:
      "Extending our reach to serve the Canadian market with innovative solutions.",
    icon: <Globe size={48} />,
  },
];
