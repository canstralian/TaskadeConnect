import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const LOGS = [
  { id: "LOG-9281", workflow: "Notion Projects → Taskade", time: "2023-10-24 14:30:22", status: "success", items: 12, duration: "1.2s" },
  { id: "LOG-9282", workflow: "Replit DB → Taskade Team", time: "2023-10-24 14:25:10", status: "success", items: 5, duration: "0.8s" },
  { id: "LOG-9283", workflow: "Taskade Tasks → Notion", time: "2023-10-24 13:15:00", status: "error", items: 0, duration: "5.0s", error: "API Rate Limit Exceeded" },
  { id: "LOG-9284", workflow: "Notion Projects → Taskade", time: "2023-10-24 12:30:22", status: "success", items: 3, duration: "1.1s" },
  { id: "LOG-9285", workflow: "New Client Onboarding", time: "2023-10-24 11:45:00", status: "warning", items: 1, duration: "2.3s", message: "Partial sync - 1 field skipped" },
  { id: "LOG-9286", workflow: "Replit DB → Taskade Team", time: "2023-10-24 10:25:10", status: "success", items: 8, duration: "0.9s" },
];

export default function History() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sync History</h1>
        <p className="text-muted-foreground mt-1">Detailed logs of all synchronization activities.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search logs by ID or Workflow..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Log ID</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOGS.map((log) => (
                <TableRow key={log.id} className="group cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{log.workflow}</div>
                    {log.error && <div className="text-xs text-destructive mt-0.5">{log.error}</div>}
                    {log.message && <div className="text-xs text-amber-600 mt-0.5">{log.message}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "capitalize",
                      log.status === "success" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      log.status === "error" ? "bg-destructive/10 text-destructive border-destructive/20" :
                      "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}>
                      {log.status === "success" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {log.status === "error" && <XCircle className="w-3 h-3 mr-1" />}
                      {log.status === "warning" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{log.time}</TableCell>
                  <TableCell className="text-sm">{log.items}</TableCell>
                  <TableCell className="text-right text-sm font-mono text-muted-foreground">{log.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
