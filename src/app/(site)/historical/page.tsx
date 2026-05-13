import React from "react";
import '@/Style/style.css'
import Tabularasa from "@/components/Historical/Tabularasa/tabularasa";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shipwreck Stories | OMG-DIVE",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/schedules", text: "Schedules" },
  ];
  return (
    <>
      <Tabularasa />
    </>
  );
};

export default page;
