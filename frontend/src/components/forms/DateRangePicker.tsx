import React from 'react';
import { TextField } from './TextField';

interface DateRangePickerProps {
  label?: string;
  startDate: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  showCurrent?: boolean;
  isCurrent?: boolean;
  onCurrentChange?: (current: boolean) => void;
  error?: string;
}

export function DateRangePicker({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  showCurrent = true,
  isCurrent = false,
  onCurrentChange,
  error
}: DateRangePickerProps) {
  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 7); // YYYY-MM format
  };

  const handleDateChange = (value: string, isStart: boolean) => {
    const formattedDate = value; // Keep as YYYY-MM
    if (isStart) {
      onStartDateChange(formattedDate);
    } else {
      onEndDateChange(formattedDate);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <TextField
          type="month"
          label="Start Date"
          value={formatDateForInput(startDate)}
          onChange={(e) => handleDateChange(e.target.value, true)}
          required
        />
        
        <TextField
          type="month"
          label="End Date"
          value={isCurrent ? '' : formatDateForInput(endDate || '')}
          onChange={(e) => handleDateChange(e.target.value, false)}
          disabled={isCurrent}
          placeholder={isCurrent ? 'Present' : ''}
        />
      </div>

      {showCurrent && (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => onCurrentChange?.(e.target.checked)}
            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
          />
          I currently work here
        </label>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}