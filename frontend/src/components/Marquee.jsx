const ITEMS = [
  "No automated queues",
  "Direct line · +91 97405 42188",
  "Trained inside an asset management house",
  "Disciplined asset allocation",
  "Portfolio restructuring",
  "SIP architecture",
  "Goal-first, product-last",
  "One advisor. Every conversation.",
];

export const Marquee = () => (
  <div data-testid="editorial-marquee" className="bg-navy-deep border-y border-copper/25 overflow-hidden py-5 select-none">
    <div className="marquee-track flex w-max">
      {[0, 1].map((rep) => (
        <div key={rep} className="flex items-center" aria-hidden={rep === 1}>
          {ITEMS.map((t, i) => (
            <span key={`${rep}-${i}`} className="flex items-center font-serif text-xl sm:text-2xl text-[#E6D5B8]/85 px-8 whitespace-nowrap">
              {t}
              <img src="/brand/logo.png" alt="" className="w-5 h-5 ml-16 opacity-60" />
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);
