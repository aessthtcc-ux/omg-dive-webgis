import DataAnalytics from "@/components/Data";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Data | OMG-DIVE",
};

const page = () => {
    const breadcrumbLinks = [
        { href: "/", text: "Home" },
        { href: "/speakers", text: "Speakers" },
      ];
  return (
    <>
      
      <DataAnalytics />
      
    </>
  );
};

export default page;
