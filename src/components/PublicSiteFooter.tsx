import { BrandLogo } from "@/components/BrandLogo";
import { Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { to: "/login", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/about", label: "About Us" },
  { to: "/why-choose-us", label: "Why Choose Us" },
  { to: "/contact", label: "Contact" },
];

const resources = ["Product Updates", "Implementation Guide", "Case Studies"];
const legal = ["Terms of Service", "Privacy Policy", "Security", "Compliance", "Cookie Policy"];

export const PublicSiteFooter = () => {
  return (
    <footer className="relative z-10 border-t border-transparent bg-slate-950/70 backdrop-blur-md mt-6">
      <div className="relative w-full h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      <div className="container max-w-7xl mx-auto py-9 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <section className="space-y-4">
          <BrandLogo size="sm" />
          <p className="text-sm text-slate-300 max-w-xs">
            Streamlining accounts payable and GST invoice processing with secure AI-powered workflows.
          </p>
          <div className="text-sm text-slate-300 space-y-2">
            <p className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-blue-300 shrink-0" />
              <span>PKF Sridhar & Santhanam LLP, Head Office, Chennai</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-300" />
              admin@pkfindia.in
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-300" />
              (+91) 44 28112985
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://in.linkedin.com/company/pkf-sridhar-&-santhanam"
              target="_blank"
              rel="noreferrer"
              className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/PKFSridharSanthanam"
              target="_blank"
              rel="noreferrer"
              className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            {resources.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            {legal.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </footer>
  );
};

