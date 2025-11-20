import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, AlertCircle, Key, ExternalLink, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: string; // Using simple text/emoji for now or I could use Lucide if relevant
  color: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
}

const CONNECTIONS: Connection[] = [
  {
    id: "taskade",
    name: "Taskade",
    description: "Sync projects, tasks, and team members.",
    icon: "T",
    color: "bg-pink-500",
    status: "connected",
    lastSync: "2 mins ago"
  },
  {
    id: "notion",
    name: "Notion",
    description: "Access databases, pages, and blocks.",
    icon: "N",
    color: "bg-black dark:bg-white",
    status: "connected",
    lastSync: "5 mins ago"
  },
  {
    id: "replit",
    name: "Replit DB",
    description: "Read/Write to Replit Database and Object Storage.",
    icon: "R",
    color: "bg-orange-500",
    status: "error",
    lastSync: "Failed 1 hr ago"
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications and updates to channels.",
    icon: "S",
    color: "bg-purple-500",
    status: "disconnected",
  }
];

export default function Connections() {
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openConfig = (conn: Connection) => {
    setSelectedConnection(conn);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Connections</h1>
        <p className="text-muted-foreground mt-1">Manage your integrations and API credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CONNECTIONS.map((conn) => (
          <Card key={conn.id} className="flex flex-col overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg",
                  conn.color
                )}>
                  {conn.icon}
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
              <CardDescription className="mt-1 line-clamp-2">{conn.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-4 flex-1">
              {conn.status !== "disconnected" && (
                <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                  <RefreshCcw className="w-3 h-3" />
                  Last sync: {conn.lastSync}
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
        ))}
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
                  defaultValue={selectedConnection?.status === "connected" ? "**********************" : ""}
                />
                <Key className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Never share your API keys. Stored securely.</span>
              </p>
            </div>
            
            {selectedConnection?.id === "notion" && (
              <div className="grid gap-2">
                <Label htmlFor="workspace">Workspace ID (Optional)</Label>
                <Input id="workspace" placeholder="Enter workspace ID" />
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
             <Button variant="secondary" className="sm:mr-auto" onClick={() => window.open('https://developers.taskade.com', '_blank')}>
               <ExternalLink className="w-4 h-4 mr-2" /> Docs
             </Button>
             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
             <Button onClick={() => setIsDialogOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
