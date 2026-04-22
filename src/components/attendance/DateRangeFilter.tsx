import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DatePreset = "today" | "week" | "month" | "custom";

export interface DateFilterValue {
  preset: DatePreset;
  range?: DateRange;
}

interface DateRangeFilterProps {
  value: DateFilterValue;
  onChange: (v: DateFilterValue) => void;
}

const presetLabel: Record<DatePreset, string> = {
  today: "今天",
  week: "本周",
  month: "本月",
  custom: "自定义",
};

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const handlePresetChange = (p: DatePreset) => {
    if (p === "custom") {
      onChange({ preset: "custom", range: value.range });
      setOpen(true);
    } else {
      onChange({ preset: p, range: undefined });
    }
  };

  const customLabel =
    value.preset === "custom" && value.range?.from
      ? value.range.to
        ? `${format(value.range.from, "MM-dd")} ~ ${format(value.range.to, "MM-dd")}`
        : format(value.range.from, "MM-dd")
      : "选择日期";

  return (
    <div className="flex items-center gap-2">
      <Select value={value.preset} onValueChange={(v) => handlePresetChange(v as DatePreset)}>
        <SelectTrigger className="h-9 w-28">
          <SelectValue placeholder="时间范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">{presetLabel.today}</SelectItem>
          <SelectItem value="week">{presetLabel.week}</SelectItem>
          <SelectItem value="month">{presetLabel.month}</SelectItem>
          <SelectItem value="custom">{presetLabel.custom}</SelectItem>
        </SelectContent>
      </Select>

      {value.preset === "custom" && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 justify-start gap-2 font-normal",
                !value.range?.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {customLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={value.range}
              onSelect={(range) => onChange({ preset: "custom", range })}
              numberOfMonths={2}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
