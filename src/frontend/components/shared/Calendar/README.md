# Shared Calendar Component

A reusable calendar component that can be used across all CRM modules (Transactions, ATS, etc.) to display and manage calendar events.

## Features

- **Multiple Views**: Day, Week, and Month views
- **Date Navigation**: Navigate between dates with prev/next buttons and "Today" button
- **Event Rendering**: Display events with customizable colors and titles
- **Click Handlers**: Support for clicking on events and dates
- **Loading States**: Built-in loading indicator
- **Empty States**: Customizable empty state messages
- **Fully Customizable**: Colors, titles, and behavior can be customized per use case

## Usage

### Basic Example

```tsx
import { Calendar, CalendarEvent } from '@/components/shared/Calendar';

const MyCalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const calendarEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Meeting with Client',
      startDate: new Date('2025-01-15T10:00:00'),
      endDate: new Date('2025-01-15T11:00:00'),
      type: 'meeting',
      color: 'blue',
      metadata: { clientId: '123' },
    },
  ];

  return (
    <Calendar
      events={calendarEvents}
      onEventClick={(event) => console.log('Event clicked:', event)}
      onDateClick={(date) => console.log('Date clicked:', date)}
    />
  );
};
```

### Advanced Example with Custom Colors

```tsx
import { Calendar, CalendarEvent } from '@/components/shared/Calendar';

const TransactionsCalendar = () => {
  const [appointments, setAppointments] = useState([]);

  const getAppointmentColor = (type: string): string => {
    const colors: Record<string, string> = {
      call_back_buyer: 'blue',
      call_back_seller: 'green',
      closing_date_reminder: 'red',
    };
    return colors[type] || 'gray';
  };

  const convertToCalendarEvents = (appointments: any[]): CalendarEvent[] => {
    return appointments.map(apt => ({
      id: apt.id,
      title: apt.title,
      startDate: apt.startDate,
      endDate: apt.endDate,
      type: apt.type,
      color: getAppointmentColor(apt.type),
      metadata: { transactionId: apt.transactionId },
    }));
  };

  return (
    <Calendar
      events={convertToCalendarEvents(appointments)}
      isLoading={isLoading}
      view="week"
      onViewChange={(view) => setView(view)}
      onEventClick={(event) => {
        router.push(`/transactions/${event.metadata.transactionId}`);
      }}
      getEventColor={(event) => event.color || 'blue'}
      formatEventTitle={(event) => {
        const time = new Date(event.startDate).toLocaleTimeString();
        return `${time} - ${event.title}`;
      }}
      emptyStateMessage="No appointments scheduled"
    />
  );
};
```

## Props

### CalendarProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `events` | `CalendarEvent[]` | Yes | `[]` | Array of calendar events to display |
| `isLoading` | `boolean` | No | `false` | Show loading state |
| `view` | `'day' \| 'week' \| 'month'` | No | `'week'` | Current view mode |
| `onViewChange` | `(view: CalendarView) => void` | No | - | Callback when view changes |
| `onEventClick` | `(event: CalendarEvent) => void` | No | - | Callback when event is clicked |
| `onDateClick` | `(date: Date) => void` | No | - | Callback when date is clicked |
| `onNavigate` | `(date: Date) => void` | No | - | Callback when date navigation occurs |
| `getEventColor` | `(event: CalendarEvent) => string` | No | - | Custom function to get event color |
| `formatEventTitle` | `(event: CalendarEvent) => string` | No | - | Custom function to format event title |
| `showControls` | `boolean` | No | `true` | Show navigation controls |
| `initialDate` | `Date` | No | `new Date()` | Initial date to display |
| `headerTitle` | `string` | No | - | Custom header title (overrides date range) |
| `emptyStateMessage` | `string` | No | `'No events scheduled'` | Message to show when no events |

## CalendarEvent Interface

```typescript
interface CalendarEvent {
  id: string;                    // Unique identifier
  title: string;                  // Event title
  startDate: string | Date;      // Start date/time
  endDate?: string | Date;       // End date/time (optional)
  type?: string;                 // Event type (optional)
  color?: string;                // Color name (e.g., 'blue', 'red') (optional)
  metadata?: Record<string, any>; // Additional data (optional)
}
```

## useCalendar Hook

For more advanced date management, you can use the `useCalendar` hook:

```tsx
import { useCalendar } from '@/components/shared/Calendar/useCalendar';

const MyComponent = () => {
  const {
    currentDate,
    view,
    setView,
    navigateDate,
    goToToday,
    getStartDate,
    getEndDate,
    formatDateRange,
    filteredEvents,
  } = useCalendar(events, {
    initialView: 'week',
    initialDate: new Date(),
  });

  // Use the hook's utilities
  useEffect(() => {
    const start = getStartDate();
    const end = getEndDate();
    loadEvents(start, end);
  }, [currentDate, view]);
};
```

## Examples in Codebase

- **Transactions Calendar**: `/pages/transactions/calendar.tsx`
- **ATS Interviews Calendar**: `/pages/ats/interviews/calendar.tsx`

## Color System

The component uses Chakra UI's color system. Colors should be specified as color names (e.g., 'blue', 'red', 'green') which will be used with Chakra's color scale (e.g., `blue.100`, `blue.500`).

Available color names: `blue`, `green`, `red`, `yellow`, `purple`, `orange`, `pink`, `cyan`, `teal`, `gray`, etc.

## Notes

- The component is fully responsive and works on all screen sizes
- Events are automatically filtered based on the current view and date range
- The component handles timezone conversions automatically
- All date operations use native JavaScript Date objects

