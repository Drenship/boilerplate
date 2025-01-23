"use client";
import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface ModalToggleAnimationProps {
  children: ReactNode;
}

export function ModalToggleAnimation({ children }: ModalToggleAnimationProps) {
  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
