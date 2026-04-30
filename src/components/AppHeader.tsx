import { ReactNode } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Moon, ScrollText, Settings2, Sun, UserCircle2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export const AppHeader = ({ title, subtitle, actions }: Props) => {
  const { theme, toggle } = useTheme();
  const { currentUser, logout } = useAuth();

  return (
    <header className="border-b border-[#173765] bg-[#0e2a55] sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <BrandLogo size="sm" className="rounded-md" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight truncate text-white">{title}</h1>
              <div className="flex items-center gap-2 min-w-0 mt-0.5">
                <p className="text-xs text-blue-100/75 truncate">{subtitle}</p>
                {actions}
              </div>
            </div>
          </div>

          <div className="flex w-full lg:w-auto items-center justify-between gap-2 lg:gap-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-thin min-w-0">
              <NavLink
                to="/"
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium border whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-[#2f88db] text-white border-[#2f88db]"
                      : "bg-white/95 border-slate-300 text-slate-700 hover:bg-white"
                  )
                }
              >
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                Dashboard
              </NavLink>
              <NavLink
                to="/logs"
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium border whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-[#2f88db] text-white border-[#2f88db]"
                      : "bg-white/95 border-slate-300 text-slate-700 hover:bg-white"
                  )
                }
              >
                <ScrollText className="h-4 w-4 mr-1.5" />
                Logs
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium border whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-[#2f88db] text-white border-[#2f88db]"
                      : "bg-white/95 border-slate-300 text-slate-700 hover:bg-white"
                  )
                }
              >
                <Settings2 className="h-4 w-4 mr-1.5" />
                Settings
              </NavLink>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 px-2.5 border-blue-300/35 bg-[#133663] text-blue-100 hover:bg-[#1a477c] hover:text-white shrink-0"
                  aria-label="Open profile menu"
                >
                  <UserCircle2 className="h-5 w-5 mr-1" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Signed in as</DropdownMenuLabel>
                <DropdownMenuLabel className="pt-0 font-medium truncate">
                  {currentUser?.email || "No user"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => toggle()}>
                  {theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </DropdownMenuItem>
                {currentUser && (
                  <DropdownMenuItem onSelect={() => void logout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
