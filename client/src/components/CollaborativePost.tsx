
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UserPlus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CollaborativePostProps {
  onClose: () => void;
  onAddCollaborators?: (collaborators: string[]) => void;
}

const suggestedCreators = [
  { username: "kojoart", category: "Visual Artist" },
  { username: "amaarabeats", category: "Music Producer" },
  { username: "zara_style", category: "Fashion Designer" },
  { username: "kwame_creative", category: "Photographer" },
];

export default function CollaborativePost({ onClose, onAddCollaborators }: CollaborativePostProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredCreators = suggestedCreators.filter((creator) =>
    creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCollaborator = (username: string) => {
    setSelectedCollaborators((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const handleAdd = () => {
    if (selectedCollaborators.length === 0) {
      toast({
        title: "No collaborators selected",
        description: "Please select at least one collaborator",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "✨ Collaborators added!",
      description: `${selectedCollaborators.length} creator${selectedCollaborators.length > 1 ? 's' : ''} tagged`,
      className: "border-primary/20 bg-card",
    });

    onAddCollaborators?.(selectedCollaborators);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Add Collaborators</h2>
        <Button
          onClick={handleAdd}
          disabled={selectedCollaborators.length === 0}
          className="bg-gradient-to-r from-primary to-orange-500"
        >
          Add ({selectedCollaborators.length})
        </Button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <Label>Search Creators</Label>
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {selectedCollaborators.length > 0 && (
          <div className="space-y-2">
            <Label>Selected ({selectedCollaborators.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCollaborators.map((username) => (
                <div
                  key={username}
                  className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full"
                >
                  <span className="text-sm font-medium">{username}</span>
                  <button onClick={() => toggleCollaborator(username)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label>Suggested Creators</Label>
          {filteredCreators.map((creator) => {
            const isSelected = selectedCollaborators.includes(creator.username);
            return (
              <button
                key={creator.username}
                onClick={() => toggleCollaborator(creator.username)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{creator.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{creator.username}</p>
                    <p className="text-xs text-muted-foreground">{creator.category}</p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground italic">
            💡 Collaborate with other creators to showcase your combined work!
          </p>
        </div>
      </div>
    </div>
  );
}
