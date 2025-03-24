import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`font-bold text-primary ${className}`}>
      {"🍔"}
    </div>
  );
}; 