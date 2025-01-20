import React from "react";
import { FcGoogle } from "react-icons/fc";
import { BiLogoDiscord, BiLogoGithub } from "react-icons/bi";
import useAuthentication from "@/libs/auth/useAuthentication";
import Button from "@/components/ui/Buttons/button";

export default function ProviderOAuth() {
  const { handleOAuthLogin } = useAuthentication();

  return (
    <div className="gap-4 grid grid-cols-1 lg:grid-cols-3">
      <Button
        outline
        label="Google"
        icon={FcGoogle}
        onClick={() => handleOAuthLogin("google")}
      />
      <Button
        outline
        label="Github"
        icon={BiLogoGithub}
        onClick={() => handleOAuthLogin("github")}
      />
      <Button
        outline
        label="Discord"
        icon={BiLogoDiscord}
        onClick={() => handleOAuthLogin("discord")}
      />
    </div>
  );
}