import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UploadPage } from "./app/uploadPage";
import { DecksPage } from "./app/decksPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/decks" element={<DecksPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;