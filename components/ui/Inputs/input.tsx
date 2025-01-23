"use client";

import React, { useState } from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { BiDollar } from "react-icons/bi";
import { BiShow, BiHide } from "react-icons/bi";
import clsx from "clsx";

interface InputProps {
  id: string;
  label: string;
  type?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>; // Typage correct pour `register`
  errors: FieldErrors;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  disabled,
  formatPrice,
  register,
  required,
  errors,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="relative w-full">
      {formatPrice && (
        <BiDollar
          size={24}
          className="absolute text-neutral-700 top-5 left-2"
        />
      )}
      <input
        id={id}
        disabled={disabled}
        {...register(id, {
          required: required ? "Ce champ est requis" : false,
        })}
        placeholder=" "
        type={inputType}
        className={clsx(
          "peer w-full p-4 pt-6 font-light bg-white! border-2 rounded-md outline-hidden transition disabled:opacity-70 disabled:cursor-not-allowed text-black",
          {
            "pl-9": formatPrice,
            "pl-4": !formatPrice,
            "border-rose-500 focus:border-rose-500": errors[id],
            "border-neutral-300 focus:border-black": !errors[id],
          }
        )}
      />
      <label
        htmlFor={id}
        className={clsx(
          "absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4",
          {
            "left-9": formatPrice,
            "left-4": !formatPrice,
            "text-rose-500": errors[id],
            "text-zinc-400": !errors[id],
          }
        )}
      >
        {label}
      </label>
      {type === "password" && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute top-5 right-4 text-neutral-700 focus:outline-hidden"
        >
          {showPassword ? <BiHide size={24} /> : <BiShow size={24} />}
        </button>
      )}
      {errors[id] && (
        <p className="text-rose-500 text-sm mt-1">
          {errors[id]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Input;