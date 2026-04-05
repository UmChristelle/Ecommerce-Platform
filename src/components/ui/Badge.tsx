import clsx from "clsx";

type Color = "green" | "yellow" | "blue" | "red" | "gray" | "purple";

interface Props { label: string; color?: Color; }

const colors: Record<Color, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
  purple: "bg-purple-100 text-purple-700",
};

const Badge = ({ label, color = "gray" }: Props) => (
  <span className={clsx("badge", colors[color])}>{label}</span>
);

export default Badge;