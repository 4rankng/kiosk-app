import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, TrendDown01, TrendUp01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface MetricChangeIndicatorProps {
    type: "simple" | "trend" | "modern";
    trend: "positive" | "negative";
    value?: string;
    className?: string;
}

export const MetricChangeIndicator = ({ type, trend, value, className }: MetricChangeIndicatorProps) => {
    const icons = {
        positive: {
            simple: ArrowUp,
            trend: TrendUp01,
            modern: ArrowUpRight,
        },
        negative: {
            simple: ArrowDown,
            trend: TrendDown01,
            modern: ArrowDownRight,
        },
    };

    const Icon = icons[trend][type];

    return (
        <div
            className={cx(
                "flex items-center",
                type === "simple" ? "gap-0.5" : "gap-1",
                type === "modern" && "rounded-md bg-primary py-0.5 pr-2 pl-1.5 shadow-xs ring-1 ring-primary ring-inset",
                className,
            )}
        >
            <Icon
                className={cx(
                    "stroke-[3px] text-fg-success-secondary",
                    type === "modern" ? "size-3" : "size-4",
                    trend === "negative" ? "text-fg-error-secondary" : "text-fg-success-secondary",
                )}
            />
            <span
                className={cx(
                    "text-sm font-medium text-secondary",
                    type === "modern" ? "text-secondary" : trend === "negative" ? "text-error-primary" : "text-success-primary",
                )}
            >
                {value}
            </span>
        </div>
    );
};

