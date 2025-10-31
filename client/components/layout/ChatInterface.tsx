"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { matchAPI, chatAPI, API_BASE_URL } from "@/lib/api";
import { Match, Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Info } from "lucide-react";
import { useRef, useState, useEffect, FormEvent } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import socket from "@/services/socket";
import Image from "next/image";

interface ChatInterfaceProps {
  matchId: string;
  onUnmatch?: () => void;
}

export default function ChatInterface({
  matchId,
  onUnmatch,
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const {
    connected,
    sendMessage: socketSendMessage,
    onNewMessage,
    onUnmatch: onSocketUnmatch,
    onUserStatusChange,
  } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [otherUserOnline, setOtherUserOnline] = useState(false);

  useEffect(() => {
    loadMatchAndMessages();
  }, [matchId]);

  useEffect(() => {
    const cleanup = onNewMessage((message: Message) => {
      if (!match) return;
      const otherUserId =
        match.user1Id === user?.id ? match.user2?.id : match.user1?.id;

      if (
        message.senderId === otherUserId ||
        message.receiverId === otherUserId
      ) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    return cleanup;
  }, [onNewMessage, match, user]);

  // Listen for unmatch events from other user
  useEffect(() => {
    const cleanup = onSocketUnmatch((data: { matchId: string }) => {
      if (data.matchId === matchId) {
        toast.info("Match ended", {
          description: "This match has been ended",
        });

        // Navigate back to discovery
        if (onUnmatch) {
          onUnmatch();
        }
      }
    });

    return cleanup;
  }, [onSocketUnmatch, matchId, onUnmatch]);

  useEffect(() => {
    if (!match || !user) return;

    const otherUserId =
      match.user1Id === user?.id ? match.user2?.id : match.user1?.id;

    if (!otherUserId) return;

    // console.log("Setting up typing/status listeners for user:", otherUserId);

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      // console.log("Received typing event:", data, "expecting:", otherUserId);
      if (data.userId === otherUserId) {
        // console.log("Setting isTyping to:", data.isTyping);
        setIsTyping(data.isTyping);
      }
    };

    // Listen for typing events using socket service
    const socketInstance = socket.getSocket();
    if (!socketInstance) {
      // console.log("No socket instance available for typing listener");
      return;
    }

    socketInstance.on("userTyping", handleUserTyping);

    // Listen for online status changes using context helper
    const cleanupStatusChange = onUserStatusChange((data) => {
      if (data.userId === otherUserId) {
        setOtherUserOnline(data.isOnline);
      }
    });

    return () => {
      socketInstance.off("userTyping", handleUserTyping);
      cleanupStatusChange();
    };
  }, [match, user, onUserStatusChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMatchAndMessages = async () => {
    setLoading(true);
    try {
      const matchesData = await matchAPI.getMatches();
      const currentMatch = matchesData.find((m) => m.id === matchId);
      if (currentMatch) {
        setMatch(currentMatch);
        const otherUser =
          currentMatch.user1Id === user?.id
            ? currentMatch.user2
            : currentMatch.user1;

        // Initialize online status
        if (otherUser) {
          setOtherUserOnline(otherUser.isOnline || false);
          const messagesData = await chatAPI.getMessages(otherUser.id);
          setMessages(messagesData);
        }
      }
    } catch (error) {
      // console.error("Failed to load match/messages:", error);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };

  const handleTyping = () => {
    if (!match || !connected) return;

    const otherUserId =
      match.user1Id === user?.id ? match.user2?.id : match.user1?.id;
    if (!otherUserId) return;

    // Get the socket instance
    const socketInstance = socket.getSocket();
    if (!socketInstance) {
      // console.log("No socket instance available for typing");
      return;
    }

    // Emit typing start
    // console.log("Emitting typing start to:", otherUserId);
    socket.sendTyping(otherUserId, true);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set timeout to emit typing stop
    const timeout = setTimeout(() => {
      // console.log("Emitting typing stop to:", otherUserId);
      socket.sendTyping(otherUserId, false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !match || sending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setSending(true);

    const otherUserId =
      match.user1Id === user?.id ? match.user2?.id : match.user1?.id;

    if (!otherUserId) return;

    // Stop typing indicator
    if (socket && connected) {
      socket.sendTyping(otherUserId, false);
    }
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    try {
      if (connected) {
        socketSendMessage(otherUserId, content);
        const tempMessage: Message = {
          id: Date.now().toString(),
          content,
          senderId: user!.id,
          receiverId: otherUserId,
          read: false,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, tempMessage]);
      } else {
        const message = await chatAPI.sendMessage(otherUserId, content);
        setMessages((prev) => [...prev, message]);
      }
      scrollToBottom();
      inputRef.current?.focus();
    } catch (error) {
      // console.error("Failed to send message:", error);
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleUnmatch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const otherUser =
        match?.user1Id === user?.id ? match?.user2 : match?.user1;
      const otherUserName = otherUser?.name || "this user";

      await matchAPI.unmatch(matchId);

      toast.info("User unmatched", {
        description: `Goodbye ${otherUserName}`,
      });

      // Navigate back to discovery section
      // The AppSidebar will be updated when we call onUnmatch
      // which will reload the matches list
      if (onUnmatch) {
        onUnmatch();
      }
    } catch (error) {
      toast.error("Failed to unmatch user", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      setLoading(false);
    }
  };

  if (loading || !match) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-base h-16 w-16 border-4 border-border border-t-main"></div>
      </div>
    );
  }

  const otherUser = match.user1Id === user?.id ? match.user2 : match.user1;

  if (!otherUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-foreground">Unable to load user information</p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="shrink-0 p-4 border-b-2 border-border bg-secondary-background flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
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
            {/* Online status indicator */}
            {otherUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-secondary-background"></div>
            )}
          </div>
          <div>
            <h3 className="font-heading text-foreground">
              {otherUser.name.trim().split(" ")[0]}
            </h3>

            {isTyping && (
              <p className="text-xs text-foreground/70">typing...</p>
            )}

            {!isTyping && otherUserOnline && (
              <p className="text-xs text-green-600">online</p>
            )}

            {!isTyping && !otherUserOnline && (
              <p className="text-xs text-foreground/40">offline</p>
            )}
          </div>
        </div>
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogTrigger asChild>
            <Button variant="noShadow" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex justify-center">
                {otherUser.profilePhoto ? (
                  <img
                    src={`${API_BASE_URL}${otherUser.profilePhoto}`}
                    alt={otherUser.name}
                    className="w-48 h-48 object-cover rounded-base border-2 border-border shadow-shadow"
                    width={192}
                    height={192}
                  />
                ) : (
                  <div className="w-48 h-48 bg-main/10 rounded-base border-2 border-border flex items-center justify-center">
                    <User size={80} className="text-foreground/30" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div>
                <h4 className="text-2xl font-heading text-foreground mb-2">
                  {otherUser.name}, {otherUser.age}
                </h4>
                <p className="text-sm text-foreground/70 capitalize">
                  {otherUser.gender}
                </p>
              </div>

              {/* Bio */}
              {otherUser.bio && (
                <div>
                  <h5 className="font-heading text-foreground mb-2">About</h5>
                  <p className="text-foreground/70">{otherUser.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full">Unmatch</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure to unmatch {otherUser.name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnmatch}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto flex flex-col-reverse"
      >
        <div className="flex flex-col space-y-4">
          <div ref={messagesEndRef} />
          {messages.map((message) => {
            const isMine = message.senderId === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-base border-2 border-border ${
                    isMine
                      ? "bg-main text-main-foreground"
                      : "bg-secondary-background text-foreground"
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMine ? "text-main-foreground/70" : "text-foreground/50"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 p-4 border-t-2 border-border bg-secondary-background"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-background border-2 border-border rounded-base text-foreground focus:ring-2 focus:ring-main outline-none"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="px-6 py-3 bg-main text-main-foreground rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition disabled:opacity-50 font-base"
          >
            Send
          </button>
        </div>
        {!connected && (
          <p className="text-xs text-yellow-600 mt-2">
            Reconnecting to chat server...
          </p>
        )}
      </form>
    </div>
  );
}
