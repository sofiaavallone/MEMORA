import { Brain, Upload, Layers3, LogIn, User, LogOut, ChevronDown, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type UserData = {
  name: string;
  email: string;
};

type SideBarProps = {
  reviewCardsCount: number;
  reviewProgressPercentage: number;
  activeItem?: "upload" | "decks" | "review" | "profile";
  onLoginClick?: () => void;
  user?: UserData | null;
  onLogout?: () => void;
};

type NavItemProps = {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
};

function NavItem({ label, icon, isActive = false, badge, onClick }: NavItemProps) {
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
      <span className="flex-1 text-[14px] font-normal">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#9b4ca0] px-1.5 text-[11px] font-semibold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

export function SideBar({
  reviewCardsCount,
  reviewProgressPercentage,
  activeItem = "upload",
  onLoginClick,
  user,
  onLogout,
}: SideBarProps) {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <aside className="flex min-h-screen w-full max-w-[255px] flex-col border-r border-[#e8ebf0] bg-[#fcfcfc] px-3 py-6">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#9b4ca0] text-white">
          <Brain size={20} strokeWidth={2.4} />
        </div>
        <span className="font-heading text-[21px] font-semibold tracking-[-0.02em] text-[#24172b]">
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
        <NavItem
          label="Revisão Diária"
          icon={<CalendarClock size={20} strokeWidth={2.2} />}
          isActive={activeItem === "review"}
          badge={reviewCardsCount}
          onClick={() => navigate("/review")}
        />
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        {/* Card de revisão diária */}
        <button
          type="button"
          onClick={() => navigate("/review")}
          className="w-full rounded-[13px] bg-[#eee7ef] p-4 text-left transition-colors hover:bg-[#e5dce6]"
        >
          <h2 className="mb-0.5 font-heading text-[12px] font-medium text-[#24172b]">
            Revisão Diária
          </h2>
          <p className="mb-2 text-[12px] font-normal text-[#6b7a99]">
            {reviewCardsCount > 0
              ? `${reviewCardsCount} cards para revisar hoje`
              : "Em dia! Nenhum card pendente"}
          </p>
          <div className="h-1.5 w-full rounded-full bg-[#d9dfe8]">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                reviewProgressPercentage < 50
                  ? "bg-red-400"
                  : reviewProgressPercentage < 80
                  ? "bg-yellow-400"
                  : "bg-green-500"
              }`}
              style={{ width: `${reviewProgressPercentage}%` }}
            />
          </div>
        </button>

        {/* Usuário */}
        {user ? (
          <div className="relative">
            {isUserMenuOpen && (
              <div className="absolute bottom-[calc(100%+12px)] left-0 w-full rounded-[10px] border border-[#d9dfe8] bg-white px-2 py-1.5 shadow-[0px_8px_24px_rgba(15,23,42,0.12)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate("/profile");
                  }}
                  className={`flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left transition-colors ${
                    activeItem === "profile"
                      ? "bg-[#1DBA84] text-white"
                      : "text-[#24172b] hover:bg-[#f3eef4]"
                  }`}
                >
                  <User size={16} strokeWidth={2} />
                  <span className="text-[14px] font-light">Meu Perfil</span>
                </button>

                <div className="my-1 h-px bg-[#e8ebf0]" />

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[#ff4d5e] transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} strokeWidth={2} />
                  <span className="text-[14px] font-light">Sair da conta</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-[#24172b] transition-colors hover:bg-[#f3eef4]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eee7ef] text-[#9b4ca0]">
                  <User size={16} strokeWidth={2.1} />
                </div>
                <p className="truncate text-[14px] font-normal text-[#24172b]">{user.name}</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-[#6b7a99] transition-transform duration-200 ${
                  isUserMenuOpen ? "" : "rotate-180"
                }`}
              />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-3 px-3 py-1.5 text-[#6b7a99] transition-colors hover:text-[#24172b]"
          >
            <LogIn size={19} strokeWidth={2.2} />
            <span className="text-[15px] font-normal">Entrar</span>
          </button>
        )}
      </div>
    </aside>
  );
}