"use client";
import React from "react";
import { useForm, FieldValues } from "react-hook-form";
import Input from "@/components/ui/Inputs/input";
import { ButtonSave } from "@/components/ui/Buttons/buttons";
import useAuthentication from "@/libs/auth/useAuthentication";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

interface VerificationCodeFormProps {
  email: string;
  onNextStep: (code: string) => void;
  onPrevStep: () => void;
}

export default function VerificationCodeForm({
  email,
  onNextStep,
  onPrevStep,
}: VerificationCodeFormProps) {
  const tAuth = useTranslations("Auth");
  const { isLoading, handleVerificationCode } = useAuthentication();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: FieldValues) => {
    
    if (data.code.length < 8) {
      setError("code", {
        type: "manual",
        message: tAuth("error.code.tooShort"),
      });
      return;
    }

    const isSuccess = await handleVerificationCode({ ...data, email });
    if (isSuccess) {
      onNextStep(data.code);
    } else {
      // Définir une erreur manuellement si la vérification échoue
      setError("code", {
        type: "manual",
        message: tAuth("error.code.invalid"), // Utilisation de la traduction pour le message d'erreur
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button
        type="button"
        onClick={onPrevStep}
        className="h-14 text-xl active:scale-[0.975] flex items-center"
      >
        <ArrowLeft /> {tAuth("goBack")}
      </button>
      <div className="flex flex-col gap-4 w-full">
        <Input
          id="code"
          label={tAuth("inputs.code")}
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <ButtonSave
          isLoading={isLoading}
          disabled={isLoading}
          label={tAuth("verifyCode")}
          onclick={handleSubmit(onSubmit)}
          className="h-14 text-xl active:scale-[0.975]"
        />
      </div>
    </form>
  );
}