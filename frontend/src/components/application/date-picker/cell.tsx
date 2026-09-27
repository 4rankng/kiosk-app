import { getDayOfWeek, getLocalTimeZone, isToday } from "@internationalized/date";
import type { CalendarCellProps as AriaCalendarCellProps } from "react-aria-components";
import { CalendarCell as AriaCalendarCell, RangeCalendarContext, useLocale, useSlottedContext } from "react-aria-components";
import { cx } from "@/utils/cx";

interface CalendarCellProps extends AriaCalendarCellProps {
    /** Whether the calendar is a range calendar. */
    isRangeCalendar?: boolean;
    /** Whether the cell is highlighted. */
    isHighlighted?: boolean;
    /** Whether to show out of range dates. */
    showOutOfRangeDates?: boolean;
}

/** Derived per-day state shared by the cell class/content renderers. */
const useCellState = (date: CalendarCellProps["date"]) => {
    const { locale } = useLocale();
    const dayOfWeek = getDayOfWeek(date, locale);
    const rangeCalendarContext = useSlottedContext(RangeCalendarContext);

    const isRangeCalendar = !!rangeCalendarContext;

    const start = rangeCalendarContext?.value?.start;
    const end = rangeCalendarContext?.value?.end;

    const isAfterStart = start ? date.compare(start) > 0 : true;
    const isBeforeEnd = end ? date.compare(end) < 0 : true;

    const isAfterOrOnStart = start && date.compare(start) >= 0;
    const isBeforeOrOnEnd = end && date.compare(end) <= 0;
    const isInRange = isAfterOrOnStart && isBeforeOrOnEnd;

    const lastDayOfMonth = new Date(date.year, date.month, 0).getDate();
    const isLastDayOfMonth = date.day === lastDayOfMonth;
    const isFirstDayOfMonth = date.day === 1;

    const isTodayDate = isToday(date, getLocalTimeZone());

    return { dayOfWeek, isRangeCalendar, isAfterStart, isBeforeEnd, isInRange, isLastDayOfMonth, isFirstDayOfMonth, isTodayDate };
};

interface CellRenderState {
    isDisabled?: boolean;
    isFocusVisible?: boolean;
    isSelectionStart?: boolean;
    isSelectionEnd?: boolean;
    isSelected?: boolean;
    isOutsideMonth?: boolean;
}

const getCellClassName = (state: ReturnType<typeof useCellState>, showOutOfRangeDates: boolean) =>
    ({ isDisabled, isFocusVisible, isSelectionStart, isSelectionEnd, isSelected, isOutsideMonth }: CellRenderState) => {
        const isRoundedLeft = isSelectionStart || state.dayOfWeek === 0;
        const isRoundedRight = isSelectionEnd || state.dayOfWeek === 6;

        return cx(
            "relative size-10 focus:outline-hidden",
            isRoundedLeft && "rounded-l-full",
            isRoundedRight && "rounded-r-full",
            state.isInRange && isDisabled && "bg-secondary",
            isSelected && state.isRangeCalendar && "bg-secondary",
            isDisabled ? "pointer-events-none" : "cursor-pointer",
            isFocusVisible ? "z-10" : "z-0",
            isOutsideMonth && "opacity-50",
            state.isRangeCalendar && isOutsideMonth && !showOutOfRangeDates && "hidden",

            // Show gradient on last day of month if it's within the selected range.
            state.isLastDayOfMonth &&
                isSelected &&
                state.isBeforeEnd &&
                state.isRangeCalendar &&
                "after:absolute after:inset-0 after:translate-x-full after:bg-gradient-to-l after:from-transparent after:to-bg-secondary in-[[role=gridcell]:last-child]:after:hidden",

            // Show gradient on first day of month if it's within the selected range.
            state.isFirstDayOfMonth &&
                isSelected &&
                state.isAfterStart &&
                state.isRangeCalendar &&
                "after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:to-bg-secondary in-[[role=gridcell]:first-child]:after:hidden",
        );
    };

interface CellContentState extends CellRenderState {
    formattedDate?: string | null;
}

const getCellContent = (state: ReturnType<typeof useCellState>, isHighlighted?: boolean) =>
    ({ isDisabled, isFocusVisible, isSelectionStart, isSelectionEnd, isSelected, formattedDate }: CellContentState) => {
        const markedAsSelected = isSelectionStart || isSelectionEnd || (isSelected && !isDisabled && !state.isRangeCalendar);

        return (
            <div
                className={cx(
                    "relative flex size-full items-center justify-center rounded-full text-sm text-secondary hover:text-secondary_hover",
                    // Disabled state.
                    isDisabled && "text-secondary/50",
                    // Focus ring, visible while the cell has keyboard focus.
                    isFocusVisible ? "outline-2 outline-offset-2 outline-focus-ring" : "",
                    // Hover state for cells in the middle of the range.
                    isSelected && !isDisabled && state.isRangeCalendar ? "font-medium" : "",
                    markedAsSelected && "bg-brand-solid font-medium text-white hover:bg-brand-solid_hover hover:text-white",
                    // Hover state for non-selected cells.
                    !isSelected && !isDisabled ? "hover:bg-primary_hover hover:font-medium!" : "",
                    !isSelected && state.isTodayDate ? "bg-secondary font-medium hover:bg-secondary_hover" : "",
                )}
            >
                {formattedDate}

                {(isHighlighted || state.isTodayDate) && (
                    <div
                        className={cx(
                            "absolute bottom-1 left-1/2 size-1.25 -translate-x-1/2 rounded-full",
                            markedAsSelected ? "bg-fg-white" : "bg-fg-brand-primary",
                            isDisabled && "opacity-50",
                        )}
                    />
                )}
            </div>
        );
    };

export const CalendarCell = ({ date, isHighlighted, showOutOfRangeDates = false, ...props }: CalendarCellProps) => {
    const state = useCellState(date);

    return (
        <AriaCalendarCell {...props} date={date} className={getCellClassName(state, showOutOfRangeDates)}>
            {getCellContent(state, isHighlighted)}
        </AriaCalendarCell>
    );
};
