import { useEffect, useState, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
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
import type { Match, Message } from "@/lib/types";
import socket from "@/services/socket";

interface AppSidebarProps {
  selectedMatchId?: string | null;
  onMatchSelect: (matchId: string | null) => void;
  onBackToDiscovery: () => void;
  refreshTrigger?: number;
}

export function AppSidebar({
  selectedMatchId,
  onMatchSelect,
  onBackToDiscovery,
  refreshTrigger,
}: AppSidebarProps) {
  const { user, logout } = useAuth();
  const { onNewMatch, onUnmatch, onNewMessage, onUserStatusChange } = useSocket();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const selectedMatchIdRef = useRef<string | null>(null);

  // Keep ref in sync with prop
  useEffect(() => {
    selectedMatchIdRef.current = selectedMatchId || null;
  }, [selectedMatchId]);

  useEffect(() => {
    loadMatches();
  }, []);

  // Reload matches when refreshTrigger changes (e.g., after unmatch)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadMatches();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    const cleanupNewMatch = onNewMatch((match) => {
      setMatches((prev) => [match, ...prev]);
    });

    const cleanupUnmatch = onUnmatch((data) => {
      setMatches((prev) => prev.filter((m) => m.id !== data.matchId));

      // If the unmatched chat was currently selected, clear selection
      if (selectedMatchIdRef.current === data.matchId) {
        onMatchSelect(null);
      }
    });

    const updateLastMessage = (message: Message) => {
      // Update last message for the match
      setMatches((prev) =>
        prev.map((match) => {
          const otherUserId =
            match.user1Id === user?.id ? match.user2?.id : match.user1?.id;
          if (
            otherUserId === message.senderId ||
            otherUserId === message.receiverId
          ) {
            // If this match is currently selected and the message is from the other user,
            // mark it as read immediately
            const isCurrentlySelected = match.id === selectedMatchIdRef.current;
            const isIncoming = message.senderId === otherUserId;

            return {
              ...match,
              lastMessage: {
                ...message,
                read: isCurrentlySelected && isIncoming ? true : message.read,
              },
            };
          }
          return match;
        })
      );
    };

    const cleanupNewMessage = onNewMessage(updateLastMessage);

    // Also listen for messageSent events (for messages sent by this user)
    const socketInstance = socket.getSocket();
    if (socketInstance) {
      socketInstance.on("messageSent", updateLastMessage);
    }

    return () => {
      cleanupNewMatch();
      cleanupUnmatch();
      cleanupNewMessage();
      if (socketInstance) {
        socketInstance.off("messageSent", updateLastMessage);
      }
    };
  }, [onNewMatch, onUnmatch, onNewMessage, user]);

  // Listen for online status changes
  useEffect(() => {
    const cleanup = onUserStatusChange((data) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    return cleanup;
  }, [onUserStatusChange]);

  // Mark messages as read when a match is selected
  useEffect(() => {
    if (!selectedMatchId) return;

    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === selectedMatchId && match.lastMessage) {
          return {
            ...match,
            lastMessage: {
              ...match.lastMessage,
              read: true,
            },
          };
        }
        return match;
      })
    );
  }, [selectedMatchId]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await matchAPI.getMatches();
      setMatches(data);

      // Initialize online users from match data
      const initialOnlineUsers = new Set<string>();
      data.forEach((match) => {
        const otherUser = getOtherUser(match);
        if (otherUser?.isOnline) {
          initialOnlineUsers.add(otherUser.id);
        }
      });
      setOnlineUsers(initialOnlineUsers);
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
      <SidebarContent className={loading || matches.length === 0 ? "items-center justify-center" : ""}>
        <SidebarGroup className={loading || matches.length === 0 ? "flex-1 flex items-center justify-center" : "p-0"}>
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-base h-8 w-8 border-2 border-border border-t-main mx-auto"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-foreground/70 text-sm">
              <MessageCircle
                size={32}
                className="mb-2 text-foreground/30"
              />
              <p>No matches yet</p>
            </div>
          ) : (
            <>
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
              <div className="pb-2">{
              matches.map((match) => {
                const otherUser = getOtherUser(match);
                if (!otherUser) return null;

                const isSelected = match.id === selectedMatchId;
                const hasUnread =
                  !isSelected &&
                  match.lastMessage &&
                  !match.lastMessage.read &&
                  match.lastMessage.senderId !== user?.id;
                const isOnline = onlineUsers.has(otherUser.id);

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
                        <div className="absolute -top-1 right-0 w-3 h-3 bg-main rounded-full border-2 border-secondary-background"></div>
                      )}
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
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
              })}
              </div>
            </>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
