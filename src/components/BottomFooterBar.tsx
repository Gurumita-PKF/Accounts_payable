import { Link } from "react-router-dom";

interface BottomFooterBarProps {
  variant?: "public" | "internal";
}

export const BottomFooterBar = ({ variant = "internal" }: BottomFooterBarProps) => {
  const wrapperClass =
    variant === "public"
      ? "border-t border-white/10 bg-[#061438]"
      : "border-t border-white/15 bg-slate-900/60 backdrop-blur-lg";

  return (
    <div className={wrapperClass}>
      <div className="container max-w-7xl mx-auto py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-300">
        <p>© 2026 Accounts Payable Application. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link to="/about" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link to="/about" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link to="/about" className="hover:text-white transition-colors">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
};
