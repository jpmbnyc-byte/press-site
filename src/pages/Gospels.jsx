import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COMMANDS = [
  {
    id: 'fear-not',
    latin: 'Nolite timere',
    command: 'Be not afraid',
    source: 'Luke 2:10 · John 14:27',
    weather: 'When the body braces for threat that has not arrived.',
    practice:
      'Place one hand on the sternum. Lengthen the exhale until it outlasts the inhale. Say the command once out loud, once under the breath.',
  },
  {
    id: 'peace-still',
    latin: 'Quiesce',
    command: 'Peace, be still',
    source: 'Mark 4:39',
    weather: 'When the interior storm is louder than the room you are in.',
    practice:
      'Sit until the jaw softens. Trace one slow circle with the gaze. Speak the command into the weather you are actually in — not the one you fear.',
  },
  {
    id: 'take-heart',
    latin: 'Confidite',
    command: 'Take heart',
    source: 'John 16:33 · Matthew 14:27',
    weather: 'When courage feels like a costume you cannot keep wearing.',
    practice:
      'Stand. Feel the weight in both heels. Inhale through the nose for four, hold for two, release for six. Receive the command as permission, not performance.',
  },
  {
    id: 'come-unto-me',
    latin: 'Venite ad me',
    command: 'Come unto me',
    source: 'Matthew 11:28',
    weather: 'When the load has been carried alone for too long.',
    practice:
      'Name one weight you are holding that is not yours to finish today. Set the shoulders down on the exhale. Let the command be an invitation, not a demand.',
  },
  {
    id: 'abide',
    latin: 'Manete',
    command: 'Abide in me',
    source: 'John 15:4',
    weather: 'When the mind keeps leaving the body for tomorrow.',
    practice:
      'Return to one sensory fact: temperature, light, contact with the chair. Stay for ninety seconds. Abiding is the opposite of forecasting.',
  },
  {
    id: 'love-one-another',
    latin: 'Diligite',
    command: 'Love one another',
    source: 'John 13:34',
    weather: 'When distance has become the default between you and another.',
    practice:
      'Choose one concrete nearness: a message, a meal, a minute of undivided attention. Love as regulation practiced between nervous systems.',
  },
];

export default function Gospels() {
  const [activeId, setActiveId] = useState(COMMANDS[0].id);
  const [spoken, setSpoken] = useState(false);
  const active = COMMANDS.find(c => c.id === activeId) || COMMANDS[0];

  useEffect(() => {
    setSpoken(false);
  }, [activeId]);

  const speak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpoken(true);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(active.command);
    utterance.rate = 0.85;
    utterance.pitch = 0.95;
    utterance.onend = () => setSpoken(true);
    window.speechSynthesis.speak(utterance);
    setSpoken(true);
  };

  return (
    <div className="bg-[var(--hw-bg)]">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#0e0d0a] px-6 py-24">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, rgba(196,168,74,0.18) 0%, transparent 55%), linear-gradient(180deg, #0e0d0a 0%, #1a1810 100%)',
          }}
        />
        <div className="relative z-10 text-center max-w-3xl animate-[hw-rise_0.9s_ease-out]">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#c4a84a] mb-8">
            Gospels Live
          </div>
          <h1 className="font-serif text-[clamp(40px,8vw,72px)] font-light text-[#F7F4EE] leading-[0.95] tracking-[-0.02em] mb-8">
            Living Commands
          </h1>
          <p className="font-serif italic text-xl md:text-2xl text-[#F7F4EE] opacity-80 leading-relaxed max-w-xl mx-auto mb-10">
            The direct speech of Jesus across the Gospels — compressed somatic maps for fear, storm,
            courage, and nearness.
          </p>
          <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#c8b99a] opacity-60">
            Select a command · Hear it · Practice it
          </p>
        </div>
      </section>

      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 space-y-1">
            {COMMANDS.map((cmd, i) => {
              const isActive = cmd.id === activeId;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => setActiveId(cmd.id)}
                  className={`w-full text-left border-t px-1 py-5 transition-colors duration-300 ${
                    isActive
                      ? 'border-[var(--hw-gold)]'
                      : 'border-[rgba(154,125,46,0.2)] hover:border-[var(--hw-gold)]'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-gold)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-serif text-2xl font-light transition-colors duration-300 ${
                        isActive ? 'text-[var(--hw-gold)]' : 'text-[var(--hw-ink)]'
                      }`}
                    >
                      {cmd.command}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            key={active.id}
            className="lg:col-span-7 animate-[hw-rise_0.5s_ease-out] border-t border-[var(--hw-gold)] pt-8"
          >
            <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-ink3)] mb-3">
              {active.latin}
            </div>
            <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-light text-[var(--hw-ink)] leading-[1.05] mb-3">
              {active.command}
            </h2>
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-gold)] mb-10">
              {active.source}
            </div>

            <div className="mb-10">
              <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-gold)] mb-3">
                The Weather
              </div>
              <p className="font-serif italic text-xl text-[var(--hw-ink2)] leading-relaxed">
                {active.weather}
              </p>
            </div>

            <div className="mb-12">
              <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-gold)] mb-3">
                The Practice
              </div>
              <p className="font-serif text-lg text-[var(--hw-ink2)] leading-[1.8]">
                {active.practice}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                type="button"
                onClick={speak}
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-bg)] bg-[var(--hw-gold)] px-10 py-4 hover:bg-[var(--hw-gold-lt)] transition-colors duration-300"
              >
                {spoken ? 'Speak Again' : 'Hear the Command'}
              </button>
              <Link
                to="/subscribe"
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-ink)] border-b border-[var(--hw-gold)] pb-1 hover:text-[var(--hw-gold)] transition-colors duration-300"
              >
                Enter the Field Station →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[rgba(108,87,89,0.18)] text-center">
        <p className="font-serif italic text-xl text-[var(--hw-ink2)] max-w-2xl mx-auto mb-8 leading-relaxed">
          Two thousand years before polyvagal theory, these commands were already prescribing
          regulation. Gospels Live keeps them spoken — not archived.
        </p>
        <Link
          to="/about"
          className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-ink)] border-b border-[var(--hw-gold)] pb-1 hover:text-[var(--hw-gold)] transition-colors duration-300"
        >
          Read the Contemplative Pillar →
        </Link>
      </section>
    </div>
  );
}
