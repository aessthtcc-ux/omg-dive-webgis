import { HeaderItem } from "@/types/menu";

export const headerData: HeaderItem[] = [
  { label: "Homepage", href: "/" },
  { label: "Historical", href: "/historical" },
  { label: "Data", href: "/data" },
  {
    label: "Map",
    href: "/map2d",
    submenu: [
      { label: "2D Map", href: "/map2d" },
      { label: "3D Point Cloud", href: "/pointcloud" },
    ],
  },
  { label: "Overview", href: "/overview" },
  { label: "DiveDeeper", href: "/document" },
];  