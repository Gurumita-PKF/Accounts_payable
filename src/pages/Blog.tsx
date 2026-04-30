import { ArrowLeft, Building2, Brain, DollarSign, FolderGit2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicSiteLayout } from "@/components/PublicSiteLayout";

const posts = [
  {
    title: "The Future of AI in Accounts Payable",
    date: "May 15, 2026",
    excerpt: "Explore how AI helps finance teams automate extraction and reduce processing cycles.",
    icon: Brain,
    tint: "from-indigo-500/30 to-indigo-900/30",
  },
  {
    title: "5 Ways Automation Reduces AP Costs",
    date: "May 8, 2026",
    excerpt: "Discover practical ways to reduce overhead through streamlined AP workflows.",
    icon: DollarSign,
    tint: "from-emerald-500/30 to-emerald-900/30",
  },
  {
    title: "Case Study: Faster Invoice Review Cycles",
    date: "April 30, 2026",
    excerpt: "See how teams improved data quality and speed with structured extraction.",
    icon: FolderGit2,
    tint: "from-fuchsia-500/30 to-fuchsia-900/30",
  },
];

const Blog = () => {
  return (
    <PublicSiteLayout>
      <section className="container max-w-7xl mx-auto py-10 md:py-14 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Accounts Payable Application</span>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-200 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold">Accounts Payable Blog</h1>
          <p className="text-slate-200 text-base md:text-xl">
            Stay up to date with product updates, workflow insights, and automation best practices.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {posts.map((post) => (
            <article key={post.title} className="rounded-2xl overflow-hidden border border-white/15 bg-[#121d42]">
              <div className={`h-44 bg-gradient-to-br ${post.tint} flex items-center justify-center`}>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <post.icon className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm text-blue-300">{post.date}</p>
                <h2 className="text-2xl font-semibold leading-tight">{post.title}</h2>
                <p className="text-slate-300">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default Blog;

