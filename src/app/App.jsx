import ErrorBoundary from "./ErrorBoundary";
import WhiteboardPage from "./WhiteboardPage";
import "../styles/globals.css";

export default function App() {
  return (
    <ErrorBoundary>
      <WhiteboardPage />
    </ErrorBoundary>
  );
}
