"use client";
import { Home, User, Briefcase, FileText } from "lucide-react";
import { NavBar } from "@/components/ui/navbar/tubelight-navbar";
import { ThemeToggle } from "@/components/ui/theme-switcher/theme-toggle";
import useUser from "@/libs/hooks/datas/useUser";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="relative min-h-[200vh]">
      <header className="header--main">
        <div className="header--mask -z-10!" data-framer-name="Mask Pattern" />
        <nav className="flex items-center justify-between z-50">
          <h1 className="text-2xl font-black text-yellow-600">Hello</h1>
          {user ? (
            <div className="flex items-center gap-4 justify-end">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="px-3 py-1.5 bg-slate-700 rounded-full border border-white active:scale-95 duration-200 transition-all text-sm uppercase tracking-widest shadow-sm"
              >
                Dashboard
              </Link>
              <Image
                src={user?.image || "/default-panda-pp.png"}
                className="h-8 w-8 shrink-0 rounded-full shadow-sm"
                width={50}
                height={50}
                alt="Avatar"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 justify-end">
              <ThemeToggle />
              <Link
                href="/auth/sign-in"
                className="px-3 py-1.5 bg-slate-700 rounded-full border border-white active:scale-95 duration-200 transition-all text-sm uppercase tracking-widest shadow-sm"
              >
                Sign-in
              </Link>
            </div>
          )}
        </nav>
      </header>
      <div className="relative p-2 md:p-10 flex flex-col gap-2 flex-1 w-full h-full">
        {/*<NavBar items={[
          { name: "Home", url: "#", icon: Home },
          { name: "About", url: "#", icon: User },
          { name: "Projects", url: "#", icon: Briefcase },
          { name: "Resume", url: "#", icon: FileText },
        ]} />*/}
      </div>
    </div>
  );
}
