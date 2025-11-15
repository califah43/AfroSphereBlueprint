import ShareSheet from "../ShareSheet";

export default function ShareSheetExample() {
  return (
    <div className="h-screen bg-background">
      <ShareSheet
        postUrl="https://afrosphere.app/post/123"
        onClose={() => console.log("Close share sheet")}
        onShare={(platform) => console.log("Shared to:", platform)}
      />
    </div>
  );
}
