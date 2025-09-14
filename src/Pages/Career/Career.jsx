import React from 'react'
import './Career.css'
import CareerLanding from './CareerLanding'
import CustomeCard from '../../Components/CustomeCard/CustomeCard'
import { Globe, Heart, Lightbulb, MapFill, People } from 'react-bootstrap-icons';
import { Clock, TrendingUp } from 'lucide-react';
import OpenPosition from './OpenPosition';
import ApplyNow from './ApplyNow';
import DynamicCTA from '../../Components/DynamicCTA/DynamicCTA';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

export default function Career() {

  const innovationProcessList = [

    {
      icon: <Globe size={32} />,
      title: "Global Opportunities",
      description: `Work on international projects across India, USA, and Canada with diverse teams.`
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Career Growth",
      description: `Continuous learning opportunities and clear advancement paths in cutting-edge technology.`,
    },
    {
      icon: <Lightbulb size={32} />,
      title: "Innovation Focus",
      description: `Be part of pioneering AI-driven engineering solutions and breakthrough technologies.`,
    },
    {
      icon: <Heart size={26} />,
      title: "Work-Life Balance",
      description: `Flexible working arrangements and comprehensive wellness programs.`,
    },
  ];
  const remoteAndCollList = [

    {
      icon: <Globe size={32} />,
      title: "Global Team",
      description: `Work with talented professionals from around the world on diverse, challenging projects.`
    },
    {
      icon: <Clock size={32} />,
      title: "Flexible Hours",
      description: `Enjoy flexible working hours that accommodate your lifestyle and peak productivity times.`,
    },
    {
      icon: <People size={32} />,
      title: "Collaborative Culture",
      description: `Be part of a supportive, inclusive culture that values diverse perspectives and ideas.`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Careers at Axisys Global Engineering</title>
        <meta name="description" content="Join Axisys Global Engineering and be part of an innovative team transforming the AEC industry with AI-powered solutions. Explore current job openings and opportunities." />
        <meta name="keywords" content="engineering careers, jobs at Axisys, AI engineering jobs, career in construction technology" />
        <meta property="og:title" content="Axisys Global Careers" />
        <meta property="og:description" content="Explore career opportunities with our global engineering team." />
        <meta property="og:url" content="https://axisysglobal.com/career" />
      </Helmet>

      <div className="career_main">
        <CareerLanding />
        <CustomeCard
          cardDataList={innovationProcessList}
          title="Our Innovation Process"
          subTitle="How we continuously develop and integrate new technologies to stay at the forefront of engineering innovation."
        />
        <OpenPosition />
        <ApplyNow />
        <section>
          <Container>
            <CustomeCard
              title='Remote & International Collaboration'
              subTitle='We embrace flexible working arrangements and global collaboration, enabling our team to work effectively across time zones and continents.'
              cardDataList={remoteAndCollList}
            />
          </Container>
        </section>
        <DynamicCTA
          title="Ready to Shape the Future?"
          description="Join Axisys and be part of a team that's revolutionizing engineering through innovation, AI, and sustainable practices. Your next career adventure starts here."
          primaryBtnText="Apply Today"
          primaryBtnLink="#"
          secondaryBtnText="Learn About Our Culture"
          secondaryBtnLink="/about-us"
        />
      </div>
    </>
  )
}
