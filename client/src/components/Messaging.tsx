import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Search, Plus, Block, Flag, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isBlocked?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  seen: boolean;
  delivered: boolean;
}

interface MessagingProps {
  onClose: () => void;
}

export default function Messaging({ onClose }: MessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      username: "adikeafrica",
      displayName: "Adike Africa",
      avatar: "https://i.pravatar.cc/150?img=1",
      lastMessage: "That's awesome!",
      timestamp: "2h",
      unread: 2,
      isBlocked: false,
    },
    {
      id: "2",
      username: "beat_masta",
      displayName: "Beat Masta",
      avatar: "https://i.pravatar.cc/150?img=2",
      lastMessage: "Check out my new beat",
      timestamp: "5h",
      unread: 0,
      isBlocked: false,
    },
    {
      id: "3",
      username: "kojoart",
      displayName: "Kojo Art",
      avatar: "https://i.pravatar.cc/150?img=3",
      lastMessage: "Love your work!",
      timestamp: "1d",
      unread: 0,
      isBlocked: false,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
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
      {
        id: "1",
        senderId: "other",
        senderName: "adikeafrica",
        content: "Hey! How are you?",
        timestamp: "14:30",
        seen: true,
        delivered: true,
      },
      {
        id: "2",
        senderId: "me",
        senderName: "you",
        content: "Doing great! How about you?",
        timestamp: "14:31",
        seen: true,
        delivered: true,
      },
      {
        id: "3",
        senderId: "other",
        senderName: "adikeafrica",
        content: "That's awesome!",
        timestamp: "14:32",
        seen: true,
        delivered: true,
      },
    ]);
    
    // Mark as read
    setConversations(prev =>
      prev.map(conv => (conv.id === id ? { ...conv, unread: 0 } : conv))
    );
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: String(messages.length + 1),
      senderId: "me",
      senderName: "you",
      content: messageInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      delivered: true,
      seen: false,
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");

    // Simulate typing indicator
    setTypingUsers(["adikeafrica"]);
    setTimeout(() => {
      setTypingUsers([]);
      // Simulate response
      setMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          senderId: "other",
          senderName: "adikeafrica",
          content: "Thanks for the message!",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          delivered: true,
          seen: true,
        },
      ]);
    }, 2000);
  };

  const handleBlockUser = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, isBlocked: !conv.isBlocked } : conv
      )
    );
  };

  const handleDeleteChat = (conversationId: string) => {
    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationId)
    );
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = selectedConversation
    ? conversations.find((c) => c.id === selectedConversation)
    : null;

  return (
    <div className="h-full flex flex-col bg-background">
      {selectedConversation && currentConversation ? (
        <>
          {/* Chat Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-back-conversations"
              >
                ←
              </button>
              <img
                src={currentConversation.avatar}
                alt={currentConversation.displayName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-sm">{currentConversation.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {typingUsers.length > 0 ? "typing..." : "Active now"}
                </p>
              </div>
            </div>

            {/* Chat Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-chat-menu">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleBlockUser(selectedConversation)}
                  data-testid="option-block-user"
                >
                  <Block className="h-4 w-4 mr-2" />
                  {currentConversation.isBlocked ? "Unblock" : "Block"} User
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="option-report">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Conversation
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteChat(selectedConversation)}
                  className="text-destructive"
                  data-testid="option-delete-chat"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1" viewportRef={scrollRef}>
            <div className="space-y-4 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                      msg.senderId === "me"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    }`}
                    data-testid={`message-${msg.id}`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                    {msg.senderId === "me" && (
                      <p className="text-xs mt-0.5 opacity-70">
                        {msg.seen ? "Seen" : "Delivered"}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <div
                      className="h-2 w-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          {!currentConversation.isBlocked && (
            <div className="p-4 border-t">
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
          )}
        </>
      ) : (
        <>
          {/* Conversation List Header */}
          <div className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Messages</h2>
            </div>
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
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-4">
              {filteredConversations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No conversations yet
                </p>
              ) : (
                filteredConversations.map((conv) => (
                  <Card
                    key={conv.id}
                    className={`p-4 cursor-pointer hover-elevate transition-all ${
                      conv.isBlocked ? "opacity-50" : ""
                    }`}
                    onClick={() => handleSelectConversation(conv.id)}
                    data-testid={`card-conversation-${conv.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={conv.avatar}
                        alt={conv.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm">{conv.displayName}</p>
                          <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-bold">
                            {conv.unread}
                          </span>
                        </div>
                      )}
                      {conv.isBlocked && (
                        <span className="text-xs text-destructive font-semibold">
                          Blocked
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
