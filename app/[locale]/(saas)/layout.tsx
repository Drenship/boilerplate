"use client";

import { DashboardLayout } from "@/components/ui/layout/DashboardLayout";
import useAuthentication from "@/libs/auth/useAuthentication";
import { LayoutDashboard, UserCog, Settings, LogOut } from "lucide-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { handleLogout } = useAuthentication();
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      action: handleLogout,
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
  ];

  return <DashboardLayout links={links}>{children}</DashboardLayout>;
}
