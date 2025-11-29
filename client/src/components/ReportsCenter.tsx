import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, AlertCircle, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Report {
  id: string;
  reporter: string;
  reason: string;
  date: string;
  status: "pending" | "reviewed" | "resolved";
  description?: string;
}

interface UserReport extends Report {
  reportedUsername: string;
}

interface PostReport extends Report {
  postId: string;
  postCaption: string;
}

interface CommentReport extends Report {
  commentId: string;
  commentText: string;
  postAuthor: string;
}

const MOCK_USER_REPORTS: UserReport[] = [
  {
    id: "u1",
    reporter: "user_123",
    reportedUsername: "suspicious_account",
    reason: "Harassment and bullying",
    date: "2024-11-27 2:15 PM",
    status: "pending",
    description: "Repeated negative comments on my posts",
  },
  {
    id: "u2",
    reporter: "safety_patrol",
    reportedUsername: "fake_verified",
    reason: "Impersonation",
    date: "2024-11-26 8:45 AM",
    status: "reviewed",
    description: "Fake verification badge, pretending to be celebrity",
  },
  {
    id: "u3",
    reporter: "community_mod",
    reportedUsername: "spam_bot_2024",
    reason: "Spam and bot activity",
    date: "2024-11-25 6:20 PM",
    status: "resolved",
    description: "Mass following and promotional spam",
  },
];

const MOCK_POST_REPORTS: PostReport[] = [
  {
    id: "p1",
    reporter: "content_reviewer",
    postId: "post_456",
    postCaption: "Inappropriate content post",
    reason: "Adult content",
    date: "2024-11-27 10:30 AM",
    status: "pending",
  },
  {
    id: "p2",
    reporter: "user_456",
    postId: "post_789",
    postCaption: "Misinformation about health",
    reason: "Misinformation",
    date: "2024-11-26 4:15 PM",
    status: "reviewed",
  },
  {
    id: "p3",
    reporter: "admin_user",
    postId: "post_321",
    postCaption: "Copyrighted content",
    reason: "Copyright violation",
    date: "2024-11-24 11:00 AM",
    status: "resolved",
  },
];

const MOCK_COMMENT_REPORTS: CommentReport[] = [
  {
    id: "c1",
    reporter: "user_789",
    commentId: "comment_123",
    commentText: "Hateful comment targeting group",
    postAuthor: "adikeafrica",
    reason: "Hate speech",
    date: "2024-11-27 1:45 PM",
    status: "pending",
  },
  {
    id: "c2",
    reporter: "moderation_team",
    commentId: "comment_456",
    commentText: "Spam promotional message",
    postAuthor: "amaarabeats",
    reason: "Spam",
    date: "2024-11-26 9:30 AM",
    status: "reviewed",
  },
  {
    id: "c3",
    reporter: "user_234",
    commentId: "comment_789",
    commentText: "Personal attack comment",
    postAuthor: "kojoart",
    reason: "Harassment",
    date: "2024-11-25 3:00 PM",
    status: "resolved",
  },
];

interface ReportsCenterProps {
  onBack?: () => void;
}

