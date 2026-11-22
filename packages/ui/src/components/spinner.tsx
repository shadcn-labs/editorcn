import { cn } from "@editorcn/ui/lib/utils";
import { Loader2Icon } from "lucide-react";
import * as React from "react";

const Spinner = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <Loader2Icon
    data-slot="spinner"
    role="status"
    aria-label="Loading"
    className={cn("size-4 animate-spin", className)}
    {...props}
  />
);

export { Spinner };
