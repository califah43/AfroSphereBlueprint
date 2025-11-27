import { useEffect, useState } from "react";

const greetings = [
  { text: "Jambo", lang: "Swahili (East Africa)" },
  { text: "Ayoba", lang: "South Africa" },
  { text: "Sawubona", lang: "Zulu (South Africa)" },
  { text: "Sankofa", lang: "Akan (Ghana/Ivory Coast)" },
  { text: "Ubuntu", lang: "Xhosa (South Africa)" },
  { text: "Habari", lang: "Swahili" },
  { text: "Wasuze otya", lang: "Luganda (Uganda)" },
  { text: "Salaam", lang: "Arabic (North Africa)" },
];

export default function AfricanCulturalBanner() {
  const [greeting, setGreeting] = useState(greetings[0]);

  useEffect(() => {
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setGreeting(randomGreeting);
  }, []);

  return (
    <div
      className="w-full bg-gradient-to-r from-primary/80 via-purple-500/80 to-pink-500/80 py-3 px-4 text-center relative overflow-hidden"
      data-testid="banner-cultural"
    >
      {/* Decorative pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,.1)_10px,rgba(255,255,255,.1)_20px)]" />
      </div>

      <div className="relative z-10">
        <p className="text-white font-bold text-lg mb-1" data-testid="text-greeting">
          {greeting.text}
        </p>
        <p className="text-white/80 text-xs" data-testid="text-greeting-lang">
          {greeting.lang}
        </p>
      </div>
    </div>
  );
}
