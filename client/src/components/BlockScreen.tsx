import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, Ban } from "lucide-react";

interface BlockScreenProps {
  title: string;
  message: string;
  action: string;
}

export default function BlockScreen({ title, message, action }: BlockScreenProps) {
  const getIcon = () => {
    if (title.includes("Banned")) return <Ban className="w-16 h-16 text-destructive" />;
    if (title.includes("Disabled")) return <Lock className="w-16 h-16 text-destructive" />;
    return <AlertCircle className="w-16 h-16 text-destructive" />;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="w-full max-w-[430px] h-screen max-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h1 className="text-3xl font-bold mb-4" data-testid="text-block-title">
          {title}
        </h1>
        
        <p className="text-base text-muted-foreground mb-8 leading-relaxed" data-testid="text-block-message">
          {message}
        </p>
        
        <Button
          variant="destructive"
          onClick={() => {
            if (title.includes("Suspended")) {
              window.location.href = "mailto:support@afrosphere.app";
            } else {
              window.location.href = "https://afrosphere.app/support";
            }
          }}
          data-testid="button-block-action"
        >
          {action}
        </Button>
      </div>
    </div>
  );
}
