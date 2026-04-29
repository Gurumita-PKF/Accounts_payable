import { cn } from "@/lib/utils";

interface BrandBackgroundProps {
  className?: string;
  variant?: "dots" | "bubble-grid" | "soft-mesh" | "app-surface";
}

const dotPattern = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(255,255,255,0.14)" />
  </svg>`
);

export const BrandBackground = ({ className, variant = "dots" }: BrandBackgroundProps) => {
  const layerStyle =
    variant === "bubble-grid"
      ? {
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.18) 0, rgba(148,163,184,0.18) 44px, transparent 45px)",
          backgroundSize: "96px 96px",
          backgroundPosition: "0 0",
          opacity: 0.24,
        }
      : variant === "soft-mesh"
        ? {
            backgroundImage:
              "linear-gradient(120deg, rgba(15,23,42,0.22), transparent 45%),linear-gradient(240deg, rgba(30,64,175,0.18), transparent 48%),radial-gradient(circle at 15% 22%, rgba(56,189,248,0.18), transparent 34%),radial-gradient(circle at 82% 18%, rgba(99,102,241,0.16), transparent 36%),radial-gradient(circle at 70% 78%, rgba(168,85,247,0.14), transparent 34%)",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            opacity: 0.52,
          }
        : variant === "app-surface"
          ? {
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(246,250,255,0.95)),radial-gradient(circle at 14% 6%, rgba(34,211,238,0.16), transparent 42%),radial-gradient(circle at 86% 10%, rgba(99,102,241,0.14), transparent 40%),radial-gradient(circle at 22% 26%, rgba(56,189,248,0.1) 0 18px, transparent 19px),radial-gradient(circle at 76% 32%, rgba(99,102,241,0.1) 0 16px, transparent 17px),radial-gradient(circle at 50% 70%, rgba(34,211,238,0.09) 0 12px, transparent 13px),linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px),linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px),radial-gradient(circle, rgba(148,163,184,0.14) 1px, transparent 1px)",
              backgroundSize: "cover, cover, cover, 220px 220px, 240px 240px, 260px 260px, 30px 30px, 30px 30px, 18px 18px",
              backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat, repeat, repeat",
              opacity: 0.72,
            }
        : {
            backgroundImage: `url("data:image/svg+xml,${dotPattern}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "36px 36px",
            opacity: 0.28,
          };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        "bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(168,85,247,0.2),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.14),transparent_30%)]",
        className
      )}
      style={layerStyle}
    />
  );
};

