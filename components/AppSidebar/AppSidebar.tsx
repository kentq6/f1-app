"use client";

import { LayoutDashboard, Info, UserRoundPen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "../ui/sidebar";
import AppSidebarItem from "./AppSidebarItem";
import { useUser } from "@clerk/nextjs";
import Loading from "../Loading";

const AppSidebar = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loading />;
  }

  // Menu items available if loaded.
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "About",
      url: "/about",
      icon: Info,
    },
    // Only show profile if there's a user.
    ...(user
      ? [
          {
            title: "Profile",
            url: `/profile/${user.id}`,
            icon: UserRoundPen,
          },
        ]
      : []),
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <AppSidebarItem key={item.title} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
