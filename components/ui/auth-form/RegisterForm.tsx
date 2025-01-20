"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
// libs
import useAuthentication from "@/libs/auth/useAuthentication";
import useLoginModal from "@/libs/hooks/modals/useLoginModal";
import useRegisterModal from "@/libs/hooks/modals/useRegisterModal";
import {validateEmail, verifyPassword } from "@/libs/utils/formvalidate";
// components
import { ButtonSave } from "@/components/ui/Buttons/buttons";
import ProviderOAuth from "@/components/ui/auth-form/ProviderOAuth";
import Input from "@/components/ui/Inputs/input";


interface RegisterFormProps {
  isModal?: boolean;
}

export default function RegisterForm({ isModal }: RegisterFormProps) {
  const t = useTranslations("Navigation");
  const tAuth = useTranslations("Auth");
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const { isLoading, handleRegister } = useAuthentication();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onToggle = useCallback(() => {
    loginModal.onOpen();
    registerModal.onClose();
  }, [loginModal, registerModal]);

  const onSubmit = async (data: FieldValues) => {
    // Vérification de l'email avec `validateEmail`
    if (!validateEmail(data.email)) {
      setError("email", {
        type: "manual",
        message: tAuth("error.email.invalid"),
      });
      return;
    }
  
    // Vérification des règles de sécurité du mot de passe avec `verifyPassword`
    const [isPasswordValid, passwordChecks] = verifyPassword(data.password);
  
    if (!isPasswordValid) {
      let errorMessage = tAuth("error.password.weak");
      
      // Détailler les erreurs spécifiques si nécessaire
      if (!passwordChecks.isLength) {
        errorMessage = tAuth("error.password.minLength");
      } else if (!passwordChecks.isUpperCase) {
        errorMessage = tAuth("error.password.upperCase");
      } else if (!passwordChecks.isLowerCase) {
        errorMessage = tAuth("error.password.lowerCase");
      } else if (!passwordChecks.isNumbers) {
        errorMessage = tAuth("error.password.numbers");
      } else if (!passwordChecks.isSpecialChars) {
        errorMessage = tAuth("error.password.specialChars");
      }
  
      setError("password", {
        type: "manual",
        message: errorMessage,
      });
      return;
    }
  
    // Appeler `handleRegister` si les validations sont réussies
    const isSuccess = await handleRegister(
      data,
      () => registerModal.onClose(),
      () => loginModal.onOpen()
    );
  
    if (!isSuccess) {
      // Définir une erreur manuelle si l'inscription échoue
      setError("email", {
        type: "manual",
        message: tAuth("error.generic.signupFailed"),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4 w-full">
        <Input
          id="name"
          label={tAuth("inputs.name")}
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input
          id="email"
          label={tAuth("inputs.email")}
          type="email"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input
          id="password"
          label={tAuth("inputs.password")}
          type="password"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />

        <ButtonSave
          isLoading={isLoading}
          disabled={isLoading}
          label={t("auth.sign-up")}
          onclick={handleSubmit(onSubmit)}
          className="h-14 text-xl active:scale-[0.975]"
        />
      </div>

      <div className="flex flex-col gap-4 mt-3">
        <hr />
        <ProviderOAuth />

        <div className="mt-4 font-light text-center text-neutral-500">
          <Link
            href="/auth/login"
            onClick={(e) => {
              if (isModal) {
                e.stopPropagation();
                e.preventDefault();
                onToggle();
              }
            }}
          >
            {tAuth("hasAccount")}
            <span className="cursor-pointer text-neutral-800 hover:underline mx-2">
              {tAuth("login")}
            </span>
          </Link>
        </div>
      </div>
    </form>
  );
}