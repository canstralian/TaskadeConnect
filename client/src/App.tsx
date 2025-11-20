import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Connections from "@/pages/Connections";
import Workflows from "@/pages/Workflows";
import WorkflowEditor from "@/pages/WorkflowEditor";
import History from "@/pages/History";

// Placeholder pages for now
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
    <h2 className="text-2xl font-bold text-muted-foreground">{title}</h2>
    <p className="text-muted-foreground">This page is under construction.</p>
  </div>
);

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/workflows/new" component={WorkflowEditor} />
        <Route path="/workflows/:id" component={WorkflowEditor} />
        <Route path="/connections" component={Connections} />
        <Route path="/history" component={History} />
        <Route path="/settings" component={() => <PlaceholderPage title="Settings" />} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
