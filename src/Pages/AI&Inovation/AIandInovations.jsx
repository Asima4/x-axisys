import React from 'react'
import LandingAIandInovations from './LandingAIandInovations'
import './AIandInovations.css'
import DynamicCTA from '../../Components/DynamicCTA/DynamicCTA'
import OurAiInnovations from './OurAiInnovations'
import CustomeCard from '../../Components/CustomeCard/CustomeCard'
import { Cpu, LayerBackward, Layers } from 'react-bootstrap-icons'
import { FiZap } from 'react-icons/fi'
import { Brain } from 'lucide-react'
import StruxNovaPreview from './StruxNovaPreview/StruxNovaPreview'

export default function AIandInovations() {

  const AiCoreCapabilityList = [
    {
      icon: <Cpu size={32} />,
      title: "Core Engineering",
      items: ["Structural Engineering", "Architecture", "MEP Engineering", "Piping Engineering"],
    },
    {
      icon: <Brain size={32} />,
      title: "Digital Solutions",
      items: ["BIM Services", "3D Rendering & Animation", "AR/VR Integration", "3D Printing & Prototypes"],
    },
    {
      icon: <FiZap size={32} />,
      title: "Advanced Technology",
      items: ["AI-Assisted Design", "Drone & Laser Scanning", "Automation Solutions", "Smart Building Systems"],
    },
    {
      icon: <Layers size={32} />,
      title: "Sustainability",
      items: ["Sustainability Consulting", "Green Building Design", "Energy Efficiency", "Carbon Analysis"],
    },
  ];
  const innovationProcessList = [
    {
      icon: 1,
      title: "Research",
      description: `Identifying emerging technologies and their potential applications in engineering.`,
    },
    {
      icon: 2,
      title: "Development",
      description: `Creating prototypes and testing new solutions in controlled environments.`
    },
    {
      icon: 3,
      title: "Integration",
      description:`Seamlessly incorporating proven technologies into our existing workflows.`,
    },
    {
      icon: 4,
      title: "Deployment",
      description: `Rolling out innovations to deliver enhanced value to our clients.`,
    },
  ];


  return (
    <>
      <div className='aiAndInovations_main'>
        <LandingAIandInovations />
        <OurAiInnovations />
        <CustomeCard
          cardDataList={AiCoreCapabilityList}
          title="Core AI Capabilities"
          subTitle="The foundational technologies that power our intelligent engineering solutions and drive innovation across all our services."
        />
        <StruxNovaPreview/>
        <CustomeCard
          cardDataList={innovationProcessList}
          title="Our Innovation Process"
          subTitle="How we continuously develop and integrate new technologies to stay at the forefront of engineering innovation."
        />
        <DynamicCTA
          title="Experience the Future of Engineering"
          description="Ready to leverage AI-powered engineering solutions for your next project? Let's discuss how our innovative technologies can transform your vision into reality."
          primaryBtnText="Schedule AI Consultation"
          primaryBtnLink="/contact-us"
          secondaryBtnText="View AI-Enhanced Projects"
          secondaryBtnLink="/projects"
        />
      </div>
    </>
  )
}
