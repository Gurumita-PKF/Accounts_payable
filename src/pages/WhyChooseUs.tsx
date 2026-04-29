import { Badge } from "@/components/ui/badge";
import { PublicSiteLayout } from "@/components/PublicSiteLayout";
import { Clock3, DollarSign, Shield, Sparkles } from "lucide-react";

const items = [
  {
    icon: Clock3,
    title: "Save Time",
    value: "80%",
    text: "Reduce repetitive manual data entry and review loops.",
  },
  {
    icon: DollarSign,
    title: "Lower Processing Cost",
    value: "60%",
    text: "Improve throughput with fewer manual interventions.",
  },
  {
    icon: Shield,
    title: "Audit-Ready Accuracy",
    value: "99.9%",
    text: "Maintain reliable extracted data quality standards.",
  },
  {
    icon: Sparkles,
    title: "Scalable Workflow",
    value: "24/7",
    text: "Support growing invoice volume with resilient processing and review controls.",
  },
];

const WhyChooseUs = () => {
  return (
    <PublicSiteLayout>
      <section className="container max-w-6xl mx-auto py-10 md:py-14 space-y-10">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <Badge variant="outline" className="border-white/25 text-slate-200 bg-white/5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Why Choose Accounts Payable
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            The Smart Choice for <span className="brand-heading-gradient">Modern Auditing</span>
          </h1>
          <p className="text-slate-200 text-sm md:text-base">
            Experience faster turnaround, stronger data confidence, and workflow consistency tailored for finance
            operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <article key={item.title} className="brand-glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-blue-300">{item.value}</p>
              </div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-sm text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <article className="brand-glass-card rounded-2xl p-5">
            <h3 className="text-lg font-semibold mb-2">Reliable Extraction</h3>
            <p className="text-sm text-slate-300">
              Advanced parsing helps extract invoice fields consistently across varying formats.
            </p>
          </article>
          <article className="brand-glass-card rounded-2xl p-5">
            <h3 className="text-lg font-semibold mb-2">Operational Visibility</h3>
            <p className="text-sm text-slate-300">
              Built-in logs and status tracking make it easier to monitor processing and resolve issues fast.
            </p>
          </article>
          <article className="brand-glass-card rounded-2xl p-5">
            <h3 className="text-lg font-semibold mb-2">Secure Team Access</h3>
            <p className="text-sm text-slate-300">
              Organization-based Microsoft SSO keeps access controlled while enabling collaboration.
            </p>
          </article>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <article className="brand-glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-lg font-semibold">Business impact</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>- Improve monthly AP throughput and reduce processing backlog.</li>
              <li>- Strengthen invoice data consistency across teams.</li>
              <li>- Minimize manual reconciliation effort before reporting.</li>
            </ul>
          </article>
          <article className="brand-glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-lg font-semibold">Operational strengths</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>- Domain-restricted SSO for controlled team access.</li>
              <li>- Persistent backend logs with filters and export support.</li>
              <li>- Flexible cards/table views for finance review workflows.</li>
            </ul>
          </article>
        </div>

        <div className="brand-glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold">Why finance teams prefer this platform</h3>
          <p className="text-sm text-slate-300">
            The platform is designed to balance speed, control, and operational visibility so AP teams can confidently
            process invoice volumes at scale.
          </p>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">Consistency</p>
              <p className="text-slate-300 text-xs mt-1">
                Standardized extraction and review flow reduces process variability.
              </p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">Transparency</p>
              <p className="text-slate-300 text-xs mt-1">
                Logs and status visibility make outcomes easier to monitor and explain.
              </p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">Scalability</p>
              <p className="text-slate-300 text-xs mt-1">
                Handles growing invoice volumes without proportionally increasing manual effort.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default WhyChooseUs;

