import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
export type InputProps = React.ComponentProps<typeof Input>;

export const MandatoryInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <Input
        className={cn(
          {
            "bg-yellow-100 focus-visible:ring-yellow-400": !value,
          },
          className
        )}
        ref={ref}
        value={value}
        {...props}
      />
    );
  }
);
MandatoryInput.displayName = "Input";
