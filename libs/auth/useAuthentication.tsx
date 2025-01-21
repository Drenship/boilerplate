"use client";
import { useState } from "react";
import axios from "axios";
import { signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { publicPages, authPages } from "@/config";
import useLoginModal from "@/libs/hooks/modals/useLoginModal";
import useRegisterModal from "@/libs/hooks/modals/useRegisterModal";
import { useTranslations } from "next-intl";

export default function useAuthentication() {
  const tAuth = useTranslations("Auth.toaster");
  const router = useRouter();
  const pathname = usePathname();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  const [isLoading, setIsLoading] = useState(false);

  const generateCallbackUrl = (defaultPath: string = "/"): string => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("callbackUrl")) {
      const rawCallbackUrl = urlParams.get("callbackUrl") || defaultPath;
      const parsedCallbackUrl = new URL(rawCallbackUrl, window.location.origin);

      // Fusionner les paramètres existants
      const mergedParams = new URLSearchParams(parsedCallbackUrl.search);
      for (const [key, value] of urlParams.entries()) {
        if (key !== "callbackUrl") {
          mergedParams.append(key, value);
        }
      }

      // Reconstruire et retourner l'URL finale
      return `${parsedCallbackUrl.pathname}?${mergedParams.toString()}`;
    }

    // Retourne le chemin par défaut si aucun callbackUrl n'est défini
    return defaultPath;
  };

  const handleLogin: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);

      // Effectuer la tentative de connexion avec les informations d'identification
      const callback = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      setIsLoading(false);

      if (callback?.ok && !callback?.error) {
        toast.success(tAuth("loginSuccess"));
        loginModal.onClose();

        // Utiliser la fonction pour générer l'URL de redirection
        const callbackUrl = generateCallbackUrl(
          authPages.includes(pathname) ? "/" : pathname
        );

        await router.push(callbackUrl);
        return true; // Succès
      } else if (callback?.error) {
        toast.error(callback.error || tAuth("loginError"));
        return false; // Échec
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(tAuth("unexpectedError"));
      return false; // Échec
    }
  };

  const handleRegister = async (
    data: FieldValues,
    onClose: () => void,
    onOpenLoginModal: () => void
  ): Promise<boolean | undefined> => {
    try {
      setIsLoading(true);

      const response = await axios.post("/api/auth/register", data);

      if (!response.data.error) {
        const callback = await signIn("credentials", {
          ...data,
          redirect: false,
        });

        setIsLoading(false);

        if (callback?.ok) {
          toast.success(tAuth("registerSuccess"));
          registerModal.onClose();

          // Utiliser la fonction pour générer l'URL de redirection
          const callbackUrl = generateCallbackUrl(
            authPages.includes(pathname) ? "/" : pathname
          );

          await router.push(callbackUrl);
          window.location.reload(); // Recharger la page après la redirection

          onClose();
          return true; // Succès
        }

        if (callback?.error) {
          toast.error(callback.error);
          onClose();
          onOpenLoginModal();
          return false; // Échec
        }
      } else {
        toast.error(response.data.message || tAuth("registerError"));
        return false; // Échec
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(tAuth("registerError"));
      return false; // Échec
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer le code de récupération
  const handleSendCodeRecovery = async (data: FieldValues) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/auth/send-recovery-code", {
        email: data.email,
      });

      setIsLoading(false);

      if (response.data.success) {
        toast.success(tAuth("sendCodeSuccess"));
        return true; // Succès
      } else {
        toast.error(response.data.message || tAuth("sendCodeError"));
        return false; // Échec
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(tAuth("sendCodeError"));
      return false; // Échec
    }
  };

  // Fonction pour vérifier le code de récupération
  const handleVerificationCode = async (data: FieldValues) => {
    try {
      setIsLoading(true);

      const response = await axios.post("/api/auth/verify-recovery-code", {
        email: data.email,
        code: data.code,
      });

      setIsLoading(false);

      if (response.data.success) {
        toast.success(tAuth("verifyCodeSuccess"));
        return true; // Retourner true pour indiquer que la vérification a réussi
      } else {
        toast.error(response.data.message || tAuth("verifyCodeError"));
        return false; // Retourner false en cas d'échec
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(tAuth("verifyCodeErrorFail"));
      return false; // Retourner false en cas d'erreur
    }
  };

  // Fonction pour mettre à jour le mot de passe
  const handleUpdatePassword = async (data: FieldValues) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/auth/update-password", {
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      setIsLoading(false);

      if (response.data.success) {
        toast.success(tAuth("updatePasswordSuccess"));
        router.push("/login");
        return true; // Succès
      } else {
        toast.error(response.data.message || tAuth("updatePasswordError"));
        return false; // Échec
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(tAuth("updatePasswordError"));
      return false; // Échec
    }
  };

  const handleUpdatePasswordWithOld = async (data: FieldValues) => {
    try {
      setIsLoading(true);
      if (data.newPassword !== data.confirmPassword) {
        toast.error(tAuth("newPasswordMismatch"));
        return false; // Échec
      }

      if (data.newPassword === data.currentPassword) {
        toast.error(tAuth("sameAsCurrentPassword"));
        return false; // Échec
      }

      const response = await axios.post("/api/auth/update-old-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      setIsLoading(false);

      if (response.data.success) {
        toast.success(tAuth("updatePasswordSuccess"));
        return true; // Succès
      } else {
        toast.error(response.data.message || tAuth("updatePasswordError"));
        return false; // Échec
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(tAuth("updatePasswordError"));
      return false; // Échec
    }
  };

  const handleOAuthLogin = (provider: string) => {
    // Générer l'URL de callback
    const callbackUrl = generateCallbackUrl("/");
    // Passer l'URL de callback au fournisseur OAuth
    signIn(provider, { callbackUrl });
  };

  const handleLogout = () => {
    // Supprimer le préfixe de langue du pathname
    const normalizedPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
    // Vérifier si la page actuelle correspond à l'une des pages publiques
    const isPublicPage = publicPages.some((page) =>
      new RegExp(`^${page}$`).test(normalizedPathname)
    );
    const callbackUrl = isPublicPage ? pathname : "/";
    signOut({ callbackUrl });
  };

  return {
    isLoading,
    handleLogin,
    handleRegister,
    handleSendCodeRecovery,
    handleVerificationCode,
    handleUpdatePassword,
    handleOAuthLogin,
    handleLogout,
    handleUpdatePasswordWithOld,
  };
}