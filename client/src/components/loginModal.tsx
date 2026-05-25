import { X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

type LoginModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreateAccountClick?: () => void;
    onLoginSucess?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onCreateAccountClick?: () => void;
  onLoginSucess?: (user: AuthUser) => void;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

// Valida os campos antes de chamar a API
function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Informe um email válido.";
  }

  if (!password) {
    errors.password = "Senha é obrigatória.";
  }

  return errors;
}

const inputBase =
  "h-[40px] w-full rounded-[12px] border px-4 text-[14px] text-[#24172b] outline-none placeholder:text-[#7c89a3] transition-colors duration-150 focus:ring-2 focus:ring-offset-2";
const inputNormal = `${inputBase} border-[#d9dde7] focus:ring-[#9b4ca0]`;
const inputError = `${inputBase} border-red-400 focus:ring-red-300`;

export function LoginModal({
  isOpen,
  onClose,
  onCreateAccountClick,
  onLoginSucess,
}: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login, isLoading, error, clearError } = useAuthStore();

    if (!isOpen) return null;

    const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (event) => {
        event.preventDefault();
        clearError();

        await login(email, password);

        if (!useAuthStore.getState().error) {
            onLoginSucess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
            <div className="relative w-full max-w-[460px] rounded-[12px] bg-white px-6 py-7 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 text-[#7b7280] transition-colors duration-200 hover:text-[#4b4350]"
                >
                    <X size={20} />
                </button>

                <h2 className="mb-6 font-heading text-[20px] font-semibold text-[#24172b]">
                    Entrar no Memora
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-heading font-medium text-[#24172b]">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="h-[40px] rounded-[12px] border border-[#d9dde7] px-4 text-[14px] text-[#24172b] outline-none placeholder:text-[#7c89a3] focus:ring-2 focus:ring-[#9b4ca0] focus:ring-offset-2" 
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-heading font-medium text-[#24172b]">
                            Senha
                        </label>

                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="h-[40px] rounded-[12px] border border-[#d9dde7] px-4 text-[14px] text-[#24172b] outline-none placeholder:text-[#7c89a3] focus:ring-2 focus:ring-[#9b4ca0] focus:ring-offset-2"
                        />
                    </div>

                    {error && <p className="text-[13px] text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 h-[40px] rounded-[12px] bg-[#9b4ca0] text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#b15bb4]"
                    >
                        {isLoading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <div className="mt-5 flex flex-row justify-center gap-1 text-[13px] font-light text-[#677489]">
                    <p>Não tem conta?</p>
                    <button
                        type="button"
                        onClick={onCreateAccountClick}
                        className="text-[#9b4ca0] hover:underline hover:underline-offset-1 hover:decoration-1 transition-colors duration-200"
                    >
                        Criar conta
                    </button>
                </div>
            </div>
        </div>
    );
}
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();
    setApiError("");

    // Validação local antes de chamar a API
    const errors = validate(email, password);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      setIsLoading(true);
      const data = await loginUser({ email, password });
      localStorage.setItem("memora_token", data.token);
      localStorage.setItem("memora_user", JSON.stringify(data.user));
      onLoginSucess?.(data.user);
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="relative w-full max-w-[460px] rounded-[12px] bg-white px-6 py-7 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#7b7280] transition-colors hover:text-[#4b4350]"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 font-heading text-[20px] font-semibold text-[#24172b]">
          Entrar no Memora
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-heading font-medium text-[#24172b]">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={fieldErrors.email ? inputError : inputNormal}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="text-[12px] text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-heading font-medium text-[#24172b]">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={fieldErrors.password ? inputError : inputNormal}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="text-[12px] text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {/* Erro da API */}
          {apiError && (
            <p className="rounded-[8px] bg-red-50 px-3 py-2 text-[13px] text-red-500">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 h-[40px] rounded-[12px] bg-[#9b4ca0] text-[14px] font-medium text-white transition-colors hover:bg-[#b15bb4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-5 flex flex-row justify-center gap-1 text-[13px] font-light text-[#677489]">
          <p>Não tem conta?</p>
          <button
            type="button"
            onClick={onCreateAccountClick}
            className="text-[#9b4ca0] transition-colors hover:underline hover:underline-offset-1"
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}
