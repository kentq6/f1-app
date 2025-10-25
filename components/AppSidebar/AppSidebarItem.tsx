import React from "react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

interface Item {
  title: string;
  url: string;
  icon: React.ElementType;
}

const AppSidebarItem: React.FC<Item> = ({ title, url, icon: Icon }) => {
  return (
    <SidebarMenuItem key={title}>
      <SidebarMenuButton asChild>
        <a href={url}>
          <Icon />
          <span>{title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default AppSidebarItem;
