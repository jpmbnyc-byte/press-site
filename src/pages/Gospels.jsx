import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthorPortrait from '@/components/AuthorPortrait';
import {
  CHAMBER_COMMANDS,
  GOSPEL_ARCHIVE,
  GATE_SAMPLE_SIZE,
  chamberForArchiveNumber,
  pickRandomClimate,
  sampleGateClimates,
} from '@/data/gospelCommands';

const STAGES = ['threshold', 'chamber', 'practice', 'stillness', 'archive'];

function BreathRing({ breath, active }) {
  const cycle = Math.max(1, (breath.inhale + breath.hold + breath.exhale) * 1000);
  return (
    <div className="relative w-44 h-44 md:w-56 md:h-56 mx-auto" aria-hidden="true">
      <div
        className={`absolute inset-0 rounded-full border border-[#c4a84a]/40 ${
          active ? 'hw-breath-ring' : ''
        }`}
        style={active ? { animationDuration: `${cycle}ms` } : undefined}
      />
      <div className="absolute inset-4 rounded-full border border-[#c4a84a]/20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-[8px] tracking-[0.3em] uppercase text-[#c4a84a] mb-2">
            Breath
          </div>
          <div className="font-serif text-lg text-[#F7F4EE] tabular-nums">
            {breath.inhale}-{breath.hold}-{breath.exhale}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Gospels() {
  const [params, setParams] = useSearchParams();
  const initialArchive = params.get('view') === 'archive';
  const [stage, setStage] = useState(initialArchive ? 'archive' : 'threshold');
  const [activeId, setActiveId] = useState(null);
  const [received, setReceived] = useState([]);
  const [spoken, setSpoken] = useState(false);
  const [practiceSeconds, setPracticeSeconds] = useState(90);
  const [practicing, setPracticing] = useState(false);
  const [openArchiveN, setOpenArchiveN] = useState(null);
  const [gateClimates, setGateClimates] = useState(() => sampleGateClimates());
  const [gateKey, setGateKey] = useState(0);
  const timerRef = useRef(null);
  const active = CHAMBER_COMMANDS.find(c => c.id === activeId) || null;

  useEffect(() => {
    if (params.get('view') === 'archive') setStage('archive');
  }, [params]);

  useEffect(() => {
    setSpoken(false);
    setPracticing(false);
    setPracticeSeconds(90);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activeId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const goArchive = () => {
    setStage('archive');
    setParams({ view: 'archive' }, { replace: true });
  };

  const goThreshold = () => {
    setStage('threshold');
    setParams({}, { replace: true });
  };

  const redrawGate = () => {
    setGateClimates(sampleGateClimates());
    setGateKey(k => k + 1);
  };

  const enterCommand = (id) => {
    setActiveId(id);
    setStage('chamber');
    setParams({}, { replace: true });
    setReceived(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const receiveRandom = ({ excludeActive = true } = {}) => {
    const excludeIds = excludeActive && activeId ? [activeId] : [];
    const unreceived = CHAMBER_COMMANDS.filter(
      c => !received.includes(c.id) && !excludeIds.includes(c.id)
    );
    const choice =
      unreceived.length > 0
        ? unreceived[Math.floor(Math.random() * unreceived.length)]
        : pickRandomClimate(CHAMBER_COMMANDS, { excludeIds, preferUnreceived: false });
    if (choice) enterCommand(choice.id);
  };

  const speakText = (text, onEnd) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 0.92;
    utterance.onend = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
  };

  const speak = () => {
    if (!active) return;
    speakText(active.command, () => setSpoken(true));
    setSpoken(true);
  };

  const speakArchive = (item) => {
    const chamber = chamberForArchiveNumber(item.n);
    speakText(chamber?.command || item.title);
  };

  const startPractice = () => {
    if (!active) return;
    setStage('practice');
    setPracticing(true);
    setPracticeSeconds(90);
    speak();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPracticeSeconds(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setPracticing(false);
          setStage('stillness');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const atmosphere = active?.hue || 'rgba(196,168,74,0.14)';
  const receivedPct = Math.round((received.length / CHAMBER_COMMANDS.length) * 100);

  // Chamber sidebar: current gate draw, ensuring active is included
  const sidebarClimates = (() => {
    const list = [...gateClimates];
    if (active && !list.some(c => c.id === active.id)) {
      list.unshift(active);
      return list.slice(0, GATE_SAMPLE_SIZE);
    }
    return list;
  })();

  return (
    <div className="bg-[#0e0d0a] text-[#F7F4EE] min-h-screen -mt-0">
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${atmosphere} 0%, transparent 55%), linear-gradient(180deg, #0e0d0a 0%, #14120e 50%, #0e0d0a 100%)`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 hw-chamber-grain opacity-[0.07]" />

      {stage !== 'archive' && (
        <div className="fixed top-16 right-4 md:right-8 z-30 w-28 md:w-36">
          <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#c4a84a]/70 mb-2 text-right">
            Received {received.length}/{CHAMBER_COMMANDS.length}
          </div>
          <div className="h-[2px] bg-[#F7F4EE]/15 overflow-hidden">
            <div
              className="h-full bg-[#c4a84a] transition-all duration-700"
              style={{ width: `${receivedPct}%` }}
            />
          </div>
        </div>
      )}

      {/* THRESHOLD */}
      {stage === 'threshold' && (
        <section className="relative z-10 min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 py-20">
          <div className="text-center max-w-3xl animate-[hw-rise_1s_ease-out]">
            <div className="flex justify-center mb-10">
              <AuthorPortrait size="lg" />
            </div>
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#c4a84a] mb-6">
              Gospels Live · The Chamber
            </div>
            <h1 className="font-serif text-[clamp(40px,8vw,80px)] font-light leading-[0.95] tracking-[-0.02em] mb-6">
              What is your weather?
            </h1>
            <p className="font-serif italic text-xl text-[#F7F4EE]/75 max-w-xl mx-auto mb-6 leading-relaxed">
              Name a climate from this draw — or receive a command at random from all forty-eight.
            </p>
            <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#c8b99a] mb-10">
              {GATE_SAMPLE_SIZE} climates drawn · {CHAMBER_COMMANDS.length} live commands
            </p>
          </div>

          <div
            key={gateKey}
            className="relative z-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-[hw-rise_0.85s_ease-out]"
          >
            {gateClimates.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => enterCommand(c.id)}
                className="group text-left border border-[#F7F4EE]/15 hover:border-[#c4a84a] bg-[#0e0d0a]/40 backdrop-blur-sm px-5 py-6 md:px-6 md:py-8 transition-all duration-500 hover:bg-[#c4a84a]/08"
              >
                <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#c4a84a] mb-3">
                  {String(c.n).padStart(2, '0')} · {c.climateHint}
                </div>
                <div className="font-serif text-2xl md:text-3xl font-light text-[#F7F4EE] group-hover:text-[#c4a84a] transition-colors duration-500">
                  {c.climate}
                </div>
                <div className="font-serif italic text-sm text-[#F7F4EE]/45 mt-3 group-hover:text-[#F7F4EE]/70 transition-colors">
                  {c.command}
                </div>
              </button>
            ))}
          </div>

          <div className="relative z-10 mt-12 flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => receiveRandom({ excludeActive: false })}
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-10 py-4 hover:bg-[#e0c870] transition-colors duration-300"
            >
              Receive a random command →
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <button
                type="button"
                onClick={redrawGate}
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE]/55 hover:text-[#c4a84a] transition-colors duration-300"
              >
                Draw new climates
              </button>
              <span className="hidden sm:inline text-[#F7F4EE]/20">·</span>
              <button
                type="button"
                onClick={goArchive}
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#c4a84a] border-b border-[#c4a84a]/40 pb-1 hover:border-[#c4a84a] transition-colors duration-300"
              >
                Browse all {GOSPEL_ARCHIVE.length} →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ARCHIVE */}
      {stage === 'archive' && (
        <section className="relative z-10 min-h-[calc(100vh-3.5rem)] px-6 py-20">
          <div className="max-w-3xl mx-auto animate-[hw-rise_0.8s_ease-out]">
            <button
              type="button"
              onClick={goThreshold}
              className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#c8b99a] hover:text-[#c4a84a] mb-10 transition-colors"
            >
              ← Back to the Chamber
            </button>
            <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#c4a84a] mb-4">
              Gospels Live · The Map
            </div>
            <h1 className="font-serif text-[clamp(36px,7vw,64px)] font-light leading-[0.98] tracking-[-0.02em] mb-5">
              Forty-eight live climates.
            </h1>
            <p className="font-serif italic text-xl text-[#F7F4EE]/75 max-w-xl mb-4 leading-relaxed">
              Every command is practiced in the chamber. Open any one — or receive one at random.
            </p>
            <button
              type="button"
              onClick={() => receiveRandom({ excludeActive: false })}
              className="mb-14 font-mono text-[10px] tracking-[0.25em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-8 py-3 hover:bg-[#e0c870] transition-colors"
            >
              Receive a random command →
            </button>

            <div className="space-y-0 border-t border-[#F7F4EE]/12">
              {GOSPEL_ARCHIVE.map((item, i) => {
                const open = openArchiveN === item.n;
                const chamber = chamberForArchiveNumber(item.n);
                const isReceived = chamber && received.includes(chamber.id);
                return (
                  <div
                    key={item.n}
                    className="border-b border-[#F7F4EE]/12 animate-[hw-rise_0.6s_ease-out_both]"
                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenArchiveN(open ? null : item.n)}
                      className="w-full text-left py-5 flex items-baseline gap-4 md:gap-6 group"
                    >
                      <span className="font-mono text-[10px] tracking-[0.2em] text-[#c4a84a] w-8 shrink-0">
                        {String(item.n).padStart(2, '0')}
                      </span>
                      <span className="font-serif text-xl md:text-2xl font-light text-[#F7F4EE] group-hover:text-[#c4a84a] transition-colors duration-300 flex-1">
                        {item.title}
                        {chamber && (
                          <span className="block font-mono text-[8px] tracking-[0.18em] uppercase text-[#c8b99a] mt-1">
                            Climate · {chamber.climate}
                            {isReceived ? ' · Received' : ''}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-[#c8b99a] hidden sm:inline">
                        {item.ref}
                      </span>
                    </button>
                    {open && chamber && (
                      <div className="pb-8 pl-12 md:pl-14 animate-[hw-rise_0.45s_ease-out]">
                        <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#c8b99a] mb-3 sm:hidden">
                          {item.ref}
                        </div>
                        <p className="font-serif italic text-lg text-[#F7F4EE]/80 leading-[1.85] mb-4 max-w-2xl">
                          &ldquo;{item.verse}&rdquo;
                        </p>
                        <p className="font-serif text-base text-[#c8b99a] mb-6 max-w-xl leading-relaxed">
                          {chamber.weather}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => speakArchive(item)}
                            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-8 py-3 hover:bg-[#e0c870] transition-colors"
                          >
                            Hear the command
                          </button>
                          <button
                            type="button"
                            onClick={() => enterCommand(chamber.id)}
                            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-8 py-3 hover:bg-[#F7F4EE] hover:text-[#0e0d0a] transition-all"
                          >
                            Enter chamber · {chamber.climate}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-16 font-mono text-[8px] tracking-[0.18em] uppercase text-[#c8b99a]/70 leading-relaxed max-w-xl">
              Command list organized from the Gospels (KJV). Chamber practices are Human Weather
              framings for the body — not a replacement for reading the text.
            </p>
          </div>
        </section>
      )}

      {/* CHAMBER */}
      {stage === 'chamber' && active && (
        <section className="relative z-10 min-h-[calc(100vh-3.5rem)] flex flex-col justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 animate-[hw-rise_0.7s_ease-out]">
              <button
                type="button"
                onClick={goThreshold}
                className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#c8b99a] hover:text-[#c4a84a] mb-8 transition-colors"
              >
                ← Climate gate
              </button>
              <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#c4a84a] mb-4">
                {active.latin} · {String(active.n).padStart(2, '0')} of 48
              </div>
              <h2 className="font-serif text-[clamp(44px,9vw,88px)] font-light leading-[0.92] tracking-[-0.03em] mb-6">
                {active.command}
              </h2>
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c8b99a] mb-10">
                {active.source} · Climate: {active.climate}
              </div>
              <p className="font-serif italic text-xl md:text-2xl text-[#F7F4EE]/80 leading-relaxed max-w-xl mb-8">
                {active.weather}
              </p>
              <p className="font-serif text-lg text-[#c8b99a] leading-[1.8] max-w-xl mb-12">
                {active.practice}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={speak}
                  className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-10 py-4 hover:bg-[#e0c870] transition-colors duration-300"
                >
                  {spoken ? 'Speak Again' : 'Hear the Command'}
                </button>
                <button
                  type="button"
                  onClick={startPractice}
                  className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-10 py-4 hover:bg-[#F7F4EE] hover:text-[#0e0d0a] transition-all duration-500"
                >
                  Enter Practice · 90s
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 animate-[hw-rise_0.9s_ease-out_0.1s_both]">
              <BreathRing breath={active.breath} active={spoken || practicing} />
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => receiveRandom()}
                  className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c4a84a] border border-[#c4a84a]/50 px-4 py-2 hover:bg-[#c4a84a]/10 transition-colors"
                >
                  Random next
                </button>
                <button
                  type="button"
                  onClick={redrawGate}
                  className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#F7F4EE]/55 border border-[#F7F4EE]/20 px-4 py-2 hover:border-[#c4a84a]/50 transition-colors"
                >
                  New draw
                </button>
              </div>
              <div className="mt-6 space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {sidebarClimates.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => enterCommand(c.id)}
                    className={`w-full flex items-baseline justify-between gap-3 border-t px-1 py-3 text-left transition-colors duration-300 ${
                      c.id === activeId
                        ? 'border-[#c4a84a] text-[#c4a84a]'
                        : 'border-[#F7F4EE]/12 text-[#F7F4EE]/55 hover:text-[#F7F4EE] hover:border-[#c4a84a]/50'
                    }`}
                  >
                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase shrink-0">
                      {String(c.n).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-lg font-light text-right">{c.command}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={goArchive}
                className="mt-6 font-mono text-[9px] tracking-[0.25em] uppercase text-[#c4a84a] border-b border-[#c4a84a]/40 pb-1 hover:border-[#c4a84a] transition-colors"
              >
                Full command map →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PRACTICE */}
      {stage === 'practice' && active && (
        <section className="relative z-10 min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#c4a84a] mb-8 animate-[hw-rise_0.5s_ease-out]">
            Practice in progress
          </div>
          <h2 className="font-serif text-[clamp(36px,8vw,72px)] font-light leading-[0.95] mb-6 animate-[hw-rise_0.6s_ease-out]">
            {active.command}
          </h2>
          <p className="font-serif italic text-xl text-[#F7F4EE]/70 max-w-md mx-auto mb-12">
            {active.practice}
          </p>
          <BreathRing breath={active.breath} active={practicing} />
          <div className="mt-10 font-serif text-5xl font-light tabular-nums text-[#c4a84a]">
            {Math.floor(practiceSeconds / 60)}:{String(practiceSeconds % 60).padStart(2, '0')}
          </div>
          <button
            type="button"
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setPracticing(false);
              setStage('stillness');
            }}
            className="mt-12 font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE]/50 hover:text-[#c4a84a] transition-colors"
          >
            Arrive in stillness →
          </button>
        </section>
      )}

      {/* STILLNESS */}
      {stage === 'stillness' && (
        <section className="relative z-10 min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="animate-[hw-rise_1.1s_ease-out] max-w-2xl">
            <div className="hw-ornament !text-[#c4a84a] !opacity-50 !my-6">✦</div>
            <p className="font-serif text-[clamp(28px,5vw,44px)] font-light italic leading-relaxed mb-8">
              Peace be with you.
            </p>
            <p className="font-serif text-lg text-[#c8b99a] leading-relaxed mb-12 max-w-lg mx-auto">
              The command has been received. Carry it in the body — not as doctrine, as weather you
              can return to.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => receiveRandom()}
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-10 py-4 hover:bg-[#e0c870] transition-colors"
              >
                Receive another at random →
              </button>
              <button
                type="button"
                onClick={goThreshold}
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-10 py-4 hover:bg-[#F7F4EE] hover:text-[#0e0d0a] transition-all duration-500"
              >
                Return to the Gate
              </button>
              {active && (
                <button
                  type="button"
                  onClick={() => setStage('chamber')}
                  className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#c4a84a] border border-[#c4a84a] px-10 py-4 hover:bg-[#c4a84a] hover:text-[#0e0d0a] transition-all duration-500"
                >
                  Stay with {active.command}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 px-3 py-2 rounded-full bg-[#0e0d0a]/70 border border-[#F7F4EE]/10 backdrop-blur-md"
        aria-label="Chamber stages"
      >
        {STAGES.map(s => {
          const canGo =
            s === 'threshold' ||
            s === 'archive' ||
            (activeId && (s === 'chamber' || s === 'practice' || s === 'stillness'));
          return (
            <button
              key={s}
              type="button"
              disabled={!canGo}
              onClick={() => {
                if (!canGo) return;
                if (s === 'archive') goArchive();
                else if (s === 'threshold') goThreshold();
                else if (s === 'practice' && stage !== 'practice') startPractice();
                else {
                  setStage(s);
                  setParams({}, { replace: true });
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 disabled:opacity-30 ${
                stage === s ? 'bg-[#c4a84a] w-4' : 'bg-[#F7F4EE]/25 w-1.5'
              }`}
              aria-label={s}
              aria-current={stage === s ? 'step' : undefined}
            />
          );
        })}
      </nav>
    </div>
  );
}
