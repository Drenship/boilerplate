"use client";
import { Home, User, Briefcase, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/navbar/tubelight-navbar";

export default function HomePage() {

  const navItems = [
    { name: 'Home', url: '#', icon: Home },
    { name: 'About', url: '#', icon: User },
    { name: 'Projects', url: '#', icon: Briefcase },
    { name: 'Resume', url: '#', icon: FileText }
  ]

  return (
    <div className="relative p-2 md:p-10 flex flex-col gap-2 flex-1 w-full h-full">
      <NavBar items={navItems} />
    </div>
  );
}
