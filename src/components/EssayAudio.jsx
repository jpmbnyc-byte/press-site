import { useRef } from 'react';
import { Headphones } from 'lucide-react';

export default function EssayAudio({ recording, title }) {
  const player = useRef(null);

  return (
    <section aria-label="Audio edition" className="border-l-2 border-[var(--series-ink)] bg-[var(--hw-surface)] px-4 py-4 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="flex items-center gap-2 font-heading text-base text-[var(--hw-ink)]">
          <Headphones size={16} aria-hidden="true" />
          Listen to this essay
          <span className="font-mono text-xs text-[var(--hw-muted)]">{recording.duration}</span>
        </h2>
        <label className="hw-label text-[var(--hw-muted)]">
          Speed{' '}
          <select
            defaultValue="1"
            className="bg-transparent text-[var(--hw-ink)]"
            onChange={event => { player.current.playbackRate = Number(event.target.value); }}
          >
            {[0.75, 1, 1.25, 1.5, 2].map(rate => <option key={rate} value={rate}>{rate}×</option>)}
          </select>
        </label>
      </div>
      <audio ref={player} controls preload="metadata" src={recording.src} aria-label={`Listen to ${title}`} className="block w-full">
        <a href={recording.src}>Open the audio edition</a>
      </audio>
    </section>
  );
}
