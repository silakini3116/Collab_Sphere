import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineClock, HiOutlineCurrencyDollar, HiPlus, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const InternshipCard = ({ internship }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xl flex-shrink-0">
          {internship.company.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-surface-900">{internship.company}</h3>
          <p className="text-indigo-600 font-medium">{internship.role}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 text-sm text-surface-600 mb-4 pb-4 border-b border-surface-100">
        <div className="flex items-center gap-1">
          <HiOutlineLocationMarker className="w-4 h-4 text-surface-400" />
          {internship.location}
        </div>
        <div className="flex items-center gap-1">
          <HiOutlineClock className="w-4 h-4 text-surface-400" />
          {internship.duration}
        </div>
        <div className="flex items-center gap-1">
          <HiOutlineCurrencyDollar className="w-4 h-4 text-surface-400" />
          <span className={internship.paidOrUnpaid === 'Paid' ? 'text-emerald-600 font-medium' : ''}>
            {internship.paidOrUnpaid}
          </span>
        </div>
      </div>

      <div className={`text-sm text-surface-600 space-y-4 mb-4 ${!expanded && 'line-clamp-3'}`}>
        <div>
          <h4 className="font-bold text-surface-900 mb-1">Experience:</h4>
          <p className="whitespace-pre-wrap">{internship.experience}</p>
        </div>
        
        {expanded && (
          <>
            <div>
              <h4 className="font-bold text-surface-900 mb-1">Selection Process:</h4>
              <p className="whitespace-pre-wrap">{internship.selectionProcess}</p>
            </div>
            
            {internship.interviewQuestions?.length > 0 && (
              <div>
                <h4 className="font-bold text-surface-900 mb-1">Interview Questions:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {internship.interviewQuestions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            )}

            {internship.preparationTips && (
              <div>
                <h4 className="font-bold text-surface-900 mb-1">Preparation Tips:</h4>
                <p className="whitespace-pre-wrap">{internship.preparationTips}</p>
              </div>
            )}
          </>
        )}
      </div>

      <button 
        onClick={() => setExpanded(!expanded)} 
        className="text-indigo-600 text-sm font-semibold flex items-center justify-center gap-1 mt-auto pb-4"
      >
        {expanded ? <>Show Less <HiOutlineChevronUp /></> : <>Read Full Experience <HiOutlineChevronDown /></>}
      </button>

      <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={internship.postedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${internship.postedBy?.name}&background=6366f1&color=fff`} 
            alt="" className="w-8 h-8 rounded-full border border-surface-200" 
          />
          <div>
            <div className="text-sm font-bold text-surface-900">{internship.postedBy?.name}</div>
            <div className="text-xs text-surface-500">{internship.postedBy?.year}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInternships = async () => {
    try {
      setLoading(true);
      let url = '/internships';
      if (search) url += `?search=${search}`;
      
      const res = await api.get(url);
      setInternships(res.data.internships);
    } catch (error) {
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [search]);

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Internship Hub</h1>
          <p className="text-surface-600">Learn from seniors' internship and placement experiences.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn-primary">
            <HiPlus className="w-5 h-5" /> Share Experience
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 mb-8 flex justify-end">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search by company, role, or skills..."
            className="input-field py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="card-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-96 skeleton"></div>
          ))}
        </div>
      ) : internships.length > 0 ? (
        <div className="card-grid">
          {internships.map(internship => (
            <InternshipCard key={internship._id} internship={internship} />
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card">
          <HiOutlineBriefcase />
          <h3 className="text-xl font-bold text-surface-900 mb-2">No experiences found</h3>
          <p>Be the first to share your internship experience!</p>
        </div>
      )}
    </div>
  );
};

export default Internships;
