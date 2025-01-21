import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getUser, putUser } from "@/libs/actions/user.actions";
import { useUserStore } from "@/libs/store/userStore";
import { TypeUser } from "@/libs/typings";
import useEffectHasMounted from "@/libs/hooks/generics/useEffectHasMounted";

interface UseUserReturn {
  userId: string | null;
  user: TypeUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  isFetchingUser: boolean;
  error: string | null;
  refreshUser: () => void;
  updateUser: (updatedData: Partial<TypeUser>) => Promise<void>;
  updateUserSetting: (
    category: keyof TypeUser["settings"],
    key: string,
    value: boolean
  ) => Promise<void>;
}

export default function useUser(): UseUserReturn {
  const { data: session, status } = useSession();
  const { user, setUser } = useUserStore(); // Utilisation du store Zustand

  const {
    data: userData,
    isLoading: isFetchingUser,
    error,
    refetch: refreshUser,
  } = useQuery({
    queryKey: ["user", session?.user?.email],
    queryFn: async () => {
      const result = await getUser();
      if (result.success) {
        return result.user;
      } else {
        throw new Error(result.failure);
      }
    },
    enabled: status === "authenticated",
    staleTime: 6000,
    refetchOnWindowFocus: false,
  });

  useEffectHasMounted(() => setUser(userData), [userData]);

  // Mutation pour mettre à jour l'utilisateur
  const mutationUpdateUser = useMutation({
    mutationFn: async (updatedData: Partial<TypeUser>) => {
      const result = await putUser(updatedData);
      if (result.success) {
        setUser(result.user); // Mettre à jour dans le store
        return result.user;
      } else {
        throw new Error(result.failure);
      }
    },
  });

  // Fonction pour mettre à jour l'utilisateur
  const updateUser = async (updatedData: Partial<TypeUser>) => {
    return mutationUpdateUser.mutateAsync(updatedData);
  };

  // Fonction pour mettre à jour les paramètres de l'utilisateur
  const updateUserSetting = async (
    category: keyof TypeUser["settings"],
    key: string,
    value: boolean
  ) => {
    const updatedSettings = {
      ...user?.settings,
      [category]: {
        ...(user?.settings[category] || {}),
        [key]: value,
      },
    };
    return updateUser({ settings: updatedSettings });
  };

  return {
    userId: session?.user?._id || null,
    user: userData || user, // On récupère les données de react-query ou du store Zustand
    isAdmin: !!session?.user?.isAdmin, // Added optional chaining to prevent undefined error
    isLoading: isFetchingUser,
    error: error?.message || mutationUpdateUser.error?.message || null,
    refreshUser,
    updateUser,
    updateUserSetting,
  };
}
