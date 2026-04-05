interface Props { size?: "sm" | "md" | "lg"; color?: string; }

const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

const Spinner = ({ size = "md", color = "border-primary-600" }: Props) => (
  <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-200 border-t-transparent ${color}`} />
);

export default Spinner;