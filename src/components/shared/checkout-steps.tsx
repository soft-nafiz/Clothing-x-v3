import { cn } from "@/lib/utils";
import { ShoppingBag, CreditCard, CheckCircle2 } from "lucide-react";

interface Props {
  current: 1 | 2 | 3;
}

/**
 * 3-step visual indicator: Cart → Checkout → Confirmation.
 * Helps customers understand the buying process.
 */
export function CheckoutSteps({ current }: Props) {
  const steps = [
    { n: 1, label: "Cart", icon: ShoppingBag },
    { n: 2, label: "Checkout", icon: CreditCard },
    { n: 3, label: "Done", icon: CheckCircle2 },
  ];

  return (
    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = current === step.n;
        const isDone = current > step.n;
        return (
          <div key={step.n} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition sm:h-10 sm:w-10",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isDone && "border-primary bg-primary/15 text-primary",
                  !isActive && !isDone && "border-border text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider sm:text-xs",
                  isActive ? "text-primary" : isDone ? "text-primary/70" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-16",
                  current > step.n ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
