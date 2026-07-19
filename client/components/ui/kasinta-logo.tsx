import Image from "next/image";
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
    <Image
      src="/kasinta-title.svg"
      alt="Kasinta"
      width={478}
      height={117}
      className={cn(
        "w-auto",
        sizeClasses[size],
        variant === "inverted" && "brightness-0 invert",
        className
      )}
    />
  );
}
