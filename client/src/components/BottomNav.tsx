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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Premium Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-card/50 to-card/30 backdrop-blur-lg border-t border-primary/10" />
      
      {/* Premium Shadow Layer */}
      <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-b from-black/20 via-black/10 to-transparent pointer-events-none" />
      
      <div className="relative max-w-md mx-auto flex items-center justify-around px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTabChange(item.id)}
                className={`relative h-12 w-12 transition-all duration-300 ${
                  isActive 
                    ? "text-primary scale-110" 
                    : "text-muted-foreground hover:text-foreground/80"
                } hover-elevate`}
                data-testid={`button-nav-${item.id}`}
              >
                {/* Active Background Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/15 rounded-full gold-glow-lg blur-md -z-10 animate-pulse" />
                )}
                
                <Icon
                  className={`h-6 w-6 transition-all duration-300 ${
                    isActive 
                      ? "text-primary fill-primary drop-shadow-lg" 
                      : "group-hover:scale-110"
                  }`}
                />
              </Button>
              
              {/* Premium Active Indicator */}
              {isActive && (
                <>
                  {/* Top bar indicator */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-1.5 w-8 bg-gradient-to-r from-primary to-orange-400 rounded-full gold-glow animate-pulse shadow-lg" />
                  
                  {/* Bottom dot indicator */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-orange-400 gold-glow animate-pulse shadow-lg" />
                  
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-full border border-primary/40 animate-spin" style={{ animationDuration: '3s' }} />
                </>
              )}
              
              {/* Hover effect indicator */}
              {!isActive && (
                <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
