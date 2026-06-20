import type { ReactNode } from "react";

type CardColor = "purple" | "blue" | "green" | "amber";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: CardColor;
}

const colorMap: Record<
  CardColor,
  {
    iconBg: string;
    iconText: string;
    topBar: string;
  }
> = {
  purple: {
    iconBg: "bg-accent-glow",
    iconText: "text-accent",
    topBar: "from-accent to-accent-secondary",
  },
  blue: {
    iconBg: "bg-blue-500/[0.12]",
    iconText: "text-blue-500",
    topBar: "from-blue-500 to-blue-400",
  },
  green: {
    iconBg: "bg-green-500/[0.12]",
    iconText: "text-green-500",
    topBar: "from-green-500 to-green-400",
  },
  amber: {
    iconBg: "bg-amber-500/[0.12]",
    iconText: "text-amber-500",
    topBar: "from-amber-500 to-amber-400",
  },
};

export default function StatsCard({
  icon,
  label,
  value,
  sub,
  color = "purple",
}: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className="group relative bg-card border border-white/[0.06] rounded-2xl p-[22px] transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] overflow-hidden animate-fade-in">
      {/* Top accent bar on hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${c.topBar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="flex items-center justify-between mb-3.5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.iconBg} ${c.iconText}`}
        >
          {icon}
        </div>
      </div>

      <div className="text-xs font-semibold uppercase tracking-[1px] text-[#4a4f66]">
        {label}
      </div>
      <div className="text-[32px] font-extrabold tracking-tight leading-none mb-1">
        {value ?? "—"}
      </div>
      {sub && <div className="text-xs text-[#7c8097]">{sub}</div>}
    </div>
  );
}
