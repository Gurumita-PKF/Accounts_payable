import { FileCheck2, Wallet, Receipt, IndianRupee } from "lucide-react";

interface Props {
  totalInvoices: number;
  totalTaxable: number;
  totalGst: number;
  totalValue: number;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export const StatsCards = ({ totalInvoices, totalTaxable, totalGst, totalValue }: Props) => {
  const cards = [
    { label: "Invoices Processed", value: totalInvoices.toString(), icon: FileCheck2 },
    { label: "Total Taxable Amount", value: `₹${formatINR(totalTaxable)}`, icon: Wallet },
    { label: "Total GST Collected", value: `₹${formatINR(totalGst)}`, icon: Receipt },
    { label: "Total Invoice Value", value: `₹${formatINR(totalValue)}`, icon: IndianRupee },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-card transition-smooth hover:shadow-elegant"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-bold mt-2 tracking-tight">{c.value}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <c.icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
