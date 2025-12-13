"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Hero from "@/components/layout/Hero";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import DiscoverySection from "@/components/layout/DiscoverySection";
import ChatInterface from "@/components/layout/ChatInterface";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FiltersSection from "@/components/layout/FilterPopover";
import { KasintaLogo } from "@/components/ui/kasinta-logo";

export default function HomePage() {
  const { user, loading } = useAuth();

  // Initialize selectedMatchId from URL parameters during render
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const matchIdFromUrl = params.get("matchId");
    if (matchIdFromUrl) {
      // Clean up URL immediately
      window.history.replaceState({}, "", window.location.pathname);
      return matchIdFromUrl;
    }
    return null;
  });

  const [refreshDiscovery, setRefreshDiscovery] = useState(0);

  // Handle notification clicks via popstate events
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const matchId = params.get("matchId");
      if (matchId) {
        setSelectedMatchId(matchId);
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="rounded-base border-2 border-border bg-secondary-background p-8 shadow-shadow text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-base border-4 border-border border-t-main"></div>
          <p className="font-base text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  if (!user) {
    return <Hero />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar
          selectedMatchId={selectedMatchId}
          onMatchSelect={(matchId: string | null) =>
            setSelectedMatchId(matchId)
          }
          onBackToDiscovery={() => {
            setSelectedMatchId(null);
          }}
          refreshTrigger={refreshDiscovery}
        />
        <main
          className="w-full h-screen bg-background flex flex-col overflow-hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='18' viewBox='0 0 100 18'%3E%3Cpath fill='currentColor' fill-opacity='0.1' d='M61.82 18c3.47-1.45 6.86-3.78 11.3-7.34C78 6.76 80.34 5.1 83.87 3.42 88.56 1.16 93.75 0 100 0v6.16C98.76 6.05 97.43 6 96 6c-9.59 0-14.23 2.23-23.13 9.34-1.28 1.03-2.39 1.9-3.4 2.66h-7.65zm-23.64 0H22.52c-1-.76-2.1-1.63-3.4-2.66C11.57 9.3 7.08 6.78 0 6.16V0c6.25 0 11.44 1.16 16.14 3.42 3.53 1.7 5.87 3.35 10.73 7.24 4.45 3.56 7.84 5.9 11.31 7.34zM61.82 0h7.66a39.57 39.57 0 0 1-7.34 4.58C57.44 6.84 52.25 8 46 8S34.56 6.84 29.86 4.58A39.57 39.57 0 0 1 22.52 0h15.66C41.65 1.44 45.21 2 50 2c4.8 0 8.35-.56 11.82-2z'%3E%3C/path%3E%3C/svg%3E")`,
          }}
        >
          {/* Mobile Header */}
          <header className="xl:hidden shrink-0 bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between">
            <SidebarTrigger />
            <KasintaLogo size="sm" />
            {!selectedMatchId && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"noShadow"} size="icon">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-main-foreground">
                  <FiltersSection />
                </PopoverContent>
              </Popover>
            )}
            {selectedMatchId && <div className="w-10" />}
          </header>

          {selectedMatchId ? (
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                matchId={selectedMatchId}
                onUnmatch={() => {
                  setSelectedMatchId(null);
                  setRefreshDiscovery((prev) => prev + 1);
                }}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden p-4 xl:p-8 flex flex-col">
              <div className="max-w-7xl m-auto w-full h-full flex flex-col">
                <DiscoverySection
                  onMatchSelect={(matchId: string) =>
                    setSelectedMatchId(matchId)
                  }
                />
              </div>
            </div>
          )}
        </main>
      </SidebarProvider>
    </>
  );
}
