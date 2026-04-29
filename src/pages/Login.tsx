import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CircleCheckBig,
  ChevronRight,
  FileSpreadsheet,
  Info,
  LockKeyhole,
  Loader2,
  LogIn,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { PublicSiteLayout } from "@/components/PublicSiteLayout";

const Login = () => {
  const { loginWithMicrosoft, currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasFirebaseConfig = Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID &&
      import.meta.env.VITE_AZURE_TENANT_ID
  );
  const [backendOnline, setBackendOnline] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const checkBackendHealth = async () => {
    try {
      setCheckingHealth(true);
      const res = await fetch("/api/health");
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) return;

    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";
    navigate(from, { replace: true });
  }, [currentUser, loading, location.state, navigate]);

  return (
    <PublicSiteLayout backgroundVariant="light-rays">
      <section className="relative py-6 md:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(191,219,254,0.45),transparent_36%),radial-gradient(circle_at_88%_12%,rgba(199,210,254,0.38),transparent_35%),linear-gradient(180deg,rgba(247,250,255,0.98),rgba(240,246,255,0.96))]" />
        <div className="container relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-6 xl:gap-8 items-start">
          <div className="space-y-5">
            <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Financial AI Features
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-slate-900">
              AI-Powered GST{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Invoice Intelligence
              </span>
            </h1>
            <p className="text-slate-700 max-w-2xl text-sm md:text-base">
              Transform your invoice workflow with AI extraction, structured review, and export-ready reporting built
              for finance teams.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#d7e2f0] bg-gradient-to-br from-white to-[#f4f8ff] p-3 shadow-[0_8px_20px_rgba(37,99,235,0.08)] text-slate-800">
                <p className="text-xl font-semibold">80%</p>
                <p className="text-xs text-slate-600">Faster Processing</p>
              </div>
              <div className="rounded-xl border border-[#d7e2f0] bg-gradient-to-br from-white to-[#f4f8ff] p-3 shadow-[0_8px_20px_rgba(37,99,235,0.08)] text-slate-800">
                <p className="text-xl font-semibold">99.9%</p>
                <p className="text-xs text-slate-600">Accuracy Potential</p>
              </div>
              <div className="rounded-xl border border-[#d7e2f0] bg-gradient-to-br from-white to-[#f4f8ff] p-3 shadow-[0_8px_20px_rgba(37,99,235,0.08)] text-slate-800">
                <p className="text-xl font-semibold">24/7</p>
                <p className="text-xs text-slate-600">Secure Access</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#d7e2f0] bg-gradient-to-br from-white to-[#f4f8ff] p-3 shadow-[0_8px_20px_rgba(37,99,235,0.08)] text-slate-800">
                <p className="text-sm font-semibold">Automated Field Coverage</p>
                <p className="text-xs text-slate-600 mt-1">
                  Capture invoice number, GSTIN details, taxable value, and tax components automatically.
                </p>
              </div>
              <div className="rounded-xl border border-[#d7e2f0] bg-gradient-to-br from-white to-[#f4f8ff] p-3 shadow-[0_8px_20px_rgba(37,99,235,0.08)] text-slate-800">
                <p className="text-sm font-semibold">Traceable Operations</p>
                <p className="text-xs text-slate-600 mt-1">
                  Review extraction logs, monitor failures, and export logs for audit and troubleshooting.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#d7e2f0] bg-gradient-to-br from-white to-[#f4f8ff] p-3 shadow-[0_8px_20px_rgba(37,99,235,0.08)] text-slate-800">
                <p className="text-sm font-semibold">Role-ready access</p>
                <p className="text-xs text-slate-600 mt-1">Use organization SSO with approved domain policy.</p>
              </div>
              <div className="rounded-xl border border-[#d7e2f0] bg-gradient-to-br from-white to-[#f4f8ff] p-3 shadow-[0_8px_20px_rgba(37,99,235,0.08)] text-slate-800">
                <p className="text-sm font-semibold">Review confidence</p>
                <p className="text-xs text-slate-600 mt-1">Cross-check extraction outputs with detailed logs.</p>
              </div>
              <div className="rounded-xl border border-[#d7e2f0] bg-gradient-to-br from-white to-[#f4f8ff] p-3 shadow-[0_8px_20px_rgba(37,99,235,0.08)] text-slate-800">
                <p className="text-sm font-semibold">Export quality</p>
                <p className="text-xs text-slate-600 mt-1">Generate structured Excel outputs for AP operations.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-[#f8fafc] p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.10)] space-y-5 self-stretch text-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_8px_18px_rgba(79,70,229,0.28)]">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold leading-tight">Secure Sign-in</h2>
                <p className="text-sm text-slate-600">Access Accounts Payable with Microsoft SSO</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">One-click Excel export</p>
                  <p className="text-[13px] text-slate-600">Clean records with totals and download-ready reports.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">Secure workspace access</p>
                  <p className="text-[13px] text-slate-600">Sign in using your approved organization account.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <CircleCheckBig className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">Smart review controls</p>
                  <p className="text-[13px] text-slate-600">
                    Edit extracted records, compare values, and finalize data before export.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-24 flex items-start gap-2">
              <Info className="h-4.5 w-4.5 mt-0.5 shrink-0 text-slate-500" />
              <div className="text-[13px] leading-5 text-slate-700">
                <p>Use your Microsoft work/school account.</p>
                <p>If access is denied, contact your admin.</p>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 h-14 w-14 rounded-xl bg-gradient-to-br from-[#dbeafe] via-[#c7d2fe] to-[#e0e7ff] border border-blue-200/80 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div className="h-8 w-8 rounded-lg bg-white/60 flex items-center justify-center border border-white/70">
                  <LockKeyhole className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            {authError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2.5 text-xs text-destructive flex gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {!hasFirebaseConfig ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2.5 text-xs">
                Missing Firebase/Azure environment variables. Check `.env` and restart the frontend.
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={async () => {
                    try {
                      setSigningIn(true);
                      setAuthError("");
                      await loginWithMicrosoft();
                      toast.success("Signed in successfully");
                    } catch (error) {
                      const message = error instanceof Error ? error.message : "Microsoft sign-in failed";
                      setAuthError(message);
                      toast.error(message);
                    } finally {
                      setSigningIn(false);
                    }
                  }}
                  disabled={signingIn}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {signingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <span className="mr-3 grid h-5 w-5 grid-cols-2 gap-[2px] rounded-sm bg-white p-[2px]">
                        <span className="bg-[#f25022]" />
                        <span className="bg-[#7fba00]" />
                        <span className="bg-[#00a4ef]" />
                        <span className="bg-[#ffb900]" />
                      </span>
                      Login with Microsoft
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-10 rounded-xl border border-slate-300 bg-white flex items-center justify-center gap-2 text-slate-700 text-sm font-medium">
                    <Shield className="h-4 w-4 text-blue-500" />
                    SSO
                  </div>
                  <div className="h-10 rounded-xl border border-slate-300 bg-white flex items-center justify-center gap-2 text-slate-700 text-sm font-medium">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${checkingHealth ? "bg-slate-400" : backendOnline ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    {checkingHealth ? "Checking" : backendOnline ? "Online" : "Offline"}
                  </div>
                  <div className="h-10 rounded-xl border border-slate-300 bg-white flex items-center justify-center gap-2 text-slate-700 text-sm font-medium">
                    <LockKeyhole className="h-4 w-4 text-violet-500" />
                    Protected
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-[#f6f8fc] p-3">
                  <div className="flex items-center justify-between gap-3 text-[13px] text-slate-600">
                    <span>{signingIn ? "Signing in..." : "Need access? Contact admin."}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={checkBackendHealth}
                      className="h-7 px-2 text-violet-700 hover:bg-violet-50 font-medium shrink-0"
                    >
                      Recheck backend
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default Login;
