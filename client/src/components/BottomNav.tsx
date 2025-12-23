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
    <div className="fixed bottom-0 left-0 right-0 z-50 h-24 pointer-events-none">
      {/* Premium Glassmorphism Background with more blur and better gradient */}
      <div className="absolute inset-x-4 bottom-4 h-16 bg-card/40 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-2xl" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center justify-around gap-4 px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative group p-3 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? "text-primary scale-110" 
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
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
                
                {/* Premium Active Indicator */}
                {isActive && (
                  <>
                    {/* Top bar indicator */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-1.5 w-8 bg-gradient-to-r from-primary to-orange-400 rounded-full gold-glow animate-pulse shadow-lg" />
                    
                    {/* Bottom dot indicator */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-orange-400 gold-glow animate-pulse shadow-lg" />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
