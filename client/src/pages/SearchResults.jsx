import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineCalendar, HiOutlineLightBulb, HiOutlineBriefcase, HiOutlineUserGroup } from 'react-icons/hi';

const SearchResults = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q');

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (error) {
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (!query) {
    return <div className="page-container text-center py-20 text-surface-500">Please enter a search term in the navbar.</div>;
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Search Results</h1>
        <p className="text-surface-600 text-lg">
          Showing results for <span className="font-bold text-indigo-600">"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : results ? (
        <div className="space-y-12">
          {/* Summary */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="glass-card px-6 py-4 flex-shrink-0 flex items-center gap-3">
              <HiOutlineSearch className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-surface-500">Total Results</p>
                <p className="text-2xl font-bold">{results.counts.total}</p>
              </div>
            </div>
          </div>

          {/* Events */}
          {results.results.events.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-surface-200 pb-2">
                <HiOutlineCalendar className="text-indigo-500" /> Events ({results.counts.events})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.results.events.map(event => (
                  <Link to="/events" key={event._id} className="glass-card p-4 hover:border-indigo-300 transition-colors">
                    <h3 className="font-bold text-surface-900 line-clamp-1">{event.title}</h3>
                    <p className="text-sm text-surface-600 mt-1">{new Date(event.date).toLocaleDateString()} • {event.category}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.results.projects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-surface-200 pb-2">
                <HiOutlineLightBulb className="text-amber-500" /> Projects ({results.counts.projects})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.results.projects.map(project => (
                  <Link to="/projects" key={project._id} className="glass-card p-4 hover:border-amber-300 transition-colors">
                    <h3 className="font-bold text-surface-900 line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-surface-600 mt-1 line-clamp-1">{project.overview}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}



          {/* Alumni */}
          {results.results.alumni.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-surface-200 pb-2">
                <HiOutlineUserGroup className="text-purple-500" /> Alumni ({results.counts.alumni})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.results.alumni.map(alumni => (
                  <Link to={`/profile/${alumni.userId._id}`} key={alumni._id} className="glass-card p-4 flex items-center gap-4 hover:border-purple-300 transition-colors">
                    <img src={alumni.photo || `https://ui-avatars.com/api/?name=${alumni.name}`} alt="" className="w-12 h-12 rounded-full" />
                    <div>
                      <h3 className="font-bold text-surface-900 line-clamp-1">{alumni.name}</h3>
                      <p className="text-sm text-surface-600 mt-1">{alumni.role} at {alumni.company}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.counts.total === 0 && (
            <div className="empty-state glass-card">
              <HiOutlineSearch />
              <h3 className="text-xl font-bold text-surface-900 mb-2">No matches found</h3>
              <p>We couldn't find any events, projects, or alumni matching "{query}".</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SearchResults;
