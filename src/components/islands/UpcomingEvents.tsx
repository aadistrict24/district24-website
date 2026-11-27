import { DISTRICT_24_EVENTS_URL } from '../../data';
import type { CsvRow } from '../../utils/csv';
import { formatEventDate, parseEventDate } from '../../utils/dates';
import { ExtLink } from './ExtLink';
import { useCsv } from './useCsv';

interface EventRow {
  isoDate: string;
  isoEndDate: string | null;
  label: string;
  link: string | null;
}

function toEvents(rows: CsvRow[]): EventRow[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 2);
  return rows
    .map((r) => ({ isoDate: r.Date, isoEndDate: r.EndDate || null, label: r.Label, link: r.Link || null }))
    .filter((ev) => {
      if (!ev.isoDate) return false;
      const endRef = parseEventDate(ev.isoEndDate || ev.isoDate);
      return !isNaN(endRef.getTime()) && endRef >= cutoff;
    })
    .sort((a, b) => parseEventDate(a.isoDate).getTime() - parseEventDate(b.isoDate).getTime());
}

export default function UpcomingEvents() {
  const events = useCsv(DISTRICT_24_EVENTS_URL, toEvents);
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr><th>Date</th><th>Event</th></tr>
        </thead>
        <tbody>
          {events.map((ev, i) => (
            <tr key={i} className={i % 2 === 0 ? 'stripe' : 'white'}>
              <td>{formatEventDate(ev.isoDate, ev.isoEndDate)}</td>
              <td className="text-muted text-sm">
                {ev.link ? <ExtLink href={ev.link}>{ev.label}</ExtLink> : <span>{ev.label}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
