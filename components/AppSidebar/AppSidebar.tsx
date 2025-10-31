"use client";

import { Calendar, Home, Inbox } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "../ui/sidebar";
import AppSidebarItem from "./AppSidebarItem";

const AppSidebar = () => {
  // Menu items.
  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Drivers",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Teams",
      url: "#",
      icon: Calendar,
    },
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
