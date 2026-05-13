import React from 'react'
import { Metadata } from "next";
import Hero from '@/components/Home/Hero';
import Mapprev from '@/components/Home/Preview';
import WorkflowSteps from '@/components/Home/Process';
import Sdgs from '@/components/Home/Sdgs';
import PramukaOverview  from "@/components/Overview/PramukaOverview";
import BlueEconomy from '@/components/Home/BlueEconomy';
import Testimonials from '@/components/Historical/Poso';
export const metadata: Metadata = {
  title: "OMG-DIVE | Shipwreck StoryMap",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Mapprev/>
      <WorkflowSteps/>
      <Sdgs/>
      <BlueEconomy/>
      
    </main>
  )
}
