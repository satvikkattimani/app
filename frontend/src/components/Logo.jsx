export const Logo = ({ size = 40, dark = true, subtitle = true, className = "" }) => (
  <span className={`flex items-center gap-3 ${className}`}>
    <img src="/brand/logo.png" alt="Satvik Capital compass emblem" width={size} height={size} className="shrink-0" style={{ width: size, height: size }} />
    <span className="flex flex-col leading-none">
      <span className={`font-serif tracking-[0.18em] uppercase ${dark ? "text-white" : "text-ink"}`} style={{ fontSize: size * 0.48 }}>
        Satvik <span className="text-copper">Capital</span>
      </span>
      {subtitle && (
        <span className={`font-mono text-[9px] uppercase tracking-[0.3em] mt-1.5 ${dark ? "text-white/45" : "text-ink-3"}`}>
          Financial Advisory
        </span>
      )}
    </span>
  </span>
);
