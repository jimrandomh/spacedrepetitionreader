import { orderBy } from "lodash";

interface TimezoneInfo {
  name: string
  offsetStr: string
  offset: number
  label: string
}

export function getTimezonesList(): TimezoneInfo[] {
  // Get a list of timezones. Has a ts-ignore because Intl.supportedValuesOf was
  // introduced recently, tsserver doesn't seem to know it exists. If it's been
  // awhile and version numbers have ticked up, this ts-ignore can probably be
  // removed.
  // @ts-ignore
  const timezoneNames: string[] = Intl.supportedValuesOf("timeZone");
  const timezoneDetails = timezoneNames.map(tz => timezoneNameToDetails(tz))
  return orderBy(timezoneDetails, tz=>tz.offset)
}

function timezoneNameToDetails(timeZone: string): TimezoneInfo {
  const shortFormat = new Intl.DateTimeFormat('en', {
    timeZone, timeZoneName: "shortOffset"
  });

  const offsetStr = shortFormat
    .formatToParts()
    .find(part => part.type==='timeZoneName')!
    .value;
  return {
    name: timeZone,
    offset: gmtOffsetStrToNumHours(offsetStr),
    offsetStr,
    label: `${offsetStr} (${timeZone})`,
  }
}

function gmtOffsetStrToNumHours(offsetStr: string): number {
  if (offsetStr === 'GMT') return 0;
  const match = offsetStr.match(/GMT([+-])(\d+)(:\d\d)?/)
  const [_1, signStr, hoursStr, _2, minsStr] = match!
  const sign = (signStr==='-') ? -1 : 1;
  const hours = (hoursStr?.length>0) ? parseInt(hoursStr) : 0;
  const mins = (minsStr?.length>0) ? parseInt(minsStr) : 0;
  
  return sign * (hours + mins/60.0);
}

export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function timezoneNameToUtcOffset(timeZone: string): number {
  return timezoneNameToDetails(timeZone).offset;
}
