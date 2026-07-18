import { Link } from 'react-router-dom';
import SomaticField from '@/components/SomaticField';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#0e0d0a] py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-baseline justify-center gap-[2px] mb-6">
            <span className="font-mono text-[14px] tracking-[0.2em] text-[#f0e9d8]">HUMAN</span>
            <span className="font-serif italic text-xl text-[#c4a84a]">Weather</span>
            <span className="font-mono text-[14px] text-[#f0e9d8]">.</span>
          </div>
          <p className="font-serif italic text-2xl text-[#f0e9d8] mb-8">
            The emotional climate of modern life.
          </p>
          <p className="font-serif text-lg text-[#c8b99a] leading-relaxed max-w-2xl mx-auto">
            A publishing platform and wellness tool built at the intersection of somatic neuroscience,
            neuroaesthetics, and two thousand years of contemplative wisdom.
          </p>
        </div>
      </section>

      {/* Section I — The Question */}
      <section className="py-20 px-6 max-w-2xl mx-auto">
        <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">I — The Question</div>
        <h2 className="font-serif text-4xl font-light text-[var(--hw-ink)] mb-8 leading-tight">
          What is your weather right now?
        </h2>
        <div className="space-y-6 font-serif text-xl leading-[1.9] text-[var(--hw-ink2)] text-justify">
          <p>
            Not how are you doing. Not what have you been up to. The actual climate inside your body — the
            temperature, the pressure, whether things feel clear or like something is moving in from a distance
            you cannot name yet.
          </p>
          <p>
            Human Weather is built on the belief that the answer to that question changes everything. It changes
            how you work, how you love, how you pray, how you carry the weight of being alive in a world that
            moves faster than the body can process.
          </p>
          <p>
            We are not a wellness brand. We are a publication and a practice — one that takes the interior life
            seriously enough to write about it like it matters, because it does.
          </p>
        </div>
      </section>

      {/* Section II — The Science */}
      <section className="py-20 px-6 bg-[var(--hw-surface)] transition-colors duration-500">
        <div className="max-w-5xl mx-auto">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-sage)] mb-4">II — The Science</div>
          <h2 className="font-serif text-4xl font-light text-[var(--hw-ink)] mb-12 leading-tight">
            Three streams, one river.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-sage)] mb-3">Somatic Neuroscience</div>
              <p className="font-serif text-base text-[var(--hw-ink2)] leading-relaxed">
                Heart rate variability, autonomic regulation, interoceptive awareness. The body is not a metaphor
                for what you feel — it is where feeling happens. Modern neuroscience is only now catching up to
                what contemplatives have known for millennia.
              </p>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-sage)] mb-3">Neuroaesthetics</div>
              <p className="font-serif text-base text-[var(--hw-ink2)] leading-relaxed">
                The Johns Hopkins IAM Lab has shown that beauty measurably changes the body — reducing stress
                markers, altering neural patterns, shifting the climate of the nervous system. What you read and
                look at is not neutral. It is weather.
              </p>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-sage)] mb-3">Contemplative Wisdom</div>
              <p className="font-serif text-base text-[var(--hw-ink2)] leading-relaxed">
                The direct commands of Jesus across all four Gospels and Acts — be not afraid, peace be still,
                take heart — are the oldest compressed somatic map in existence. Two thousand years before
                polyvagal theory, they were already prescribing regulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section III — The Practice */}
      <section className="bg-[#0e0d0a] py-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a] mb-4">III — The Practice</div>
            <h2 className="font-serif text-4xl font-light text-[#f0e9d8] mb-6">
              The app is where the reading becomes regulation.
            </h2>
            <p className="font-serif text-lg text-[#c8b99a] leading-relaxed mb-6 max-w-md">
              The publication gives you the language. The app gives you the tools — a somatic map that reads what
              your body is doing, and a set of regulated responses: breathwork, frequency therapy, light therapy,
              sacred commands, solar intelligence, and the Sanctuary, a space of accumulated stillness.
            </p>
            <a
              href="https://humanweather.social"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] border border-[#c4a84a] px-8 py-3 hover:bg-[#c4a84a] hover:text-[#0e0d0a] transition-all duration-300 inline-block"
            >
              Open the App →
            </a>
          </div>
          <div className="flex-shrink-0 w-48 md:w-56">
            <SomaticField size={8} />
          </div>
        </div>
      </section>

      {/* Section IV — The Founder */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">IV — The Founder</div>
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="w-20 h-20 bg-[var(--hw-ink)] text-[var(--hw-gold)] flex items-center justify-center font-mono text-lg flex-shrink-0">
            JP
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--hw-ink)] mb-1">JP Bobo</div>
            <div className="font-serif italic text-sm text-[var(--hw-ink3)] mb-4">
              Bayonne NJ · Crown Heights Brooklyn
            </div>
            <div className="space-y-4 font-serif text-lg leading-relaxed text-[var(--hw-ink2)]">
              <p>
                JP comes from sales operations — the world of pipelines, forecasts, and measurable proximity.
                He brings that diagnostic instinct to the interior life, asking the same questions business asks
                of its relationships: how close are we, actually? How direct? How sustained?
              </p>
              <p>
                He is a daily Catholic practitioner, a student of somatic neuroscience, and a writer who believes
                the wellness industry has excluded the very people who need it most. Human Weather — and PBWY™ —
                is built for the millions who have been left out of the conversation about what it means to be
                well.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section V — The Series */}
      <section className="py-20 px-6 border-t border-[rgba(154,125,46,0.18)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">V — The Series</div>
          <h2 className="font-serif text-4xl font-light text-[var(--hw-ink)] mb-6">Seven series. Forty-nine essays.</h2>
          <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-8 max-w-xl mx-auto">
            Each series is a sustained meditation on one dimension of the interior life.
          </p>
          <Link
            to="/series"
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-8 py-3 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 inline-block"
          >
            Explore the Series →
          </Link>
        </div>
      </section>
    </div>
  );
}