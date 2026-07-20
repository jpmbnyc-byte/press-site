import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AuthorPortrait from '@/components/AuthorPortrait';

const COMMANDS = [
  {
    id: 'fear-not',
    climate: 'Bracing',
    climateHint: 'Threat without arrival',
    latin: 'Nolite timere',
    command: 'Be not afraid',
    source: 'Luke 2:10 · John 14:27',
    weather: 'When the body braces for threat that has not arrived.',
    practice:
      'Place one hand on the sternum. Lengthen the exhale until it outlasts the inhale. Say the command once out loud, once under the breath.',
    breath: { inhale: 4, hold: 2, exhale: 6 },
    hue: 'rgba(196,168,74,0.22)',
  },
  {
    id: 'peace-still',
    climate: 'Storm',
    climateHint: 'Interior louder than the room',
    latin: 'Quiesce',
    command: 'Peace, be still',
    source: 'Mark 4:39',
    weather: 'When the interior storm is louder than the room you are in.',
    practice:
      'Sit until the jaw softens. Trace one slow circle with the gaze. Speak the command into the weather you are actually in — not the one you fear.',
    breath: { inhale: 4, hold: 4, exhale: 8 },
    hue: 'rgba(100,140,160,0.20)',
  },
  {
    id: 'take-heart',
    climate: 'Thin',
    climateHint: 'Courage as costume',
    latin: 'Confidite',
    command: 'Take heart',
    source: 'John 16:33 · Matthew 14:27',
    weather: 'When courage feels like a costume you cannot keep wearing.',
    practice:
      'Stand. Feel the weight in both heels. Inhale through the nose for four, hold for two, release for six. Receive the command as permission, not performance.',
    breath: { inhale: 4, hold: 2, exhale: 6 },
    hue: 'rgba(196,100,60,0.18)',
  },
  {
    id: 'come-unto-me',
    climate: 'Heavy',
    climateHint: 'Load carried alone',
    latin: 'Venite ad me',
    command: 'Come unto me',
    source: 'Matthew 11:28',
    weather: 'When the load has been carried alone for too long.',
    practice:
      'Name one weight you are holding that is not yours to finish today. Set the shoulders down on the exhale. Let the command be an invitation, not a demand.',
    breath: { inhale: 3, hold: 1, exhale: 7 },
    hue: 'rgba(120,90,70,0.22)',
  },
  {
    id: 'abide',
    climate: 'Scattered',
    climateHint: 'Mind leaving the body',
    latin: 'Manete',
    command: 'Abide in me',
    source: 'John 15:4',
    weather: 'When the mind keeps leaving the body for tomorrow.',
    practice:
      'Return to one sensory fact: temperature, light, contact with the chair. Stay for ninety seconds. Abiding is the opposite of forecasting.',
    breath: { inhale: 4, hold: 4, exhale: 4 },
    hue: 'rgba(90,140,110,0.18)',
  },
  {
    id: 'love-one-another',
    climate: 'Distant',
    climateHint: 'Nearness has gone quiet',
    latin: 'Diligite',
    command: 'Love one another',
    source: 'John 13:34',
    weather: 'When distance has become the default between you and another.',
    practice:
      'Choose one concrete nearness: a message, a meal, a minute of undivided attention. Love as regulation practiced between nervous systems.',
    breath: { inhale: 5, hold: 0, exhale: 5 },
    hue: 'rgba(160,90,100,0.16)',
  },
];

