import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Search, Plus, Blocks, Flag, Trash2, User } from "lucide-react";
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
  oriDescription?: string;
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
  onProfileClick?: (username: string) => void;
}

export default function Messaging({ onClose, onProfileClick }: MessagingProps) {
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
      oriDescription: "Fashion visionary exploring African textures and modern silhouettes.",
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
      oriDescription: "Sound architect blending Afrobeat rhythms with electronic soul.",
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
      oriDescription: "Visual storyteller capturing the essence of Ghanaian street life.",
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setIsCreatingNew(false);
    // Load messages for this conversation - reverse order for latest at bottom
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

  const startNewChat = (user: any) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.username === user.username);
    if (existing) {
      handleSelectConversation(existing.id);
    } else {
      const newConv: Conversation = {
        id: `new-${Date.now()}`,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar || `https://avatar.vercel.sh/${user.username}`,
        lastMessage: "Start a conversation",
        timestamp: "Now",
        unread: 0,
        oriDescription: user.bio || "African creator exploring new horizons."
      };
      setConversations(prev => [newConv, ...prev]);
      handleSelectConversation(newConv.id);
    }
    setIsCreatingNew(false);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: String(Date.now()),
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

    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");

    // Update last message in conversation list
    setConversations(prev => 
      prev.map(conv => conv.id === selectedConversation ? { ...conv, lastMessage: messageInput, timestamp: "Just now" } : conv)
    );

    // Simulate typing indicator
    const currentConv = conversations.find(c => c.id === selectedConversation);
    if (currentConv) {
      setTimeout(() => setTypingUsers([currentConv.username]), 1000);
      setTimeout(() => {
        setTypingUsers([]);
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            senderId: "other",
            senderName: currentConv.username,
            content: "Thanks for the message! I'll get back to you soon.",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            delivered: true,
            seen: true,
          },
        ]);
        setConversations(prev => 
          prev.map(conv => conv.id === selectedConversation ? { ...conv, lastMessage: "Thanks for the message!...", timestamp: "Just now" } : conv)
        );
      }, 3000);
    }
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
      {isCreatingNew ? (
        <>
          {/* New Chat Header */}
          <div className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8"
                onClick={() => setIsCreatingNew(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-black tracking-tight">New Message</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className="pl-10 rounded-xl bg-muted/30 border-none"
                autoFocus
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Suggested</p>
              {/* Using existing conversations as "suggested" for demo, in real app would search all users */}
              {conversations.filter(c => 
                c.username.toLowerCase().includes(newChatSearch.toLowerCase()) || 
                c.displayName.toLowerCase().includes(newChatSearch.toLowerCase())
              ).map(user => (
                <button
                  key={user.id}
                  onClick={() => startNewChat(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/30 transition-all active:scale-[0.98]"
                >
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="h-10 w-10 rounded-full object-cover border border-primary/10"
                  />
                  <div className="text-left">
                    <p className="font-bold text-sm">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </>
      ) : selectedConversation && currentConversation ? (
        <>
          {/* Chat Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-muted-foreground hover:text-foreground p-1"
                data-testid="button-back-conversations"
              >
                ←
              </button>
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onProfileClick?.(currentConversation.username)}
              >
                <img
                  src={currentConversation.avatar}
                  alt={currentConversation.displayName}
                  className="h-10 w-10 rounded-full object-cover border border-primary/20"
                />
                <div>
                  <p className="font-bold text-sm flex items-center gap-1">
                    {currentConversation.displayName}
                    <span className="h-2 w-2 rounded-full bg-primary/40" title="ORÍ Badge" />
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                    {typingUsers.length > 0 ? "typing..." : "Active now"}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-chat-menu">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-primary/10 shadow-xl">
                <DropdownMenuItem
                  onClick={() => onProfileClick?.(currentConversation.username)}
                  className="font-bold text-xs"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBlockUser(selectedConversation)}
                  className="font-bold text-xs"
                  data-testid="option-block-user"
                >
                  <Blocks className="h-4 w-4 mr-2" />
                  {currentConversation.isBlocked ? "Unblock" : "Block"} User
                </DropdownMenuItem>
                <DropdownMenuItem className="font-bold text-xs" data-testid="option-report">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Conversation
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteChat(selectedConversation)}
                  className="text-destructive font-bold text-xs"
                  data-testid="option-delete-chat"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ORÍ Description visible at top of chat */}
          {currentConversation.oriDescription && (
            <div className="bg-primary/5 p-3 text-center border-b border-primary/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">ORÍ INSIGHT</p>
              <p className="text-xs text-muted-foreground italic leading-tight">
                "{currentConversation.oriDescription}"
              </p>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4 flex flex-col">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm shadow-sm ${
                      msg.senderId === "me"
                        ? "bg-primary text-primary-foreground rounded-tr-none gold-glow-sm"
                        : "bg-muted/50 border border-border/50 rounded-tl-none"
                    }`}
                    data-testid={`message-${msg.id}`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[10px]">
                      <span>{msg.timestamp}</span>
                      {msg.senderId === "me" && (
                        <span className="font-bold uppercase tracking-tighter">
                          {msg.seen ? "Seen" : "Sent"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted/50 border border-border/50 p-3 px-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          {!currentConversation.isBlocked ? (
            <div className="p-4 border-t bg-background/50 backdrop-blur-sm pb-24">
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
                  className="flex-1 rounded-xl bg-muted/30 border-primary/10 focus-visible:ring-primary/30"
                  data-testid="input-message"
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="rounded-xl shadow-lg gold-glow active-elevate-2"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="p-6 text-center border-t bg-muted/10 pb-28">
              <p className="text-sm font-bold text-destructive">You have blocked this user</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary font-black uppercase tracking-widest text-[10px] hover:bg-transparent"
                onClick={() => handleBlockUser(selectedConversation)}
              >
                Unblock to send messages
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Conversation List Header */}
          <div className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight">Messages</h2>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full bg-primary/5 hover:bg-primary/10"
                onClick={() => setIsCreatingNew(true)}
                data-testid="button-new-message"
              >
                <Plus className="h-5 w-5 text-primary" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-muted/30 border-none"
                data-testid="input-search-messages"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2 pb-24">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <MessageCircle className="h-12 w-12 text-primary/10 mx-auto mb-4" />
                  <p className="font-bold text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start chatting with African creators around you.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    className={`w-full text-left p-3 rounded-2xl transition-all active:scale-[0.98] ${
                      conv.unread > 0 ? "bg-primary/5 shadow-sm" : "hover:bg-muted/30"
                    } ${conv.isBlocked ? "opacity-50 grayscale" : ""}`}
                    onClick={() => handleSelectConversation(conv.id)}
                    data-testid={`card-conversation-${conv.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={conv.avatar}
                          alt={conv.displayName}
                          className="h-14 w-14 rounded-full object-cover border-2 border-primary/10"
                        />
                        {conv.unread > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                            <span className="text-[10px] text-primary-foreground font-black">
                              {conv.unread}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`font-black text-sm truncate ${conv.unread > 0 ? "text-foreground" : "text-foreground/80"}`}>
                            {conv.displayName}
                          </p>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                            {conv.timestamp}
                          </span>
                        </div>
                        <p className={`text-xs truncate leading-tight ${conv.unread > 0 ? "font-bold text-foreground/70" : "text-muted-foreground"}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.isBlocked && (
                        <div className="px-2 py-1 rounded bg-destructive/10">
                          <span className="text-[8px] text-destructive font-black uppercase tracking-widest">
                            Blocked
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}

function MessageCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.5 8.5 0 0 1 8.5 7.9Z" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
      <path d="M8 12h.01" />
    </svg>
  );
}

