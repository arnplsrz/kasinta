"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Heart, MessageCircle, User, Compass, LogOut } from "lucide-react";
import { chatAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Bricolage_Grotesque } from "next/font/google";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
});

export default function Header() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const data = await chatAPI.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  if (!user) return null;

  return (
    <header className="fixed left-0 top-0 z-20 w-full border-b-2 border-border bg-main">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-heading text-main-foreground hover:translate-x-0.5 hover:translate-y-0.5 transition-transform ${bricolageGrotesque.className}`}
        >
          KASINTA
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/discover"
            className="font-heading hover:translate-x-0.5 hover:translate-y-0.5 inline-block transition-transform"
          >
            Discover
          </Link>

          <Link
            href="/matches"
            className="font-heading hover:translate-x-0.5 hover:translate-y-0.5 inline-block transition-transform"
          >
            Matches
          </Link>

          <Link
            href="/chat"
            className="relative font-heading hover:translate-x-0.5 hover:translate-y-0.5 inline-block transition-transform"
          >
            Messages
            {unreadCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-base border border-border bg-chart-2 text-xs font-heading">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            className="font-heading hover:translate-x-0.5 hover:translate-y-0.5 inline-block transition-transform"
          >
            Profile
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <span className="hidden rounded-base border-2 border-border bg-secondary-background px-3 py-1 font-heading text-sm sm:block">
            {user.name}
          </span>
          <Button onClick={logout} size="sm" variant="noShadow">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="flex justify-around border-t-2 border-border bg-secondary-background py-2 md:hidden">
        <Link
          href="/discover"
          className="flex flex-col items-center gap-1 p-2 hover:translate-y-0.5 transition-transform"
        >
          <Compass size={20} />
          <span className="text-xs font-heading">Discover</span>
        </Link>

        <Link
          href="/matches"
          className="flex flex-col items-center gap-1 p-2 hover:translate-y-0.5 transition-transform"
        >
          <Heart size={20} />
          <span className="text-xs font-heading">Matches</span>
        </Link>

        <Link
          href="/chat"
          className="relative flex flex-col items-center gap-1 p-2 hover:translate-y-0.5 transition-transform"
        >
          <MessageCircle size={20} />
          <span className="text-xs font-heading">Messages</span>
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-base border border-border bg-chart-2 text-xs font-heading">
              {unreadCount > 9 ? "9" : unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 p-2 hover:translate-y-0.5 transition-transform"
        >
          <User size={20} />
          <span className="text-xs font-heading">Profile</span>
        </Link>
      </nav>
    </header>
  );
}
