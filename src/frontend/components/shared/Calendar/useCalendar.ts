import { useState, useMemo } from 'react';
import { CalendarEvent, CalendarView } from './Calendar';

export interface UseCalendarOptions {
  initialView?: CalendarView;
  initialDate?: Date;
}

export interface UseCalendarReturn {
  currentDate: Date;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  navigateDate: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
  getStartDate: () => Date;
  getEndDate: () => Date;
  formatDateRange: () => string;
  filteredEvents: CalendarEvent[];
}

export const useCalendar = (
  events: CalendarEvent[],
  options: UseCalendarOptions = {}
): UseCalendarReturn => {
  const { initialView = 'week', initialDate } = options;
  const [view, setView] = useState<CalendarView>(initialView);
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());

  const getStartDate = (): Date => {
    const date = new Date(currentDate);
    if (view === 'day') {
      date.setHours(0, 0, 0, 0);
    } else if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
    } else {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    return date;
  };

  const getEndDate = (): Date => {
    const date = new Date(currentDate);
    if (view === 'day') {
      date.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() + (6 - day));
      date.setHours(23, 59, 59, 999);
    } else {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
    }
    return date;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateRange = (): string => {
    const start = getStartDate();
    const end = getEndDate();
    
    if (view === 'day') {
      return start.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (view === 'week') {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const filteredEvents = useMemo(() => {
    const start = getStartDate();
    const end = getEndDate();
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= start && eventDate <= end;
    });
  }, [events, currentDate, view]);

  return {
    currentDate,
    view,
    setView,
    setCurrentDate,
    navigateDate,
    goToToday,
    getStartDate,
    getEndDate,
    formatDateRange,
    filteredEvents,
  };
};