export default function ReportsCenter({ onBack }: ReportsCenterProps) {
  const [userReports, setUserReports] = useState<UserReport[]>(MOCK_USER_REPORTS);
  const [postReports, setPostReports] = useState<PostReport[]>(MOCK_POST_REPORTS);
  const [commentReports, setCommentReports] = useState<CommentReport[]>(MOCK_COMMENT_REPORTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/reports");
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setUserReports(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIgnore = (reportId: string, type: "user" | "post" | "comment") => {
    if (type === "user") {
      setUserReports(userReports.map(r => r.id === reportId ? { ...r, status: "resolved" } : r));
    } else if (type === "post") {
      setPostReports(postReports.map(r => r.id === reportId ? { ...r, status: "resolved" } : r));
    } else {
      setCommentReports(commentReports.map(r => r.id === reportId ? { ...r, status: "resolved" } : r));
    }
  };

  const handleWarn = (reportId: string, type: "user" | "post" | "comment") => {
    alert(`Warning sent to user. Report #${reportId} marked as reviewed.`);
    if (type === "user") {
      setUserReports(userReports.map(r => r.id === reportId ? { ...r, status: "reviewed" } : r));
    } else if (type === "post") {
      setPostReports(postReports.map(r => r.id === reportId ? { ...r, status: "reviewed" } : r));
    } else {
      setCommentReports(commentReports.map(r => r.id === reportId ? { ...r, status: "reviewed" } : r));
    }
  };

  const handleSuspend = (reportId: string, target: string, type: "user" | "post" | "comment") => {
    if (confirm(`Are you sure you want to suspend ${target}?`)) {
      alert(`${type === "user" ? "User" : "Content"} suspended. Report #${reportId} resolved.`);
      if (type === "user") {
        setUserReports(userReports.map(r => r.id === reportId ? { ...r, status: "resolved" } : r));
      } else if (type === "post") {
        setPostReports(postReports.map(r => r.id === reportId ? { ...r, status: "resolved" } : r));
      } else {
        setCommentReports(commentReports.map(r => r.id === reportId ? { ...r, status: "resolved" } : r));
      }
    }
  };

  const handleDelete = (reportId: string, type: "user" | "post" | "comment") => {
    if (confirm(`Delete this ${type === "user" ? "user account" : "content"}?`)) {
      alert(`${type === "user" ? "User account" : "Content"} deleted. Report #${reportId} resolved.`);
      if (type === "user") {
        setUserReports(userReports.filter(r => r.id !== reportId));
      } else if (type === "post") {
        setPostReports(postReports.filter(r => r.id !== reportId));
      } else {
        setCommentReports(commentReports.filter(r => r.id !== reportId));
      }
    }
  };

  const ReportRow = ({ report, type, target }: { report: Report; type: "user" | "post" | "comment"; target: string }) => (
    <tr className="border-b border-border/50 hover:bg-muted/50 transition-colors" data-testid={`row-report-${type}-${report.id}`}>
      <td className="px-4 py-3 font-medium" data-testid={`text-report-reporter-${report.id}`}>
        {report.reporter}
      </td>
      <td className="px-4 py-3 text-sm" data-testid={`text-report-target-${report.id}`}>
        {target}
      </td>
      <td className="px-4 py-3 text-sm" data-testid={`text-report-reason-${report.id}`}>
        {report.reason}
      </td>
      <td className="px-4 py-3 text-muted-foreground text-xs" data-testid={`text-report-date-${report.id}`}>
        {report.date}
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={
            report.status === "pending"
              ? "destructive"
              : report.status === "reviewed"
              ? "secondary"
              : "default"
          }
          data-testid={`badge-report-status-${report.id}`}
        >
          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid={`button-menu-report-${report.id}`}>
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleIgnore(report.id, type)}
              data-testid={`menu-ignore-${report.id}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ignore
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleWarn(report.id, type)}
              data-testid={`menu-warn-${report.id}`}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Warn
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSuspend(report.id, target, type)}
              data-testid={`menu-suspend-${report.id}`}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Suspend
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(report.id, type)}
              className="text-red-500"
              data-testid={`menu-delete-${report.id}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-4 gap-2"
                data-testid="button-back-dashboard-reports"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <h1 className="text-4xl font-bold text-primary" data-testid="text-reports-center-title">
              Reports Center
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-reports-center-subtitle">
              Review and manage user reports
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" data-testid="tab-reported-users">
              Reported Users ({userReports.length})
            </TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-reported-posts">
              Reported Posts ({postReports.length})
            </TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-reported-comments">
              Reported Comments ({commentReports.length})
            </TabsTrigger>
          </TabsList>

          {/* Reported Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Reported Users</CardTitle>
                <CardDescription>User accounts reported by the community</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Reporter</th>
                        <th className="px-4 py-3 text-left font-medium">Reported User</th>
                        <th className="px-4 py-3 text-left font-medium">Reason</th>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userReports.map((report) => (
                        <ReportRow
                          key={report.id}
                          report={report}
                          type="user"
                          target={report.reportedUsername}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reported Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Reported Posts</CardTitle>
                <CardDescription>User-generated posts reported for policy violations</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Reporter</th>
                        <th className="px-4 py-3 text-left font-medium">Post Caption</th>
                        <th className="px-4 py-3 text-left font-medium">Reason</th>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postReports.map((report) => (
                        <ReportRow
                          key={report.id}
                          report={report}
                          type="post"
                          target={report.postCaption.substring(0, 40) + "..."}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reported Comments Tab */}
          <TabsContent value="comments" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Reported Comments</CardTitle>
                <CardDescription>Comments reported for policy violations</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Reporter</th>
                        <th className="px-4 py-3 text-left font-medium">Comment Text</th>
                        <th className="px-4 py-3 text-left font-medium">Reason</th>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commentReports.map((report) => (
                        <ReportRow
                          key={report.id}
                          report={report}
                          type="comment"
                          target={report.commentText.substring(0, 40) + "..."}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
