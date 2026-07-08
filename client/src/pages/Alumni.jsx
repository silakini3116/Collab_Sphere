import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineAcademicCap, HiOutlineMail, HiLink, HiPlus } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const AlumniCard = ({ alumni }) => (
  <div className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 group">
    <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
    <div className="px-6 pb-6 relative">
      <div className="flex justify-between items-start -mt-12 mb-4">
        <img
          src={alumni.photo || `https://ui-avatars.com/api/?name=${alumni.name}&background=fff&color=4f46e5`}
          alt={alumni.name}
          className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover"
        />
        <span className="mt-14 badge bg-indigo-100 text-indigo-700 border border-indigo-200">
          Batch {alumni.batch}
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-surface-900">{alumni.name}</h3>
        <p className="text-indigo-600 font-medium">{alumni.role}</p>
        <div className="flex items-center gap-1 text-surface-500 text-sm mt-1">
          <HiOutlineOfficeBuilding className="w-4 h-4" />
          {alumni.company}
        </div>
      </div>

      <p className="text-sm text-surface-600 line-clamp-3 mb-6 min-h-[4.5rem]">
        {alumni.experience || 'No experience summary provided.'}
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-surface-100">
        {alumni.linkedin && (
          <a href={alumni.linkedin} target="_blank" rel="noreferrer" className="text-surface-400 hover:text-[#0077b5] transition-colors p-2 hover:bg-surface-50 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        )}
        {alumni.email && (
          <a href={`mailto:${alumni.email}`} className="text-surface-400 hover:text-indigo-600 transition-colors p-2 hover:bg-surface-50 rounded-full">
            <HiOutlineMail className="w-5 h-5" />
          </a>
        )}
        <button className="ml-auto text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          View Profile
        </button>
      </div>
    </div>
  </div>
);

const AlumniList = () => {
  const [alumnis, setAlumnis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      let url = '/alumni';
      if (search) url += `?search=${search}`;
      
      const res = await api.get(url);
      setAlumnis(res.data.alumni);
    } catch (error) {
      toast.error('Failed to load alumni directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [search]);

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Alumni Network</h1>
          <p className="text-surface-600">Connect with past students and seek career guidance.</p>
        </div>
        
        {user?.role === 'alumni' && (
          <div className="flex items-center gap-3">
            <button className="btn-primary">
              <HiOutlineAcademicCap className="w-5 h-5" /> My Alumni Profile
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-4 mb-8 flex justify-end">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name, company, or role..."
            className="input-field py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card h-[380px] skeleton"></div>
          ))}
        </div>
      ) : alumnis.length > 0 ? (
        <div className="card-grid">
          {alumnis.map(alumni => (
            <AlumniCard key={alumni._id} alumni={alumni} />
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card">
          <HiOutlineUserGroup />
          <h3 className="text-xl font-bold text-surface-900 mb-2">No alumni found</h3>
          <p>Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default AlumniList;
