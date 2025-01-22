"use client";
import { Home, User, Briefcase, FileText } from "lucide-react";
import { NavBar } from "@/components/ui/navbar/tubelight-navbar";
import { ThemeToggle } from "@/components/ui/theme-switcher/theme-toggle";

export default function HomePage() {
  const navItems = [
    { name: "Home", url: "#", icon: Home },
    { name: "About", url: "#", icon: User },
    { name: "Projects", url: "#", icon: Briefcase },
    { name: "Resume", url: "#", icon: FileText },
  ];

  return (
    <div className="relative min-h-[200vh]">
      <header className="header--main">
        <div className="header--mask !-z-10" data-framer-name="Mask Pattern" />
        <nav className="flex items-center justify-between z-50">
          <h1 className="text-2xl font-black text-yellow-600">Hello</h1>
          <ThemeToggle />
        </nav>
      </header>
      <div className="relative p-2 md:p-10 flex flex-col gap-2 flex-1 w-full h-full">
        {/*<NavBar items={navItems} />*/}

        
      </div>
    </div>
  );
}
