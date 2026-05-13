"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor, Fish, Waves, Trophy, RefreshCw,
  CheckCircle, XCircle, Zap, Star,
  ChevronRight, Shield, Target, Award, Clock
} from "lucide-react";

// ---------------------------------------------------------------------------
// QUIZ DATA
// ---------------------------------------------------------------------------
interface Question {
  id: number;
  category: "wreck" | "marine" | "history" | "ecology";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  funFact?: string;
}

const questions: Question[] = [
  { id:1, category:"history", difficulty:"easy", question:"In what year did KM Tabularasa sink in the waters of Pramuka Island?", options:["1985","1990","1995","2000"], correct:2, explanation:"KM Tabularasa sank in 1995 due to damage in the ship's engine room.", funFact:"Despite being less than 50 years old, Tabularasa already holds significant national maritime historical value." },
  { id:2, category:"wreck", difficulty:"easy", question:"What is the maximum depth of the Tabularasa wreck site?", options:["15–20 meters","20–33 meters","33–45 meters","10–15 meters"], correct:1, explanation:"Tabularasa rests at 20–33 meters depth, ideal for Advanced Open Water certified divers.", funFact:"The ship's structure remains remarkably intact, making it highly attractive for wreck exploration." },
  { id:3, category:"history", difficulty:"medium", question:"Which vessel collided with KM Poso, causing it to sink?", options:["KM Nusantara","KM Berdikari","KM Jaya Bahari","KM Sriwijaya"], correct:1, explanation:"KM Poso sank in 1970 after colliding with KM Berdikari in the waters of Karang Congkak.", funFact:"KM Poso was originally a Dutch maritime trading vessel before being converted into a cement cargo ship." },
  { id:4, category:"ecology", difficulty:"medium", question:"What is the coral cover percentage at the Poso wreck site?", options:["34.92%","55.00%","80.18%","92.50%"], correct:2, explanation:"Poso has an 80.18% coral cover — the highest among all surveyed wrecks — making it a prime candidate for an eco-archaeological park.", funFact:"This high coral coverage supports over 28 species of living coral." },
  { id:5, category:"marine", difficulty:"easy", question:"Which marine animal is most commonly found inside the crevices of a shipwreck hull?", options:["Green Sea Turtle","Moray Eel","Angelfish","Stingray"], correct:1, explanation:"The Moray Eel is a permanent resident in engine rooms and cargo hold crevices, spotted year-round.", funFact:"Moray Eels can live over 30 years and consistently return to the same hiding spot." },
  { id:6, category:"wreck", difficulty:"hard", question:"What is the total site assessment score of Poso based on I. Dillenia et al. (2021) criteria?", options:["18 / 30","22 / 30","26 / 30","30 / 30"], correct:2, explanation:"Poso scored 26/30 — the highest among all surveyed wrecks — indicating exceptional potential as an underwater archaeological park.", funFact:"Tabularasa scored 22/30, still categorised as a high-potential site." },
  { id:7, category:"ecology", difficulty:"medium", question:"What seabed substrate type best supports underwater visibility around Pramuka Island wrecks?", options:["Fine mud","Sandy substrate","Hard coral","Gravel"], correct:1, explanation:"Sandy substrate is not easily disturbed by currents, keeping water clarity high for diving.", funFact:"Parrotfish actually contribute to creating this sand through their coral-feeding process!" },
  { id:8, category:"marine", difficulty:"hard", question:"Which sea turtle species is Critically Endangered and feeds on sponges growing on wreck structures?", options:["Green Sea Turtle","Leatherback Turtle","Hawksbill Turtle","Loggerhead Turtle"], correct:2, explanation:"The Hawksbill Turtle (Eretmochelys imbricata) is Critically Endangered and is known to feed on sponges colonising wreck surfaces.", funFact:"The Hawksbill's narrow beak is perfectly shaped to extract sponges from tight crevices." },
  { id:9, category:"history", difficulty:"easy", question:"What was KM Tabularasa's original function before it sank?", options:["Oil tanker","Passenger ferry","STP Training vessel","Fishing boat"], correct:2, explanation:"Tabularasa was a training ship belonging to STP (Sekolah Tinggi Perikanan) that sank in the waters of Pramuka Island in 1995.", funFact:"Its role as an educational vessel gives Tabularasa additional value in Indonesia's maritime history." },
  { id:10, category:"ecology", difficulty:"hard", question:"During which season does underwater visibility in Pramuka Island waters reach its peak?", options:["West Monsoon (Nov–Mar)","Transition Season (Apr–May)","East Monsoon (Jun–Oct)","Same year-round"], correct:2, explanation:"The East Monsoon (Jun–Oct) typically produces the best visibility — up to 12 meters — with more stable currents.", funFact:"The Transition Season (Apr–May) is also excellent and recommended for all diver levels." },
  { id:11, category:"marine", difficulty:"medium", question:"Which fish is known to produce white sand as a byproduct of its feeding?", options:["Angelfish","Surgeonfish","Parrotfish","Butterfly Fish"], correct:2, explanation:"Parrotfish bite coral and algae with their hard teeth, producing fine sand grains that form white sandy beaches.", funFact:"A single Parrotfish can produce over 100 kg of sand per year!" },
  { id:12, category:"wreck", difficulty:"medium", question:"What is the depth range of the Poso wreck site?", options:["10–20 meters","15–25 meters","25–30 meters","30–40 meters"], correct:2, explanation:"Poso rests at 25–30 meters depth, slightly deeper than Tabularasa, suited for experienced divers.", funFact:"This depth falls within the safe recreational diving zone using standard equipment." },
  { id:13, category:"history", difficulty:"hard", question:"From which country did KM Poso originate before operating in Indonesia?", options:["England","Japan","Netherlands","Germany"], correct:2, explanation:"KM Poso was originally a Dutch maritime trading vessel before being converted into a cement cargo ship.", funFact:"Its connection to Dutch trade routes gives Poso global maritime historical significance." },
  { id:14, category:"marine", difficulty:"easy", question:"What animal group does a Nudibranch belong to?", options:["Fish","Mollusc (sea slug)","Crustacean","Echinoderm"], correct:1, explanation:"Nudibranchs are shell-less sea slugs belonging to the class Gastropoda, known for their vivid warning colours.", funFact:"The name 'nudibranch' comes from Latin: nudus (naked) + brankhia (gills)." },
  { id:15, category:"ecology", difficulty:"medium", question:"What does 'underwater visibility' measured by a Secchi disk indicate?", options:["Water temperature at depth","Water clarity — how far you can see underwater","Underwater current speed","Dissolved oxygen levels"], correct:1, explanation:"A Secchi disk is lowered until it disappears from sight — that distance indicates water clarity (visibility).", funFact:"The Secchi disk was invented by Pastor Pietro Angelo Secchi in 1865 in the Mediterranean Sea." },
];

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
type GamePhase = "intro" | "playing" | "result";
interface AnswerRecord { questionId: number; selectedIndex: number; correct: boolean; timeLeft: number; }

