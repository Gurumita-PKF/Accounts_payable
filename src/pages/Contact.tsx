import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PublicSiteLayout } from "@/components/PublicSiteLayout";
import { Facebook, Linkedin, Mail, MapPin, Phone, Send } from "lucide-react";

const Contact = () => {
  return (
    <PublicSiteLayout>
      <section className="container max-w-6xl mx-auto py-10 md:py-14 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="outline" className="border-white/25 text-slate-200 bg-white/5">
            Contact
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold">
            Let’s Talk <span className="brand-heading-gradient">Invoice Automation</span>
          </h1>
          <p className="text-slate-200 max-w-3xl mx-auto">
            Reach out for onboarding, implementation details, and workflow setup support.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <section className="brand-glass-card rounded-2xl p-5 space-y-4">
            <h2 className="text-xl font-semibold">Send us a message</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">First Name</label>
                <Input placeholder="First name" className="bg-white/10 border-white/20 text-white placeholder:text-slate-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Last Name</label>
                <Input placeholder="Last name" className="bg-white/10 border-white/20 text-white placeholder:text-slate-300" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Email</label>
              <Input placeholder="Work email" className="bg-white/10 border-white/20 text-white placeholder:text-slate-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Company</label>
              <Input placeholder="Your company" className="bg-white/10 border-white/20 text-white placeholder:text-slate-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Message</label>
              <Textarea
                placeholder="Tell us about your AP automation needs..."
                className="min-h-28 bg-white/10 border-white/20 text-white placeholder:text-slate-300"
              />
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </section>

          <section className="space-y-4">
            <article className="brand-glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-blue-300">
                <Mail className="h-4 w-4" />
                <h3 className="text-lg font-semibold text-white">Email Us</h3>
              </div>
              <p className="text-sm text-slate-200">admin@pkfindia.in</p>
              <p className="text-xs text-slate-300">
                Get in touch with our team for support, sales inquiries, and partnerships.
              </p>
            </article>

            <article className="brand-glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-blue-300">
                <Phone className="h-4 w-4" />
                <h3 className="text-lg font-semibold text-white">Call Us</h3>
              </div>
              <p className="text-sm text-slate-200">(+91) 44 28112985</p>
              <p className="text-xs text-slate-300">Speak directly with our experts. Available Monday-Friday, 9AM-6PM IST.</p>
            </article>

            <article className="brand-glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-blue-300">
                <MapPin className="h-4 w-4" />
                <h3 className="text-lg font-semibold text-white">Visit Us</h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                PKF Sridhar & Santhanam LLP
                <br />
                Head Office
                <br />
                KRD GEE GEE Crystal
                <br />
                7th Floor, 91-92,
                <br />
                Dr. Radhakrishnan Salai,
                <br />
                Mylapore, Chennai 600 004.
              </p>
            </article>

            <article className="brand-glass-card rounded-2xl p-5 space-y-2">
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.facebook.com/PKFSridharSanthanam"
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-md bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://in.linkedin.com/company/pkf-sridhar-&-santhanam"
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-md bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </article>
          </section>
        </div>
      </section>
    </PublicSiteLayout>
  );
};

export default Contact;

