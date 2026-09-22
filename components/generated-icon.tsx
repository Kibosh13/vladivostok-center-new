import Image from "next/image";

const iconSources = {
  "path-science": "/images/icons/generated/path-science.png",
  "path-specialist": "/images/icons/generated/path-specialist.png",
  "path-method": "/images/icons/generated/path-method.png",
  "path-support": "/images/icons/generated/path-support.png",
  "pain-tension": "/images/icons/generated/pain-tension.png",
  "pain-clock": "/images/icons/generated/pain-clock.png",
  "pain-family": "/images/icons/generated/pain-family.png",
  "pain-energy": "/images/icons/generated/pain-energy.png",
  "income-support": "/images/icons/generated/income-support.png",
  "income-decisions": "/images/icons/generated/income-decisions.png",
  "income-team": "/images/icons/generated/income-team.png",
  "income-growth": "/images/icons/generated/income-growth.png",
  "utility-calendar": "/images/icons/generated/utility-calendar.png",
  "utility-phone": "/images/icons/generated/utility-phone.png",
  "utility-location": "/images/icons/generated/utility-location.png",
  "utility-send": "/images/icons/generated/utility-send.png",
  "utility-success": "/images/icons/generated/utility-success.png",
} as const;

export type GeneratedIconName = keyof typeof iconSources;

export function GeneratedIcon({ name, className = "" }: { name: GeneratedIconName; className?: string }) {
  return (
    <span className={`generated-icon ${className}`.trim()} aria-hidden="true">
      <Image src={iconSources[name]} alt="" width={512} height={512} sizes="96px" />
    </span>
  );
}
