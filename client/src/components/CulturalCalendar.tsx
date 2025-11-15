
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, X } from "lucide-react";

interface CulturalCalendarProps {
  onClose: () => void;
  onCreateEventPost?: (eventId: string) => void;
}

const upcomingEvents = [
  {
    id: "1",
    name: "African Liberation Day",
    date: "May 25",
    category: "Historical",
    description: "Celebrating African independence and unity",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "2",
    name: "Ankara Fashion Week",
    date: "June 15-20",
    category: "Fashion",
    description: "Showcase of contemporary African fashion",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "3",
    name: "Afrobeats Festival",
    date: "July 10",
    category: "Music",
    description: "Celebrating African music and culture",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "4",
    name: "Pan-African Art Exhibition",
    date: "August 1-7",
    category: "Art",
    description: "Contemporary African art from across the continent",
    color: "from-blue-500 to-cyan-600",
  },
];

const monthlyThemes = [
  { month: "February", theme: "Black History Month" },
  { month: "May", theme: "African Heritage Month" },
  { month: "October", theme: "African Art Month" },
];

export default function CulturalCalendar({ onClose, onCreateEventPost }: CulturalCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Cultural Calendar</h2>
        <div className="w-10" />
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events
          </h3>
          <p className="text-sm text-muted-foreground">
            Celebrate African culture and creativity
          </p>
        </div>

        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="border border-border rounded-lg overflow-hidden hover-elevate"
            >
              <div className={`h-2 bg-gradient-to-r ${event.color}`} />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{event.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </p>
                  </div>
                  <Badge variant="outline">{event.category}</Badge>
                </div>
                <p className="text-sm">{event.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onCreateEventPost?.(event.id)}
                >
                  Create Event Post
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Monthly Themes
          </h3>
          <div className="space-y-2">
            {monthlyThemes.map((item) => (
              <div
                key={item.month}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <span className="font-medium">{item.month}</span>
                <span className="text-sm text-muted-foreground">{item.theme}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-lg p-4 border border-primary/20">
          <p className="text-sm font-medium mb-2">✨ Share Your Event</p>
          <p className="text-xs text-muted-foreground mb-3">
            Organizing a cultural event? Share it with the community!
          </p>
          <Button size="sm" className="w-full bg-gradient-to-r from-primary to-orange-500">
            Submit Event
          </Button>
        </div>
      </div>
    </div>
  );
}
