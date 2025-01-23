"use client";
import React, { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";

interface ModalScreenBackgroundProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function ModalScreenBackground({
  isOpen,
  onClose,
  children,
}: ModalScreenBackgroundProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop with animation */}
        <motion.div
          className="fixed inset-0 z-99 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
        />

        {/* modale */}
        {children}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
