"use client";
import React, { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children?: ReactNode;
  title?: string;
};

export default function PageAuthLayout({ children, title }: Props) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center sm:p-4">
      <motion.div
        className="max-w-xl w-full bg-white/90 rounded-3xl shadow-2xl px-4 py-6  sm:p-10 backdrop-blur-lg border border-white/20"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        <h3 className="text-3xl font-bold mb-9 text-black">{title}</h3>
        {children}
      </motion.div>
    </div>
  );
}