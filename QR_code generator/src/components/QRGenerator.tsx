import { useState, useCallback, useRef } from "react";
import QRCode from "qrcode";
import { Download, Eye, QrCode, ArrowRight, Zap, Shield, Globe, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SurveyBuilder from "./SurveyBuilder";

const PREVIEW_SIZE = 200;
const DOWNLOAD_SIZE = 1024;

type Mode = "url" | "survey";

const QRGenerator = () => {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeUrl, setActiveUrl] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const previewUrl = typeof window !== "undefined" ? window.location.origin : "";

  const generateQR = useCallback(async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setActiveUrl(targetUrl);
    try {
      const src = await QRCode.toDataURL(targetUrl.trim(), {
        width: PREVIEW_SIZE,
        margin: 2,
        color: { dark: "#1a1f2e", light: "#ffffff" },
      });
      setPreviewSrc(src);
      setGenerated(true);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } catch {
      setPreviewSrc(null);
    }
    setLoading(false);
  }, []);

  const generate = useCallback(() => generateQR(url), [url, generateQR]);

  const downloadHQ = useCallback(async () => {
    if (!activeUrl.trim()) return;
    const src = await QRCode.toDataURL(activeUrl.trim(), {
      width: DOWNLOAD_SIZE,
      margin: 2,
      color: { dark: "#1a1f2e", light: "#ffffff" },
    });
    const a = document.createElement("a");
    a.href = src;
    a.download = "qrcode.png";
    a.click();
  }, [activeUrl]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") generate();
  };

  const handleSurveyGenerate = (surveyUrl: string) => {
    generateQR(surveyUrl);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setPreviewSrc(null);
    setGenerated(false);
    setActiveUrl("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Organic background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blush/40 blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/3 -left-48 w-[400px] h-[400px] rounded-full bg-sage/30 blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-24 right-1/4 w-[350px] h-[350px] rounded-full bg-primary/10 blur-3xl animate-pulse-soft" style={{ animationDelay: "4s" }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <QrCode className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl text-foreground">QRcraft</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground font-body">
          <span className="hover:text-foreground transition-colors cursor-pointer">How it works</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">About</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 sm:px-10 pt-12 sm:pt-20 pb-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-muted-foreground text-xs font-body tracking-wide uppercase mb-8">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Instant · Free · No Sign-up
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-foreground mb-6">
            Turn any link into<br />
            a <span className="italic text-primary">scannable</span> code
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto font-body leading-relaxed mb-12">
            Paste your URL or create a survey — get a beautiful QR code in seconds.
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <div className="flex gap-1 p-1 bg-card rounded-xl border border-border w-fit mx-auto">
            <button
              onClick={() => switchMode("url")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
                mode === "url"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-4 h-4" />
              URL to QR
            </button>
            <button
              onClick={() => switchMode("survey")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
                mode === "survey"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Survey QR
            </button>
          </div>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {mode === "url" ? (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-card rounded-2xl border border-border p-3 shadow-lg shadow-foreground/[0.03]">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste your URL here..."
                        className="w-full h-14 pl-11 pr-4 rounded-xl bg-background border-0 text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <button
                      onClick={generate}
                      disabled={!url.trim() || loading}
                      className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm flex items-center gap-2.5 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 shrink-0"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          Generate
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="survey"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-card rounded-2xl border border-border p-6 shadow-lg shadow-foreground/[0.03]">
                  <SurveyBuilder onGenerate={handleSurveyGenerate} previewUrl={previewUrl} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Result Section */}
      <AnimatePresence>
        {generated && previewSrc && (
          <motion.section
            ref={resultRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 px-6 sm:px-10 pb-20 max-w-3xl mx-auto"
          >
            <div className="bg-card rounded-3xl border border-border p-8 sm:p-12 shadow-xl shadow-foreground/[0.04]">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl scale-110" />
                  <div className="relative p-5 bg-card rounded-2xl border border-border shadow-sm">
                    <img
                      src={previewSrc}
                      alt="QR Code preview"
                      width={PREVIEW_SIZE}
                      height={PREVIEW_SIZE}
                      className="rounded-lg"
                    />
                  </div>
                </motion.div>

                <div className="flex-1 text-center md:text-left space-y-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">
                      Your QR is ready
                    </h2>
                    <p className="text-muted-foreground text-sm font-body truncate max-w-xs">
                      {mode === "survey" ? "Survey QR Code" : activeUrl}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={downloadHQ}
                      className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-px active:translate-y-0 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download HD ({DOWNLOAD_SIZE}×{DOWNLOAD_SIZE}px)
                    </button>
                    <div className="flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground font-body">
                      <Eye className="w-4 h-4" />
                      Preview above · {PREVIEW_SIZE}px
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Features Strip */}
      <section className="relative z-10 px-6 sm:px-10 pb-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: Zap, title: "Instant generation", desc: "QR codes created in milliseconds, right in your browser." },
            { icon: Shield, title: "100% private", desc: "Nothing leaves your device. No data stored anywhere." },
            { icon: ClipboardList, title: "Survey mode", desc: "Create surveys, generate QR codes, and let anyone scan & answer." },
          ].map((f, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-card/60 border border-border hover:border-primary/20 hover:bg-card transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <f.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-body font-semibold text-foreground text-sm mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed font-body">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-display text-lg text-foreground">QRcraft</span>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            No accounts · No tracking · 100% client-side
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QRGenerator;
