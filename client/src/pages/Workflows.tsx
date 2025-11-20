import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Edit3, 
  Trash2,
  Clock,
  RefreshCcw,
  Loader2,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { workflowsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Workflows() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: workflows, isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: workflowsAPI.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: workflowsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast({ title: "Workflow deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete workflow", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      workflowsAPI.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast({ title: "Workflow status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update workflow", variant: "destructive" });
    },
  });

  const filteredWorkflows = workflows?.filter(w => 
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (w.description && w.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

      {/* Empty State */}
      {filteredWorkflows.length === 0 && !searchTerm && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Layers className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-6">Create your first workflow to start automating tasks</p>
            <Link href="/workflows/new">
              <Button className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" /> Create Workflow
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Workflow List */}
      {filteredWorkflows.length > 0 && (
        <div className="grid gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="group hover:border-primary/40 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Visual Flow Icon */}
                    <div className="hidden md:flex flex-col items-center gap-1 mt-1 min-w-[3rem]">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                        {workflow.sourceService[0].toUpperCase()}
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary border border-secondary/20">
                        {workflow.targetService[0].toUpperCase()}
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
                          <span>{workflow.schedule || "Manual"}</span>
                        </div>
                        {workflow.lastRun && (
                          <div className="flex items-center gap-1">
                            <RefreshCcw className="w-3 h-3" />
                            <span>Last run: {formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true })}</span>
                          </div>
                        )}
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => toggleStatusMutation.mutate({ id: workflow.id, status: "paused" })}
                      >
                        <Pause className="w-4 h-4 mr-1" /> Pause
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => toggleStatusMutation.mutate({ id: workflow.id, status: "active" })}
                      >
                        <Play className="w-4 h-4 mr-1" /> Resume
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this workflow?")) {
                          deleteMutation.mutate(workflow.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
