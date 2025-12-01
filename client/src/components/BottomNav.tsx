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
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-lg bg-opacity-95 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => onTabChange(item.id)}
              className="relative transition-all"
              data-testid={`button-nav-${item.id}`}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isActive ? "text-primary fill-primary" : "text-muted-foreground"
                }`}
              />
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
