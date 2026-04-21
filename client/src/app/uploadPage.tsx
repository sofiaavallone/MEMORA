import { SideBar } from "../components/sideBar";

export function UploadPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="flex">
        <SideBar
          reviewCardsCount={12}
          reviewProgressPercentage={70}
          activeItem="upload"
          onLoginClick={() => console.log("Entrar clicado")}
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
    </div>
  );
}