import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UploadPage } from "./app/uploadPage";
import { DecksPage } from "./app/decksPage";
import { FlashcardPage } from "./app/flashcardPage";
import { ReviewPage } from "./app/reviewPage";
import { ProfilePage } from "./app/profilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/decks" element={<DecksPage />} />
        <Route path="/flashcards" element={<FlashcardPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;