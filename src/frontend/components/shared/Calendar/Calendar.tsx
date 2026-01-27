import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  SimpleGrid,
  Select,
  Card,
  CardBody,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string | Date;
  endDate?: string | Date;
  type?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface CalendarProps {
  events: CalendarEvent[];
  isLoading?: boolean;
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onNavigate?: (date: Date) => void;
  getEventColor?: (event: CalendarEvent) => string;
  formatEventTitle?: (event: CalendarEvent) => string;
  showControls?: boolean;
  initialDate?: Date;
  headerTitle?: string;
  emptyStateMessage?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  isLoading = false,
  view: controlledView,
  onViewChange,
  onEventClick,
  onDateClick,
  onNavigate,
  getEventColor,
  formatEventTitle,
  showControls = true,
  initialDate,
  headerTitle,
  emptyStateMessage = 'No events scheduled',
}) => {
  const [internalView, setInternalView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  
  const view = controlledView !== undefined ? controlledView : internalView;
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');

  const handleViewChange = (newView: CalendarView) => {
    if (controlledView === undefined) {
      setInternalView(newView);
    }
    onViewChange?.(newView);
  };

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
    onNavigate?.(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onNavigate?.(today);
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

  const getEventColorValue = (event: CalendarEvent): string => {
    if (getEventColor) {
      return getEventColor(event);
    }
    return event.color || 'blue';
  };

  const getEventTitle = (event: CalendarEvent): string => {
    if (formatEventTitle) {
      return formatEventTitle(event);
    }
    return event.title;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDate(currentDate);

    return (
      <VStack align="stretch" spacing={0}>
        {hours.map(hour => {
          const hourEvents = dayEvents.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getHours() === hour;
          });

          return (
            <Box key={hour} borderBottom="1px" borderColor={gridColor} minH="60px" p={2}>
              <HStack align="start" spacing={4}>
                <Text fontSize="sm" color="gray.500" w="60px" flexShrink={0}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
                <VStack align="stretch" spacing={1} flex={1}>
                  {hourEvents.map(event => (
                    <Card
                      key={event.id}
                      size="sm"
                      bg={`${getEventColorValue(event)}.100`}
                      borderLeft="4px"
                      borderColor={`${getEventColorValue(event)}.500`}
                      cursor="pointer"
                      onClick={() => onEventClick?.(event)}
                    >
                      <CardBody p={2}>
                        <Text fontSize="xs" fontWeight="bold">
                          {getEventTitle(event)}
                        </Text>
                        {event.metadata?.contactPerson && (
                          <Text fontSize="xs" color="gray.600">
                            {event.metadata.contactPerson}
                          </Text>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    );
  };

  const renderWeekView = () => {
    const start = getStartDate();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });

    return (
      <SimpleGrid columns={7} spacing={2}>
        {days.map((day, idx) => {
          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <Box 
              key={idx} 
              border="1px" 
              borderColor={gridColor} 
              borderRadius="md" 
              p={2} 
              minH="400px"
              cursor={onDateClick ? 'pointer' : 'default'}
              onClick={() => onDateClick?.(day)}
            >
              <VStack align="stretch" spacing={2}>
                <Text
                  fontSize="sm"
                  fontWeight={isToday ? 'bold' : 'normal'}
                  color={isToday ? 'blue.500' : textColor}
                  textAlign="center"
                >
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight={isToday ? 'bold' : 'normal'}
                  color={isToday ? 'blue.500' : textColor}
                  textAlign="center"
                >
                  {day.getDate()}
                </Text>
                <Box borderTop="1px" borderColor={gridColor} />
                <VStack align="stretch" spacing={1} flex={1}>
                  {dayEvents.map(event => (
                    <Card
                      key={event.id}
                      size="sm"
                      bg={`${getEventColorValue(event)}.100`}
                      borderLeft="3px"
                      borderColor={`${getEventColorValue(event)}.500`}
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <CardBody p={2}>
                        <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                          {getEventTitle(event)}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(event.startDate).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                  {dayEvents.length === 0 && (
                    <Text fontSize="xs" color="gray.400" textAlign="center" py={2}>
                      {emptyStateMessage}
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    );
  };

  const renderMonthView = () => {
    const start = getStartDate();
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = Array.from({ length: 42 }, (_, i) => {
      const day = i - startingDayOfWeek + 1;
      const date = new Date(start.getFullYear(), start.getMonth(), day);
      return { date, day };
    });

    return (
      <SimpleGrid columns={7} spacing={1}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box 
            key={day} 
            p={2} 
            textAlign="center" 
            fontWeight="bold" 
            fontSize="sm" 
            color="gray.600"
          >
            {day}
          </Box>
        ))}
        {days.map(({ date, day }, idx) => {
          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date.getMonth() === start.getMonth();

          return (
            <Box
              key={idx}
              border="1px"
              borderColor={gridColor}
              borderRadius="md"
              p={1}
              minH="100px"
              bg={!isCurrentMonth ? 'gray.50' : cardBg}
              cursor={onDateClick ? 'pointer' : 'default'}
              onClick={() => onDateClick?.(date)}
            >
              <Text
                fontSize="sm"
                fontWeight={isToday ? 'bold' : 'normal'}
                color={isToday ? 'blue.500' : !isCurrentMonth ? 'gray.400' : textColor}
                mb={1}
              >
                {isCurrentMonth ? day : ''}
              </Text>
              <VStack align="stretch" spacing={0.5}>
                {dayEvents.slice(0, 3).map(event => (
                  <Box
                    key={event.id}
                    bg={`${getEventColorValue(event)}.200`}
                    borderRadius="sm"
                    p={0.5}
                    fontSize="xs"
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    title={getEventTitle(event)}
                  >
                    <Text noOfLines={1} fontSize="xs">
                      {new Date(event.startDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </Box>
                ))}
                {dayEvents.length > 3 && (
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    +{dayEvents.length - 3} more
                  </Text>
                )}
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    );
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text color="gray.500" mt={4}>Loading calendar...</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={4}>
      {showControls && (
        <HStack justify="space-between" mb={4}>
          <HStack spacing={2}>
            <IconButton
              aria-label="Previous"
              icon={<FiChevronLeft />}
              onClick={() => navigateDate('prev')}
              size="sm"
            />
            <Button variant="ghost" onClick={goToToday} size="sm">
              Today
            </Button>
            <IconButton
              aria-label="Next"
              icon={<FiChevronRight />}
              onClick={() => navigateDate('next')}
              size="sm"
            />
            <Text fontWeight="semibold" minW="200px" textAlign="center">
              {headerTitle || formatDateRange()}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Select
              value={view}
              onChange={(e) => handleViewChange(e.target.value as CalendarView)}
              w="120px"
              size="sm"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
          </HStack>
        </HStack>
      )}

      <Box>
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </Box>
    </VStack>
  );
};

export default Calendar;

