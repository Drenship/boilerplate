"use client";
import clsx from "clsx";
import { Loader2, Trash2 } from "lucide-react";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface ButtonProps {
  icon?: React.ReactElement;
  iconRight?: React.ReactElement;
  label: string;
  onclick: (x?: any) => void;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  useRef?: React.Ref<HTMLElement>;
}

export const ButtonDefault: React.FC<ButtonProps> = ({
  icon,
  iconRight,
  label,
  onclick,
  disabled,
  isLoading,
  className,
  useRef,
}) => {
  return (
    <button
      ref={useRef as React.RefObject<HTMLButtonElement>}
      onClick={onclick}
      className={clsx(
        "flex items-center justify-center text-sm font-medium rounded-md border shadow-md py-1.5 px-2 active:scale-95",
        className,
        isLoading && "motion-safe:animate-pulse"
      )}
      disabled={disabled || isLoading}
    >
      {icon}
      {label}
      {iconRight}
    </button>
  );
};

export const ButtonTrash: React.FC<
  Omit<ButtonProps, "label"> & {
    label?: string;
    integrationName?: string;
  }
> = ({
  label = "",
  onclick,
  disabled,
  className,
  useRef,
  integrationName = "",
}) => {
  const t = useTranslations("Global");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          ref={useRef as React.RefObject<HTMLButtonElement>}
          className={`flex items-center justify-center text-sm font-medium rounded-md border shadow-md py-1.5 px-2 active:scale-95 ${className} aspect-square group transition-all duration-300 hover:border-red-500/40 hover:shadow-red-500/40`}
          disabled={disabled}
        >
          <Trash2 size={16} className="group-hover:text-red-500 group-hover:border-red-500 transition-all duration-300" />
          {label}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("delete.title", { integration: integrationName })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete.description", {
              integration: integrationName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("navigation.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onclick}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("crud.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const ButtonSave: React.FC<
  Omit<ButtonProps, "icon"> & {
    isLoading?: boolean;
    type?: "button" | "submit";
  }
> = ({
  label,
  onclick,
  disabled,
  isLoading,
  className,
  type = "submit",
  useRef,
}) => {
  return (
    <button
      ref={useRef as React.RefObject<HTMLButtonElement>}
      type={type}
      className={clsx(
        "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-sky-900 via-sky-950 to-gray-900 hover:from-sky-800 hover:via-sky-900 hover:to-gray-900 text-slate-300 hover:text-white transition-all duration-300 active:scale-95 px-8 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:shadow-custom-blue uppercase disabled:text-white disabled:active:scale-100 disabled:cursor-not-allowed",
        className,
        isLoading && "motion-safe:animate-pulse"
      )}
      disabled={disabled || isLoading}
      onClick={onclick}
    >
      {isLoading && <Loader2 className="motion-safe:animate-spin h-5 w-5" />}
      {label || "Save content"}
    </button>
  );
};