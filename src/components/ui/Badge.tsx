import clsx from "clsx";

type Color = "green" | "yellow" | "blue" | "red" | "gray" | "purple";

interface Props { label: string; color?: Color; }

const colors: Record<Color, string> = {
  green: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
  yellow: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20",
  blue: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20",
  red: "bg-red-500/15 text-red-300 ring-1 ring-red-500/20",
  gray: "bg-slate-800 text-slate-300 ring-1 ring-slate-700",
  purple: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20",
};

const Badge = ({ label, color = "gray" }: Props) => (
  <span className={clsx("badge", colors[color])}>{label}</span>
);

export default Badge;
