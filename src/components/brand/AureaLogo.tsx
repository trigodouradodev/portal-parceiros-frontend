export function AureaLogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 2 L16.5 9H21.5L17.5 13.5L19.5 20.5L14 16.5L8.5 20.5L10.5 13.5L6.5 9H11.5Z"
        fill="#FFD320"
      />
    </svg>
  );
}

export function AureaLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
          <g fill="#0D0D53">
            <Star cx={16} cy={3} s={3} />
            <Star cx={11} cy={11} s={3} />
            <Star cx={21} cy={11} s={3} />
            <Star cx={6} cy={19} s={3} />
            <Star cx={16} cy={19} s={3} />
            <Star cx={26} cy={19} s={3} />
          </g>
        </svg>
        <span className="font-fraunces text-2xl font-bold tracking-tight text-brand-navy">
          aurea
        </span>
      </div>
    </div>
  );
}

function Star({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <path
      d={`M${cx},${cy - s} C${cx},${cy - s * 0.3} ${cx + s * 0.3},${cy} ${cx + s},${cy} C${cx + s * 0.3},${cy} ${cx},${cy + s * 0.3} ${cx},${cy + s} C${cx},${cy + s * 0.3} ${cx - s * 0.3},${cy} ${cx - s},${cy} C${cx - s * 0.3},${cy} ${cx},${cy - s * 0.3} ${cx},${cy - s}Z`}
    />
  );
}
