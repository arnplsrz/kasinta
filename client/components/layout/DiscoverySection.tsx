import { useSocket } from "@/contexts/SocketContext";
import { discoveryAPI, API_BASE_URL } from "@/lib/api";
import { PotentialMatch, Match } from "@/lib/types";
import {
  User,
  MapPin,
  X,
  RotateCcw,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FiltersSection from "@/components/layout/FilterPopover";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

interface DiscoverySectionProps {
  onMatchSelect?: (matchId: string) => void;
}

export default function DiscoverySection({
  onMatchSelect,
}: DiscoverySectionProps = {}) {
  const { user } = useAuth();
  const { onNewMatch } = useSocket();

  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [newMatch, setNewMatch] = useState<Match | null>(null);

  useEffect(() => {
    loadPotentialMatches();
  }, [user]);

  useEffect(() => {
    const cleanup = onNewMatch((match) => {
      setNewMatch(match);
    });
    return cleanup;
  }, [onNewMatch]);

  const loadPotentialMatches = async () => {
    setLoading(true);
    try {
      const matches = await discoveryAPI.getPotentialMatches();
      setPotentialMatches(matches);
      setCurrentIndex(0);
    } catch (error) {
      toast.error("Failed to update preferences", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      console.error("Failed to load matches:", error);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  const handleSwipe = async (action: "like" | "dislike") => {
    if (swiping || currentIndex >= potentialMatches.length) return;

    setSwiping(true);
    const currentMatch = potentialMatches[currentIndex];

    try {
      const response = await discoveryAPI.swipe(currentMatch.id, action);
      if (response.match) {
        setNewMatch(response.match);
      }
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error("Swipe failed:", error);
    } finally {
      setSwiping(false);
    }
  };

  const handleUndo = async () => {
    if (currentIndex === 0) return;
    try {
      await discoveryAPI.undoSwipe();
      setCurrentIndex(currentIndex - 1);
    } catch (error) {
      console.error("Undo failed:", error);
    }
  };

  const currentMatch = potentialMatches[currentIndex];
  const hasMoreMatches = currentIndex < potentialMatches.length;

  if (loading) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <header className="relative mb-6 hidden md:flex items-center bg-secondary-background border-2 border-border rounded-base shadow-shadow p-4">
          <Skeleton className="h-10 w-24" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Skeleton className="h-9 w-32" />
          </div>
        </header>

        <div className="flex-1 flex md:items-center md:justify-center overflow-hidden">
          {/* Match Card Skeleton */}
          <div className="w-full h-full bg-secondary-background border-2 border-border rounded-base shadow-shadow overflow-hidden flex-1 md:flex-initial flex flex-col">
            {/* Profile Photo Skeleton */}
            <Skeleton className="h-full w-full rounded-none border-0" />

            {/* Bio Skeleton */}
            <div className="p-6 border-t-2 border-border space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="p-6 flex justify-center gap-6 border-t-2 border-border">
              <Skeleton className="w-16 h-16 rounded-base" />
              <Skeleton className="w-16 h-16 rounded-base" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <header className="relative mb-6 hidden md:flex items-center bg-secondary-background border-2 border-border rounded-base shadow-shadow p-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"noShadow"} className="hidden md:flex">
              <SlidersHorizontal />
              <span>Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-main-foreground">
            <FiltersSection />
          </PopoverContent>
        </Popover>

        <h2 className="text-3xl font-heading text-foreground text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          Discover
        </h2>
      </header>

      {hasMoreMatches ? (
        <div className="w-full flex-1 flex md:items-center md:justify-center overflow-hidden">
          {/* Match Card */}
          <div className="w-full h-full bg-secondary-background border-2 border-border rounded-base shadow-shadow overflow-hidden flex-1 md:flex-initial flex flex-col">
            {/* Profile Photo */}
            <div className="relative h-full bg-main/10">
              {currentMatch.profilePhoto ? (
                <img
                  src={`${API_BASE_URL}${currentMatch.profilePhoto}`}
                  alt={currentMatch.name}
                  className="mx-auto h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={80} className="text-foreground/30" />
                </div>
              )}
              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-overlay p-6 text-white">
                <h3 className="text-3xl font-heading mb-1">
                  {currentMatch.name}, {currentMatch.age}
                </h3>
                {currentMatch.distance && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin size={16} />
                    <span>{Math.round(currentMatch.distance)} km away</span>
                  </div>
                )}
              </div>
            </div>
            {/* Bio */}
            {currentMatch.bio && (
              <div className="p-6 border-t-2 border-border">
                <h4 className="font-heading text-foreground mb-2">About</h4>
                <p className="text-foreground/70">{currentMatch.bio}</p>
              </div>
            )}
            {/* Action Buttons */}
            <div className="p-6 flex justify-center gap-6 border-t-2 border-border">
              <button
                onClick={() => handleSwipe("dislike")}
                disabled={swiping}
                className="w-16 h-16 rounded-base bg-secondary-background border-2 border-border text-foreground hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none shadow-shadow transition disabled:opacity-50 flex items-center justify-center"
              >
                <X size={32} />
              </button>
              {currentIndex > 0 && (
                <button
                  onClick={handleUndo}
                  disabled={swiping}
                  className="w-14 h-14 rounded-base bg-secondary-background border-2 border-border text-foreground hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none shadow-shadow transition disabled:opacity-50 flex items-center justify-center"
                >
                  <RotateCcw size={24} />
                </button>
              )}
              <button
                onClick={() => handleSwipe("like")}
                disabled={swiping}
                className="w-16 h-16 rounded-base bg-main border-2 border-border text-main-foreground hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none shadow-shadow transition disabled:opacity-50 flex items-center justify-center"
              >
                <Heart size={32} />
              </button>
            </div>
            {/* Progress */}
            <div className="px-6 pb-4 text-center text-foreground/70 text-sm">
              {currentIndex + 1} / {potentialMatches.length}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex md:items-center md:justify-center md:mb-10 overflow-hidden">
          <div className="bg-secondary-background border-2 border-border rounded-base shadow-shadow p-12 text-center flex-1 md:flex-initial flex flex-col items-center justify-center md:w-[600px]">
            <Heart size={64} className="text-foreground/30 mx-auto mb-4" />
            <h3 className="text-2xl font-heading text-foreground mb-4">
              No more profiles
            </h3>
            <p className="text-foreground/70 mb-6">
              Check back later for new potential matches
            </p>
            <button
              onClick={loadPotentialMatches}
              className="bg-main border-2 border-border rounded-base px-6 py-3 font-base text-main-foreground shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Match Modal */}
      {newMatch && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-secondary-background border-2 border-border rounded-base shadow-shadow p-8 max-w-md w-full text-center">
            <Heart size={64} className="text-main mx-auto animate-pulse mb-6" />
            <h3 className="text-3xl font-heading text-foreground mb-4">
              It&apos;s a Match!
            </h3>
            <p className="text-foreground/70 mb-8">
              You and your match liked each other!
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setNewMatch(null)}
                className="flex-1 border-2 border-border rounded-base px-6 py-3 font-base text-foreground bg-secondary-background hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none shadow-shadow transition"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => {
                  if (onMatchSelect && newMatch) {
                    onMatchSelect(newMatch.id);
                    setNewMatch(null);
                  }
                }}
                className="flex-1 bg-main border-2 border-border rounded-base px-6 py-3 font-base text-main-foreground shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
