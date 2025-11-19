import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export const LoadingSpinner = ({ size = "md", className = "" }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
  </div>
);


