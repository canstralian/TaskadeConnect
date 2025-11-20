import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Brain, Send, Trash2, Loader2, Sparkles, User, Bot, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { connectionsAPI, mcpAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function AIAgent() {
  const [, setLocation] = useLocation();
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: connectionsAPI.getAll,
  });

  const aiConnections = connections?.filter(c => c.service === "ai_agent" && c.status === "connected") || [];

  useEffect(() => {
    if (aiConnections.length > 0 && !selectedConnectionId) {
      setSelectedConnectionId(aiConnections[0].id);
    }
  }, [aiConnections, selectedConnectionId]);

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["mcp-messages", selectedConnectionId],
    queryFn: () => selectedConnectionId ? mcpAPI.getMessages(selectedConnectionId) : Promise.resolve([]),
    enabled: !!selectedConnectionId,
  });

  const chatMutation = useMutation({
    mutationFn: mcpAPI.chat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mcp-messages", selectedConnectionId] });
      setMessage("");
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const clearMutation = useMutation({
    mutationFn: mcpAPI.clearMessages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mcp-messages", selectedConnectionId] });
      toast({ title: "Conversation cleared" });
    },
    onError: () => {
      toast({ title: "Failed to clear conversation", variant: "destructive" });
    },
  });

  const handleSend = () => {
    if (!message.trim() || !selectedConnectionId) return;

    chatMutation.mutate({
      connectionId: selectedConnectionId,
      userMessage: message,
      model,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (aiConnections.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/connections">
            <Button variant="ghost" size="icon" className="cursor-pointer" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Agent</h1>
            <p className="text-muted-foreground mt-1">Chat with AI agents via MCP.</p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle>No AI Agent Connections</CardTitle>
            <CardDescription>
              You need to create an AI agent connection first to start chatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/connections">
              <Button className="cursor-pointer" data-testid="button-createConnection">
                <Sparkles className="w-4 h-4 mr-2" />
                Create AI Connection
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedConnection = aiConnections.find(c => c.id === selectedConnectionId);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/connections">
            <Button variant="ghost" size="icon" className="cursor-pointer" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Agent</h1>
            <p className="text-muted-foreground mt-1">Chat with AI agents via MCP.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {aiConnections.length > 1 && (
            <Select value={selectedConnectionId?.toString()} onValueChange={(val) => setSelectedConnectionId(parseInt(val))}>
              <SelectTrigger className="w-[200px]" data-testid="select-connection">
                <SelectValue placeholder="Select connection" />
              </SelectTrigger>
              <SelectContent>
                {aiConnections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id.toString()} data-testid={`select-option-${conn.id}`}>
                    {conn.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-[160px]" data-testid="select-model">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini" data-testid="select-option-gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="gpt-4o" data-testid="select-option-gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-5-mini" data-testid="select-option-gpt-5-mini">GPT-5 Mini</SelectItem>
              <SelectItem value="gpt-5" data-testid="select-option-gpt-5">GPT-5</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedConnectionId && clearMutation.mutate(selectedConnectionId)}
            disabled={!messages || messages.length === 0 || clearMutation.isPending}
            data-testid="button-clearConversation"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col h-[calc(100vh-16rem)]">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <div>
                <CardTitle className="text-lg">{selectedConnection?.name}</CardTitle>
                <CardDescription className="text-xs">
                  Powered by {model} via Replit AI Integrations
                </CardDescription>
              </div>
            </div>
            <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              Connected
            </Badge>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                  data-testid={`message-${msg.id}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl max-w-[80%]",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">Start a conversation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask your AI agent anything via MCP
                </p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatMutation.isPending}
              className="flex-1"
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || chatMutation.isPending}
              data-testid="button-send"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
