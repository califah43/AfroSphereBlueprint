import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MoreVertical, Eye, Trash2, EyeOff, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockPosts } from "@/data/mockData";

interface AdminPost {
  id: string;
  username: string;
  caption: string;
  imageUrl: string;
  likes: number;
  comments: number;
  timeAgo: string;
  datePosted: string;
  status: "visible" | "hidden";
  reports: number;
  reportReasons?: string[];
}

const MOCK_ADMIN_POSTS: AdminPost[] = mockPosts.map((post, idx) => ({
  id: post.id,
  username: post.author.username,
  caption: post.caption,
  imageUrl: post.imageUrl,
  likes: post.likes,
  comments: post.comments,
  timeAgo: post.timeAgo,
  datePosted: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  status: Math.random() > 0.95 ? "hidden" : "visible",
  reports: Math.floor(Math.random() * 5),
  reportReasons: [
    "Inappropriate content",
    "Misleading",
    "Spam",
    "Copyright violation",
    "Harassment",
  ].filter(() => Math.random() > 0.6),
}));

interface PostManagementProps {
  onBack?: () => void;
}

export default function PostManagement({ onBack }: PostManagementProps) {
  const [posts, setPosts] = useState<AdminPost[]>(MOCK_ADMIN_POSTS);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = posts.filter(
    (post) =>
      post.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHide = (postId: string) => {
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, status: p.status === "visible" ? "hidden" : "visible" } : p
      )
    );
    if (selectedPost?.id === postId) {
      setSelectedPost(
        selectedPost.status === "visible"
          ? { ...selectedPost, status: "hidden" }
          : { ...selectedPost, status: "visible" }
      );
    }
  };

  const handleDelete = (postId: string) => {
    if (confirm("Are you sure you want to permanently delete this post?")) {
      setPosts(posts.filter((p) => p.id !== postId));
      setSelectedPost(null);
    }
  };

  const handleClearReports = (postId: string) => {
    setPosts(
      posts.map((p) => (p.id === postId ? { ...p, reports: 0, reportReasons: [] } : p))
    );
    if (selectedPost?.id === postId) {
      setSelectedPost({
        ...selectedPost,
        reports: 0,
        reportReasons: [],
      });
    }
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedPost(null)}
              data-testid="button-back-post"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary" data-testid="text-post-detail-title">
                Post Details
              </h1>
              <p className="text-muted-foreground">by @{selectedPost.username}</p>
            </div>
          </div>

          {/* Post Content */}
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <img
                src={selectedPost.imageUrl}
                alt="Post"
                className="w-full max-h-96 object-cover"
                data-testid="img-post-content"
              />
            </CardContent>
          </Card>

          {/* Post Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Caption & Meta */}
            <Card className="border-border/50 md:col-span-2">
              <CardHeader>
                <CardTitle>Post Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Caption</p>
                  <p className="text-foreground" data-testid="text-post-caption">
                    {selectedPost.caption}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Date Posted</p>
                    <p className="font-medium" data-testid="text-post-date">
                      {selectedPost.datePosted}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Ago</p>
                    <p className="font-medium" data-testid="text-post-timeago">
                      {selectedPost.timeAgo}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary" data-testid="text-post-likes">
                    {selectedPost.likes.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500" data-testid="text-post-comments">
                    {selectedPost.comments}
                  </p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
                <div>
                  <Badge
                    variant={selectedPost.status === "visible" ? "default" : "secondary"}
                    className="w-full justify-center"
                    data-testid={`badge-post-status-${selectedPost.status}`}
                  >
                    {selectedPost.status === "visible" ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Reports ({selectedPost.reports})</CardTitle>
              <CardDescription>User reports on this post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedPost.reports > 0 && selectedPost.reportReasons ? (
                <div className="space-y-2">
                  {selectedPost.reportReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-500/10 rounded-md border border-red-500/30"
                      data-testid={`text-report-reason-${idx}`}
                    >
                      <p className="text-sm">{reason}</p>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => handleClearReports(selectedPost.id)}
                    className="w-full mt-4"
                    data-testid="button-clear-reports"
                  >
                    Clear All Reports
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No reports on this post</p>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="border-border/50 border-red-500/50 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-500">Admin Actions</CardTitle>
              <CardDescription>Manage this post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant={selectedPost.status === "visible" ? "destructive" : "outline"}
                  onClick={() => handleHide(selectedPost.id)}
                  className="gap-2"
                  data-testid={`button-${selectedPost.status === "visible" ? "hide" : "unhide"}-post-${selectedPost.id}`}
                >
                  {selectedPost.status === "visible" ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide Post
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Unhide Post
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedPost.id)}
                  className="gap-2"
                  data-testid={`button-delete-post-${selectedPost.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                data-testid="button-back-dashboard-post"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <h1 className="text-4xl font-bold text-primary" data-testid="text-post-management-title">
              Post Management
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-post-management-subtitle">
              Moderate and manage platform posts
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by username or caption..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-md border border-border/50 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="input-search-posts"
          />
        </div>

        {/* Posts Table */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle>All Posts ({filteredPosts.length})</CardTitle>
            <CardDescription>Click on a post to view details and manage it</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Thumbnail</th>
                    <th className="px-4 py-3 text-left font-medium">Username</th>
                    <th className="px-4 py-3 text-left font-medium">Caption</th>
                    <th className="px-4 py-3 text-left font-medium">Date Posted</th>
                    <th className="px-4 py-3 text-left font-medium">Likes</th>
                    <th className="px-4 py-3 text-left font-medium">Reports</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                      data-testid={`row-post-${post.id}`}
                    >
                      <td className="px-4 py-3">
                        <img
                          src={post.imageUrl}
                          alt="Thumbnail"
                          className="h-10 w-10 object-cover rounded"
                          data-testid={`img-thumbnail-${post.id}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium" data-testid={`text-post-username-${post.id}`}>
                        {post.username}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" data-testid={`text-post-caption-${post.id}`}>
                        {post.caption.substring(0, 50)}...
                      </td>
                      <td className="px-4 py-3 text-muted-foreground" data-testid={`text-post-date-${post.id}`}>
                        {post.datePosted}
                      </td>
                      <td className="px-4 py-3" data-testid={`text-post-likes-${post.id}`}>
                        {post.likes.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={post.reports > 0 ? "destructive" : "secondary"}
                          data-testid={`badge-reports-${post.id}`}
                        >
                          {post.reports}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={post.status === "visible" ? "default" : "secondary"}
                          data-testid={`badge-poststatus-${post.id}`}
                        >
                          {post.status === "visible" ? "Visible" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPost(post)}
                            className="gap-1"
                            data-testid={`button-view-post-${post.id}`}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-menu-post-${post.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleHide(post.id)}
                                data-testid={`menu-${post.status === "visible" ? "hide" : "unhide"}-${post.id}`}
                              >
                                {post.status === "visible" ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Unhide
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(post.id)}
                                className="text-red-500"
                                data-testid={`menu-delete-post-${post.id}`}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
