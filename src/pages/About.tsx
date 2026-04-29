import { Badge } from "@/components/ui/badge";
import { PublicSiteLayout } from "@/components/PublicSiteLayout";

const About = () => {
  return (
    <PublicSiteLayout>
      <section className="container max-w-5xl mx-auto py-10 md:py-14 space-y-8">
        <Badge variant="outline" className="border-white/25 text-slate-200 bg-white/5">
          About Our Solution
        </Badge>
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Revolutionizing <span className="brand-heading-gradient">Invoice Quality Review</span>
          </h1>
          <p className="text-slate-200 text-sm md:text-lg leading-relaxed">
            The Accounts Payable Application helps teams review invoice data with speed and confidence. The platform
            extracts GST fields, highlights operational trace logs, and supports configurable exports so teams can move
            from document processing to decision making faster.
          </p>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Designed for audit and finance workflows, the solution improves consistency, supports compliance-focused
            review, and reduces manual effort across high-volume invoices.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="brand-glass-card rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold">80%</p>
            <p className="text-sm text-slate-300 mt-1">Faster review cycles</p>
          </div>
          <div className="brand-glass-card rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold">99.9%</p>
            <p className="text-sm text-slate-300 mt-1">Structured extraction potential</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <article className="brand-glass-card rounded-2xl p-5 space-y-2">
            <h3 className="text-lg font-semibold">Vision</h3>
            <p className="text-sm text-slate-300">
              Build a dependable accounts payable platform that improves speed without sacrificing control.
            </p>
          </article>
          <article className="brand-glass-card rounded-2xl p-5 space-y-2">
            <h3 className="text-lg font-semibold">Approach</h3>
            <p className="text-sm text-slate-300">
              Combine AI extraction, operational logging, and human review to maintain quality outcomes.
            </p>
          </article>
          <article className="brand-glass-card rounded-2xl p-5 space-y-2">
            <h3 className="text-lg font-semibold">Outcome</h3>
            <p className="text-sm text-slate-300">
              Faster invoice throughput, cleaner exports, and better compliance visibility for finance teams.
            </p>
          </article>
        </div>

        <div className="brand-glass-card rounded-2xl p-6 space-y-3">
          <h3 className="text-xl font-semibold">How the platform works</h3>
          <div className="grid md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">1. Upload</p>
              <p className="text-slate-300 text-xs mt-1">Add PDF/image invoices in batch.</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">2. Extract</p>
              <p className="text-slate-300 text-xs mt-1">AI maps GST fields to structured values.</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">3. Review</p>
              <p className="text-slate-300 text-xs mt-1">Validate records with detailed trace logs.</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold">4. Export</p>
              <p className="text-slate-300 text-xs mt-1">Download formatted Excel output.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <article className="brand-glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-lg font-semibold">Who this is built for</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>- Accounts payable teams processing high invoice volume.</li>
              <li>- Finance controllers validating GST/tax field correctness.</li>
              <li>- Operations leads tracking extraction quality and exceptions.</li>
            </ul>
          </article>
          <article className="brand-glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-lg font-semibold">What teams gain</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>- Faster cycle time from invoice intake to final export.</li>
              <li>- Better data consistency across records and reports.</li>
              <li>- Stronger operational traceability for audits and review.</li>
            </ul>
          </article>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default About;

