import { FileCheck2, Wallet, Receipt, IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  totalInvoices: number;
  totalTaxable: number;
  totalGst: number;
  totalValue: number;
  scopeLabel: string;
  loading?: boolean;
  compact?: boolean;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export const StatsCards = ({
  totalInvoices,
  totalTaxable,
  totalGst,
  totalValue,
  scopeLabel,
  loading = false,
  compact = false,
}: Props) => {
  const cards = [
    { label: "Invoices Processed", value: totalInvoices.toString(), icon: FileCheck2, accent: "from-blue-500/80 via-blue-500/80 to-blue-500/80" },
    { label: "Total Taxable Amount", value: `₹${formatINR(totalTaxable)}`, icon: Wallet, accent: "from-orange-500/85 via-orange-500/85 to-orange-500/85" },
    { label: "Total GST Collected", value: `₹${formatINR(totalGst)}`, icon: Receipt, accent: "from-emerald-500/80 via-emerald-500/80 to-emerald-500/80" },
    { label: "Total Invoice Value", value: `₹${formatINR(totalValue)}`, icon: IndianRupee, accent: "from-violet-500/80 via-violet-500/80 to-violet-500/80" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground break-words">{scopeLabel}</p>
      <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        {cards.map((c) => (
          <div
            key={c.label}
            className={compact
              ? "relative overflow-hidden rounded-xl border border-[#c8d6e8] bg-white p-4 shadow-sm transition-smooth hover:shadow-md min-w-0"
              : "relative overflow-hidden rounded-xl border border-[#c8d6e8] bg-white p-5 shadow-sm transition-smooth hover:shadow-md min-w-0"
            }
          >
            <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${c.accent}`} />
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground leading-tight">{c.label}</p>
                {loading ? (
                  <Skeleton className={compact ? "h-7 w-24 mt-2" : "h-8 w-28 mt-2"} />
                ) : (
                  <p
                    className={
                      compact
                        ? "text-xl font-bold mt-2 tracking-tight leading-tight break-words"
                        : "text-2xl font-bold mt-2 tracking-tight leading-tight break-words"
                    }
                  >
                    {c.value}
                  </p>
                )}
              </div>
              <div className={compact ? "h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0" : "h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"}>
                <c.icon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
