import { BrandLogo } from "@/components/BrandLogo";
import { Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export const BrandFooter = () => {
  const quickLinks = [
    { to: "/login", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/about", label: "About Us" },
    { to: "/why-choose-us", label: "Why Choose Us" },
    { to: "/contact", label: "Contact" },
    { to: "/blog", label: "Blog" },
  ];

  const resources = ["Blog", "Resource Center", "Case Studies"];
  const legal = ["Terms of Service", "Privacy Policy", "Security", "Compliance", "Cookie Policy"];

  return (
    <footer className="border-t border-white/15 bg-[#071638]">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />
      <div className="container max-w-7xl mx-auto py-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <section className="space-y-4">
          <BrandLogo size="sm" showText={false} />
          <p className="text-sm text-slate-300 max-w-xs">
            Transforming accounts payable workflows with cutting-edge AI technology.
          </p>
          <div className="space-y-2 text-sm text-slate-200">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-300" />
              PKF Sridhar & Santhanam LLP
            </p>
            <p className="pl-6 text-slate-300">Head Office, Mylapore, Chennai 600004</p>
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
            <button className="h-8 w-8 rounded-full bg-white/10 border border-white/20 inline-flex items-center justify-center">
              <Linkedin className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-full bg-white/10 border border-white/20 inline-flex items-center justify-center">
              <Facebook className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2.5 text-slate-300">
            {quickLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Resources</h3>
          <ul className="space-y-2.5 text-slate-300">
            {resources.map((item) => (
              <li key={item} className="hover:text-white transition-colors cursor-default">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Legal</h3>
          <ul className="space-y-2.5 text-slate-300">
            {legal.map((item) => (
              <li key={item} className="hover:text-white transition-colors cursor-default">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </footer>
  );
};

