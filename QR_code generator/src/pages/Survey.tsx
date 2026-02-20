import { useState, useMemo } from "react";
import { QrCode, CheckCircle2, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

interface Question {
  id: number;
  text: string;
  type: "text" | "mcq";
  options?: string[];
}

const SurveyPage = () => {
  const [searchParams] = useSearchParams();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions: Question[] = useMemo(() => {
    try {
      const encoded = searchParams.get("q");
      if (!encoded) return [];
      const decoded = atob(encoded);
      return JSON.parse(decoded);
    } catch {
      return [];
    }
  }, [searchParams]);

  const title = useMemo(() => {
    try {
      const t = searchParams.get("t");
      return t ? atob(t) : "Survey";
    } catch {
      return "Survey";
    }
  }, [searchParams]);

  const handleAnswer = (qId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]?.trim());

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl text-foreground mb-2">Invalid Survey</h1>
          <p className="text-muted-foreground font-body text-sm">
            This survey link appears to be broken or expired.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl text-foreground mb-3">Thank you!</h1>
          <p className="text-muted-foreground font-body text-base leading-relaxed">
            Your response has been recorded. Since this survey runs entirely in your browser, your answers are not stored anywhere.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blush/40 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 -left-48 w-[400px] h-[400px] rounded-full bg-sage/30 blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-foreground">QRcraft</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground font-body text-sm">
            {questions.length} question{questions.length !== 1 ? "s" : ""} · Your answers stay private
          </p>
        </motion.div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <label className="block font-body font-semibold text-foreground text-sm mb-4">
                <span className="text-primary mr-2">{i + 1}.</span>
                {q.text}
              </label>

              {q.type === "text" ? (
                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  placeholder="Type your answer..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-background border-0 text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                />
              ) : (
                <div className="space-y-2">
                  {q.options?.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all font-body text-sm ${
                        answers[q.id] === opt
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          answers[q.id] === opt ? "border-primary" : "border-muted-foreground/40"
                        }`}
                      >
                        {answers[q.id] === opt && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswer(q.id, opt)}
                        className="sr-only"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <button
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            <Send className="w-4 h-4" />
            Submit Response
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SurveyPage;
