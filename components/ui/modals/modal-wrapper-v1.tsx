"use client";
import React, { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ModalScreenBackground } from "./modal-screen-background";
import { ModalToggleAnimation } from "./modal-toggle-animation";

interface ModalWrapperV1Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function ModalWrapperV1({
  isOpen,
  onClose,
  children,
  title = "Dialog Title",
}: ModalWrapperV1Props) {
  return (
    <ModalScreenBackground isOpen={isOpen} onClose={onClose}>
      <ModalToggleAnimation>

        {/* Modal content */}
        <Dialog.Content className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[calc(100vh-env(safe-area-inset-top))] p-6 text-black">
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-xl">{title}</h3>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-lg flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Dynamic content passed via children */}
          <div className="space-y-6">{children}</div>
        </Dialog.Content>
        {/* Modal content --- end */}

      </ModalToggleAnimation>
    </ModalScreenBackground>
  );
}
