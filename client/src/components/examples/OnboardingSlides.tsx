import OnboardingSlides from "../OnboardingSlides";

export default function OnboardingSlidesExample() {
  return (
    <OnboardingSlides
      onComplete={() => console.log("Onboarding complete")}
      onSkip={() => console.log("Onboarding skipped")}
    />
  );
}
