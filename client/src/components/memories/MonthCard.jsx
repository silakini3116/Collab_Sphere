import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePhotograph, HiOutlineUsers, HiOutlineClock,
  HiOutlineCalendar, HiArrowRight
} from 'react-icons/hi';

const MONTH_COLORS = [
  { bg: 'linear-gradient(135deg,#3b82f6,#06b6d4)', accent: '#3b82f6' },
  { bg: 'linear-gradient(135deg,#6366f1,#3b82f6)', accent: '#6366f1' },
  { bg: 'linear-gradient(135deg,#8b5cf6,#6366f1)', accent: '#8b5cf6' },
  { bg: 'linear-gradient(135deg,#ec4899,#a855f7)', accent: '#ec4899' },
  { bg: 'linear-gradient(135deg,#f97316,#eab308)', accent: '#f97316' },
  { bg: 'linear-gradient(135deg,#10b981,#14b8a6)', accent: '#10b981' },
  { bg: 'linear-gradient(135deg,#06b6d4,#6366f1)', accent: '#06b6d4' },
  { bg: 'linear-gradient(135deg,#3b82f6,#06b6d4)', accent: '#0ea5e9' },
  { bg: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', accent: '#7c3aed' },
  { bg: 'linear-gradient(135deg,#db2777,#ec4899)', accent: '#db2777' },
  { bg: 'linear-gradient(135deg,#e11d48,#db2777)', accent: '#e11d48' },
  { bg: 'linear-gradient(135deg,#d97706,#f97316)', accent: '#d97706' },
];

function timeAgo(date) {
  if (!date) return null;
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function MonthCard({ monthData, year }) {
  const navigate = useNavigate();
  const { month, monthName, events, photoCount, contributorCount, lastUpdated } = monthData;
  const hasEvents = events && events.length > 0;
  const color = MONTH_COLORS[(month - 1) % MONTH_COLORS.length];

  return (
    <div
      className="glass-card overflow-hidden flex flex-col animate-fadeIn"
      style={{ transition: 'box-shadow 0.3s ease, transform 0.3s ease' }}
    >
      {/* Month header */}
      <div className="p-4 text-white relative overflow-hidden" style={{ background: color.bg }}>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
          style={{ background: '#fff', transform: 'translate(30%, -30%)' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">{monthName}</h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{year}</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <HiOutlineCalendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        {hasEvents ? (
          <>
            <div className="space-y-1 flex-grow mb-4">
              {events.map((event) => (
                <button
                  key={event._id}
                  onClick={() => navigate(`/memories/events/${event._id}`)}
                  className="w-full text-left flex items-center gap-2 p-2 rounded-lg group"
                  style={{ transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color.accent }} />
                  <span
                    className="text-sm font-medium line-clamp-1 flex-grow"
                    style={{ color: 'var(--color-surface-800)', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.style.color = 'var(--color-primary-600)'}
                    onMouseLeave={e => e.style.color = 'var(--color-surface-800)'}
                  >
                    {event.title}
                  </span>
                  <HiArrowRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    style={{ color: 'var(--color-primary-400)', transition: 'opacity 0.2s' }} />
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="pt-3" style={{ borderTop: '1px solid var(--color-surface-100)' }}>
              <div className="flex items-center justify-between text-xs mb-3"
                style={{ color: 'var(--color-surface-700)' }}>
                <span className="flex items-center gap-1">
                  <HiOutlinePhotograph className="w-3.5 h-3.5" /> {photoCount} photos
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineUsers className="w-3.5 h-3.5" /> {contributorCount} contributors
                </span>
              </div>
              {lastUpdated && (
                <p className="text-xs mb-3 flex items-center gap-1"
                  style={{ color: 'var(--color-surface-700)' }}>
                  <HiOutlineClock className="w-3 h-3" /> Updated {timeAgo(lastUpdated)}
                </p>
              )}
              <button
                onClick={() => navigate(`/memories/${year}/${month}`)}
                className="btn-primary w-full justify-center"
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
              >
                Open Gallery
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
            <HiOutlineCalendar className="w-10 h-10 mb-2" style={{ color: 'var(--color-surface-200)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-surface-700)' }}>No Events</p>
            <p className="text-xs" style={{ color: 'var(--color-surface-700)', opacity: 0.6 }}>
              Nothing scheduled this month
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
