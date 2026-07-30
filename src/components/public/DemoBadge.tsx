import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_NOTICE } from "@/lib/demo";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/15 px-3 py-1 text-xs font-medium text-warning-foreground",
        className,
      )}
    >
      <Info className="size-3.5" aria-hidden="true" />
      {DEMO_NOTICE}
    </p>
  );
}