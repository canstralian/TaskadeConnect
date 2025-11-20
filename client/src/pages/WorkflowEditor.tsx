import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Plus, 
  Settings2, 
  ChevronRight,
  Zap,
  Database,
  ArrowDown,
  X,
  Webhook
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  type: "trigger" | "action" | "filter";
  app: string;
  action: string;
  description: string;
  icon: any;
  config: Record<string, string>;
}

const INITIAL_STEPS: Step[] = [
  {
    id: "step-1",
    type: "trigger",
    app: "GitHub",
    action: "Push Event",
    description: "Triggers when code is pushed to repository",
    icon: Webhook,
    config: { triggerType: "webhook", event: "github.push" }
  },
  {
    id: "step-2",
    type: "action",
    app: "Taskade",
    action: "Create Task",
    description: "Create a new task in Workspace 'Alpha'",
    icon: Zap,
    config: { workspace_id: "ws_98765", template_id: "tpl_basic" }
  }
];

export default function WorkflowEditor() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [selectedStepId, setSelectedStepId] = useState<string | null>("step-1");
  const [, setLocation] = useLocation();

  const selectedStep = steps.find(s => s.id === selectedStepId);

  const updateStepConfig = (stepId: string, configUpdates: Record<string, string>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, config: { ...step.config, ...configUpdates } }
        : step
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 md:-m-8">
      {/* Editor Header */}
      <header className="h-16 border-b bg-card px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/workflows">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">Sync Notion Projects to Taskade</h1>
              <span className="bg-emerald-500/10 text-emerald-600 text-xs px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
            </div>
            <p className="text-xs text-muted-foreground">Last edited just now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Play className="w-4 h-4 mr-2 text-emerald-600" /> Run Test
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" /> Save Workflow
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden bg-muted/30">
        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-8 relative flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-2 pb-20">
            
            {/* Start Node */}
            <div className="flex justify-center mb-4">
              <div className="bg-muted-foreground/10 text-muted-foreground text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider">
                Start
              </div>
            </div>

            {/* Steps */}
            {steps.map((step, index) => (
              <div key={step.id} className="relative group">
                {/* Connecting Line */}
                {index > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-0.5 bg-border group-hover:bg-primary/30 transition-colors flex items-center justify-center">
                    <ArrowDown className="w-3 h-3 text-muted-foreground bg-background absolute top-1/2 -translate-y-1/2" />
                  </div>
                )}

                <Card 
                  className={cn(
                    "relative transition-all duration-200 cursor-pointer border-2",
                    selectedStepId === step.id 
                      ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20" 
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  )}
                  onClick={() => setSelectedStepId(step.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md shrink-0",
                      step.app === "Notion" ? "bg-black dark:bg-white dark:text-black" : 
                      step.app === "Taskade" ? "bg-pink-500" : "bg-orange-500"
                    )}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">{step.type}</p>
                        <Badge variant="secondary" className="text-[10px] h-5">Step {index + 1}</Badge>
                      </div>
                      <h3 className="font-bold text-base truncate">{step.action}</h3>
                      <p className="text-sm text-muted-foreground truncate">{step.description}</p>
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      selectedStepId === step.id && "rotate-90 text-primary"
                    )} />
                  </CardContent>
                </Card>

                {/* Add Button */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100">
                   <Button 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-background border shadow-sm hover:bg-primary hover:text-primary-foreground"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* End Placeholder */}
            <div className="flex justify-center mt-8 opacity-50">
               <Button variant="ghost" className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5">
                 <Plus className="w-4 h-4 mr-2" /> Add Step
               </Button>
            </div>

          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-96 border-l bg-card shrink-0 flex flex-col transition-all duration-300 ease-in-out transform translate-x-0">
          {selectedStep ? (
            <>
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="font-semibold text-lg">Configuration</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedStepId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>App & Event</Label>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                      <div className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center text-white text-xs",
                        selectedStep.app === "Notion" ? "bg-black" : "bg-pink-500"
                      )}>
                        {selectedStep.app[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{selectedStep.app}</p>
                        <p className="text-xs text-muted-foreground">{selectedStep.action}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto h-8 text-xs">Change</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Account</Label>
                    <Input value="My Personal Account" readOnly className="bg-muted/50" />
                  </div>

                  <div className="space-y-4">
                    <Label>{selectedStep.type === "trigger" ? "Trigger Setup" : "Action Setup"}</Label>
                    
                    {selectedStep.type === "trigger" ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Trigger Type</Label>
                          <Select 
                            value={selectedStep.config.triggerType || "database"}
                            onValueChange={(value) => {
                              updateStepConfig(selectedStep.id, { 
                                triggerType: value,
                                // Clear incompatible fields when switching
                                ...(value === "webhook" ? { database_id: "", trigger_on: "" } : { event: "" })
                              });
                            }}
                          >
                            <SelectTrigger data-testid="select-triggerType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="database" data-testid="option-database">
                                <div className="flex items-center gap-2">
                                  <Database className="w-4 h-4" />
                                  <span>Database Change</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="webhook" data-testid="option-webhook">
                                <div className="flex items-center gap-2">
                                  <Webhook className="w-4 h-4" />
                                  <span>Webhook Event</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedStep.config.triggerType === "webhook" ? (
                          <>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Event Type</Label>
                              <Select 
                                value={selectedStep.config.event || ""}
                                onValueChange={(value) => updateStepConfig(selectedStep.id, { event: value })}
                              >
                                <SelectTrigger data-testid="select-webhookEvent">
                                  <SelectValue placeholder="Select event" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedStep.app === "GitHub" ? (
                                    <>
                                      <SelectItem value="github.push" data-testid="option-github-push">Push (Code pushed to branch)</SelectItem>
                                      <SelectItem value="github.pull_request" data-testid="option-github-pr">Pull Request (PR opened/closed)</SelectItem>
                                      <SelectItem value="github.issues" data-testid="option-github-issues">Issues (Issue created/updated)</SelectItem>
                                    </>
                                  ) : selectedStep.app === "Taskade" ? (
                                    <>
                                      <SelectItem value="taskade.task.created" data-testid="option-taskade-created">Task Created</SelectItem>
                                      <SelectItem value="taskade.task.completed" data-testid="option-taskade-completed">Task Completed</SelectItem>
                                      <SelectItem value="taskade.task.updated" data-testid="option-taskade-updated">Task Updated</SelectItem>
                                    </>
                                  ) : (
                                    <SelectItem value="custom" disabled>No events available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <p className="text-[10px] text-muted-foreground">
                                <Link href="/connections">
                                  <Button variant="link" className="h-auto p-0 text-[10px]">
                                    Configure webhook URL in Connections →
                                  </Button>
                                </Link>
                              </p>
                            </div>

                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                              <p className="text-xs text-muted-foreground">
                                <strong className="text-primary">Real-time trigger:</strong> This workflow will execute instantly when the event occurs in {selectedStep.app}.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Database</Label>
                              <Input defaultValue="Project Tracker 2024" data-testid="input-database" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Trigger On</Label>
                              <Select 
                                value={selectedStep.config.trigger_on || "created"}
                                onValueChange={(value) => updateStepConfig(selectedStep.id, { trigger_on: value })}
                              >
                                <SelectTrigger data-testid="select-databaseTrigger">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="created">New Item Created</SelectItem>
                                  <SelectItem value="updated">Item Updated</SelectItem>
                                  <SelectItem value="deleted">Item Deleted</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    ) : selectedStep.app === "Taskade" ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Workspace</Label>
                          <Input defaultValue="Alpha Team" data-testid="input-workspace" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Project Name</Label>
                          <div className="flex gap-2">
                             <Input defaultValue="" placeholder="Enter name" className="flex-1" data-testid="input-projectName"/>
                             <Button variant="outline" size="icon" className="shrink-0">
                               <Database className="w-4 h-4 text-muted-foreground" />
                             </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Map data from previous steps</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t bg-muted/10">
                <Button className="w-full">
                  Test Step
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <Settings2 className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a step to configure it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