const STAGES = ['threshold', 'chamber', 'practice', 'stillness'];

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
  const [stage, setStage] = useState('threshold');
  const [activeId, setActiveId] = useState(null);
  const [received, setReceived] = useState([]);
  const [spoken, setSpoken] = useState(false);
  const [practiceSeconds, setPracticeSeconds] = useState(90);
  const [practicing, setPracticing] = useState(false);
  const timerRef = useRef(null);
  const active = COMMANDS.find(c => c.id === activeId) || null;

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

  const enterCommand = (id) => {
    setActiveId(id);
    setStage('chamber');
    setReceived(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const speak = () => {
    if (!active) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpoken(true);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(active.command);
    utterance.rate = 0.82;
    utterance.pitch = 0.92;
    utterance.onend = () => setSpoken(true);
    window.speechSynthesis.speak(utterance);
    setSpoken(true);
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

  return (
    <div className="bg-[#0e0d0a] text-[#F7F4EE] min-h-screen -mt-0">
      {/* Persistent chamber atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${atmosphere} 0%, transparent 55%), linear-gradient(180deg, #0e0d0a 0%, #14120e 50%, #0e0d0a 100%)`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 hw-chamber-grain opacity-[0.07]" />

      {/* Session beads */}
      <div className="fixed top-16 right-4 md:right-8 z-30 flex flex-col items-end gap-2">
        <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#c4a84a]/70 mb-1">
          Received {received.length}/{COMMANDS.length}
        </div>
        <div className="flex gap-1.5">
          {COMMANDS.map(c => (
            <button
              key={c.id}
              type="button"
              title={c.command}
              onClick={() => enterCommand(c.id)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                received.includes(c.id)
                  ? 'bg-[#c4a84a] scale-110'
                  : 'bg-[#F7F4EE]/20 hover:bg-[#F7F4EE]/40'
              } ${activeId === c.id ? 'ring-1 ring-[#c4a84a] ring-offset-2 ring-offset-[#0e0d0a]' : ''}`}
              aria-label={c.command}
            />
          ))}
        </div>
      </div>

      {/* THRESHOLD — climate gate */}
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
            <p className="font-serif italic text-xl text-[#F7F4EE]/75 max-w-xl mx-auto mb-14 leading-relaxed">
              Name the climate inside you. The chamber will answer with a living command — spoken,
              breathed, practiced.
            </p>
          </div>

          <div className="relative z-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-[hw-rise_1s_ease-out_0.15s_both]">
            {COMMANDS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => enterCommand(c.id)}
                className="group text-left border border-[#F7F4EE]/15 hover:border-[#c4a84a] bg-[#0e0d0a]/40 backdrop-blur-sm px-5 py-6 md:px-6 md:py-8 transition-all duration-500 hover:bg-[#c4a84a]/08"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#c4a84a] mb-3">
                  {String(i + 1).padStart(2, '0')} · {c.climateHint}
                </div>
                <div className="font-serif text-2xl md:text-3xl font-light text-[#F7F4EE] group-hover:text-[#c4a84a] transition-colors duration-500">
                  {c.climate}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => enterCommand(COMMANDS[0].id)}
            className="relative z-10 mt-14 font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE]/50 hover:text-[#c4a84a] transition-colors duration-300"
          >
            Or enter without naming →
          </button>
        </section>
      )}

      {/* CHAMBER — command revealed */}
      {stage === 'chamber' && active && (
        <section className="relative z-10 min-h-[calc(100vh-3.5rem)] flex flex-col justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 animate-[hw-rise_0.7s_ease-out]">
              <button
                type="button"
                onClick={() => setStage('threshold')}
                className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#c8b99a] hover:text-[#c4a84a] mb-8 transition-colors"
              >
                ← Climate gate
              </button>
              <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#c4a84a] mb-4">
                {active.latin}
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
              <div className="mt-10 space-y-2">
                {COMMANDS.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => enterCommand(c.id)}
                    className={`w-full flex items-baseline justify-between border-t px-1 py-3 text-left transition-colors duration-300 ${
                      c.id === activeId
                        ? 'border-[#c4a84a] text-[#c4a84a]'
                        : 'border-[#F7F4EE]/12 text-[#F7F4EE]/55 hover:text-[#F7F4EE] hover:border-[#c4a84a]/50'
                    }`}
                  >
                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-lg font-light">{c.command}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PRACTICE — timed somatic ritual */}
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

      {/* STILLNESS — closing blessing */}
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
                onClick={() => setStage('threshold')}
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
              <Link
                to="/journal"
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE]/60 hover:text-[#c4a84a] px-6 py-4 transition-colors"
              >
                Read the Journal →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stage rail for accessibility */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 px-3 py-2 rounded-full bg-[#0e0d0a]/70 border border-[#F7F4EE]/10 backdrop-blur-md"
        aria-label="Chamber stages"
      >
        {STAGES.map(s => {
          const canGo =
            s === 'threshold' || (activeId && (s === 'chamber' || s === 'practice' || s === 'stillness'));
          return (
            <button
              key={s}
              type="button"
              disabled={!canGo}
              onClick={() => {
                if (!canGo) return;
                if (s === 'practice' && stage !== 'practice') startPractice();
                else setStage(s);
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