const QUESTION_TIME     = 20;
const POINTS_BASE       = 100;
const POINTS_TIME_BONUS = 5;

const catMeta = {
  wreck:   { label: "Wreck",   dot: "bg-blue-500",    pill: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",    bar: "bg-blue-500"    },
  marine:  { label: "Marine",  dot: "bg-teal-500",    pill: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",    bar: "bg-teal-500"    },
  history: { label: "History", dot: "bg-amber-500",   pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", bar: "bg-amber-500"   },
  ecology: { label: "Ecology", dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", bar: "bg-emerald-500" },
} as const;

const diffMeta = {
  easy:   { stars: 1, color: "text-emerald-500" },
  medium: { stars: 2, color: "text-amber-500"   },
  hard:   { stars: 3, color: "text-red-500"      },
} as const;

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// ---------------------------------------------------------------------------
// TIMER RING
// ---------------------------------------------------------------------------
const TimerRing = ({ timeLeft, total }: { timeLeft: number; total: number }) => {
  const r    = 26;
  const circ = 2 * Math.PI * r;
  const off  = circ * (1 - timeLeft / total);
  const clr  = timeLeft > 10 ? "#3b82f6" : timeLeft > 5 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
      <svg className="-rotate-90 absolute inset-0" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-white/10" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={clr} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
      </svg>
      <span className="text-sm font-black tabular-nums text-gray-800 dark:text-white">{timeLeft}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// OPTION BUTTON
// ---------------------------------------------------------------------------
const OptionButton = ({ label, index, selected, correct, revealed, onClick }: {
  label: string; index: number; selected: boolean; correct: boolean; revealed: boolean; onClick: () => void;
}) => {
  const letters = ["A", "B", "C", "D"];
  let wrap  = "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-primary hover:bg-primary/5 dark:hover:bg-white/10 cursor-pointer shadow-sm";
  let badge = "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50";
  let text  = "text-gray-800 dark:text-white/90";
  if (revealed) {
    if (correct) {
      wrap  = "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-400 cursor-default";
      badge = "bg-emerald-500 text-white";
      text  = "text-emerald-800 dark:text-emerald-300 font-semibold";
    } else if (selected) {
      wrap  = "bg-red-50 dark:bg-red-500/15 border-red-400 cursor-default";
      badge = "bg-red-500 text-white";
      text  = "text-red-800 dark:text-red-300";
    } else {
      wrap  = "bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 opacity-40 cursor-default";
    }
  }
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      onClick={revealed ? undefined : onClick}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left ${wrap}`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-colors ${badge}`}>
        {revealed && correct  ? <CheckCircle size={14} /> :
         revealed && selected ? <XCircle size={14} /> :
         letters[index]}
      </div>
      <span className={`text-sm leading-snug ${text}`}>{label}</span>
    </motion.button>
  );
};

// ---------------------------------------------------------------------------
// INTRO SCREEN
// ---------------------------------------------------------------------------
const IntroScreen = ({ onStart }: { onStart: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="flex flex-col gap-6 py-2">

    <div>
      <h2 className="text-3xl lg:text-4xl font-black tracking-tighter leading-[1.05] text-gray-900 dark:text-white mb-3">
        How deep does your <span className="text-primary">knowledge go?</span>
      </h2>
      <p className="text-gray-500 dark:text-white/40 text-sm leading-relaxed max-w-lg">
        15 questions about wreck diving, marine life, and maritime history of the Pramuka Islands. Answer fast — earn more points.
      </p>
    </div>

    {/* Rule pills */}
    <div className="flex flex-wrap gap-2">
      {[
        { icon: <Target size={12} />, text: "15 questions" },
        { icon: <Clock size={12} />, text: "20 sec / question" },
        { icon: <Zap size={12} />, text: "Time bonus" },
        { icon: <Star size={12} />, text: "3 difficulty levels" },
      ].map(({ icon, text }) => (
        <div key={text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 text-xs font-semibold">
          <span className="text-primary">{icon}</span>
          {text}
        </div>
      ))}
    </div>

    {/* Category grid */}
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">Question categories</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(catMeta).map(([key, cfg], i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.07 }}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
            <div className={`w-1.5 h-6 rounded-full ${cfg.dot} opacity-80 flex-shrink-0`} />
            <div>
              <p className="text-xs font-black text-gray-800 dark:text-white">{cfg.label}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30">
                {questions.filter(q => q.category === key).length} Question
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    <motion.button
      whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
      onClick={onStart}
      className="self-start flex items-center gap-3 bg-primary text-white font-black px-8 py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-sm"
    >
      Start Diving
      <ChevronRight size={18} />
    </motion.button>
  </motion.div>
);

// ---------------------------------------------------------------------------
// PLAYING SCREEN
// ---------------------------------------------------------------------------
const PlayingScreen = ({ question, questionIndex, total, score, timeLeft, selected, revealed, onSelect, onNext }: {
  question: Question; questionIndex: number; total: number; score: number; timeLeft: number;
  selected: number | null; revealed: boolean; onSelect: (i: number) => void; onNext: () => void;
}) => {
  const cat  = catMeta[question.category];
  const diff = diffMeta[question.difficulty];
  const pct  = (questionIndex / total) * 100;

  return (
    <motion.div key={question.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="flex flex-col gap-4">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-black text-gray-400 dark:text-white/30 tabular-nums flex-shrink-0">
            {questionIndex + 1}<span className="opacity-40">/{total}</span>
          </span>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${cat.pill}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
            {cat.label}
          </div>
          <div className="flex gap-0.5">
            {[1,2,3].map(i => (
              <Star key={i} size={9} className={i <= diff.stars ? `${diff.color} fill-current` : "text-gray-300 dark:text-white/15"} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10">
            <Zap size={12} className="text-yellow-500" />
            <span className="text-xs font-black text-gray-800 dark:text-white tabular-nums">{score.toLocaleString()}</span>
          </div>
          <TimerRing timeLeft={timeLeft} total={QUESTION_TIME} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }}
          className={`h-full rounded-full ${cat.bar}`} />
      </div>

      {/* Question */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10">
        <p className="text-base font-bold text-gray-900 dark:text-white leading-snug">
          {question.question}
        </p>
      </div>

      {/* Options — 1 col always to avoid cramped layout on narrow screens */}
      <div className="grid grid-cols-1 gap-2">
        {question.options.map((opt, i) => (
          <OptionButton key={i} index={i} label={opt}
            selected={selected === i} correct={i === question.correct}
            revealed={revealed} onClick={() => onSelect(i)} />
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
              selected === question.correct
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30"
                : "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30"
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                {selected === question.correct
                  ? <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                  : <XCircle size={16} className="text-red-600 dark:text-red-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${
                  selected === question.correct ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                }`}>
                  {selected === question.correct ? `Correct! +${POINTS_BASE + timeLeft * POINTS_TIME_BONUS} pts` : "Incorrect"}
                </p>
                <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">{question.explanation}</p>
              </div>
            </div>

            {question.funFact && (
              <div className="flex gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/15">
                <Shield size={13} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-white/50 leading-relaxed">
                  <span className="font-black text-primary">Fun fact — </span>{question.funFact}
                </p>
              </div>
            )}

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onNext}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-3 rounded-xl text-sm transition-colors hover:bg-gray-700 dark:hover:bg-white/90">
              {questionIndex + 1 < total
                ? <><ChevronRight size={16} />Next Question</>
                : <><Award size={16} />See Results</>
              }
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// RESULT SCREEN
// ---------------------------------------------------------------------------
const ResultScreen = ({ score, answers, questions: qs, onRestart }: {
  score: number; answers: AnswerRecord[]; questions: Question[]; onRestart: () => void;
}) => {
  const correct = answers.filter(a => a.correct).length;
  const total   = qs.length;
  const pct     = Math.round((correct / total) * 100);

  const grade =
    pct >= 90 ? { emoji: "🐠", label: "Master Diver",     desc: "Outstanding! You know Pramuka Island like a seasoned marine archaeologist.",   color: "text-primary border-primary/30 bg-primary/5" } :
    pct >= 70 ? { emoji: "🐟", label: "Advanced Diver",   desc: "Impressive! A few more dives and you'll master every corner of these wrecks.", color: "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10" } :
    pct >= 50 ? { emoji: "🌊", label: "Open Water Diver", desc: "Good start! Keep exploring the storymap to deepen your knowledge.",            color: "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10" } :
                { emoji: "🏊", label: "Surface Swimmer",  desc: "Every expert was once a beginner. Dive back into the storymap and try again!", color: "text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10" };

  const byCategory = Object.keys(catMeta).map(cat => {
    const catQs  = qs.filter(q => q.category === cat);
    const catAns = answers.filter(a => catQs.find(q => q.id === a.questionId));
    return { cat, total: catQs.length, correct: catAns.filter(a => a.correct).length };
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5">

      {/* Grade card */}
      <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${grade.color}`}>
        <span className="text-4xl flex-shrink-0">{grade.emoji}</span>
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-0.5">Your rank</p>
          <p className="text-xl font-black leading-tight">{grade.label}</p>
          <p className="text-xs opacity-70 leading-relaxed mt-1">{grade.desc}</p>
        </div>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: score.toLocaleString(), l: "Score",    icon: <Zap size={15} className="text-yellow-500" /> },
          { v: `${correct}/${total}`,  l: "Correct",  icon: <CheckCircle size={15} className="text-emerald-500" /> },
          { v: `${pct}%`,              l: "Accuracy", icon: <Target size={15} className="text-primary" /> },
        ].map(({ v, l, icon }) => (
          <div key={l} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            {icon}
            <span className="text-lg font-black text-gray-900 dark:text-white">{v}</span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">{l}</span>
          </div>
        ))}
      </div>

      {/* Category bars */}
      <div className="space-y-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30">By Category</p>
        {byCategory.map(({ cat, total: t, correct: c }) => {
          const cfg = catMeta[cat as keyof typeof catMeta];
          const p   = t > 0 ? Math.round((c / t) * 100) : 0;
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border w-16 text-center flex-shrink-0 ${cfg.pill}`}>
                {cfg.label}
              </span>
              <div className="flex-1 bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  className={`h-full rounded-full ${cfg.bar}`} />
              </div>
              <span className="text-xs font-black text-gray-500 dark:text-white/50 w-8 text-right">{c}/{t}</span>
            </div>
          );
        })}
      </div>

      {/* Answer review */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30">Answer Review</p>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
          {answers.map((ans) => {
            const q = qs.find(q => q.id === ans.questionId)!;
            return (
              <div key={ans.questionId} className={`flex items-start gap-2.5 p-3 rounded-xl text-sm border ${
                ans.correct
                  ? "bg-emerald-50 dark:bg-emerald-500/8 border-emerald-200 dark:border-emerald-500/20"
                  : "bg-red-50 dark:bg-red-500/8 border-red-200 dark:border-red-500/20"
              }`}>
                {ans.correct
                  ? <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  : <XCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-white/70 line-clamp-1">{q.question}</p>
                  {!ans.correct && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓ {q.options[q.correct]}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 dark:text-white/25 flex-shrink-0">{ans.timeLeft}s</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restart */}
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onRestart}
        className="flex items-center justify-center gap-2 w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-3.5 rounded-xl text-sm hover:bg-gray-700 dark:hover:bg-white/90 transition-colors">
        <RefreshCw size={15} />
        Try Again
      </motion.button>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
const MarineQuiz: React.FC = () => {
  const [phase,    setPhase]    = useState<GamePhase>("intro");
  const [quizQs,  setQuizQs]   = useState<Question[]>([]);
  const [qIndex,  setQIndex]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);
  const [answers,  setAnswers]  = useState<AnswerRecord[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          stopTimer();
          setRevealed(true);
          setAnswers(a => [...a, { questionId: quizQs[qIndex]?.id ?? 0, selectedIndex: -1, correct: false, timeLeft: 0 }]);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  }, [qIndex, quizQs]);

  const handleStart = () => {
    setQuizQs(shuffle(questions).slice(0, 15));
    setQIndex(0); setScore(0); setAnswers([]);
    setSelected(null); setRevealed(false);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase === "playing" && quizQs.length > 0) {
      setSelected(null); setRevealed(false);
      startTimer();
    }
    return stopTimer;
  }, [phase, qIndex, quizQs]);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    stopTimer();
    const q      = quizQs[qIndex];
    const isCorr = idx === q.correct;
    setSelected(idx); setRevealed(true);
    if (isCorr) setScore(s => s + POINTS_BASE + timeLeft * POINTS_TIME_BONUS);
    setAnswers(a => [...a, { questionId: q.id, selectedIndex: idx, correct: isCorr, timeLeft }]);
  };

  const handleNext = () => {
    qIndex + 1 >= quizQs.length ? setPhase("result") : setQIndex(i => i + 1);
  };

  const handleRestart = () => {
    setPhase("intro"); setQuizQs([]); setQIndex(0);
    setScore(0); setAnswers([]); setSelected(null); setRevealed(false); stopTimer();
  };

  return (
    <section className="min-h-screen bg-white dark:bg-darkmode transition-colors duration-300 pt-24 pb-16 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Page title */}
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 mb-1">OMG-DIVE · Interactive</p>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
            Marine <span className="text-primary">Knowledge</span> Quiz
          </h1>
        </div>

        {/* ── Responsive layout ──
            mobile / tablet / split-screen : single column (main card full width)
            wide desktop (≥1280px)          : two columns (main + sidebar)
        */}
        <div className="flex flex-col xl:flex-row gap-5 items-start">

          {/* ── Main card — always full width below xl ── */}
          <div className="w-full xl:flex-1 xl:min-w-0 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none overflow-hidden">
            <div className="p-5 lg:p-7">
              <AnimatePresence mode="wait">
                {phase === "intro" && (
                  <motion.div key="intro"><IntroScreen onStart={handleStart} /></motion.div>
                )}
                {phase === "playing" && quizQs.length > 0 && (
                  <motion.div key={`q-${qIndex}`}>
                    <PlayingScreen
                      question={quizQs[qIndex]} questionIndex={qIndex} total={quizQs.length}
                      score={score} timeLeft={timeLeft} selected={selected} revealed={revealed}
                      onSelect={handleSelect} onNext={handleNext}
                    />
                  </motion.div>
                )}
                {phase === "result" && (
                  <motion.div key="result">
                    <ResultScreen score={score} answers={answers} questions={quizQs} onRestart={handleRestart} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Sidebar — only rendered at xl (≥1280px) ── */}
          <div className="hidden xl:flex flex-col gap-4 w-52 flex-shrink-0 sticky top-28">

            {/* Scoring */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">Scoring</p>
              <div className="space-y-2">
                {[
                  { l: "Correct answer", v: "100 pts"    },
                  { l: "Time bonus",     v: "+5 pts/sec" },
                  { l: "Max per Q",      v: "200 pts", accent: true },
                ].map(({ l, v, accent }) => (
                  <div key={l} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-white/40">{l}</span>
                    <span className={`font-black ${accent ? "text-primary" : "text-gray-800 dark:text-white"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">Difficulty</p>
              <div className="space-y-2">
                {Object.entries(diffMeta).map(([key, cfg]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-white/50 capitalize">{key}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(i => (
                        <Star key={i} size={9} className={i <= cfg.stars ? `${cfg.color} fill-current` : "text-gray-200 dark:text-white/15"} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarineQuiz;