"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import RecoveryForm from "@/components/ui/auth-form/recovery/RecoveryForm";
import VerificationCodeForm from "@/components/ui/auth-form/recovery/VerificationCodeForm";
import UpdatePasswordForm from "@/components/ui/auth-form/recovery/UpdatePasswordForm";

export default function PasswordRecoveryProcess() {
  const tAuth = useTranslations("Auth");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div>
      {step === 1 && (
        <RecoveryForm
          onNextStep={(emailValue: string) => {
            setEmail(emailValue);
            nextStep();
          }}
        />
      )}
      {step === 2 && (
        <VerificationCodeForm
          email={email}
          onNextStep={(codeValue: string) => {
            setCode(codeValue);
            nextStep();
          }}
          onPrevStep={prevStep}
        />
      )}
      {step === 3 && (
        <UpdatePasswordForm email={email} code={code} onPrevStep={prevStep} />
      )}
      <div className="mt-4 font-light text-center text-neutral-500">
        <Link href="/auth/login">
          {tAuth("hasAccount")}
          <span className="cursor-pointer text-neutral-800 hover:underline mx-2">
            {tAuth("login")}
          </span>
        </Link>
      </div>
    </div>
  );
}