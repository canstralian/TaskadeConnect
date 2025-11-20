import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCcw, 
  Database,
  Layers,
  Zap,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const STATS = [
  { label: "Active Syncs", value: "4", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Tasks Synced", value: "1,284", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
  { label: "API Requests", value: "45.2k", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Storage Used", value: "12%", icon: Database, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const RECENT_SYNCS = [
  { id: 1, name: "Project Alpha Tasks", source: "Notion", target: "Taskade", status: "success", time: "2 mins ago", items: 12 },
  { id: 2, name: "Team Roster Sync", source: "Replit DB", target: "Taskade", status: "success", time: "15 mins ago", items: 5 },
  { id: 3, name: "Daily Standup Notes", source: "Taskade", target: "Notion", status: "failed", time: "1 hour ago", items: 0 },
  { id: 4, name: "Bug Tracker", source: "GitHub", target: "Taskade", status: "success", time: "2 hours ago", items: 34 },
];

const WORKFLOWS = [
  { 
    id: 1, 
    title: "Sync Notion Projects to Taskade", 
    description: "Automatically create Taskade projects when a Notion page is added to 'Projects' db.",
    active: true,
    lastRun: "Success",
    sourceIcon: "N", 
    targetIcon: "T"
  },
  { 
    id: 2, 
    title: "Replit DB Users → Taskade Team", 
    description: "Sync user roles and details from Replit PostgreSQL to Taskade Workspace members.",
    active: true,
    lastRun: "Success",
    sourceIcon: "R", 
    targetIcon: "T"
  },
  { 
    id: 3, 
    title: "Taskade Tasks → Notion Board", 
    description: "Bi-directional sync of task status between Taskade and Notion Kanban.",
    active: false,
    lastRun: "Paused",
    sourceIcon: "T", 
    targetIcon: "N"
  },
];

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your integration health and activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCcw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh Data
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Layers className="w-4 h-4 mr-2" /> New Workflow
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Workflows */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Workflows</h2>
            <Button variant="link" className="text-primary h-auto p-0">View All</Button>
          </div>
          
          <div className="space-y-4">
            {WORKFLOWS.map((workflow) => (
              <Card key={workflow.id} className="group hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex -space-x-2 mt-1">
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {workflow.sourceIcon}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-secondary">
                          {workflow.targetIcon}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                          {workflow.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={workflow.active ? "default" : "secondary"} className={cn(
                        workflow.active ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400" : ""
                      )}>
                        {workflow.active ? "Active" : "Paused"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Syncs</h2>
            <Button variant="link" className="text-primary h-auto p-0">Full History</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {RECENT_SYNCS.map((sync) => (
                  <div key={sync.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        sync.status === "success" ? "bg-emerald-500" : "bg-red-500"
                      )} />
                      <div>
                        <p className="text-sm font-medium leading-none">{sync.name}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                          <span>{sync.source}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{sync.target}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium tabular-nums">{sync.time}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sync.items} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border/50 bg-muted/20 text-center">
                <span className="text-xs text-muted-foreground">Showing last 4 events</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
