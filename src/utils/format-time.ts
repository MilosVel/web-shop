import {
  addMinutes,
  differenceInMinutes,
  format,
  parse,
  parseISO,
  startOfDay,
} from 'date-fns';

import type { SelectOption } from '@/types';

export function convertTimeToMinutes(time: string) {
  const parsedTime = parse(time, 'h:mm a', new Date());
  return differenceInMinutes(parsedTime, startOfDay(parsedTime));
}

export function convertMinutesToTime(minutes: number) {
  const time = addMinutes(startOfDay(new Date()), minutes);
  return format(time, 'h:mm a');
}

export function generateTimeOptions(interval: number) {
  const times: SelectOption[] = [];
  const totalMinutesInDay = 24 * 60;

  for (let i = 0; i <= totalMinutesInDay; i += interval) {
    const time = convertMinutesToTime(i);
    times.push({ label: time, value: time });
  }

  return times;
}

export function get12HoursTime(time24: string) {
  const parsedTime = parse(time24, 'HH:mm', new Date());
  return format(parsedTime, 'h:mm a');
}

export function generateTimeOptionsExcludingUnavailable(
  interval: number,
  unavailableTimeSlots: { startTime: string; endTime: string }[],
) {
  const times: SelectOption[] = [];
  const totalMinutesInDay = 24 * 60;

  const busySlots = unavailableTimeSlots.map((slot) => ({
    start: convertTimeToMinutes(get12HoursTime(slot.startTime)),
    end: convertTimeToMinutes(get12HoursTime(slot.endTime)),
  }));

  for (let i = 0; i <= totalMinutesInDay; i += interval) {
    const time = convertMinutesToTime(i);
    const isBusy = busySlots.some((slot) => i >= slot.start && i <= slot.end);
    times.push({ label: time, value: time, unavailable: isBusy });
  }

  return times;
}

export function checkIsTimeRangeValid(
  startTime: string,
  endTime: string,
  unavailableTimeSlots: { startTime: string; endTime: string }[],
) {
  if (!startTime || !endTime) return true;

  const startInMinutes = convertTimeToMinutes(startTime);
  const endInMinutes = convertTimeToMinutes(endTime);

  return !unavailableTimeSlots.some((slot) => {
    const slotStartInMinutes = convertTimeToMinutes(
      get12HoursTime(slot.startTime),
    );
    const slotEndInMinutes = convertTimeToMinutes(get12HoursTime(slot.endTime));

    return (
      startInMinutes < slotEndInMinutes && endInMinutes > slotStartInMinutes
    );
  });
}

export function formatMinutesInFullTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes * 60) % 60);

  const fullTime: string[] = [];

  if (hours > 0) fullTime.push(`${hours}h`);
  if (minutes > 0) fullTime.push(`${minutes}min`);
  if (seconds > 0) fullTime.push(`${seconds}s`);

  return {
    hours,
    minutes,
    seconds,
    fullTime: fullTime.join(' '),
  };
}

export function formatTimeValue(
  minutes: number | undefined,
  defaultText = 'Not set',
) {
  if (minutes === undefined || minutes === null) {
    return defaultText;
  }

  if (minutes === 0) {
    return '0 min';
  }

  return formatMinutesInFullTime(minutes).fullTime;
}

export function generateHoursOptions(min = 1, max = 14) {
  const options = [];
  for (let i = min; i <= max; i++) {
    options.push({
      value: i.toString(),
      label: `${i.toString()} ${i < 2 ? 'hour' : 'hours'}`,
    });
  }
  return options;
}

export function generateMinutesOptions(interval = 15, fullHour = false) {
  const options = [];
  const minutesToCompare = fullHour ? 61 : 60;

  for (let i = 0; i < minutesToCompare; i += interval) {
    options.push({
      value: i.toString(),
      label: `${i.toString()} minutes`,
    });
  }
  return options;
}

export function formatDecimalHoursToFullTime(decimalHours: number) {
  const totalMinutes = decimalHours * 60;
  return formatMinutesInFullTime(totalMinutes);
}

export function calculateHoursDifference(
  startDateISOString: string,
  endDateISOString: string,
) {
  const startDate = parseISO(startDateISOString);
  const endDate = parseISO(endDateISOString);

  const totalMinutes = differenceInMinutes(endDate, startDate);

  return totalMinutes / 60;
}

export function parseTimeToComponents(timeValue: string) {
  if (!timeValue) {
    return { hour: '', minute: '', period: '' };
  }

  const parsedTime = parse(timeValue, 'h:mm a', new Date());

  return {
    hour: format(parsedTime, 'h'),
    minute: format(parsedTime, 'mm'),
    period: format(parsedTime, 'a'),
  };
}

export function combineTimeComponents(
  hour: string,
  minute: string,
  period: string,
): string {
  if (!hour || !minute || !period) {
    return '';
  }

  const timeString = `${hour}:${minute} ${period}`;
  const parsedTime = parse(timeString, 'h:mm a', new Date());

  return format(parsedTime, 'h:mm a');
}
