import * as React from "react";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (date: DateRange | undefined) => void;
  onRefresh?: () => void;
}

export function DatePickerWithRange({
  className,
  onDateChange,
  onRefresh,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(2024, 11, 31),
  });

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onDateChange?.(newDate);
  };

  // Predefined date range functions
  const getToday = () => {
    const today = new Date();
    return { from: today, to: today };
  };

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return { from: yesterday, to: yesterday };
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { from: tomorrow, to: tomorrow };
  };

  const getLast7Days = () => {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);
    return { from: last7Days, to: today };
  };

  const getLast30Days = () => {
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);
    return { from: last30Days, to: today };
  };

  const getThisYear = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    return { from: startOfYear, to: today };
  };

  const getLastYear = () => {
    const today = new Date();
    const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
    return { from: startOfLastYear, to: endOfLastYear };
  };

  const presets = [
    { label: "Today", action: getToday },
    { label: "Yesterday", action: getYesterday },
    { label: "Tomorrow", action: getTomorrow },
    { label: "Last 7 Days", action: getLast7Days },
    { label: "Last 30 Days", action: getLast30Days },
    { label: "This Year", action: getThisYear },
    { label: "Last Year", action: getLastYear },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className={cn("bg-white rounded-[14px] px-4 py-2 shadow-sm border border-slate-100 flex items-center justify-between gap-4 w-fit h-10", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-3 flex-1 text-left cursor-pointer group">
            <CalendarIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            <span className="text-sm font-medium text-slate-900">
              {date?.from && date?.to
                ? `${formatDate(date.from)} - ${formatDate(date.to)}`
                : "Pick a date range"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Predefined Date Shortcuts */}
            <div className="border-r border-slate-200 p-2 space-y-0.5 w-[140px]">
              <div className="text-xs font-medium text-slate-500 mb-2 px-2">Quick Select</div>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm font-normal hover:bg-slate-100"
                  onClick={() => handleDateChange(preset.action())}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Calendar */}
            <div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateChange}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}