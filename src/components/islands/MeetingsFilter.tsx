import { Fragment, useState } from 'react';
import type { Meeting, MeetingCode } from '../../data';

interface Props {
  meetings: Meeting[];
  codes: MeetingCode[];
  daysOrder: string[];
}

const isOnline = (m: Meeting) => m.codes?.includes('WB') ?? false;

function fmtLocation(m: Meeting): string {
  const addr = [m.street, [m.city, m.state].filter(Boolean).join(' '), m.zip].filter(Boolean).join(', ');
  return [m.location, addr].filter(Boolean).join(' · ');
}

function fmtZoom(m: Meeting): string | null {
  if (!m.zoom_id) return null;
  return 'ID: ' + m.zoom_id + (m.zoom_passcode ? ' · Passcode: ' + m.zoom_passcode : '');
}

/** Searchable, day-filterable list of every meeting in the District. */
export default function MeetingsFilter({ meetings, codes, daysOrder }: Props) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const activeDays = daysOrder.filter(
    (d) => d === 'All' || d === 'Online Available' || meetings.some((m) => m.day === d),
  );

  const q = search.toLowerCase();
  const visible = meetings.filter((m) => {
    const matchDay = filter === 'All' || (filter === 'Online Available' ? isOnline(m) : m.day === filter);
    const locStr = [m.location, m.street, m.city, m.state].filter(Boolean).join(' ');
    const matchSearch = q === '' || m.name.toLowerCase().includes(q) || locStr.toLowerCase().includes(q);
    return matchDay && matchSearch;
  });

  function renderCodeBadges(m: Meeting) {
    if (!m.codes || !m.codes.length) return null;
    const labels = m.codes.map((c) => codes.find((x) => x.Value === c)?.Label ?? c);
    const lines: string[][] = [];
    for (let i = 0; i < labels.length; i += 2) lines.push(labels.slice(i, i + 2));
    return lines.map((pair, li) => (
      <Fragment key={li}>
        <br />
        {pair.map((label, j) => <span key={j} className="badge badge--online">{label}</span>)}
      </Fragment>
    ));
  }

  return (
    <>
      <div className="filter-bar">
        <input
          className="filter-search"
          type="text"
          placeholder="Search by group name or location…"
          aria-label="Search meetings"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-tags">
          {activeDays.map((d) => (
            <button key={d} type="button" className={`filter-tag${filter === d ? ' active' : ''}`} onClick={() => setFilter(d)}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <p className="meetings-count">Showing {visible.length} of {meetings.length} meetings</p>
      <div className="meetings-list">
        {visible.map((m, i) => {
          const zoom = fmtZoom(m);
          return (
            <div key={i} className="meeting-card">
              <div className="meeting-card__body">
                <div className="meeting-card__name">{m.name}</div>
                <div className="meeting-card__loc">{fmtLocation(m)}</div>
                {m.notes && <div className="meeting-card__note">{m.notes}</div>}
                {zoom && <div className="meeting-card__zoom">📹 {zoom}</div>}
                {m.zoom_url && <div className="meeting-card__zoom-url">{m.zoom_url}</div>}
              </div>
              <div className="meeting-card__meta">
                <span className="badge">{m.day}</span>
                <span className="badge badge--light">{m.time}</span>
                {renderCodeBadges(m)}
                {m.id && <div className="meeting-card__id">ID: {m.id}</div>}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && <div className="meetings-empty">No meetings match your search.</div>}
      </div>
    </>
  );
}
