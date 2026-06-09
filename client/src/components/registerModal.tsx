import { X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

type RegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
  onRegisterSuccess?: () => void;
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

// Valida os campos antes de chamar a API
function validate(name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = "Nome é obrigatório.";
  } else if (name.trim().length < 2) {
    errors.name = "Nome deve ter ao menos 2 caracteres.";
  } else if (name.trim().length > 100) {
    errors.name = "Nome deve ter no máximo 100 caracteres.";
  }

  if (!email.trim()) {
    errors.email = "Email é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Informe um email válido.";
  }

  if (!password) {
    errors.password = "Senha é obrigatória.";
  } else if (password.length < 6) {
    errors.password = "Senha deve ter ao menos 6 caracteres.";
  } else if (password.length > 72) {
    errors.password = "Senha deve ter no máximo 72 caracteres.";
  }

  return errors;
}

// Calcula força da senha: 0-4
function calcPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABEL = ["", "Fraca", "Razoável", "Boa", "Forte"];
const STRENGTH_COLOR = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
const STRENGTH_TEXT = ["", "text-red-500", "text-yellow-600", "text-blue-600", "text-green-600"];

const inputBase =
  "h-[40px] w-full rounded-[12px] border px-4 text-[14px] text-[#24172b] outline-none placeholder:text-[#7c89a3] transition-colors duration-150 focus:ring-2 focus:ring-offset-2";
const inputNormal = `${inputBase} border-[#d9dde7] focus:ring-[#9b4ca0]`;
const inputError = `${inputBase} border-red-400 focus:ring-red-300`;

export function RegisterModal({
  isOpen,
  onClose,
  onLoginClick,
  onRegisterSuccess,
}: RegisterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { register, isLoading, error, clearError } = useAuthStore();

  if (!isOpen) return null;

  const passwordStrength = calcPasswordStrength(password);

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();
    clearError();

    // Validação local antes de chamar a API
    const errors = validate(name, email, password);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    await register(name, email, password);

    if (!useAuthStore.getState().error) {
      onRegisterSuccess?.();
      onClose();
    }
  };

  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

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
          Criar conta
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-heading font-medium text-[#24172b]">
              Nome
            </label>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
              className={fieldErrors.name ? inputError : inputNormal}
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p className="text-[12px] text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-heading font-medium text-[#24172b]">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
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
              onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
              className={fieldErrors.password ? inputError : inputNormal}
              autoComplete="new-password"
            />

            {/* Indicador de força da senha */}
            {password.length > 0 && (
              <div className="mt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        passwordStrength >= level
                          ? STRENGTH_COLOR[passwordStrength]
                          : "bg-[#e5e7eb]"
                      }`}
                    />
                  ))}
                </div>
                <p className={`mt-1 text-[11px] font-medium ${STRENGTH_TEXT[passwordStrength]}`}>
                  Senha {STRENGTH_LABEL[passwordStrength]}
                </p>
              </div>
            )}

            {fieldErrors.password && (
              <p className="text-[12px] text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {/* Erro da API */}
          {error && (
            <p className="rounded-[8px] bg-red-50 px-3 py-2 text-[13px] text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 h-[40px] rounded-[12px] bg-[#9b4ca0] text-[14px] font-medium text-white transition-colors hover:bg-[#b15bb4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="mt-5 flex flex-row justify-center gap-1 text-[13px] font-light text-[#677489]">
          <p>Já tem conta?</p>
          <button
            type="button"
            onClick={onLoginClick}
            className="text-[#9b4ca0] transition-colors hover:underline hover:underline-offset-1"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
