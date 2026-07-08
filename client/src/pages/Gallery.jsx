import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineHeart, HiHeart, HiOutlineChat, HiOutlineCalendar } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Gallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const { user } = useAuth();
  
  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const yearsRes = await api.get('/gallery/years');
        const availableYears = yearsRes.data.years;
        setYears(availableYears);
        
        if (availableYears.length > 0) {
          setSelectedYear(availableYears[0]);
        } else {
          // If no specific year filter is possible, just fetch latest
          const galleryRes = await api.get('/gallery');
          setGalleries(galleryRes.data.galleries);
          setLoading(false);
        }
      } catch (error) {
        toast.error('Failed to load gallery data');
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        // We'd ideally fetch /gallery/year/:year to get albums and their photos
        // For simplicity in this combined view, we just fetch all and filter client side
        // or just rely on backend to send all albums for a year.
        // I will use the general endpoint to get recent galleries if no year, or we can just fetch all.
        const res = await api.get('/gallery?limit=50');
        // Filter by selected year locally just for demo if backend isn't specific
        const filtered = res.data.galleries.filter(g => g.year === parseInt(selectedYear));
        setGalleries(filtered);
      } catch (error) {
        toast.error('Failed to load albums');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, [selectedYear]);

  const handleLike = async (id) => {
    try {
      const res = await api.post(`/gallery/${id}/like`);
      // Update local state
      setGalleries(galleries.map(g => {
        if (g._id === id) {
          if (res.data.liked) {
            g.likes.push(user._id);
          } else {
            g.likes = g.likes.filter(uid => uid !== user._id);
          }
        }
        return g;
      }));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Department Gallery</h1>
          <p className="text-surface-600">Explore memories from past events and activities.</p>
        </div>
      </div>

      {/* Year Selector */}
      {years.length > 0 && (
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-4">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`flex-shrink-0 px-6 py-2 rounded-xl text-lg font-bold transition-all ${
                  selectedYear === year 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-105' 
                    : 'bg-white text-surface-600 hover:bg-surface-50 border border-surface-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Albums */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-80 skeleton"></div>)}
        </div>
      ) : galleries.length > 0 ? (
        <div className="space-y-12">
          {galleries.map(gallery => (
            <div key={gallery._id} className="glass-card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-surface-900 mb-2">{gallery.album}</h2>
                  <div className="flex items-center gap-4 text-surface-500 text-sm">
                    <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {gallery.year}</span>
                    <span className="flex items-center gap-2">
                      <img src={gallery.uploadedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${gallery.uploadedBy?.name}&background=fff&color=6366f1`} alt="" className="w-5 h-5 rounded-full" />
                      Uploaded by {gallery.uploadedBy?.name}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button onClick={() => handleLike(gallery._id)} className="flex items-center gap-1.5 text-surface-600 hover:text-pink-600 transition-colors">
                    {gallery.likes?.includes(user?._id) ? <HiHeart className="w-6 h-6 text-pink-600" /> : <HiOutlineHeart className="w-6 h-6" />}
                    <span className="font-medium">{gallery.likes?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-surface-600 hover:text-indigo-600 transition-colors">
                    <HiOutlineChat className="w-6 h-6" />
                    <span className="font-medium">{gallery.comments?.length || 0}</span>
                  </button>
                </div>
              </div>

              {gallery.caption && (
                <p className="text-surface-700 mb-6">{gallery.caption}</p>
              )}

              {/* Photo Grid within Album */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {gallery.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => setLightboxImage(img.url)}
                  >
                    <img 
                      src={img.url} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card">
          <HiOutlinePhotograph />
          <h3 className="text-xl font-bold text-surface-900 mb-2">No photos found</h3>
          <p>No albums have been uploaded for {selectedYear} yet.</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          <button 
            className="absolute top-6 right-6 text-white hover:text-indigo-400 bg-black bg-opacity-50 rounded-full p-2 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
