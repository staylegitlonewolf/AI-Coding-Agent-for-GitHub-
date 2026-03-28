"use client";
import { signIn, signOut } from "next-auth/react";
import { LogOut, GitMerge } from "lucide-react";

export function ButtonLogin() {
  return (
    <button 
      onClick={() => signIn("github")}
      className="mt-4 flex justify-center items-center gap-2 px-8 py-3 bg-white hover:bg-slate-200 text-slate-900 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
    >
      <GitMerge className="w-5 h-5" />
      Log In with GitHub
    </button>
  );
}

export function ButtonLogout() {
  return (
    <button 
      onClick={() => signOut()}
      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-slate-300 rounded-full text-sm font-medium transition-all"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
