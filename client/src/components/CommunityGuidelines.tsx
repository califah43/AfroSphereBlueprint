import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface CommunityGuidelinesProps {
  onClose: () => void;
  onAgree?: () => void;
}

export default function CommunityGuidelines({ onClose, onAgree }: CommunityGuidelinesProps) {
  const { t } = useLanguage();

  const guidelines = [
    { rule: "guidelines.rule1", desc: "guidelines.rule1Desc" },
    { rule: "guidelines.rule2", desc: "guidelines.rule2Desc" },
    { rule: "guidelines.rule3", desc: "guidelines.rule3Desc" },
    { rule: "guidelines.rule4", desc: "guidelines.rule4Desc" },
    { rule: "guidelines.rule5", desc: "guidelines.rule5Desc" },
    { rule: "guidelines.rule6", desc: "guidelines.rule6Desc" },
    { rule: "guidelines.rule7", desc: "guidelines.rule7Desc" },
    { rule: "guidelines.rule8", desc: "guidelines.rule8Desc" },
    { rule: "guidelines.rule9", desc: "guidelines.rule9Desc" },
    { rule: "guidelines.rule10", desc: "guidelines.rule10Desc" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="bg-background w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" data-testid="text-guidelines-title">{t("guidelines.title")}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t("guidelines.subtitle")}</p>
          </div>
          <button onClick={onClose} className="p-1 hover-elevate rounded-lg" data-testid="button-close-guidelines">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 py-6 space-y-4">
          {guidelines.map((item, idx) => (
            <div key={idx} className="space-y-1.5" data-testid={`guideline-${idx + 1}`}>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                {t(item.rule)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {t(item.desc)}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border bg-card px-4 py-4 space-y-3">
          {onAgree && (
            <Button 
              onClick={() => {
                onAgree();
                onClose();
              }} 
              className="w-full"
              data-testid="button-agree-guidelines"
            >
              {t("guidelines.agree")}
            </Button>
          )}
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full"
            data-testid="button-close-guidelines-footer"
          >
            {t("common.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
