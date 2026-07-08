import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  HiOutlinePhotograph, HiOutlineCalendar, HiOutlineUsers,
  HiOutlineSparkles, HiArrowRight, HiOutlineCollection,
  HiCamera
} from 'react-icons/hi';
import memoriesAPI from '../../api/memories';

const YEAR_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-indigo-600 to-purple-700',
  'from-violet-600 to-pink-600',
  'from-rose-500 to-orange-500',
];

const YEAR_COVER_SEEDS = ['2026ece', '2025ece', '2024ece', '2023ece'];

export default function MemoriesLanding() {
  const navigate = useNavigate();
  const [years, setYears] = useState([2026, 2025, 2024, 2023]);
  const [yearStats, setYearStats] = useState({});
  const [trendingPhotos, setTrendingPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const yearsRes = await memoriesAPI.getYears();
        const fetchedYears = yearsRes.data.years || [2026, 2025, 2024, 2023];
        setYears(fetchedYears);

        const stats = {};
        await Promise.all(
          fetchedYears.map(async (y) => {
            try {
              const res = await memoriesAPI.getYearData(y);
              const months = res.data.months || [];
              stats[y] = {
                eventCount: months.reduce((s, m) => s + m.events.length, 0),
                photoCount: months.reduce((s, m) => s + m.photoCount, 0),
                contributorCount: Math.max(...months.map(m => m.contributorCount), 0),
              };
            } catch {
              stats[y] = { eventCount: 0, photoCount: 0, contributorCount: 0 };
            }
          })
        );
        setYearStats(stats);

        try {
          const trendRes = await memoriesAPI.getTrending();
          setTrendingPhotos(trendRes.data.photos || []);
        } catch { /* optional */ }
      } catch {
        toast.error('Failed to load memories');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totals = Object.values(yearStats).reduce(
    (acc, s) => ({
      photos: acc.photos + (s.photoCount || 0),
      events: acc.events + (s.eventCount || 0),
    }),
    { photos: 0, events: 0 }
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-50)' }}>
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden text-white py-28 px-4"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 40%, #7c3aed 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <HiCamera className="w-4 h-4" />
            ECE Department · Photo Memories
          </div>

          <h1 className="font-black mb-4 leading-tight" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}>
            <span style={{ background: 'linear-gradient(90deg, #fde68a, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Memories
            </span>{' '}
            that Last
          </h1>
          <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Preserving the moments that define our journey — workshops, fests, friendships, and milestones.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { icon: HiOutlinePhotograph, label: 'Photos', value: loading ? '—' : totals.photos.toLocaleString() },
              { icon: HiOutlineCalendar, label: 'Events', value: loading ? '—' : totals.events.toLocaleString() },
              { icon: HiOutlineCollection, label: 'Years', value: years.length },
              { icon: HiOutlineSparkles, label: 'Memories', value: '∞' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="text-4xl font-black mb-1">{value}</div>
                <div className="text-sm flex items-center gap-1 justify-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Year Cards ── */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-surface-900)' }}>
            Select Academic Year
          </h2>
          <p style={{ color: 'var(--color-surface-700)' }}>Dive into the memories of each academic year</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {years.map((year, idx) => {
            const stats = yearStats[year] || {};
            return (
              <button
                key={year}
                onClick={() => navigate(`/memories/${year}`)}
                className={`relative overflow-hidden rounded-2xl text-white text-left group shadow-lg`}
                style={{
                  background: `linear-gradient(135deg, ${['#2563eb,#4f46e5', '#4f46e5,#7c3aed', '#7c3aed,#db2777', '#db2777,#ea580c'][idx % 4]})`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04) translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Background image */}
                <img
                  src={`https://picsum.photos/seed/${YEAR_COVER_SEEDS[idx % 4]}/400/300`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.12 }}
                />
                <div className="relative p-8">
                  <div className="text-7xl font-black mb-4" style={{ opacity: 0.95, lineHeight: 1 }}>{year}</div>
                  <div className="space-y-1 text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {loading ? (
                      <>
                        <div className="h-3 rounded w-24 animate-pulse" style={{ background: 'rgba(255,255,255,0.2)' }} />
                        <div className="h-3 rounded w-16 animate-pulse" style={{ background: 'rgba(255,255,255,0.2)' }} />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <HiOutlineCalendar className="w-3.5 h-3.5" />
                          {stats.eventCount || 0} events
                        </div>
                        <div className="flex items-center gap-1.5">
                          <HiOutlinePhotograph className="w-3.5 h-3.5" />
                          {stats.photoCount || 0} photos
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    Explore Memories
                    <HiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Trending ── */}
      {trendingPhotos.length > 0 && (
        <div className="py-16 border-t" style={{ background: '#fff', borderColor: 'var(--color-surface-200)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f8' }}>
                <HiOutlineSparkles className="w-5 h-5" style={{ color: '#db2777' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-surface-900)' }}>Trending This Month</h2>
                <p className="text-sm" style={{ color: 'var(--color-surface-700)' }}>Most loved moments across the department</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {trendingPhotos.slice(0, 6).map((photo, i) => (
                <div
                  key={photo._id || i}
                  className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer shadow-md"
                  style={{ transition: 'transform 0.3s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || ''}
                    className="w-full h-full object-cover"
                    style={{ transition: 'transform 0.5s ease' }}
                  />
                  <div
                    className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)', transition: 'opacity 0.3s' }}
                  >
                    <span className="text-white text-xs font-medium line-clamp-2">{photo.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Footer tagline ── */}
      <div className="py-12 text-center" style={{ color: 'var(--color-surface-700)' }}>
        <HiOutlineUsers className="w-8 h-8 mx-auto mb-3 opacity-40" />
        <p className="font-medium">Every photo tells a story. Every story is a memory. 🎓</p>
      </div>
    </div>
  );
}
