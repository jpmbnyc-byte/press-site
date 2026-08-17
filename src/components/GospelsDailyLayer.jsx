import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRegister } from './Register';
import { CHAMBER_COMMANDS } from '@/data/gospelCommands';
import {
  gospelReceivedCount,
  readReaderMemory,
  recordGospelReceived,
} from '@/lib/readerMemory';
import '@/gospelsAtmosphere.css';

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

function formatDayLabel(key) {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default function GospelsDailyLayer() {
  const location = useLocation();
  const { setRegister } = useRegister();
  const active = location.pathname === '/gospels';
  const dayKey = useMemo(() => localDayKey(), []);
  const command = useMemo(() => dailyCommand(dayKey), [dayKey]);
  const [memory, setMemory] = useState(() => readReaderMemory());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onMemory = event => setMemory(event.detail || readReaderMemory());
    window.addEventListener('hw:reader-memory', onMemory);
    return () => window.removeEventListener('hw:reader-memory', onMemory);
  }, []);

  useEffect(() => {
    if (!active) {
      setOpen(false);
      return;
    }

    setRegister({
      pathname: '/gospels',
      seriesName: 'Gospels Live',
      reference: 'The Chamber',
      year: String(new Date().getFullYear()),
      color: '#c4a84a',
    });
  }, [active, setRegister]);

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

  if (!active || !command) return null;

  const received = memory.gospels?.daily?.[dayKey] === command.id;
  const count = gospelReceivedCount(memory);
  const receive = () => {
    setMemory(recordGospelReceived(command.id, { dailyKey: dayKey }));
    speak(command.command);
  };

  return (
    <div
      data-hw-gospels-daily="true"
      className="fixed right-4 top-[6.25rem] lg:top-20 z-[35] w-[min(360px,calc(100vw-2rem))]"
    >
      {open ? (
        <section className="border border-[#c4a84a]/35 bg-[#0e0d0a]/95 text-[#F7F4EE] shadow-2xl backdrop-blur-md p-5 md:p-6">
          <div className="flex items-start justify-between gap-5 mb-5">
            <div>
              <div className="font-mono text-[8px] tracking-[0.3em] uppercase text-[#c4a84a] mb-2">
                Daily Weather · {formatDayLabel(dayKey)}
              </div>
              <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-[#c8b99a]">
                Field record · {count}/{CHAMBER_COMMANDS.length} received
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-w-11 min-h-11 -mr-2 -mt-2 inline-flex items-center justify-center font-mono text-lg text-[#c8b99a] hover:text-[#c4a84a] transition-colors"
              aria-label="Close daily weather"
            >
              ×
            </button>
          </div>

          <div className="font-mono text-[8px] tracking-[0.28em] uppercase text-[#c4a84a]/70 mb-2">
            Today&apos;s climate
          </div>
          <h2 className="font-serif text-3xl font-light leading-none mb-3">{command.climate}</h2>
          <p className="font-serif italic text-lg text-[#F7F4EE]/82 leading-snug mb-3">
            {command.command}
          </p>
          {command.latin && (
            <p className="font-mono text-[8px] tracking-[0.17em] uppercase text-[#c4a84a] mb-5">
              {command.latin}
            </p>
          )}

          {received ? (
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#F7F4EE]/10">
              <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-[#c4a84a]">
                Received today
              </span>
              <button
                type="button"
                onClick={() => speak(command.command)}
                className="min-h-11 font-mono text-[8px] tracking-[0.2em] uppercase text-[#F7F4EE]/65 hover:text-[#c4a84a] transition-colors"
              >
                Hear again →
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={receive}
              className="min-h-11 w-full font-mono text-[9px] tracking-[0.23em] uppercase bg-[#c4a84a] text-[#0e0d0a] px-5 py-3 hover:bg-[#e0c870] transition-colors"
            >
              Receive today&apos;s command →
            </button>
          )}
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto min-h-11 flex items-center gap-3 border border-[#c4a84a]/30 bg-[#0e0d0a]/88 px-4 backdrop-blur-md shadow-lg text-left"
          aria-label={`Open today's climate: ${command.climate}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#c4a84a] shrink-0" aria-hidden="true" />
          <span className="font-mono text-[8px] tracking-[0.23em] uppercase text-[#c8b99a]">
            Today · <span className="text-[#c4a84a]">{command.climate}</span>
          </span>
        </button>
      )}
    </div>
  );
}
