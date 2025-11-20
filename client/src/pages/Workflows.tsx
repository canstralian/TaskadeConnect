import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit3, 
  Trash2,
  ArrowRight,
  Clock,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Workflow {
  id: number;
  title: string;
  description: string;
  source: string;
  target: string;
  status: "active" | "paused" | "draft";
  lastRun: string;
  schedule: string;
}

const WORKFLOWS: Workflow[] = [
  { 
    id: 1, 
    title: "Sync Notion Projects to Taskade", 
    description: "Automatically create Taskade projects when a Notion page is added to 'Projects' db.",
    source: "Notion",
    target: "Taskade",
    status: "active",
    lastRun: "2 mins ago",
    schedule: "Real-time"
  },
  { 
    id: 2, 
    title: "Replit DB Users → Taskade Team", 
    description: "Sync user roles and details from Replit PostgreSQL to Taskade Workspace members.",
    source: "Replit",
    target: "Taskade",
    status: "active",
    lastRun: "1 hour ago",
    schedule: "Hourly"
  },
  { 
    id: 3, 
    title: "Taskade Tasks → Notion Board", 
    description: "Bi-directional sync of task status between Taskade and Notion Kanban.",
    source: "Taskade",
    target: "Notion",
    status: "paused",
    lastRun: "1 day ago",
    schedule: "Every 15 mins"
  },
  { 
    id: 4, 
    title: "New Client Onboarding", 
    description: "Create client folder in Taskade when new record in Notion CRM.",
    source: "Notion",
    target: "Taskade",
    status: "draft",
    lastRun: "Never",
    schedule: "Real-time"
  },
];

export default function Workflows() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorkflows = WORKFLOWS.filter(w => 
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">Automate data flow between your connected apps.</p>
        </div>
        <Link href="/workflows/new">
          <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> Create Workflow
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search workflows..." 
            className="pl-10 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Workflow List */}
      <div className="grid gap-4">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="group hover:border-primary/40 transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  {/* Visual Flow Icon */}
                  <div className="hidden md:flex flex-col items-center gap-1 mt-1 min-w-[3rem]">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                      {workflow.source[0]}
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary border border-secondary/20">
                      {workflow.target[0]}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {workflow.title}
                      </h3>
                      <Badge variant="outline" className={cn(
                        "ml-2",
                        workflow.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        workflow.status === "paused" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-slate-500/10 text-slate-600 border-slate-500/20"
                      )}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {workflow.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{workflow.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RefreshCcw className="w-3 h-3" />
                        <span>Last run: {workflow.lastRun}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:border-l md:pl-6 border-border/50">
                  <Link href={`/workflows/${workflow.id}`}>
                    <Button variant="ghost" size="sm" className="hidden md:flex cursor-pointer">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  {workflow.status === "active" ? (
                    <Button variant="outline" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      <Pause className="w-4 h-4 mr-1" /> Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                      <Play className="w-4 h-4 mr-1" /> Resume
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
