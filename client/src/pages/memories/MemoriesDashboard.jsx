import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  HiArrowLeft, HiOutlinePhotograph, HiOutlineCalendar,
  HiOutlineUsers, HiPlus
} from 'react-icons/hi';
import memoriesAPI from '../../api/memories';
import { useAuth } from '../../context/AuthContext';
import MonthCard from '../../components/memories/MonthCard';
import AdminEventModal from '../../components/memories/AdminEventModal';

const YEARS = [2026, 2025, 2024, 2023];

export default function MemoriesDashboard() {
  const { year } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const isAdmin = user && ['admin', 'teacher'].includes(user.role);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await memoriesAPI.getYearData(year);
      setData(res.data);
    } catch {
      toast.error('Failed to load memories for ' + year);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year]);

  const totalPhotos = data?.months?.reduce((s, m) => s + m.photoCount, 0) || 0;
  const totalEvents = data?.months?.reduce((s, m) => s + m.events.length, 0) || 0;
  const totalContributors = data?.months?.reduce((s, m) => s + m.contributorCount, 0) || 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-50)' }}>
      {/* Header */}
      <div
        className="text-white py-12 px-4"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 60%, #5b21b6 100%)' }}
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/memories')}
            className="flex items-center gap-2 mb-5 text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            <HiArrowLeft className="w-4 h-4" /> Back to Years
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h1 className="font-black mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                📸 {year} Memories
              </h1>
              <div className="flex flex-wrap gap-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <span className="flex items-center gap-2 text-sm">
                  <HiOutlinePhotograph className="w-4 h-4" /> {totalPhotos} Photos
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <HiOutlineCalendar className="w-4 h-4" /> {totalEvents} Events
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <HiOutlineUsers className="w-4 h-4" /> {totalContributors} Contributors
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Year tabs */}
              {YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => navigate(`/memories/${y}`)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: y.toString() === year ? '#fff' : 'rgba(255,255,255,0.2)',
                    color: y.toString() === year ? '#4338ca' : '#fff',
                  }}
                >
                  {y}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: '#fff', color: '#4338ca', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                >
                  <HiPlus className="w-4 h-4" /> Add Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Month Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl skeleton" style={{ height: '220px' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(data?.months || []).map((monthData) => (
              <MonthCard
                key={monthData.month}
                monthData={monthData}
                year={year}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateEvent && (
        <AdminEventModal
          defaultYear={parseInt(year)}
          onClose={() => setShowCreateEvent(false)}
          onSuccess={() => { setShowCreateEvent(false); fetchData(); }}
        />
      )}
    </div>
  );
}
