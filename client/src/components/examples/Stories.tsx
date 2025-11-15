import Stories from "../Stories";

export default function StoriesExample() {
  const mockStories = [
    { id: "1", username: "zara_style", hasStory: true, isViewed: false },
    { id: "2", username: "kojoart", hasStory: true, isViewed: false },
    { id: "3", username: "amaarabeats", hasStory: true, isViewed: true },
    { id: "4", username: "adike", hasStory: true, isViewed: false },
    { id: "5", username: "kwame", hasStory: true, isViewed: true },
  ];

  return (
    <div className="bg-background py-4">
      <Stories
        stories={mockStories}
        onAddStory={() => console.log("Add story")}
        onViewStory={(id) => console.log("View story:", id)}
      />
    </div>
  );
}
