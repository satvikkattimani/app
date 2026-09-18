import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SCRIPTS = [
  { text: "सात्विक", lang: "Devanagari" },
  { text: "ಸಾತ್ವಿಕ್", lang: "Kannada" },
  { text: "சாத்விக்", lang: "Tamil" },
  { text: "సాత్విక్", lang: "Telugu" },
  { text: "সাত্ত্বিক", lang: "Bengali" },
  { text: "સાત્વિક", lang: "Gujarati" },
  { text: "സാത്വിക്", lang: "Malayalam" },
  { text: "ਸਾਤਵਿਕ", lang: "Gurmukhi" },
  { text: "ସାତ୍ତ୍ୱିକ", lang: "Odia" },
  { text: "ساتوک", lang: "Urdu" },
  { text: "Satvik", lang: "English" },
];

const WORD = "SATVIK CAPITAL".split("");

export const Intro = ({ onDone }) => {
  const [i, setI] = useState(0);
  const [final, setFinal] = useState(false);

  useEffect(() => {
    if (final) return undefined;
    if (i >= SCRIPTS.length - 1) {
      const t = setTimeout(() => setFinal(true), 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((n) => n + 1), i === 0 ? 600 : 340);
    return () => clearTimeout(t);
  }, [i, final]);

  useEffect(() => {
    if (!final) return undefined;
    const t = setTimeout(onDone, 2300);
    return () => clearTimeout(t);
  }, [final, onDone]);

  return (
    <motion.div
      data-testid="intro-overlay"
      className="fixed inset-0 z-[100] bg-navy flex items-center justify-center overflow-hidden"
      exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="absolute inset-0 nav-grid opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(199,106,61,0.14),transparent_60%)]" />

      <motion.img
        src="/brand/logo.png"
        alt=""
        className="absolute w-[70vmin] h-[70vmin] opacity-[0.07] spin-slow pointer-events-none"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.07 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <div className="relative flex flex-col items-center text-center px-6">
        <motion.div
          className="w-2 h-2 rounded-full bg-copper mb-12"
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {!final ? (
          <div className="flex flex-col items-center">
            <div className="relative h-[120px] sm:h-[140px] w-[90vw] max-w-[720px]">
              <AnimatePresence initial={false}>
                <motion.p
                  key={SCRIPTS[i].text}
                  data-testid="intro-script"
                  className="absolute inset-0 flex items-center justify-center font-scripts text-copper-glow text-6xl sm:text-7xl md:text-8xl leading-none"
                  initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -22, filter: "blur(6px)" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {SCRIPTS[i].text}
                </motion.p>
              </AnimatePresence>
            </div>
            <p data-testid="intro-script-lang" className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 mt-6">{SCRIPTS[i].lang}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center" data-testid="intro-final">
            <motion.img
              src="/brand/logo.png"
              alt="Satvik Capital"
              className="w-24 h-24 sm:w-28 sm:h-28"
              initial={{ scale: 0.4, opacity: 0, rotate: -40 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
            <h1 className="font-serif text-white text-4xl sm:text-5xl lg:text-6xl tracking-[0.22em] mt-10 flex flex-wrap justify-center">
              {WORD.map((ch, idx) => (
                <motion.span
                  key={idx}
                  className={ch === " " ? "w-4 sm:w-6" : idx > 6 ? "text-copper-glow" : ""}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + idx * 0.045, duration: 0.5, ease: "easeOut" }}
                >
                  {ch}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="font-scripts text-white/55 text-lg sm:text-xl mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.7 }}
            >
              सत्येन धार्यते धनम् <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35 ml-3">Wealth is held by truth</span>
            </motion.p>
          </div>
        )}
      </div>

      <button
        data-testid="intro-skip-btn"
        onClick={onDone}
        className="absolute bottom-8 right-8 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50 hover:text-copper-glow transition-colors duration-300 flex items-center gap-3"
      >
        Enter <span className="block w-8 h-px bg-current" />
      </button>
    </motion.div>
  );
};
