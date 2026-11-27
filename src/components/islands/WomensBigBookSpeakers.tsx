import { MAX_AGE_DAYS, MONDAY_WOMENS_BIG_BOOK_URL } from '../../data';
import type { CsvRow } from '../../utils/csv';
import { MONTH_NAMES, daysAgo } from '../../utils/dates';
import { ExtLink } from './ExtLink';
import { useCsv } from './useCsv';

interface Speaker {
  date: Date;
  description: string;
  link: string;
  label: string;
}

function toSpeakers(rows: CsvRow[]): Speaker[] {
  return rows
    .map((r) => {
      const date = new Date(r.Date);
      const exact = /^true$/i.test(r.ExactDate ?? '');
      return {
        date,
        description: r.Description,
        link: r.Link,
        label: exact ? `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}` : MONTH_NAMES[date.getMonth()],
      };
    })
    .filter((r) => !isNaN(r.date.getTime()) && daysAgo(r.date) <= MAX_AGE_DAYS)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export default function WomensBigBookSpeakers() {
  const speakers = useCsv(MONDAY_WOMENS_BIG_BOOK_URL, toSpeakers);
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr><th>Date</th><th>Description</th></tr>
        </thead>
        <tbody>
          {speakers.map((s, i) => (
            <tr key={i} className={i % 2 === 0 ? 'stripe' : 'white'}>
              <td><strong>{s.label}</strong></td>
              <td>{s.link ? <ExtLink href={s.link}>{s.description}</ExtLink> : s.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
