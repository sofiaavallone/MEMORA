import { FileText } from "lucide-react";

type DeckCardProps = {
  title: string;
  cardsCount: number;
  masteredPercentage: number;
  onClick?: () => void;
};

export function DeckCard({
  title,
  cardsCount,
  masteredPercentage,
  onClick,
}: DeckCardProps) {
  return (
    <div className="scale-50">
        <button
        onClick={onClick}
        className="w-full max-w-[500px] rounded-[28px] border border-[#e1e7f0] border-[2px] bg-white p-10 text-left shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:border-[#ebdae9]">
        <div className="mb-8 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center text-[#9b3f98]">
              <FileText size={32} strokeWidth={2.2} />
            </div>

            <span className="text-[20px] font-medium text-[#6b7a99]">
              {cardsCount} cards
            </span>
        </div>

        <h2 className="mb-6 text-[28px] font-semibold leading-tight text-[#24172b]">
            {title}
        </h2>

        <div className="mb-4 h-3 w-full rounded-full bg-[#eee7ef]">
            <div
            className={`h-3 rounded-full transition-all duration-500 ${
                masteredPercentage < 50
                  ? "bg-red-400"
                  : masteredPercentage < 70
                  ? "bg-yellow-400"
                  : "bg-green-500"
              }`}
            style={{ width: `${masteredPercentage}%` }}
            />
        </div>

        <p className="text-[18px] font-medium text-[#6b7a99]">
            {masteredPercentage}% dominado
        </p>
        </button>
    </div>
  );
}