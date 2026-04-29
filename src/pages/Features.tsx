import { Badge } from "@/components/ui/badge";
import { PublicSiteLayout } from "@/components/PublicSiteLayout";
import { Brain, FileSpreadsheet, History, ShieldCheck, Workflow, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Invoice Extraction",
    text: "Extract GST fields from invoices with structured JSON-ready outputs.",
  },
  {
    icon: Workflow,
    title: "Review Workflow",
    text: "Use detail dialogs and status flows to validate extracted data quickly.",
  },
  {
    icon: FileSpreadsheet,
    title: "Formatted Excel Export",
    text: "Download polished Excel reports for single records or complete batches.",
  },
  {
    icon: History,
    title: "Operational Logs",
    text: "Track extraction events with filters, pagination, and CSV export support.",
  },
  {
    icon: ShieldCheck,
    title: "Microsoft SSO",
    text: "Secure login with domain-aware access controls for trusted users.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    text: "Process multiple invoices with retry support and status visibility.",
  },
];

const Features = () => {
  return (
    <PublicSiteLayout>
      <section className="container max-w-7xl mx-auto py-10 md:py-14 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-white/25 text-slate-200 bg-white/5">
            Financial AI Features
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold">
            Built for <span className="brand-heading-gradient">Modern Finance Teams</span>
          </h1>
          <p className="text-slate-200 max-w-3xl mx-auto">
            The Accounts Payable Application combines automation, review controls, and secure collaboration to
            streamline your GST invoice operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((item) => (
            <article key={item.title} className="brand-glass-card rounded-2xl p-5 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="text-sm text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <article className="brand-glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-lg font-semibold">Processing capabilities</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>- Batch upload and extraction for invoice-heavy cycles.</li>
              <li>- Retry workflow support for failed records.</li>
              <li>- Record-level details dialog for correction and validation.</li>
              <li>- Card and table views for different review preferences.</li>
            </ul>
          </article>
          <article className="brand-glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-lg font-semibold">Control and governance</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>- Domain-aware Microsoft SSO access control.</li>
              <li>- Persistent backend logs with filtering and CSV export.</li>
              <li>- Preferences for compact view and auto-refresh behavior.</li>
              <li>- Structured export format for downstream finance usage.</li>
            </ul>
          </article>
        </div>

        <div className="brand-glass-card rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-3">Typical use case flow</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">Collect</p>
              <p className="text-slate-300 text-xs mt-1">Gather invoice PDFs/images from vendors.</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">Extract</p>
              <p className="text-slate-300 text-xs mt-1">Run AI extraction for GST field mapping.</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">Review</p>
              <p className="text-slate-300 text-xs mt-1">Validate and adjust values with trace context.</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">Publish</p>
              <p className="text-slate-300 text-xs mt-1">Export clean Excel reports for accounting use.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default Features;

