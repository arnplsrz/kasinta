import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import {
  Github,
  LogOut,
  User,
  Heart,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { matchAPI, API_BASE_URL } from "@/lib/api";
import type { Match } from "@/lib/types";

interface AppSidebarProps {
  selectedMatchId?: string | null;
  onMatchSelect: (matchId: string | null) => void;
  onBackToDiscovery: () => void;
}

export function AppSidebar({
  selectedMatchId,
  onMatchSelect,
  onBackToDiscovery,
}: AppSidebarProps) {
  const { user, logout } = useAuth();
  const { onNewMatch, onUnmatch, onNewMessage } = useSocket();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    const cleanupNewMatch = onNewMatch((match) => {
      setMatches((prev) => [match, ...prev]);
    });

    const cleanupUnmatch = onUnmatch((data) => {
      setMatches((prev) => prev.filter((m) => m.id !== data.matchId));
    });

    const cleanupNewMessage = onNewMessage((message) => {
      // Update last message for the match
      setMatches((prev) =>
        prev.map((match) => {
          const otherUserId =
            match.user1Id === user?.id ? match.user2?.id : match.user1?.id;
          if (
            otherUserId === message.senderId ||
            otherUserId === message.receiverId
          ) {
            return {
              ...match,
              lastMessage: message,
            };
          }
          return match;
        })
      );
    });

    return () => {
      cleanupNewMatch();
      cleanupUnmatch();
      cleanupNewMessage();
    };
  }, [onNewMatch, onUnmatch, onNewMessage, user]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await matchAPI.getMatches();
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (match: Match) => {
    if (!user) return null;
    return match.user1Id === user.id ? match.user2 : match.user1;
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex flex-row justify-between border-b-2 border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {user && (
              <div className="flex gap-3 items-center cursor-pointer">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`${API_BASE_URL}${user.profilePhoto}`}
                    alt="Profile"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-main text-main-foreground font-heading">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <h1 className="font-heading">
                  {user.name.trim().split(" ")[0]}
                </h1>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  href="/profile"
                  className="w-full flex gap-2 items-center"
                >
                  <User />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <a
                  href="https://github.com/arnplsrz/kasinta"
                  className="w-full flex gap-2 items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github />
                  <span>GitHub</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <div className="w-full flex gap-2 items-center">
                  <LogOut />
                  <span>Logout</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <ModeToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          {/* Back to Discovery Button */}
          {selectedMatchId && (
            <button
              onClick={onBackToDiscovery}
              className="w-full p-4 flex justify-between items-center gap-3 hover:bg-background transition border-b-2 border-border bg-main/5"
            >
              <span className="font-base text-foreground">
                Back to meeting new people
              </span>
              <ChevronRight />
            </button>
          )}

          {/* Chat Threads */}
          <div className="pb-2">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-base h-8 w-8 border-2 border-border border-t-main mx-auto"></div>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-4 text-center text-foreground/70 text-sm">
                <MessageCircle
                  size={32}
                  className="mx-auto mb-2 text-foreground/30"
                />
                <p>No matches yet</p>
              </div>
            ) : (
              matches.map((match) => {
                const otherUser = getOtherUser(match);
                if (!otherUser) return null;

                const isSelected = match.id === selectedMatchId;
                const hasUnread =
                  match.lastMessage &&
                  !match.lastMessage.read &&
                  match.lastMessage.senderId !== user?.id;

                return (
                  <button
                    key={match.id}
                    onClick={() => onMatchSelect(match.id)}
                    className={`w-full p-3 flex gap-3 hover:bg-background transition border-b-2 border-border ${
                      isSelected ? "bg-main/10" : ""
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            otherUser.profilePhoto
                              ? `${API_BASE_URL}${otherUser.profilePhoto}`
                              : ""
                          }
                          alt={otherUser.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-main/20 text-foreground font-heading">
                          {otherUser.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-main rounded-full border-2 border-secondary-background"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-base text-foreground truncate">
                        {otherUser.name}
                      </h4>
                      {match.lastMessage ? (
                        <p
                          className={`text-sm truncate ${
                            hasUnread
                              ? "font-base text-foreground"
                              : "text-foreground/60"
                          }`}
                        >
                          {match.lastMessage.senderId === user?.id
                            ? "You: "
                            : ""}
                          {match.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-foreground/60">
                          Start a conversation
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
