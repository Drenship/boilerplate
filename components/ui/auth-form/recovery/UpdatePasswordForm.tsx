"use client";
import React from "react";
import { useForm, FieldValues } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import useAuthentication from "@/libs/auth/useAuthentication";
import { verifyPassword } from "@/libs/utils/formvalidate";
import { ButtonSave } from "@/components/ui/Buttons/buttons";
import Input from "@/components/ui/Inputs/input";

interface UpdatePasswordFormProps {
  email: string;
  code: string;
  onPrevStep: () => void;
}

export default function UpdatePasswordForm({
  email,
  code,
  onPrevStep,
}: UpdatePasswordFormProps) {
  const tAuth = useTranslations("Auth");
  const { isLoading, handleUpdatePassword } = useAuthentication();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FieldValues) => {
    // Vérification si les mots de passe correspondent
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: tAuth("error.confirmPassword.match"), 
      });
      return;
    }
  
    // Vérification des règles de sécurité du mot de passe
    const [isPasswordValid, passwordErrors] = verifyPassword(data.newPassword);
  
    if (!isPasswordValid) {
      if (!passwordErrors.isLength) {
        setError("newPassword", {
          type: "manual",
          message: tAuth("error.password.minLength"), 
        });
      } else if (!passwordErrors.isUpperCase) {
        setError("newPassword", {
          type: "manual",
          message: tAuth("error.password.upperCase"), 
        });
      } else if (!passwordErrors.isLowerCase) {
        setError("newPassword", {
          type: "manual",
          message: tAuth("error.password.lowerCase"), 
        });
      } else if (!passwordErrors.isNumbers) {
        setError("newPassword", {
          type: "manual",
          message: tAuth("error.password.numbers"), 
        });
      } else if (!passwordErrors.isSpecialChars) {
        setError("newPassword", {
          type: "manual",
          message: tAuth("error.password.specialChars"), 
        });
      }
      return;
    }
  
    // Si toutes les validations passent, procéder à la mise à jour du mot de passe
    const isSuccess = await handleUpdatePassword({ ...data, email, code });
    if (!isSuccess) {
      setError("newPassword", {
        type: "manual",
        message: tAuth("error.generic.unexpected"), 
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
          id="newPassword"
          label={tAuth("inputs.newPassword")}
          type="password"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input
          id="confirmPassword"
          label={tAuth("inputs.confirmPassword")}
          type="password"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <ButtonSave
          isLoading={isLoading}
          disabled={isLoading}
          label={tAuth("updatePassword")}
          onclick={handleSubmit(onSubmit)}
          className="h-14 text-xl active:scale-[0.975]"
        />
      </div>
    </form>
  );
}