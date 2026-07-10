import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  const baseClasses = "bg-white border-2 border-border rounded-lg p-6";
  const hoverClasses = onClick ? "cursor-pointer hover:border-accent transition-colors" : "";

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
