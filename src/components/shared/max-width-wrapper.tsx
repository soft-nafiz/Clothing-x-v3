import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Strict MaxWidthWrapper — always max-w-7xl with consistent horizontal padding. */
export function MaxWidthWrapper({ children, className, ...rest }: Props) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...rest}>
      {children}
    </div>
  );
}
