import * as React from "react";
import {
  Building2,
  Briefcase,
  HeartHandshake,
  FileEdit,
  BadgeCheck,
  FileCheck2,
  MapPin,
  Scale,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Building2,
  Briefcase,
  HeartHandshake,
  FileEdit,
  BadgeCheck,
  FileCheck2,
  MapPin,
  Scale,
};

export const ServiceIcon = React.forwardRef<
  SVGSVGElement,
  { name: string; className?: string }
>(({ name, className }, ref) => {
  const Cmp = ICONS[name] ?? HelpCircle;
  return <Cmp ref={ref} className={className} aria-hidden />;
});
ServiceIcon.displayName = "ServiceIcon";

export function serviceIconNames(): string[] {
  return Object.keys(ICONS);
}
