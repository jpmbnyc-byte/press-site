import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { CHAMBER_COMMANDS } from '@/data/gospelCommands';
import {
  gospelReceivedCount,
  readReaderMemory,
  recordGospelReceived,
} from '@/lib/readerMemory';

function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dailyCommand(key) {
  if (!CHAMBER_COMMANDS.length) return null;
  let hash = 2166136261;
  for (const char of key) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return CHAMBER_COMMANDS[Math.abs(hash) % CHAMBER_COMMANDS.length];
}

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.82;
  utterance.pitch = 0.92;
  window.speechSynthesis.speak(utterance);
}

function DailyClimate({ command, dayKey, memory, onReceive }) {
  if (!command) return null;
  const received = memory.gospels?.daily?.[dayKey] === command.id;
  const count = gospelReceivedCount(memory);

  return (
    <section className="bg-[#0e0d0a] text-[#F7F4EE] px-6 pt-8 pb-10 border-b border-[#F7F4EE]/10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-12 items-end">
        <div className="md:col-span-3">
          <div className="font-mono text-[9px] tracking-[0.32em] uppercase text-[#c4a84a] mb-3">
            Daily Weather · {dayKey.replaceAll('-', '·')}
          </div>
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c8b99a]">
            Field record · {count}/{CHAMBER_COMMANDS.length} received
          </div>
        </div>

        <div className="md:col-span-6">
          <div className="font-mono text-[8px] tracking-[0.3em] uppercase text-[#c4a84a]/70 mb-2">
            Today&apos;s climate
          </div>
          <h2 className="font-serif text-[clamp(30px,5vw,48px)] font-light leading-none mb-4">
            {command.climate}
          </h2>
          <p className="font-serif italic text-xl md:text-2xl text-[#F7F4EE]/85 leading-snug mb-3">
            {command.command}
          </p>
          {command.latin && (
            <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#c4a84a]">
              {command.latin}
            </p>
          )}
        </div>

        <div className="md:col-span-3 md:text-right">
          {received ? (
            <div>
              <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#c4a84a] mb-2">
                Received today
              </div>
              <button
                type="button"
                onClick={() => speak(command.command)}
                className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#F7F4EE]/65 border-b border-[#F7F4EE]/25 pb-1 hover:text-[#c4a84a] hover:border-[#c4a84a] transition-colors"
              >
                Hear it again →
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onReceive}
              className="font-mono text-[9px] tracking-[0.25em] uppercase bg-[#c4a84a] text-[#0e0d0a] px-6 py-3 hover:bg-[#e0c870] transition-colors"
            >
              Receive today&apos;s command →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default function GospelsDailyLayer() {
  const location = useLocation();
  const active = location.pathname === '/gospels';
  const dayKey = useMemo(() => localDayKey(), []);
  const command = useMemo(() => dailyCommand(dayKey), [dayKey]);
  const [memory, setMemory] = useState(() => readReaderMemory());
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const onMemory = event => setMemory(event.detail || readReaderMemory());
    window.addEventListener('hw:reader-memory', onMemory);
    return () => window.removeEventListener('hw:reader-memory', onMemory);
  }, []);

  useEffect(() => {
    if (!active) {
      setTarget(null);
      return undefined;
    }

    const main = document.querySelector('main');
    if (!main) return undefined;
    const mount = document.createElement('div');
    mount.dataset.hwGospelsDaily = 'true';
    main.insertAdjacentElement('afterbegin', mount);
    setTarget(mount);

    return () => {
      setTarget(null);
      mount.remove();
    };
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;

    const capture = event => {
      const button = event.target?.closest?.('button');
      if (!button || button.closest('[data-hw-gospels-daily="true"]')) return;
      const text = String(button.textContent || '').toLowerCase();
      if (!text) return;
      const match = CHAMBER_COMMANDS.find(item => {
        const climate = String(item.climate || '').toLowerCase();
        const commandText = String(item.command || '').toLowerCase();
        const latin = String(item.latin || '').toLowerCase();
        return (climate && text.includes(climate)) ||
          (commandText && text.includes(commandText)) ||
          (latin && text.includes(latin));
      });
      if (match) setMemory(recordGospelReceived(match.id));
    };

    document.addEventListener('click', capture, true);
    return () => document.removeEventListener('click', capture, true);
  }, [active]);

  if (!active || !target || !command) return null;

  const receive = () => {
    setMemory(recordGospelReceived(command.id, { dailyKey: dayKey }));
    speak(command.command);
  };

  return createPortal(
    <div data-hw-gospels-daily="true">
      <DailyClimate
        command={command}
        dayKey={dayKey}
        memory={memory}
        onReceive={receive}
      />
    </div>,
    target
  );
}
