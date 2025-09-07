import { Cpu, Building, Tools, Lightbulb } from "react-bootstrap-icons";

export const coreServices = [
  {
    _id: "1",
    serviceName: "Structural Engineering",
    serviceOrder: 1,
    icon: Cpu, // using bootstrap-icons
  },
  {
    _id: "2",
    serviceName: "Architecture",
    serviceOrder: 2,
    icon: Building,
  },
  {
    _id: "3",
    serviceName: "MEP Engineering",
    serviceOrder: 3,
    icon: Tools,
  },
  {
    _id: "4",
    serviceName: "BIM Solutions",
    serviceOrder: 4,
    icon: Lightbulb,
  },
];
