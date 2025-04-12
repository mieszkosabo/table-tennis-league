import { cn } from "@/lib/utils";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?:
    | "normal"
    | "start"
    | "end"
    | "center"
    | "between"
    | "around"
    | "evenly"
    | "stretch";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
}

export const HStack = ({ className, ...props }: StackProps) => (
  <div
    className={cn(
      "flex flex-row items",
      {
        "justify-normal": props.justify === "normal",
        "justify-start": props.justify === "start",
        "justify-end": props.justify === "end",
        "justify-center": props.justify === "center",
        "justify-between": props.justify === "between",
        "justify-around": props.justify === "around",
        "justify-evenly": props.justify === "evenly",
        "justify-stretch": props.justify === "stretch",

        "items-start": props.align === "start",
        "items-end": props.align === "end",
        "items-center": props.align === "center",
        "items-baseline": props.align === "baseline",
        "items-stretch": props.align === "stretch",
      },
      className
    )}
    {...props}
  />
);

export const VStack = ({ className, ...props }: StackProps) => (
  <HStack className={cn("flex-col", className)} {...props} />
);
