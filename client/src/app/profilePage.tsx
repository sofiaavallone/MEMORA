import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SideBar } from "../components/sideBar";
import { useAuthStore } from "../store/useAuthStore";
import { useDueCards } from "../hooks/useDueCards";

export function ProfilePage() {
    const navigate = useNavigate();

    const { user } = useAuthStore();
    const { totalDue } = useDueCards();

    const [name, setName] = useState(user?.name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");

    const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (event) => {
        event.preventDefault();
        alert("Alterações salvas com sucesso!");
    };

    return (
        <div className="min-h-screen bg-[#f8f8f8]">
            <div className="flex">
                <SideBar
                    reviewCardsCount={totalDue}
                    reviewProgressPercentage={totalDue === 0 ? 100 : 0}
                    activeItem="profile"
                />

                <main className="flex-1 px-8 py-10">
                    <section className="mx-auto w-full max-w-[560px]">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="mb-8 flex items-center gap-2 text-[15px] text-[#6b7a99] font-light transition-colors duration-200 hover:text-[#24172b]"
                        >
                            <ArrowLeft size={17} strokeWidth={2} />
                            <span>Voltar</span>
                        </button>

                        <div className="mb-10 flex items-center gap-5">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eee7ef] text-[#9b4ca0]">
                                <User size={34} strokeWidth={2.1} />
                            </div>

                            <div>
                                <h1 className="text-[24px] font-heading font-semibold text-[#24172b]">
                                    Meu Perfil
                                </h1>

                                <p className="text-[14px] text-[#6b7a99] font-light">{email}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="mb-2 block text-[14px] font-heading font-normal text-[#24172b]">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="h-[42px] w-full rounded-[12px] border border-[#d9dde7] px-4 text-[15px] text-[#24172b] outline-none placeholder:text-[#7c89a3] focus:ring-2 focus:ring-offset-1 focus:ring-[#9b4ca0]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[14px] font-heading font-normal text-[#24172b]">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="h-[42px] w-full rounded-[12px] border border-[#d9dde7] px-4 text-[15px] text-[#24172b] outline-none placeholder:text-[#7c89a3] focus:ring-2 focus:ring-offset-1 focus:ring-[#9b4ca0]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="h-[42px] rounded-[10px] bg-[#9b4ca0] px-4 text-[14px] font-normal text-white transition-colors duration-200 hover:bg-[#8d4192]"
                            >
                                Salvar alterações
                            </button>
                        </form>
                    </section>
                </main>
            </div>
        </div>
    );
}
