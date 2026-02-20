import { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical, MessageSquareText, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  text: string;
  type: "text" | "mcq";
  options: string[];
}

interface SurveyBuilderProps {
  onGenerate: (surveyUrl: string) => void;
  previewUrl: string;
}

let nextId = 1;

const SurveyBuilder = ({ onGenerate, previewUrl }: SurveyBuilderProps) => {
  const [title, setTitle] = useState("My Survey");
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = (type: "text" | "mcq") => {
    setQuestions((prev) => [
      ...prev,
      {
        id: nextId++,
        text: "",
        type,
        options: type === "mcq" ? ["", ""] : [],
      },
    ]);
  };

  const updateQuestion = (id: number, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const removeQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateOption = (qId: number, oIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === oIdx ? value : o)) }
          : q
      )
    );
  };

  const addOption = (qId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId && q.options.length < 6
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    );
  };

  const removeOption = (qId: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId && q.options.length > 2
          ? { ...q, options: q.options.filter((_, i) => i !== oIdx) }
          : q
      )
    );
  };

  const canGenerate =
    title.trim() &&
    questions.length > 0 &&
    questions.every(
      (q) =>
        q.text.trim() &&
        (q.type === "text" || q.options.every((o) => o.trim()))
    );

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;

    const payload = questions.map((q) => ({
      id: q.id,
      text: q.text.trim(),
      type: q.type,
      ...(q.type === "mcq" ? { options: q.options.map((o) => o.trim()) } : {}),
    }));

    const encoded = btoa(JSON.stringify(payload));
    const titleEncoded = btoa(title.trim());
    const surveyUrl = `${previewUrl}/survey?t=${titleEncoded}&q=${encoded}`;
    onGenerate(surveyUrl);
  }, [canGenerate, questions, title, previewUrl, onGenerate]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Survey Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter survey title..."
          className="w-full h-12 px-4 rounded-xl bg-background border-0 text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-2 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-body font-semibold text-primary">Q{i + 1}</span>
                    <span className="text-xs font-body text-muted-foreground px-2 py-0.5 rounded-md bg-secondary">
                      {q.type === "text" ? "Text" : "Multiple Choice"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, e.target.value)}
                    placeholder="Enter your question..."
                    className="w-full px-3 py-2 rounded-lg bg-background border-0 text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* MCQ Options */}
              {q.type === "mcq" && (
                <div className="ml-7 space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(q.id, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-background border-0 text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                      {q.options.length > 2 && (
                        <button
                          onClick={() => removeOption(q.id, oi)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 6 && (
                    <button
                      onClick={() => addOption(q.id)}
                      className="text-xs font-body text-primary hover:text-primary/80 transition-colors ml-5"
                    >
                      + Add option
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Question Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => addQuestion("text")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all font-body text-sm"
        >
          <MessageSquareText className="w-4 h-4" />
          Text Question
        </button>
        <button
          onClick={() => addQuestion("mcq")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all font-body text-sm"
        >
          <ListChecks className="w-4 h-4" />
          Multiple Choice
        </button>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
      >
        <Plus className="w-4 h-4" />
        Generate Survey QR Code
      </button>
    </div>
  );
};

export default SurveyBuilder;
