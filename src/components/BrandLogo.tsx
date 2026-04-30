import { cn } from "@/lib/utils";

interface BrandLogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { img: "h-10 w-36 sm:h-12 sm:w-48", text: "text-xs" },
  md: { img: "h-11 w-44 sm:h-14 sm:w-64", text: "text-sm" },
  lg: { img: "h-12 w-52 sm:h-16 sm:w-72 md:h-[72px] md:w-80", text: "text-base" },
};

export const BrandLogo = ({ showText = false, size = "md", className }: BrandLogoProps) => {
  const dimensions = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2 min-w-0", className)}>
      <img
        src="/logomain.jpeg"
        alt="PKF Logo"
        className={cn(
          dimensions.img,
          "rounded-md object-contain bg-white p-1 shrink-0 ring-1 ring-white/20 shadow-[0_6px_18px_rgba(2,6,23,0.35)]"
        )}
      />
      {showText ? (
        <span className={cn(dimensions.text, "font-semibold tracking-tight text-white/95 truncate")}>
          Accounts Payable Application
        </span>
      ) : null}
    </div>
  );
};

