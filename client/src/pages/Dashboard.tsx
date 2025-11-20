import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCcw, 
  Database,
  Layers,
  Zap,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardAPI, workflowsAPI, syncLogsAPI } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardAPI.getStats,
  });

  const { data: workflows } = useQuery({
    queryKey: ["workflows"],
    queryFn: workflowsAPI.getAll,
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["sync-logs", "recent"],
    queryFn: () => syncLogsAPI.getAll(4),
  });

  const STATS_CONFIG = [
    { label: "Active Syncs", key: "activeSyncs", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Tasks Synced", key: "tasksSynced", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
    { label: "API Requests", key: "apiRequests", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Storage Used", key: "storageUsed", icon: Database, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const activeWorkflows = workflows?.filter(w => w.status === "active") || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your integration health and activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={statsLoading}>
            <RefreshCcw className={cn("w-4 h-4 mr-2", statsLoading && "animate-spin")} />
            Refresh Data
          </Button>
          <Link href="/workflows/new">
            <Button size="sm" className="bg-primary hover:bg-primary/90 cursor-pointer">
              <Layers className="w-4 h-4 mr-2" /> New Workflow
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CONFIG.map((statConfig, i) => {
          const value = stats ? stats[statConfig.key as keyof typeof stats] : "0";
          return (
            <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{statConfig.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{statsLoading ? "..." : value}</h3>
                </div>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", statConfig.bg)}>
                  <statConfig.icon className={cn("w-6 h-6", statConfig.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Workflows */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Workflows</h2>
            <Link href="/workflows">
              <Button variant="link" className="text-primary h-auto p-0 cursor-pointer">View All</Button>
            </Link>
          </div>
          
          {activeWorkflows.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Layers className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No active workflows yet</p>
                <Link href="/workflows/new">
                  <Button className="cursor-pointer">Create Your First Workflow</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeWorkflows.slice(0, 3).map((workflow) => (
                <Card key={workflow.id} className="group hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex -space-x-2 mt-1">
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {workflow.sourceService[0].toUpperCase()}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-secondary">
                            {workflow.targetService[0].toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                            {workflow.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 max-w-md line-clamp-2">
                            {workflow.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400">
                          Active
                        </Badge>
                        <Link href={`/workflows/${workflow.id}`}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Log */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Syncs</h2>
            <Link href="/history">
              <Button variant="link" className="text-primary h-auto p-0 cursor-pointer">Full History</Button>
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              {!recentLogs || recentLogs.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sync activity yet</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border/50">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            log.status === "success" ? "bg-emerald-500" : 
                            log.status === "error" ? "bg-red-500" : "bg-amber-500"
                          )} />
                          <div>
                            <p className="text-sm font-medium leading-none">{log.workflowName}</p>
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                              <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium tabular-nums">
                            {log.itemsProcessed} items
                          </p>
                          {log.duration && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {(log.duration / 1000).toFixed(1)}s
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border/50 bg-muted/20 text-center">
                    <span className="text-xs text-muted-foreground">Showing last {recentLogs.length} events</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
