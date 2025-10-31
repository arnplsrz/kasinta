import { cn } from "@/lib/utils";

interface KasintaLogoProps {
  variant?: "default" | "inverted";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
  xl: "h-12",
};

export function KasintaLogo({
  variant = "default",
  size = "md",
  className,
}: KasintaLogoProps) {
  return (
    <img
      src="/kasinta-title.svg"
      alt="Kasinta"
      className={cn(
        sizeClasses[size],
        variant === "inverted" && "brightness-0 invert",
        className
      )}
    />
  );
}
