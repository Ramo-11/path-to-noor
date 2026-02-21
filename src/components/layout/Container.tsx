interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const maxWidths = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[90rem]",
};

export function Container({ children, size = "lg", className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${maxWidths[size]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
