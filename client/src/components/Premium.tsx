import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Crown, Zap, Heart, MessageCircle, TrendingUp, Users, Brain, Search, ShieldCheck, Palette, Ghost, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PremiumProps {
  onClose: () => void;
}

export default function Premium({ onClose }: PremiumProps) {
  const categories = [
    {
      title: "🧠 ORÍ+ (Core Premium Value)",
      features: [
        { icon: Brain, title: "Advanced ORÍ Insights", description: "Deeper understanding of your digital soul" },
        { icon: TrendingUp, title: "Evolution History", description: "Track your ORÍ's growth over time" },
        { icon: Zap, title: "Personalized Prompts", description: "Tailored reflections for your journey" },
      ]
    },
    {
      title: "🔍 Enhanced Discovery",
      features: [
        { icon: TrendingUp, title: "Discovery Boost", description: "Appear higher in discovery feeds" },
        { icon: Users, title: "Profile Viewers", description: "See who's been checking you out" },
        { icon: Search, title: "Advanced Filters", description: "Filter by energy, intent, and more" },
      ]
    },
    {
      title: "💬 Messaging Boosts",
      features: [
        { icon: Zap, title: "Priority Delivery", description: "Your messages land at the top" },
        { icon: MessageCircle, title: "First Move", description: "Message creators before connecting" },
        { icon: ShieldCheck, title: "Safety Plus", description: "Pinned chats and request filtering" },
      ]
    },
    {
      title: "🪪 Profile Customization",
      features: [
        { icon: Crown, title: "Premium Badge", description: "Stand out with a gold crown" },
        { icon: Palette, title: "Custom Themes", description: "Exclusive dark mode variants" },
        { icon: Heart, title: "Extended Bio", description: "More space to tell your story" },
      ]
    },
    {
      title: "🛡️ Control & Privacy",
      features: [
        { icon: Ghost, title: "Ghost Mode", description: "Browse profiles anonymously" },
        { icon: Eye, title: "Read Receipts", description: "Full control over your seen status" },
        { icon: ShieldCheck, title: "Visibility Control", description: "Detailed profile privacy settings" },
      ]
    }
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
          <div className="p-4 space-y-8 max-w-2xl mx-auto w-full pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mx-auto shadow-lg gold-glow">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black">Unlock AfroSphere Premium</h3>
              <p className="text-muted-foreground">
                Enhance your experience with depth, discovery, and control.
              </p>
            </div>

            {/* Pricing Card */}
            <Card className="p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-orange-500/5 to-background shadow-xl">
              <div className="space-y-6 text-center">
                <div>
                  <div className="text-5xl font-black bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                    $4.99
                  </div>
                  <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest">per month</p>
                </div>
                <Button
                  size="lg"
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 shadow-lg active-elevate-2 transition-all"
                  data-testid="button-subscribe-premium"
                >
                  Subscribe Now
                </Button>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-primary">First month 50% off!</p>
                  <p className="text-xs text-muted-foreground">Cancel anytime in your settings.</p>
                </div>
              </div>
            </Card>

            {/* Features Breakdown */}
            <div className="space-y-10">
              {categories.map((category, catIndex) => (
                <div key={catIndex} className="space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-primary px-1">
                    {category.title}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {category.features.map((feature, fIndex) => {
                      const Icon = feature.icon;
                      return (
                        <Card
                          key={fIndex}
                          className="p-4 border-border/50 hover-elevate bg-card/50 backdrop-blur-sm"
                          data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{feature.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison */}
            <div className="pt-8 border-t space-y-4">
              <h4 className="text-center font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Our Philosophy
              </h4>
              <p className="text-center text-sm text-muted-foreground leading-relaxed px-4">
                Premium unlocks depth and customization, while core features remain free for everyone. We build for the community.
              </p>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4 pt-8 border-t">
              <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Questions?
              </h4>
              <div className="space-y-2">
                {[
                  { q: "Can I cancel anytime?", a: "Absolutely. No contracts, no hassle." },
                  { q: "Is it secure?", a: "We use enterprise-grade encryption for all transactions." },
                  { q: "What's ORÍ+?", a: "Advanced AI tools to help you understand and grow your creative presence." }
                ].map((faq, i) => (
                  <details key={i} className="group border border-border/50 rounded-xl overflow-hidden">
                    <summary className="cursor-pointer font-bold text-xs p-4 hover:bg-muted flex justify-between items-center transition-all">
                      {faq.q}
                      <Plus className="h-3 w-3 transition-transform group-open:rotate-45" />
                    </summary>
                    <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Minimal Eye icon for FAQ/Ghost if needed
function Eye({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
