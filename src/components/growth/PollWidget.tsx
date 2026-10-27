import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react";
import {
  getVerifiedEmail,
  setVerifiedEmail,
  isEmailVerified,
} from "@/lib/cookies/identity";

export interface PollResults {
  totalVotes: number;
  breakdown: Record<string, number>;
  percentages: Record<string, number>;
}

export interface PollWidgetProps {
  pollId: string;
  defaultQuestion?: string;
  defaultOptions?: string[] | string;
  className?: string;
}

/**
 * Robust delimiter parser supporting '|', ';', JSON array, or ','
 * Precedence: Pipe '|' > Semicolon ';' > JSON > Comma ','
 * This allows options to safely contain commas (e.g. "React, Next.js | Vue, Nuxt").
 */
function parsePollOptions(
  raw: string[] | string | undefined | null
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  const str = String(raw).trim();

  // 1. JSON Array format: ["React, Next.js", "Vue, Nuxt"]
  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {}
  }

  // 2. Pipe delimiter '|' (recommended when options contain commas or semicolons)
  if (str.includes("|")) {
    return str.split("|").map((s) => s.trim()).filter(Boolean);
  }

  // 3. Semicolon delimiter ';'
  if (str.includes(";")) {
    return str.split(";").map((s) => s.trim()).filter(Boolean);
  }

  // 4. Comma delimiter ',' (fallback)
  if (str.includes(",")) {
    return str.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return [str];
}

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function resolveDayOfWeekId(id?: string): string {
  if (!id || id === "daily" || id === "today") {
    return DAYS_OF_WEEK[new Date().getDay()];
  }
  return id.toLowerCase().trim();
}

type WidgetStep = "voting" | "otp_verification" | "results";

