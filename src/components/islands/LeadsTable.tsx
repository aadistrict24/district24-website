import { MAX_AGE_DAYS, MAX_LEAD_ROWS } from '../../data';
import type { CsvRow } from '../../utils/csv';
import { daysAgo, formatShortDate } from '../../utils/dates';
import { ExtLink } from './ExtLink';
import { useCsv } from './useCsv';

interface Lead {
  date: Date;
  speaker: string;
  topic: string;
  link: string;
}

function toLeads(rows: CsvRow[]): Lead[] {
  return rows
    .map((r) => ({ date: new Date(r.Date), speaker: r.Speaker, topic: r.Topic ?? '', link: r.Link }))
    .filter((r) => !isNaN(r.date.getTime()) && daysAgo(r.date) <= MAX_AGE_DAYS)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_LEAD_ROWS);
}

interface Props {
  /** Published Google Sheet CSV with Date, Speaker, Link (and optionally Topic) columns. */
  csvUrl: string;
  /** Show the Topic column. */
  showTopic?: boolean;
}

/** Upcoming leads/speakers for a group page, read live from a Google Sheet. */
export default function LeadsTable({ csvUrl, showTopic = false }: Props) {
  const leads = useCsv(csvUrl, toLeads);
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr><th>Date</th><th>Speaker</th>{showTopic && <th>Topic</th>}</tr>
        </thead>
        <tbody>
          {leads.map((l, i) => (
            <tr key={i} className={i % 2 === 0 ? 'stripe' : 'white'}>
              <td><strong>{formatShortDate(l.date)}</strong></td>
              <td>{l.link ? <ExtLink href={l.link}>{l.speaker}</ExtLink> : l.speaker}</td>
              {showTopic && <td className="italic text-muted">{l.topic}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
