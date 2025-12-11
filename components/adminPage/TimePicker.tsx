"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  label: string;
  value: string; // Format: "HH:mm"
  onChange: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function TimePicker({ label, value, onChange, icon: Icon }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [isHourFocused, setIsHourFocused] = useState(false);
  const [isMinuteFocused, setIsMinuteFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHourFirstKey, setIsHourFirstKey] = useState(true);
  const [isMinuteFirstKey, setIsMinuteFirstKey] = useState(true);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

  // Initialize hours and minutes from value - only when NOT editing
  useEffect(() => {
    if (value && !isEditing) {
      const [h, m] = value.split(":");
      setHours(h || "00");
      setMinutes(m || "00");
    }
  }, [value, isEditing]);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const commitChanges = useCallback(() => {
    const paddedHours = hours.padStart(2, "0");
    const paddedMinutes = minutes.padStart(2, "0");
    setHours(paddedHours);
    setMinutes(paddedMinutes);
    onChange(`${paddedHours}:${paddedMinutes}`);
    setIsEditing(false);
  }, [hours, minutes, onChange]);

  const handleHourInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const val = rawValue.replace(/\D/g, "");
    
    setIsEditing(true);
    
    if (val === "") {
      setHours("");
      setIsHourFirstKey(true);
      return;
    }
    
    // If this is the first key press after focus, start fresh with just the new digit
    if (isHourFirstKey) {
      setIsHourFirstKey(false);
      // Take only the last character (the newly typed one)
      const newDigit = val.slice(-1);
      setHours(newDigit);
      return;
    }
    
    // Second digit - combine with existing
    if (hours.length === 1 && val.length >= 1) {
      // Get the new digit (last character typed)
      const existingDigit = hours;
      const newDigit = val.replace(existingDigit, "").slice(-1) || val.slice(-1);
      const combined = existingDigit + newDigit;
      const numVal = parseInt(combined);
      
      if (numVal <= 23) {
        setHours(combined);
        // Auto-move to minutes after valid 2-digit hour
        setTimeout(() => {
          if (minuteInputRef.current) {
            minuteInputRef.current.focus();
          }
        }, 50);
      } else {
        // Invalid hour like "29", start fresh with new digit
        setHours(newDigit);
      }
      return;
    }
    
    // Fallback: just take last 2 digits
    const lastTwo = val.slice(-2);
    if (lastTwo.length <= 2) {
      const numVal = parseInt(lastTwo);
      if (numVal <= 23) {
        setHours(lastTwo);
      }
    }
  };

  const handleMinuteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const val = rawValue.replace(/\D/g, "");
    
    setIsEditing(true);
    
    if (val === "") {
      setMinutes("");
      setIsMinuteFirstKey(true);
      return;
    }
    
    // If this is the first key press after focus, start fresh with just the new digit
    if (isMinuteFirstKey) {
      setIsMinuteFirstKey(false);
      // Take only the last character (the newly typed one)
      const newDigit = val.slice(-1);
      setMinutes(newDigit);
      return;
    }
    
    // Second digit - combine with existing
    if (minutes.length === 1 && val.length >= 1) {
      // Get the new digit (last character typed)
      const existingDigit = minutes;
      const newDigit = val.replace(existingDigit, "").slice(-1) || val.slice(-1);
      const combined = existingDigit + newDigit;
      const numVal = parseInt(combined);
      
      if (numVal <= 59) {
        setMinutes(combined);
      } else {
        // Invalid minute like "65", start fresh with new digit
        setMinutes(newDigit);
      }
      return;
    }
    
    // Fallback: just take last 2 digits
    const lastTwo = val.slice(-2);
    if (lastTwo.length <= 2) {
      const numVal = parseInt(lastTwo);
      if (numVal <= 59) {
        setMinutes(lastTwo);
      }
    }
  };

  const handleHourBlur = () => {
    setIsHourFocused(false);
    setIsHourFirstKey(true);
    // Auto-pad and commit on blur
    const paddedHour = (hours || "0").padStart(2, "0");
    const numVal = parseInt(paddedHour);
    const validHour = numVal > 23 ? "23" : paddedHour;
    setHours(validHour);
    onChange(`${validHour}:${minutes.padStart(2, "0")}`);
    setIsEditing(false);
  };

  const handleMinuteBlur = () => {
    setIsMinuteFocused(false);
    setIsMinuteFirstKey(true);
    // Auto-pad and commit on blur
    const paddedMinute = (minutes || "0").padStart(2, "0");
    const numVal = parseInt(paddedMinute);
    const validMinute = numVal > 59 ? "59" : paddedMinute;
    setMinutes(validMinute);
    onChange(`${hours.padStart(2, "0")}:${validMinute}`);
    setIsEditing(false);
  };

  const incrementHour = () => {
    const currentHour = parseInt(hours) || 0;
    const newHour = (currentHour + 1) % 24;
    const paddedHour = String(newHour).padStart(2, "0");
    setHours(paddedHour);
    onChange(`${paddedHour}:${minutes.padStart(2, "0")}`);
  };

  const decrementHour = () => {
    const currentHour = parseInt(hours) || 0;
    const newHour = (currentHour - 1 + 24) % 24;
    const paddedHour = String(newHour).padStart(2, "0");
    setHours(paddedHour);
    onChange(`${paddedHour}:${minutes.padStart(2, "0")}`);
  };

  const incrementMinute = () => {
    const currentMinute = parseInt(minutes) || 0;
    const newMinute = (currentMinute + 1) % 60;
    const paddedMinute = String(newMinute).padStart(2, "0");
    setMinutes(paddedMinute);
    onChange(`${hours.padStart(2, "0")}:${paddedMinute}`);
  };

  const decrementMinute = () => {
    const currentMinute = parseInt(minutes) || 0;
    const newMinute = (currentMinute - 1 + 60) % 60;
    const paddedMinute = String(newMinute).padStart(2, "0");
    setMinutes(paddedMinute);
    onChange(`${hours.padStart(2, "0")}:${paddedMinute}`);
  };

  const handleOk = () => {
    commitChanges();
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset to original value
    if (value) {
      const [h, m] = value.split(":");
      setHours(h || "00");
      setMinutes(m || "00");
    }
    setIsEditing(false);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value || "00:00"}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
        />
        {Icon && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 min-w-[320px]">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Enter Time
          </h4>

          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Hour Selector */}
            <div className="flex flex-col items-center">
              <button
                onClick={incrementHour}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded transition"
                type="button"
              >
                ▲
              </button>
              <div 
                className={`w-24 h-24 flex items-center justify-center border-2 rounded-lg my-2 transition-colors cursor-text ${
                  isHourFocused ? 'border-orange-500' : 'border-gray-300'
                }`}
                onClick={() => hourInputRef.current?.focus()}
              >
                <input
                  ref={hourInputRef}
                  type="text"
                  inputMode="numeric"
                  value={hours}
                  onChange={handleHourInput}
                  onFocus={(e) => {
                    setIsHourFocused(true);
                    setIsEditing(true);
                    setIsHourFirstKey(true);
                    // Select all text after a small delay
                    setTimeout(() => e.target.select(), 0);
                  }}
                  onBlur={handleHourBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleOk();
                    } else if (e.key === "Tab" && !e.shiftKey) {
                      // Let Tab naturally move to minute input
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      incrementHour();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      decrementHour();
                    }
                  }}
                  className="text-5xl font-bold text-center w-full bg-transparent outline-none"
                  maxLength={2}
                  placeholder="00"
                />
              </div>
              <button
                onClick={decrementHour}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded transition"
                type="button"
              >
                ▼
              </button>
              <span className="text-sm text-gray-500 mt-2">Hour</span>
            </div>

            {/* Colon Separator */}
            <div className="text-5xl font-bold text-gray-800 mb-8">:</div>

            {/* Minute Selector */}
            <div className="flex flex-col items-center">
              <button
                onClick={incrementMinute}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded transition"
                type="button"
              >
                ▲
              </button>
              <div 
                className={`w-24 h-24 flex items-center justify-center border-2 rounded-lg my-2 transition-colors cursor-text ${
                  isMinuteFocused ? 'border-orange-500' : 'border-gray-300'
                }`}
                onClick={() => minuteInputRef.current?.focus()}
              >
                <input
                  ref={minuteInputRef}
                  type="text"
                  inputMode="numeric"
                  value={minutes}
                  onChange={handleMinuteInput}
                  onFocus={(e) => {
                    setIsMinuteFocused(true);
                    setIsEditing(true);
                    setIsMinuteFirstKey(true);
                    // Select all text after a small delay
                    setTimeout(() => e.target.select(), 0);
                  }}
                  onBlur={handleMinuteBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleOk();
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      incrementMinute();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      decrementMinute();
                    }
                  }}
                  className="text-5xl font-bold text-center w-full bg-transparent outline-none"
                  maxLength={2}
                  placeholder="00"
                />
              </div>
              <button
                onClick={decrementMinute}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded transition"
                type="button"
              >
                ▼
              </button>
              <span className="text-sm text-gray-500 mt-2">Minute</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
              type="button"
            >
              CANCEL
            </button>
            <button
              onClick={handleOk}
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded transition"
              type="button"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
