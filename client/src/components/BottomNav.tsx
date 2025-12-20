import { Home, Compass, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useLanguage();
  const navItems = [
    { id: "home", icon: Home, label: t("nav.home") },
    { id: "explore", icon: Compass, label: t("nav.explore") },
    { id: "notifications", icon: Bell, label: t("nav.notifications") },
    { id: "profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect-lg z-50 border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => onTabChange(item.id)}
              className={`relative transition-premium ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`button-nav-${item.id}`}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isActive ? "text-primary fill-primary gold-glow" : ""
                }`}
              />
              {isActive && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary gold-glow animate-subtle-glow" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
