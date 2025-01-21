import { create } from "zustand";
import { TypeUser } from "@/libs/typings";

interface UserStore {
  user: TypeUser | null;
  setUser: (user: TypeUser) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user: TypeUser) => set({ user }),
}));