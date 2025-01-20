"use client";
import React from "react";
import { useForm, FieldValues } from "react-hook-form";
import { useTranslations } from "next-intl";
import useAuthentication from "@/libs/auth/useAuthentication";
import { validateEmail } from "@/libs/utils/formvalidate";
import Input from "@/components/ui/Inputs/input";
import { ButtonSave } from "@/components/ui/Buttons/buttons";

interface RecoveryFormProps {
  onNextStep: (email: string) => void;
}

export default function RecoveryForm({ onNextStep }: RecoveryFormProps) {
  const tAuth = useTranslations("Auth");
  const { isLoading, handleSendCodeRecovery } = useAuthentication();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FieldValues) => {
    // Vérification de l'email avec `validateEmail`
    if (!validateEmail(data.email)) {
      setError("email", {
        type: "manual",
        message: tAuth("error.email.invalid"),
      });
      return;
    }

    const isSuccess = await handleSendCodeRecovery(data);
    if (isSuccess) {
      onNextStep(data.email);
    } else {
      // Définir une erreur manuellement si la requête échoue
      setError("email", {
        type: "manual",
        message: tAuth("error.generic.unexpected"),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4 w-full">
        <Input
          id="email"
          label={tAuth("inputs.email")}
          type="email"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <ButtonSave
          isLoading={isLoading}
          disabled={isLoading}
          label={tAuth("recoverPassword")}
          onclick={handleSubmit(onSubmit)}
          className="h-14 text-xl active:scale-[0.975]"
        />
      </div>
    </form>
  );
}