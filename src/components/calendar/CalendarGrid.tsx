import { format, addDays, isSameMonth, isToday } from "date-fns";
import { formatDuration } from "../../utils/dateUtils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type DayData = {
  dots: { color: string; type: "exam" | "event" | "log" }[];
  items: { id: string; title: string; color: string; icon?: string; type: "exam" | "event" | "log" }[];
  totalStudyMinutes?: number;
};

type Props = {
  days: Date[];
  currentMonth: Date;
  selectedDate: string;
  dayData: Record<string, DayData>;
  onSelectDate: (dateStr: string) => void;
};

export function CalendarGrid({ days, currentMonth, selectedDate, dayData, onSelectDate }: Props) {
  return (
    <div className="calendar-grid">
      {DAY_NAMES.map((dn) => (
        <div key={dn} className="calendar-day-header">{dn}</div>
      ))}
      {days.map((day) => (
        <CalendarDay
          key={format(day, "yyyy-MM-dd")}
          day={day}
          currentMonth={currentMonth}
          isSelected={format(day, "yyyy-MM-dd") === selectedDate}
          data={dayData[format(day, "yyyy-MM-dd")]}
          onSelect={onSelectDate}
        />
      ))}
    </div>
  );
}

function CalendarDay({ day, currentMonth, isSelected, data, onSelect }: {
  day: Date;
  currentMonth: Date;
  isSelected: boolean;
  data?: DayData;
  onSelect: (dateStr: string) => void;
}) {
  const dateStr = format(day, "yyyy-MM-dd");
  const className = `calendar-day${!isSameMonth(day, currentMonth) ? " other-month" : ""}${isToday(day) ? " today" : ""}${isSelected ? " selected" : ""}`;

  return (
    <button type="button" className={className} onClick={() => onSelect(dateStr)}>
      <div className="day-header">
        <div className="day-number">
          {isToday(day) ? <span>{format(day, "d")}</span> : format(day, "d")}
        </div>
        {data?.totalStudyMinutes && data.totalStudyMinutes > 0 && (
          <div className="day-study-badge" title="Total study duration today">
            ⏱️ {formatDuration(data.totalStudyMinutes, { formatUnderHourAsMins: true })}
          </div>
        )}
      </div>
      {data && (
        <>
          <div className="day-dots">
            {data.dots.map((dot, i) => (
              <div
                key={`dot-${i}`}
                className="day-dot"
                style={{ background: dot.color, opacity: dot.type === "event" ? 0.75 : 1 }}
              />
            ))}
          </div>
          <div className="calendar-day-items">
            {data.items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className={`calendar-day-item ${item.type}`}
                style={{ background: item.color + "15", color: item.color }}
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-text">{item.title}</span>
              </div>
            ))}
            {data.items.length > 2 && (
              <div className="calendar-day-item-more">+{data.items.length - 2} more</div>
            )}
          </div>
        </>
      )}
    </button>
  );
}

export type { DayData };
