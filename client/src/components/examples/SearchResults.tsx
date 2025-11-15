import SearchResults from "../SearchResults";

export default function SearchResultsExample() {
  return (
    <SearchResults
      onClose={() => console.log("Close search")}
      onHashtagClick={(tag) => console.log("Hashtag clicked:", tag)}
      onUserClick={(username) => console.log("User clicked:", username)}
    />
  );
}
