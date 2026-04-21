import { Brain, Upload, Layers3, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SideBarProps = {
  reviewCardsCount: number;
  reviewProgressPercentage: number;
  activeItem?: "upload" | "decks";
  onLoginClick?: () => void;
};

type NavItemProps = {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};

function NavItem({
  label,
  icon,
  isActive = false,
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[13px] px-3 py-2.5 text-left transition-all duration-200 ${
        isActive
          ? "bg-[#eee7ef] text-[#9b4ca0]"
          : "bg-transparent text-[#6b7a99] hover:bg-[#f3eef4] hover:text-[#000000]"
      }`}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-[14px] font-normal">{label}</span>
    </button>
  );
}

export function SideBar({
  reviewCardsCount,
  reviewProgressPercentage,
  activeItem = "upload",
  onLoginClick,
}: SideBarProps) {
    const navigate = useNavigate();

    return (
    <aside className="flex min-h-screen w-full max-w-[255px] flex-col border-r border-[#e8ebf0] bg-[#fcfcfc] px-3 py-6">
        <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#9b4ca0] text-white">
                <Brain size={20} strokeWidth={2.4} />
            </div>

            <span className="text-[21px] font-semibold tracking-[-0.02em] text-[#24172b]">
                Memora
            </span>
        </div>

        <nav className="flex flex-col gap-1.5">
            <NavItem
                label="Upload"
                icon={<Upload size={20} strokeWidth={2.2} />}
                isActive={activeItem === "upload"}
                onClick={() => navigate("/")}
            />

            <NavItem
                label="Meus Decks"
                icon={<Layers3 size={20} strokeWidth={2.2} />}
                isActive={activeItem === "decks"}
                onClick={() => navigate("/decks")}
            />
        </nav>

        <div className="mt-auto flex flex-col gap-4">
            <div className="w-full rounded-[13px] bg-[#eee7ef] p-4 text-left">
                <h2 className="mb-0.5 text-[12px] font-medium text-[#24172b]">
                    Revisão Diária
                </h2>

                <p className="mb-2 text-[12px] font-normal text-[#6b7a99]">
                    {reviewCardsCount} cards para revisar hoje
                </p>

                <div className="h-1.5 w-full rounded-full bg-[#d9dfe8]">
                <div
                    className={`h-1.5 rounded-full bg-[#9b4ca0] transition-all duration-500 ${
                        reviewProgressPercentage < 50
                        ? "bg-red-400"
                        : reviewProgressPercentage < 70
                        ? "bg-yellow-400"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${reviewProgressPercentage}%` }}
                />
                </div>
            </div>

            <button
                onClick={onLoginClick}
                className="flex items-center gap-3 px-3 py-1.5 text-[#6b7a99] transition-colors duration-200 hover:text-[#24172b]">
                <LogIn size={19} strokeWidth={2.2} />
                <span className="text-[15px] font-normal">Entrar</span>
            </button>
        </div>
    </aside>
    );
}