export const PollWidget: React.FC<PollWidgetProps> = ({
  pollId = "daily",
  defaultQuestion = "Which frontend framework do you prioritize in production?",
  defaultOptions = ["React", "Vue.js", "Svelte", "Angular", "SolidJS / Other"],
  className = "",
}) => {
  const webhookUrl =
    (import.meta.env.VITE_POLL_WEBHOOK_URL as string | undefined)?.trim() || "";

  const isDailySchedule = !pollId || pollId === "daily" || pollId === "today";
  const initialResolvedId = resolveDayOfWeekId(pollId);

  // The resolved active pollId (can start as today's day name and gets updated once fetched)
  const [activePollId, setActivePollId] = useState<string>(initialResolvedId);

  // Poll configuration state
  const [question, setQuestion] = useState(defaultQuestion);
  const [options, setOptions] = useState<string[]>(() =>
    parsePollOptions(defaultOptions)
  );

  // User input states
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [email, setEmail] = useState<string>(() => getVerifiedEmail() || "");
  const [otp, setOtp] = useState<string>("");
  const [honeypot, setHoneypot] = useState<string>("");

  // Keep in sync with cross-component identity changes (e.g. newsletter signups)
  useEffect(() => {
    const handleIdentityChange = (e: Event) => {
      const custom = e as CustomEvent<{ email: string | null }>;
      if (custom.detail?.email && !email) {
        setEmail(custom.detail.email);
      }
    };
    window.addEventListener("verified-email-changed", handleIdentityChange);
    return () => {
      window.removeEventListener("verified-email-changed", handleIdentityChange);
    };
  }, [email]);

  // Flow & UI states
  const [step, setStep] = useState<WidgetStep>("voting");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userVote, setUserVote] = useState<string>("");
  const [results, setResults] = useState<PollResults | null>(null);
  const [demoCode, setDemoCode] = useState<string>("");

  // Check localStorage on mount or when activePollId changes
  useEffect(() => {
    const targetId = activePollId && activePollId !== "latest" ? activePollId : pollId;
    const savedVote = localStorage.getItem(`poll_${targetId}_vote`);
    const savedEmail = localStorage.getItem(`poll_${targetId}_email`);

    if (savedVote && savedEmail) {
      setUserVote(savedVote);
      setEmail(savedEmail);

      if (webhookUrl && targetId !== "latest" && targetId !== "daily") {
        fetch(
          `${webhookUrl}?action=get_results&pollId=${encodeURIComponent(
            targetId
          )}&email=${encodeURIComponent(savedEmail)}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success" && data.results) {
              setResults(data.results);
              setStep("results");
            }
          })
          .catch(() => {
            // Fallback: build simulated results from localStorage
            setResults(buildSimulatedResults(options, savedVote));
            setStep("results");
          });
      } else {
        setResults(buildSimulatedResults(options, savedVote));
        setStep("results");
      }
    }
  }, [activePollId, pollId, webhookUrl, options]);

  // Fetch dynamic question/options from Google Sheet (supports "daily", day name, or custom pollId)
  useEffect(() => {
    if (!webhookUrl) return;

    const requestPollId = isDailySchedule ? resolveDayOfWeekId("daily") : pollId;

    fetch(`${webhookUrl}?action=get_poll&pollId=${encodeURIComponent(requestPollId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.poll) {
          const resolvedId = data.poll.id || requestPollId;
          setActivePollId(resolvedId);
          if (data.poll.question) setQuestion(data.poll.question);
          if (data.poll.options) {
            const parsed = parsePollOptions(data.poll.options);
            if (parsed.length > 0) {
              setOptions(parsed);
            }
          }

          // Check if user already voted in this resolved poll
          const savedVote = localStorage.getItem(`poll_${resolvedId}_vote`);
          const savedEmail = localStorage.getItem(`poll_${resolvedId}_email`);
          if (savedVote && savedEmail) {
            setUserVote(savedVote);
            setEmail(savedEmail);
            fetch(
              `${webhookUrl}?action=get_results&pollId=${encodeURIComponent(
                resolvedId
              )}&email=${encodeURIComponent(savedEmail)}`
            )
              .then((r) => r.json())
              .then((resData) => {
                if (resData.status === "success" && resData.results) {
                  setResults(resData.results);
                  setStep("results");
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.debug("Using local default poll options:", err);
      });
  }, [pollId, isDailySchedule, webhookUrl]);

  // Helper to construct simulated results for demo / unconfigured mode
  function buildSimulatedResults(
    opts: string[],
    selected: string
  ): PollResults {
    const breakdown: Record<string, number> = {};
    let total = 0;
    const baseWeights: Record<string, number> = {
      React: 68,
      "Vue.js": 24,
      Svelte: 18,
      Angular: 14,
      "SolidJS / Other": 9,
    };

    opts.forEach((opt) => {
      const base = baseWeights[opt] || 15;
      const val = opt === selected ? base + 1 : base;
      breakdown[opt] = val;
      total += val;
    });

    const percentages: Record<string, number> = {};
    opts.forEach((opt) => {
      percentages[opt] =
        total > 0 ? Math.round((breakdown[opt] / total) * 1000) / 10 : 0;
    });

    return { totalVotes: total, breakdown, percentages };
  }

  // Step 1: Submit Vote & Request OTP (or reveal if already voted)
  const handleSubmitVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent honeypot drop
    if (!selectedOption) {
      setErrorMessage("Please select an option before continuing.");
      return;
    }
    if (!email) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    const isPreVerified = isEmailVerified(email);

    // If webhook is NOT configured, provide a seamless simulated demo experience
    if (!webhookUrl) {
      if (isPreVerified) {
        setTimeout(() => {
          setIsLoading(false);
          const sim = buildSimulatedResults(options, selectedOption);
          setUserVote(selectedOption);
          setResults(sim);
          setStep("results");
          setStatusMessage("Thank you! Your vote has been recorded.");
          localStorage.setItem(`poll_${activePollId}_vote`, selectedOption);
          localStorage.setItem(`poll_${activePollId}_email`, email);
          setVerifiedEmail(email);
        }, 400);
        return;
      }

      setTimeout(() => {
        setIsLoading(false);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setDemoCode(code);
        setStep("otp_verification");
        setStatusMessage(
          `Demo mode: Enter verification code ${code} below to complete ballot.`
        );
      }, 600);
      return;
    }

    try {
      const payload = {
        action: "submit_vote",
        pollId: activePollId,
        email: email.trim().toLowerCase(),
        option: selectedOption,
        isPreVerified,
        referrer: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "already_voted" || data.status === "success") {
        setUserVote(data.userVote || selectedOption);
        setResults(data.results);
        setStep("results");
        setStatusMessage(
          data.message || "Thank you! Your vote has been recorded."
        );
        localStorage.setItem(`poll_${activePollId}_vote`, data.userVote || selectedOption);
        localStorage.setItem(`poll_${activePollId}_email`, email);
        setVerifiedEmail(email);
      } else if (data.status === "otp_sent") {
        setStep("otp_verification");
        setStatusMessage(
          data.message ||
            `A 6-digit verification code has been sent to ${email}.`
        );
      } else {
        throw new Error(data.message || "Failed to submit ballot.");
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "An error occurred while connecting to the poll service."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    // Simulated demo mode verification
    if (!webhookUrl) {
      setTimeout(() => {
        setIsLoading(false);
        if (otp.trim() === demoCode || otp.trim() === "123456") {
          const sim = buildSimulatedResults(options, selectedOption);
          setUserVote(selectedOption);
          setResults(sim);
          setStep("results");
          localStorage.setItem(`poll_${pollId}_vote`, selectedOption);
          localStorage.setItem(`poll_${pollId}_email`, email);
          setVerifiedEmail(email);
        } else {
          setErrorMessage(
            `Invalid code. For this demo, please use code: ${demoCode || "123456"}`
          );
        }
      }, 500);
      return;
    }

    try {
      const payload = {
        action: "verify_otp",
        pollId: activePollId,
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        setUserVote(data.userVote || selectedOption);
        setResults(data.results);
        setStep("results");
        setStatusMessage(
          data.message || "Thank you! Your vote has been verified."
        );
        localStorage.setItem(
          `poll_${activePollId}_vote`,
          data.userVote || selectedOption
        );
        localStorage.setItem(`poll_${activePollId}_email`, email);
        setVerifiedEmail(email);
      } else {
        throw new Error(data.message || "Invalid verification code.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMessage("");

    if (!webhookUrl) {
      setTimeout(() => {
        setIsLoading(false);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setDemoCode(code);
        setStatusMessage(`New demo verification code: ${code}`);
      }, 400);
      return;
    }

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "resend_otp", pollId: activePollId, email }),
      });
      const data = await res.json();
      setStatusMessage(data.message || "A new code has been sent.");
    } catch {
      setErrorMessage("Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-all ${className}`}
      id={`poll-${pollId}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <BarChart3 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {isDailySchedule
              ? `Poll of the Day • ${activePollId.toUpperCase()}`
              : "Active Community Poll"}
          </span>
        </div>
        {!webhookUrl && (
          <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Info className="h-3 w-3" /> Preview
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-foreground leading-snug">
        {question}
      </h3>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && step !== "results" && (
        <div
          role="status"
          className="mt-4 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-accent"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* STEP 1: VOTING FORM */}
      {step === "voting" && (
        <form onSubmit={handleSubmitVote} className="mt-5 space-y-4">
          {/* Honeypot field for bot protection */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="sr-only">Poll Options</legend>
            {options.map((opt) => {
              const isChecked = selectedOption === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-center justify-between rounded-lg border p-3 text-sm cursor-pointer transition-all ${
                    isChecked
                      ? "border-accent bg-accent/5 font-medium text-foreground ring-1 ring-accent"
                      : "border-border bg-background text-foreground hover:border-accent/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`poll_option_${pollId}`}
                      value={opt}
                      checked={isChecked}
                      onChange={() => setSelectedOption(opt)}
                      className="h-4 w-4 text-accent border-input focus:ring-accent"
                    />
                    <span>{opt}</span>
                  </div>
                </label>
              );
            })}
          </fieldset>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={`poll-email-${pollId}`}
                className="block text-xs font-medium text-muted-foreground"
              >
                Voter email <span className="text-destructive">*</span>
              </label>
              {isEmailVerified(email) && (
                <span className="inline-flex items-center gap-1 rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  <ShieldCheck className="h-3 w-3" /> Verified • Instant Vote
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id={`poll-email-${pollId}`}
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !selectedOption}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    {isEmailVerified(email) ? "Instant Vote" : "Submit Vote"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {isEmailVerified(email)
                ? "Your email is verified. Your vote is recorded directly with zero friction."
                : "One vote per email. Results are revealed once your submission is verified."}
            </p>
          </div>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === "otp_verification" && (
        <form
          onSubmit={handleVerifyOtp}
          className="mt-5 space-y-4 animate-in fade-in"
        >
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 text-center">
            <KeyRound className="mx-auto h-8 w-8 text-accent mb-2" />
            <h4 className="text-sm font-semibold text-foreground">
              Verify Your Ballot
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              We sent a 6-digit confirmation code to <strong>{email}</strong>.
            </p>
          </div>

          <div>
            <label
              htmlFor={`poll-otp-${pollId}`}
              className="block text-xs font-medium text-muted-foreground mb-1.5 text-center"
            >
              6-Digit Verification Code
            </label>
            <input
              id={`poll-otp-${pollId}`}
              type="text"
              maxLength={6}
              required
              autoFocus
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              disabled={isLoading}
              className="w-full text-center tracking-[8px] font-mono font-bold text-lg rounded-lg border border-input bg-background py-2.5 text-foreground focus-visible:outline-2 focus-visible:outline-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Confirm & Reveal Results"
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <button
              type="button"
              onClick={() => setStep("voting")}
              className="hover:text-foreground underline"
            >
              Change choice or email
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-accent hover:underline disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" /> Resend code
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: LIVE RESULTS DISPLAY */}
      {step === "results" && results && (
        <div className="mt-5 space-y-4 animate-in fade-in">
          {statusMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-accent">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            {options.map((opt) => {
              const count = results.breakdown[opt] || 0;
              const percentage = results.percentages[opt] || 0;
              const isSelected = userVote === opt;

              return (
                <div key={opt} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-medium ${
                        isSelected
                          ? "text-accent font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {opt} {isSelected && "★ (Your Vote)"}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {percentage}% ({count})
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full ${
                        isSelected ? "bg-accent" : "bg-primary/50"
                      }`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
            <span>Total ballots: {results.totalVotes}</span>
            <span className="flex items-center gap-1 text-accent font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ballot Verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollWidget;
