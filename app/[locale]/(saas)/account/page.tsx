"use client";

import { PriceRange } from "@/components/ui/filters/price-range";
import { ModalWrapperV1 } from "@/components/ui/modals/modal-wrapper-v1";
import { useState } from "react";

export default function Account() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div>
        <button onClick={() => setIsOpen(prev => !prev)}>Open modal</button>
        <div className="block w-full md:max-w-sm p-4 bg-gray-200/15 rounded-xl border">
          <PriceRange />
        </div>
      </div>

      <ModalWrapperV1
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="welcome"
      >
        <h1>Hello</h1>
      </ModalWrapperV1>
    </>
  );
}
