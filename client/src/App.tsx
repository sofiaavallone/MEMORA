import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UploadPage } from "./app/uploadPage";
import { DecksPage } from "./app/decksPage";
import { FlashcardPage } from "./app/flashcardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/decks" element={<DecksPage />} />
        <Route path="/flashcards" element={<FlashcardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;