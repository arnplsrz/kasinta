"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { matchAPI, chatAPI, API_BASE_URL } from "@/lib/api";
import { Match, Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, User } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function ChatInterface({ matchId }: { matchId: string }) {
  const { user } = useAuth();
  const {
    connected,
    sendMessage: socketSendMessage,
    onNewMessage,
  } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

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
        const otherUserId =
          currentMatch.user1Id === user?.id
            ? currentMatch.user2?.id
            : currentMatch.user1?.id;
        if (otherUserId) {
          const messagesData = await chatAPI.getMessages(otherUserId);
          setMessages(messagesData);
        }
      }
    } catch (error) {
      console.error("Failed to load match/messages:", error);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !match || sending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setSending(true);

    const otherUserId =
      match.user1Id === user?.id ? match.user2?.id : match.user1?.id;

    if (!otherUserId) return;

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
      console.error("Failed to send message:", error);
      setMessageInput(content);
    } finally {
      setSending(false);
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
    <div className="h-screen flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b-2 border-border bg-secondary-background flex items-center gap-3">
          <button
            onClick={() => setShowProfileSidebar(!showProfileSidebar)}
            className="flex items-center gap-3 hover:bg-background p-2 rounded-base transition"
          >
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
            <h3 className="font-heading text-foreground">
              {otherUser.name.trim().split(" ")[0]}
            </h3>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t-2 border-border bg-secondary-background"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
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

      {/* Profile Sidebar */}
      {showProfileSidebar && (
        <div className="w-80 border-l-2 border-border bg-secondary-background p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading text-foreground">Profile</h3>
            <button
              onClick={() => setShowProfileSidebar(false)}
              className="text-foreground/70 hover:text-foreground"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="flex justify-center">
              {otherUser.profilePhoto ? (
                <img
                  src={`${API_BASE_URL}${otherUser.profilePhoto}`}
                  alt={otherUser.name}
                  className="w-48 h-48 object-cover rounded-base border-2 border-border shadow-shadow"
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
          </div>
        </div>
      )}
    </div>
  );
}
