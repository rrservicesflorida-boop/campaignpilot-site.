import { Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  to = "/",
  tone = "light",
  withSlogan = false,
  className,
}: {
  to?: string;
  tone?: "light" | "dark";
  withSlogan?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="CampaignPilot — página inicial"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground shadow-[0_6px_20px_oklch(0.62_0.19_253_/_0.35)] transition-transform group-hover:-translate-y-0.5">
        <Rocket className="size-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-lg font-bold tracking-tight",
            tone === "dark" ? "text-ink-foreground" : "text-foreground",
          )}
        >
          Campaign<span className="text-brand">Pilot</span>
        </span>
        {withSlogan ? (
          <span
            className={cn(
              "block text-[11px]",
              tone === "dark" ? "text-ink-foreground/70" : "text-muted-foreground",
            )}
          >
            Suas campanhas no piloto certo.
          </span>
        ) : null}
      </span>
    </Link>
  );
}