import { useSocket } from "@/contexts/SocketContext";
import { discoveryAPI, API_BASE_URL } from "@/lib/api";
import { PotentialMatch, Match } from "@/lib/types";
import { User, X, RotateCcw, Heart, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import FiltersSection from "@/components/layout/FilterPopover";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <div className="mb-6 hidden xl:block xl:p-1">
          <Card className="relative flex items-center bg-secondary-background p-4 gap-0">
            <Skeleton className="h-10 w-24" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Skeleton className="h-9 w-32" />
            </div>
          </Card>
        </div>

        <div className="flex-1 flex md:items-center md:justify-center overflow-hidden p-1">
          {/* Match Card Skeleton */}
          <Card className="w-full h-full overflow-hidden flex-1 md:flex-initial flex-col p-0 gap-0 bg-secondary-background">
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
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Desktop Header */}
      <div className="mb-6 hidden xl:block xl:p-1">
        <Card className="relative flex flex-col bg-secondary-background p-4 gap-4">
          <div className="relative flex items-center">
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
          </div>

          {/* Progress Bar */}
          {hasMoreMatches && (
            <div>
              <div className="flex items-center justify-between mb-2 text-xs md:text-sm text-foreground/70">
                <span>
                  Profile {currentIndex + 1} of {potentialMatches.length}
                </span>
                <span>
                  {Math.round(
                    ((currentIndex + 1) / potentialMatches.length) * 100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={((currentIndex + 1) / potentialMatches.length) * 100}
              />
            </div>
          )}
        </Card>
      </div>

      {hasMoreMatches ? (
        <div className="flex-1 flex flex-col overflow-hidden p-1">
          {/* Match Card  */}
          <Card className="w-full flex-1 flex-col overflow-hidden p-0 gap-0 bg-secondary-background">
            {/* Main Content */}
            <div className=" flex-1 flex sm:flex-row flex-col overflow-hidden min-h-0">
              {/* Profile Photo */}
              <div
                className="relative flex flex-1 items-center justify-center bg-main/10 sm:w-2/5 md:w-2/5 lg:w-1/3 shrink-0 border-border sm:border-r-2 border-b-2 sm:border-b-0 w-full h-64 sm:h-auto"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='currentColor' fill-opacity='0.25' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                {currentMatch.profilePhoto ? (
                  <img
                    src={`${API_BASE_URL}${currentMatch.profilePhoto}`}
                    alt={currentMatch.name}
                    className="w-full h-full object-contain sm:object-contain sm:mx-2 sm:w-auto sm:h-auto"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User
                      size={60}
                      className="text-foreground/30 md:w-20 md:h-20"
                    />
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="sm:flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="flex items-center justify-center flex-1 overflow-y-auto p-3 sm:p-2 lg:p-3 xl:p-6">
                  <div className="w-xl grid grid-cols-3 gap-2 md:gap-3 auto-rows-min">
                    {/* Name Card */}
                    <div className="bg-chart-1 col-span-2 rounded-base border-2 border-border p-3 md:p-4 flex flex-col justify-center">
                      <h3 className="text-lg md:text-2xl lg:text-3xl font-heading text-main-foreground">
                        {currentMatch.name}
                      </h3>
                    </div>

                    {/* Age Card */}
                    <div className="bg-chart-2 rounded-base border-2 border-border p-3 md:p-4 flex flex-col justify-center">
                      <p className="text-sm md:text-lg lg:text-xl text-main-foreground font-heading">
                        {currentMatch.age} years old
                      </p>
                    </div>

                    {/* Bio - Full Width */}
                    {currentMatch.bio && (
                      <div className="bg-chart-3 rounded-base border-2 border-border p-3 md:p-4 col-span-3">
                        <h4 className="font-heading text-main-foreground mb-2 text-sm md:text-base lg:text-lg">
                          About
                        </h4>
                        <p className="text-main-foreground/90 text-xs md:text-sm lg:text-base">
                          {currentMatch.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Centered */}
            <TooltipProvider>
              <div className="w-full p-4 md:p-6 flex justify-center gap-4 md:gap-6 border-t-2 border-border shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSwipe("dislike")}
                      disabled={swiping}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-base bg-secondary-background border-2 border-border text-foreground hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none shadow-shadow transition disabled:opacity-50 flex items-center justify-center"
                    >
                      <X size={28} className="md:w-8 md:h-8" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pass</p>
                  </TooltipContent>
                </Tooltip>
                {currentIndex > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleUndo}
                        disabled={swiping}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-base bg-secondary-background border-2 border-border text-foreground hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none shadow-shadow transition disabled:opacity-50 flex items-center justify-center"
                      >
                        <RotateCcw size={20} className="md:w-6 md:h-6" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Undo</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSwipe("like")}
                      disabled={swiping}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-base bg-main border-2 border-border text-main-foreground hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none shadow-shadow transition disabled:opacity-50 flex items-center justify-center"
                    >
                      <Heart size={28} className="md:w-8 md:h-8" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Like</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex md:items-center md:justify-center md:mb-10 overflow-hidden">
          <Card className="p-12 text-center flex-1 md:flex-initial flex-col items-center justify-center md:w-[600px] gap-0 bg-secondary-background">
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
          </Card>
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
