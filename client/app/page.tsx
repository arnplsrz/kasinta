"use client";

import { useState } from "react";
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
import { Bricolage_Grotesque } from "next/font/google";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
});

export default function HomePage() {
  const { user, loading } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [refreshDiscovery, setRefreshDiscovery] = useState(0);

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
          className="w-full min-h-screen bg-background md:flex md:flex-col"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='18' viewBox='0 0 100 18'%3E%3Cpath fill='currentColor' fill-opacity='0.1' d='M61.82 18c3.47-1.45 6.86-3.78 11.3-7.34C78 6.76 80.34 5.1 83.87 3.42 88.56 1.16 93.75 0 100 0v6.16C98.76 6.05 97.43 6 96 6c-9.59 0-14.23 2.23-23.13 9.34-1.28 1.03-2.39 1.9-3.4 2.66h-7.65zm-23.64 0H22.52c-1-.76-2.1-1.63-3.4-2.66C11.57 9.3 7.08 6.78 0 6.16V0c6.25 0 11.44 1.16 16.14 3.42 3.53 1.7 5.87 3.35 10.73 7.24 4.45 3.56 7.84 5.9 11.31 7.34zM61.82 0h7.66a39.57 39.57 0 0 1-7.34 4.58C57.44 6.84 52.25 8 46 8S34.56 6.84 29.86 4.58A39.57 39.57 0 0 1 22.52 0h15.66C41.65 1.44 45.21 2 50 2c4.8 0 8.35-.56 11.82-2z'%3E%3C/path%3E%3C/svg%3E")`,
          }}
        >
          {/* Mobile Header */}
          <header className="md:hidden fixed top-0 left-0 right-0 z-20 bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between">
            <SidebarTrigger />
            <h1
              className={`text-2xl font-heading text-foreground ${bricolageGrotesque.className}`}
            >
              KASINTA
            </h1>
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
            <div className="h-svh mt-[58px] md:h-screen md:mt-0">
              <ChatInterface
                matchId={selectedMatchId}
                onUnmatch={() => {
                  setSelectedMatchId(null);
                  setRefreshDiscovery((prev) => prev + 1);
                }}
              />
            </div>
          ) : (
            <div className="h-[calc(100vh-58px)] mt-[58px] p-4 md:h-auto md:mt-0 md:flex-1 md:p-8 md:flex md:flex-col md:overflow-auto">
              <div className="max-w-7xl m-auto w-full h-full md:flex-1 md:flex md:flex-col">
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
