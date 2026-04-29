import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";
import { BrandBackground } from "@/components/BrandBackground";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicSiteFooter } from "@/components/PublicSiteFooter";
import { BottomFooterBar } from "@/components/BottomFooterBar";
import LightRays from "@/components/LightRays";

interface PublicSiteLayoutProps {
  children: ReactNode;
  backgroundVariant?: "dots" | "bubble-grid" | "soft-mesh" | "light-rays";
}

const links = [
  { to: "/login", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/about", label: "About" },
  { to: "/why-choose-us", label: "Why Choose Us" },
  { to: "/contact", label: "Contact" },
];

export const PublicSiteLayout = ({ children, backgroundVariant = "dots" }: PublicSiteLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden text-white flex flex-col">
      <BrandBackground variant={backgroundVariant === "light-rays" ? "soft-mesh" : backgroundVariant} />
      {backgroundVariant === "light-rays" ? (
        <div
          className="absolute inset-0 z-[1] opacity-70 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_68%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_68%,rgba(0,0,0,0)_100%]"
        >
          <LightRays
            raysOrigin="top-center"
            raysColor="#7dd3fc"
            raysSpeed={1.15}
            lightSpread={0.75}
            rayLength={1.35}
            followMouse={true}
            mouseInfluence={0.08}
            noiseAmount={0.04}
            distortion={0.03}
            fadeDistance={1.2}
            className="w-full h-full"
          />
        </div>
      ) : null}
      <header className="relative z-20 border-b border-white/15 bg-slate-900/60 backdrop-blur-lg">
        <div className="container max-w-7xl mx-auto min-h-20 py-2.5 flex items-center justify-between gap-4">
          <BrandLogo size="lg" className="shrink-0" />
          <nav className="hidden md:flex items-center gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-md text-sm font-semibold transition-colors",
                    isActive ? "bg-white/15 text-white" : "text-slate-200 hover:bg-white/10"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Button
            asChild
            size="default"
            className="h-10 px-5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <NavLink to="/login">Get Started</NavLink>
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1">{children}</main>
      <PublicSiteFooter />
      <BottomFooterBar variant="public" />
    </div>
  );
};

