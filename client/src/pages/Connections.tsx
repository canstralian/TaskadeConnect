import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, AlertCircle, Key, ExternalLink, RefreshCcw, Loader2, Copy, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { connectionsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { Connection } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

// Service configurations
const SERVICE_CONFIG: Record<string, { 
  icon: string; 
  color: string; 
  description: string;
  supportsWebhooks?: boolean;
}> = {
  ai_agent: {
    icon: "AI",
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
    description: "Connect with AI agents via MCP (Model Context Protocol) for intelligent automation."
  },
  taskade: {
    icon: "T",
    color: "bg-pink-500",
    description: "Sync projects, tasks, and team members.",
    supportsWebhooks: true,
  },
  notion: {
    icon: "N",
    color: "bg-black dark:bg-white dark:text-black",
    description: "Access databases, pages, and blocks."
  },
  replit: {
    icon: "R",
    color: "bg-orange-500",
    description: "Read/Write to Replit Database and Object Storage."
  },
  slack: {
    icon: "S",
    color: "bg-purple-500",
    description: "Send notifications and updates to channels."
  },
  github: {
    icon: "G",
    color: "bg-gray-800",
    description: "Integrate with GitHub repositories and issues.",
    supportsWebhooks: true,
  }
};

export default function Connections() {
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ apiKey: "", workspace: "" });
  
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: connectionsAPI.getAll,
  });

  const createMutation = useMutation({
    mutationFn: connectionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast({ title: "Connection created successfully" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create connection", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => connectionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast({ title: "Connection updated successfully" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update connection", variant: "destructive" });
    },
  });

  const openConfig = (conn: Connection) => {
    setSelectedConnection(conn);
    setFormData({ apiKey: "", workspace: "" });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedConnection) return;

    const data = {
      ...selectedConnection,
      apiKey: formData.apiKey || selectedConnection.apiKey,
      config: formData.workspace ? { workspace: formData.workspace } : selectedConnection.config,
      status: formData.apiKey ? "connected" : selectedConnection.status,
      lastSync: formData.apiKey ? new Date() : selectedConnection.lastSync,
    };

    if (selectedConnection.id) {
      updateMutation.mutate({ id: selectedConnection.id, data });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Connections</h1>
        <p className="text-muted-foreground mt-1">Manage your integrations and API credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections?.map((conn) => {
          const config = SERVICE_CONFIG[conn.service] || { icon: conn.service[0], color: "bg-gray-500", description: conn.description || "" };
          
          return (
            <Card key={conn.id} className="flex flex-col overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg",
                    config.color
                  )}>
                    {config.icon}
                  </div>
                  <Badge variant={
                    conn.status === "connected" ? "default" : 
                    conn.status === "error" ? "destructive" : "secondary"
                  } className={cn(
                    conn.status === "connected" ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400" : ""
                  )}>
                    {conn.status === "connected" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {conn.status === "error" && <XCircle className="w-3 h-3 mr-1" />}
                    {conn.status.charAt(0).toUpperCase() + conn.status.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-xl">{conn.name}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">{config.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-4 flex-1">
                {conn.status !== "disconnected" && conn.lastSync && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                    <RefreshCcw className="w-3 h-3" />
                    Last sync: {formatDistanceToNow(new Date(conn.lastSync), { addSuffix: true })}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 mt-auto">
                <Button 
                  variant={conn.status === "connected" ? "outline" : "default"} 
                  className="w-full"
                  onClick={() => openConfig(conn)}
                >
                  {conn.status === "connected" ? "Configure" : "Connect"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Configure {selectedConnection?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials to enable synchronization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input 
                  id="apiKey" 
                  type="password" 
                  placeholder="sk_live_..." 
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  data-testid="input-apiKey"
                />
                <Key className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Never share your API keys. Stored securely.</span>
              </p>
            </div>
            
            {selectedConnection?.service === "notion" && (
              <div className="grid gap-2">
                <Label htmlFor="workspace">Workspace ID (Optional)</Label>
                <Input 
                  id="workspace" 
                  placeholder="Enter workspace ID"
                  value={formData.workspace}
                  onChange={(e) => setFormData({ ...formData, workspace: e.target.value })}
                  data-testid="input-workspace"
                />
              </div>
            )}

            {/* Webhook Configuration */}
            {selectedConnection && SERVICE_CONFIG[selectedConnection.service]?.supportsWebhooks && (
              <div className="grid gap-3 p-4 border border-border/50 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Webhook className="w-4 h-4 text-primary" />
                  <span>Webhook Setup</span>
                </div>
                
                {selectedConnection.webhookUrl ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="webhookUrl" className="text-xs text-muted-foreground">
                        Webhook URL
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          id="webhookUrl"
                          value={selectedConnection.webhookUrl}
                          readOnly
                          className="font-mono text-xs bg-background"
                          data-testid="input-webhookUrl"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedConnection.webhookUrl || "");
                            toast({ title: "Webhook URL copied to clipboard" });
                          }}
                          data-testid="button-copyWebhookUrl"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="webhookSecret" className="text-xs text-muted-foreground">
                        Webhook Secret
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          id="webhookSecret"
                          value={selectedConnection.webhookSecret ? "•".repeat(32) : ""}
                          readOnly
                          className="font-mono text-xs bg-background"
                          data-testid="input-webhookSecret"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedConnection.webhookSecret || "");
                            toast({ title: "Webhook secret copied to clipboard" });
                          }}
                          data-testid="button-copyWebhookSecret"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">Setup instructions:</p>
                      {selectedConnection.service === "github" && (
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Go to your GitHub repository settings</li>
                          <li>Navigate to Webhooks → Add webhook</li>
                          <li>Paste the URL above and select JSON content type</li>
                          <li>Enter the secret for secure delivery</li>
                          <li>Select events: push, pull_request, issues</li>
                        </ol>
                      )}
                      {selectedConnection.service === "taskade" && (
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Go to your Taskade workspace settings</li>
                          <li>Navigate to Integrations → Webhooks</li>
                          <li>Add the webhook URL above</li>
                          <li>Configure authentication with the secret</li>
                          <li>Select events: task.created, task.completed</li>
                        </ol>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Save your connection to generate webhook credentials.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
             <Button variant="secondary" className="sm:mr-auto" onClick={() => window.open('https://developers.taskade.com', '_blank')}>
               <ExternalLink className="w-4 h-4 mr-2" /> Docs
             </Button>
             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleSave} disabled={updateMutation.isPending}>
               {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Save Changes
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
