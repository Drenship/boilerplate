"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FieldValues, useForm } from "react-hook-form";
// libs
import useAuthentication from "@/libs/auth/useAuthentication";
import useLoginModal from "@/libs/hooks/modals/useLoginModal";
import useRegisterModal from "@/libs/hooks/modals/useRegisterModal";
// components
import Input from "@/components/ui/Inputs/input";
import ProviderOAuth from "@/components/ui/auth-form/ProviderOAuth";
import { ButtonSave } from "@/components/ui/Buttons/buttons";

interface LoginFormProps {
  isModal?: boolean;
}

export default function LoginForm({ isModal }: LoginFormProps) {
  const t = useTranslations("Navigation");
  const tAuth = useTranslations("Auth");
  const { isLoading, handleLogin } = useAuthentication();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const onSubmit = async (data: FieldValues) => {
    const isSuccess = await handleLogin(data);
  
    if (!isSuccess) {
      // Définir des erreurs manuellement si la connexion échoue
      setError("email", {
        type: "manual",
        message: tAuth("error.generic.loginFailed"),
      });
      setError("password", {
        type: "manual",
        message: tAuth("error.generic.loginFailed"),
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
          label={t("auth.sign-in")}
          onclick={handleSubmit(onSubmit)}
          className="h-14 text-xl active:scale-[0.975]"
        />
      </div>

      <div className="mt-3">
        <Link
          href="/auth/recovery"
          onClick={() => {
            if (isModal) {
              loginModal.onClose();
              registerModal.onClose();
            }
          }}
        >
          <span className="cursor-pointer text-neutral-800 hover:underline mx-2">
            {tAuth("passwordLost")}
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 mt-3">
        <hr />
        <ProviderOAuth />
        <div className="mt-4 font-light text-center text-neutral-500">
          <Link
            href="/auth/sign-up"
            onClick={(e) => {
              if (isModal) {
                e.stopPropagation();
                e.preventDefault();
                onToggle();
              }
            }}
          >
            {tAuth("noAccount")}
            <span className="cursor-pointer text-neutral-800 hover:underline mx-2">
              {tAuth("createAccount")}
            </span>
          </Link>
        </div>
      </div>
    </form>
  );
}