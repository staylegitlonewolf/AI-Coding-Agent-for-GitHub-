"use client";
import { signIn, signOut } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

export function ButtonLogin() {
  return (
    <button 
      onClick={() => signIn("github")}
      className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
    >
      <LogIn className="w-5 h-5" />
      Login with GitHub
    </button>
  );
}

export function ButtonLogout({ user }: { user: any }) {
  return (
    <div className="flex items-center gap-4">
      {user?.image ? <img src={user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" /> : null}
      <button 
        onClick={() => signOut()}
        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-slate-300 rounded-full text-sm font-medium transition-all"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
