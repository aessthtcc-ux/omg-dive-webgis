import NotFound from "@/components/NotFound";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 Page | Symposium ",
};

const ErrorPage = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/contact", text: "404" },
  ];
  return (
    <>
      
      
      <NotFound />
    </>
  );
};

export default ErrorPage;
