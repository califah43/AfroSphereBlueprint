import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Search, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Conversation {
  id: string;
  username: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface MessagingProps {
  onClose: () => void;
}

export default function Messaging({ onClose }: MessagingProps) {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      username: "adikeafrica",
      avatar: "https://i.pravatar.cc/150?img=1",
      lastMessage: "That's awesome!",
      timestamp: "2 hours ago",
      unread: true,
    },
    {
      id: "2",
      username: "beat_masta",
      avatar: "https://i.pravatar.cc/150?img=2",
      lastMessage: "Check out my new beat",
      timestamp: "5 hours ago",
      unread: false,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    // Load messages for this conversation
    setMessages([
      { id: "1", senderId: "other", content: "Hey! How are you?", timestamp: "2 hours ago" },
      { id: "2", senderId: "me", content: "Doing great! How about you?", timestamp: "2 hours ago" },
      { id: "3", senderId: "other", content: "That's awesome!", timestamp: "2 hours ago" },
    ]);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: String(messages.length + 1),
      senderId: "me",
      content: messageInput,
      timestamp: "now",
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-0 sm:top-0 sm:w-full md:w-96 z-[60] p-4 sm:p-0 bg-background/95 backdrop-blur-sm flex flex-col h-screen sm:h-[600px]">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-bold">{t("messages") || "Messages"}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-messages">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {selectedConversation ? (
        <div className="flex flex-col flex-1">
          {/* Chat Header */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
              data-testid="button-back-conversations"
            >
              ← Back
            </Button>
            <div>
              <p className="font-semibold">
                {conversations.find((c) => c.id === selectedConversation)?.username}
              </p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.senderId === "me"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="pt-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
              data-testid="form-send-message"
            >
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1"
                data-testid="input-message"
              />
              <Button
                size="icon"
                type="submit"
                disabled={!messageInput.trim()}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Search and New Message */}
          <div className="pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-messages"
              />
            </div>
            <Button className="w-full" size="sm" data-testid="button-new-message">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-4">
              {filteredConversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="p-4 cursor-pointer hover-elevate"
                  onClick={() => handleSelectConversation(conv.id)}
                  data-testid={`card-conversation-${conv.id}`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conv.avatar}
                      alt={conv.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm">{conv.username}</p>
                        <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
