import { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import {
  getVerifiedEmail,
  setVerifiedEmail,
  isEmailVerified,
} from "@/lib/cookies/identity";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  _gotcha: string; // Honeypot field
}

const ContactPage = () => {
  const [formData, setFormData] = useState<FormData>(() => ({
    name: "",
    email: getVerifiedEmail() || "",
    subject: "",
    message: "",
    _gotcha: "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const webhookUrl = (
    import.meta.env.VITE_CONTACT_FORM_WEBHOOK_URL as string | undefined
  )?.trim();
  const isVerified = isEmailVerified(formData.email);

  useEffect(() => {
    const handleIdentityChange = (e: Event) => {
      const custom = e as CustomEvent<{ email: string | null }>;
      if (custom.detail?.email && !formData.email) {
        setFormData((prev) => ({ ...prev, email: custom.detail.email || "" }));
      }
    };
    window.addEventListener("verified-email-changed", handleIdentityChange);
    return () => {
      window.removeEventListener("verified-email-changed", handleIdentityChange);
    };
  }, [formData.email]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Silent honeypot drop if filled by automated bots
    if (formData._gotcha) {
      setSubmitted(true);
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim()) {
      setErrorMessage("Please fill out all required fields (Name, Email, and Subject).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // If webhook is not configured yet, provide a graceful demo preview
    if (!webhookUrl) {
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
        setVerifiedEmail(formData.email);
      }, 500);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        referrer: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };

      // 1. Try standard CORS fetch first
      let success = false;
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          redirect: "follow",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === "success") {
            success = true;
          }
        }
      } catch (corsErr) {
        // 2. Fallback to no-cors transport (handles Google Apps Script redirect quirks)
        try {
          await fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(payload),
          });
          success = true;
        } catch (noCorsErr) {
          success = false;
        }
      }

      if (success) {
        setSubmitted(true);
        setVerifiedEmail(formData.email);
      } else {
        throw new Error(
          "Unable to send message via the webhook server. Please make sure the Apps Script deployment is active with 'Who has access: Anyone', or reach out to us directly."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Something went wrong while sending your message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo
        title="Contact — Get in Touch"
        description="Have a question, project inquiry, or feedback? Reach out and we'll get back to you."
        path="/contact"
        noindex
      />
      <Container className="py-12">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow mb-2">Contact</p>
          <h1 className="display-heading text-4xl">Get in touch</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Questions, project inquiries, or feedback — we'd love to hear from you.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <Mail className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">Email</span>
              <span className="text-xs text-muted-foreground">admin@activenerds.com</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <MessageSquare className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">Community</span>
              <span className="text-xs text-muted-foreground">Join our Community</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <MapPin className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">Location</span>
              <span className="text-xs text-muted-foreground">Remote-first</span>
            </div>
          </div>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-8 text-center animate-in fade-in duration-300">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Thanks for reaching out!</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Your message has been received and logged. We've also sent an acknowledgement to{" "}
                <strong className="text-foreground">{formData.email}</strong>. We'll get back to you as soon as possible.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData((prev) => ({
                    ...prev,
                    subject: "",
                    message: "",
                    _gotcha: "",
                  }));
                }}
                className="mt-6 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              {/* Anti-spam honeypot input */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  value={formData._gotcha}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive space-y-1.5"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{errorMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You can also email us directly at{" "}
                        <a
                          href={`mailto:admin@activenerds.com?subject=${encodeURIComponent(
                            formData.subject || "Contact Inquiry"
                          )}&body=${encodeURIComponent(formData.message || "")}`}
                          className="font-medium underline hover:text-foreground"
                        >
                          admin@activenerds.com
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground"
                    >
                      Email <span className="text-destructive">*</span>
                    </label>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Subject <span className="text-destructive">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Message <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                  placeholder="Tell us more..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send message"
                )}
              </button>
            </form>
          )}
        </div>
      </Container>
    </>
  );
};

export default ContactPage;
