import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Crown, Zap, Heart, MessageCircle, TrendingUp, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PremiumProps {
  onClose: () => void;
}

export default function Premium({ onClose }: PremiumProps) {
  const premiumFeatures = [
    { icon: Zap, title: "Ad-Free Experience", description: "Browse without ads" },
    { icon: Heart, title: "Premium Reactions", description: "Exclusive reaction types" },
    { icon: MessageCircle, title: "Priority Messaging", description: "Faster message delivery" },
    { icon: TrendingUp, title: "Advanced Analytics", description: "View detailed post stats" },
    { icon: Crown, title: "Premium Badge", description: "Show your status" },
    { icon: Users, title: "Exclusive Community", description: "Join premium members only" },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto h-screen">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Premium
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-premium">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full pb-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mx-auto">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black">Unlock Premium</h3>
              <p className="text-muted-foreground">
                Get exclusive features and enhance your AfroSphere experience
              </p>
            </div>

            {/* Pricing Card */}
            <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5">
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-black">$4.99</div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90"
                  data-testid="button-subscribe-premium"
                >
                  Subscribe Now
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Cancel anytime. First month 50% off.
                </p>
              </div>
            </Card>

            {/* Features Grid */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Premium Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {premiumFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={index}
                      className="p-4 border-border/50 hover-elevate"
                      data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{feature.title}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                FAQ
              </h4>
              <div className="space-y-3">
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-sm p-3 hover:bg-muted rounded-lg">
                    Can I cancel anytime?
                  </summary>
                  <p className="text-sm text-muted-foreground p-3 pt-0">
                    Yes, you can cancel your subscription at any time without any penalties.
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-sm p-3 hover:bg-muted rounded-lg">
                    Is there a free trial?
                  </summary>
                  <p className="text-sm text-muted-foreground p-3 pt-0">
                    Yes! Your first month is 50% off. Experience all premium features.
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-sm p-3 hover:bg-muted rounded-lg">
                    What payment methods do you accept?
                  </summary>
                  <p className="text-sm text-muted-foreground p-3 pt-0">
                    We accept all major credit cards and digital payment methods.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
