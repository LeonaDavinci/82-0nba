interface IconProps {
  className?: string;
}

export function BasketballIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="bb-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E56A2C" />
          <stop offset="100%" stopColor="#C8102E" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#bb-grad)" stroke="#6b1408" strokeWidth="2.5" />
      <g fill="none" stroke="#3a0d06" strokeWidth="3" strokeLinecap="round">
        <path d="M50 5 V95" />
        <path d="M5 50 H95" />
        <path d="M16 17 C38 36 38 64 16 83" />
        <path d="M84 17 C62 36 62 64 84 83" />
      </g>
    </svg>
  );
}

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

/**
 * Brand logo: basketball graphic + "82-0" wordmark.
 * Renders the literal text "82-0" so it can serve as anchor text.
 */
export default function Logo({ className = "", iconClassName = "", textClassName = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <BasketballIcon className={`shrink-0 ${iconClassName}`} />
      <span className={`nba-wordmark font-black tracking-tighter leading-none ${textClassName}`}>
        82-0
      </span>
    </span>
  );
}
