"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Hero from "@/components/layout/Hero";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import DiscoverySection from "@/components/layout/DiscoverySection";
import ChatInterface from "@/components/layout/ChatInterface";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

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

  const handleMatchSelect = (matchId: string | null) => {
    setSelectedMatchId(matchId);
  };

  const handleBackToDiscovery = () => {
    setSelectedMatchId(null);
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar
          selectedMatchId={selectedMatchId}
          onMatchSelect={handleMatchSelect}
          onBackToDiscovery={handleBackToDiscovery}
        />
        <main className="w-full min-h-screen bg-background">
          {selectedMatchId ? (
            <ChatInterface matchId={selectedMatchId} />
          ) : (
            <div className="h-full p-4 md:p-8">
              <div className="h-full max-w-7xl m-auto">
                <DiscoverySection />
              </div>
            </div>
          )}
        </main>
      </SidebarProvider>
    </>
  );
}
