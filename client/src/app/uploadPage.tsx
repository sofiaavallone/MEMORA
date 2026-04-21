import { useState } from "react";
import { SideBar } from "../components/sideBar";
import { LoginModal } from "../components/loginModal";
import { RegisterModal } from "../components/registerModal";

export function UploadPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="flex">
        <SideBar
          reviewCardsCount={12}
          reviewProgressPercentage={70}
          activeItem="upload"
          onLoginClick={() => setIsLoginModalOpen(true)}
        />

        <main className="flex-1 p-8">
          <h1 className="mb-6 text-3xl font-semibold text-[#24172b]">
            Página de Upload
          </h1>

          <div className="rounded-[20px] bg-white p-6 shadow-sm">
            <p className="text-[#6b7a99]">
              Aqui vai o conteúdo da tela de upload.
            </p>
          </div>
        </main>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onCreateAccountClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}