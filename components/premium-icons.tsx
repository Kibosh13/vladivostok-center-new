import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, className = "", ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg className={`premium-icon ${className}`.trim()} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" {...props}>
      <circle className="premium-icon-halo" cx="32" cy="32" r="29" />
      {children}
    </svg>
  );
}

export function NeuralIcon(props: IconProps) {
  return <IconBase {...props}>
    <path d="M30 17c-4-5-12-2-11 4-6 0-8 8-3 11-4 5 0 12 6 11 1 6 9 7 12 2V20c0-4-2-6-4-3Z" />
    <path d="M34 19c3-6 12-4 11 3 6 1 7 9 2 12 4 5-1 12-7 10-1 6-8 6-10 2M24 25c5 0 7 3 7 7M22 37c5 0 8-2 9-6M40 25c-5 0-7 3-7 7M42 38c-5 0-8-2-9-6" />
    <circle className="premium-icon-gem" cx="32" cy="32" r="3" />
  </IconBase>;
}

export function GuideIcon(props: IconProps) {
  return <IconBase {...props}>
    <circle cx="32" cy="23" r="8" />
    <path d="M16 48c2-10 8-15 16-15s14 5 16 15M18 48h28" />
    <path className="premium-icon-accent" d="m42 17 3-4m2 9 5-1" />
  </IconBase>;
}

export function ShieldBloomIcon(props: IconProps) {
  return <IconBase {...props}>
    <path d="M32 14c5 4 10 5 16 6v11c0 10-6 17-16 21-10-4-16-11-16-21V20c6-1 11-2 16-6Z" />
    <path d="M25 34c4 0 7 2 7 7 0-5 3-7 7-7M32 41V25" />
    <path className="premium-icon-accent" d="M27 28c3 0 5 2 5 5M37 28c-3 0-5 2-5 5" />
  </IconBase>;
}

export function DocumentSparkIcon(props: IconProps) {
  return <IconBase {...props}>
    <path d="M20 14h17l9 9v27H20V14Z" />
    <path d="M37 14v10h9M26 31h14M26 38h14M26 45h9" />
    <path className="premium-icon-accent" d="m14 24 2-3 2 3 3 2-3 2-2 3-2-3-3-2 3-2Z" />
  </IconBase>;
}

export function ClockFlowIcon(props: IconProps) {
  return <IconBase {...props}>
    <circle cx="32" cy="32" r="17" />
    <path d="M32 20v13l9 5" />
    <path className="premium-icon-accent" d="M15 16c5-5 10-7 16-7M12 22l3-6 6 2" />
  </IconBase>;
}

export function ConnectionIcon(props: IconProps) {
  return <IconBase {...props}>
    <circle cx="22" cy="26" r="6" /><circle cx="42" cy="26" r="6" /><circle cx="32" cy="20" r="7" />
    <path d="M12 46c1-8 5-12 11-12M52 46c-1-8-5-12-11-12M20 48c1-10 5-15 12-15s11 5 12 15" />
    <path className="premium-icon-accent" d="M27 47h10" />
  </IconBase>;
}

export function BatteryHeartIcon(props: IconProps) {
  return <IconBase {...props}>
    <path d="M23 16h18v34H23V16ZM28 11h8M28 22h8" />
    <path d="M32 42s-7-4-7-9c0-5 6-6 7-2 1-4 7-3 7 2 0 5-7 9-7 9Z" />
    <path className="premium-icon-accent" d="M44 25h5M46.5 22.5v5" />
  </IconBase>;
}

export function AnchorLeafIcon(props: IconProps) {
  return <IconBase {...props}>
    <path d="M32 50V30M32 38c-10-1-15-7-14-17 10 1 15 7 14 17ZM32 34c9-1 14-7 14-16-9 1-14 7-14 16Z" />
    <path d="M16 50h32" />
    <path className="premium-icon-accent" d="M22 27c4 2 7 5 10 10M42 24c-4 2-7 5-10 10" />
  </IconBase>;
}

export function IdeaIcon(props: IconProps) {
  return <IconBase {...props}>
    <path d="M22 28c0-7 4-13 10-13s10 6 10 13c0 6-4 8-6 12H28c-2-4-6-6-6-12ZM28 45h8M29 50h6" />
    <path d="M32 20v4M18 18l4 4M46 18l-4 4" />
    <path className="premium-icon-accent" d="m29 32 3-5 3 5" />
  </IconBase>;
}

export function GrowthIcon(props: IconProps) {
  return <IconBase {...props}>
    <path d="M18 47h30M22 43V34M31 43V28M40 43V21" />
    <path d="m20 28 10-8 7 4 10-10" />
    <path d="M40 14h7v7" />
    <circle className="premium-icon-gem" cx="20" cy="28" r="2" />
  </IconBase>;
}

export function ArrowIcon({ className = "", ...props }: IconProps) {
  return <svg className={`premium-arrow ${className}`.trim()} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M4 12h14M13 6l6 6-6 6" /></svg>;
}

export function PlayIcon({ className = "", ...props }: IconProps) {
  return <svg className={`premium-play ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" {...props}><path d="m9 7 8 5-8 5V7Z" /></svg>;
}

export function CalendarIcon(props: IconProps) {
  return <IconBase {...props}><rect x="15" y="18" width="34" height="31" rx="4" /><path d="M15 27h34M23 13v10M41 13v10" /><circle className="premium-icon-gem" cx="27" cy="35" r="2" /><circle className="premium-icon-gem" cx="37" cy="35" r="2" /></IconBase>;
}

export function CheckIcon({ className = "", ...props }: IconProps) {
  return <svg className={`premium-check ${className}`.trim()} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 6-7" /></svg>;
}

export function PhoneIcon(props: IconProps) {
  return <IconBase {...props}><path d="M23 17 17 23c2 12 12 22 24 24l6-6-9-7-5 5c-4-2-7-5-9-9l5-5-6-8Z" /></IconBase>;
}

export function MapIcon(props: IconProps) {
  return <IconBase {...props}><path d="M32 51s14-12 14-24a14 14 0 1 0-28 0c0 12 14 24 14 24Z" /><circle cx="32" cy="27" r="5" /></IconBase>;
}

export function SendIcon(props: IconProps) {
  return <IconBase {...props}><path d="m14 30 36-15-13 35-7-13-16-7Z" /><path d="m30 37 20-22" /></IconBase>;
}

export function SuccessIcon(props: IconProps) {
  return <IconBase {...props}><path d="m20 33 8 8 17-19" /><path className="premium-icon-accent" d="M47 31a16 16 0 1 1-8-13" /></IconBase>;
}
