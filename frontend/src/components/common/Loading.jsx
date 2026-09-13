import "./Loading.css";

// full-page loading spinner
function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-label">Loading...</p>
    </div>
  );
}

export default Loading;
