export const Logo = ({ size = 40, dark = true, className = "" }) => (
  <span className={`flex items-center gap-3 ${className}`}>
    <img src="/brand/logo.png" alt="Satvik Capital emblem" width={size} height={size} className="shrink-0" style={{ width: size, height: size }} />
    <span className={`font-serif tracking-[0.18em] uppercase leading-none ${dark ? "text-white" : "text-ink"}`} style={{ fontSize: size * 0.48 }}>
      Satvik <span className="text-copper">Capital</span>
    </span>
  </span>
);
