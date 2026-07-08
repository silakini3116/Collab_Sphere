import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineUser, HiOutlineCalendar, HiPlus } from 'react-icons/hi';

const EventCard = ({ event }) => {
  return (
    <div className="glass-card overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
      <div className="h-48 relative overflow-hidden bg-surface-100">
        {event.image ? (
          <a href={event.registrationLink || event.image} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </a>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-300">
            <HiOutlineCalendar className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge badge-category shadow-sm">{event.category}</span>
          {event.isOfficial && <span className="badge badge-official shadow-sm">Official</span>}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-surface-900 line-clamp-2">{event.title}</h3>
        </div>
        
        <p className="text-sm text-surface-600 line-clamp-2 mb-4 flex-grow">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-surface-500 mb-4">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="w-4 h-4 text-indigo-500" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineClock className="w-4 h-4 text-indigo-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineLocationMarker className="w-4 h-4 text-indigo-500" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineUser className="w-4 h-4 text-indigo-500" />
            <span className="truncate">{event.organizer}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <img 
              src={event.postedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${event.postedBy?.name}&background=6366f1&color=fff`} 
              alt="" className="w-6 h-6 rounded-full" 
            />
            <span className="text-xs font-medium text-surface-600">
              Posted by {event.postedBy?.name} 
              {event.postedBy?.role === 'student' && event.postedBy?.registerNumber && ` - ${event.postedBy.registerNumber}`}
              {event.postedBy?.role !== 'student' && (event.postedBy?.designation || event.postedBy?.department) && ` - ${event.postedBy.designation || event.postedBy.department}`}
            </span>
          </div>
          {event.registrationLink && (
            <a 
              href={event.registrationLink.startsWith('http') ? event.registrationLink : `https://${event.registrationLink}`}
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Register →
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateEventModal = ({ onClose, onEventCreated, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    college: '',
    category: '',
    startDate: '',
    endDate: '',
    venue: '',
    description: '',
    posterUrl: '',
    registrationLink: ''
  });
  const [posterFile, setPosterFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.college) newErrors.college = 'College / Organizer is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('organizer', formData.college);
      submitData.append('category', formData.category);
      submitData.append('date', formData.startDate);
      // Send endDate as 'time' — the backend will interpret it
      if (formData.endDate) submitData.append('time', formData.endDate);
      submitData.append('venue', formData.venue || 'TBA');
      submitData.append('description', formData.description || 'No description');
      
      if (posterFile) {
        submitData.append('image', posterFile);
      } else if (formData.posterUrl) {
        submitData.append('image', formData.posterUrl);
      }
      if (formData.registrationLink) {
        submitData.append('registrationLink', formData.registrationLink);
      }

      const res = await api.post('/events', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onEventCreated(res.data.event);
      toast.success('Event created successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userInfo = user?.role === 'student' 
    ? `${user?.name} - ${user?.registerNumber || 'No Reg No'}` 
    : `${user?.name} - ${user?.designation || user?.department || 'Staff'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card p-6 md:p-8 max-w-2xl w-full my-8 mt-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Post New Event</h2>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-700 text-xl font-bold">✕</button>
        </div>
        
        <div className="bg-surface-100 p-4 rounded-lg mb-6 flex items-center gap-3">
          <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} className="w-10 h-10 rounded-full" alt="" />
          <div>
            <p className="text-xs text-surface-500 uppercase font-bold tracking-wider">Posting As</p>
            <p className="font-medium text-surface-900">{userInfo}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title *</label>
              <input type="text" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">College *</label>
              <input type="text" className="input-field" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
              {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">Select Category</option>
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Symposium">Symposium</option>
                <option value="Placement">Placement</option>
                <option value="Seminar">Seminar</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <input type="text" className="input-field" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input type="date" className="input-field" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input type="date" className="input-field" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Event Details</label>
            <textarea className="input-field min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="p-4 border border-surface-200 rounded-lg bg-surface-50">
            <label className="block text-sm font-bold mb-2">Event Poster <span className="font-normal text-surface-500">(Optional — URL or upload)</span></label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-surface-600 mb-1">Poster URL</label>
                <input type="url" className="input-field text-sm" placeholder="https://..." value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} disabled={!!posterFile} />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px bg-surface-200 flex-grow"></div>
                <span className="text-xs font-medium text-surface-400">OR</span>
                <div className="h-px bg-surface-200 flex-grow"></div>
              </div>
              <div>
                <label className="block text-xs text-surface-600 mb-1">Upload File</label>
                <input type="file" className="input-field text-sm" accept="image/*" onChange={e => setPosterFile(e.target.files[0])} disabled={!!formData.posterUrl} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Registration Link <span className="font-normal text-surface-500">(Optional)</span></label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://forms.google.com/... or any registration URL" 
              value={formData.registrationLink} 
              onChange={e => setFormData({...formData, registrationLink: e.target.value})} 
            />
            <p className="text-xs text-surface-400 mt-1">Students will see a "Register →" button on the event card linking here.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Posting...' : 'Post Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const canPost = user?.role === 'teacher' ? user?.verified : true;

  const categories = ['all', 'Workshop', 'Hackathon', 'Symposium', 'Placement', 'Seminar', 'Sports', 'Cultural', 'Other'];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let url = `/events?category=${filter}`;
      if (search) url += `&search=${search}`;
      
      const res = await api.get(url);
      setEvents(res.data.events);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter, search]);

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Department Events</h1>
          <p className="text-surface-600">Discover and register for upcoming department activities.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {canPost ? (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <HiPlus className="w-5 h-5" /> Post Event
            </button>
          ) : (
            <button disabled className="btn-primary" title="Pending admin approval">
              <HiPlus className="w-5 h-5" /> Post Event
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto gap-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search events..."
            className="input-field py-1.5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card h-96 skeleton"></div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="card-grid">
          {events.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card">
          <HiOutlineCalendar />
          <h3 className="text-xl font-bold text-surface-900 mb-2">No events found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)} 
          onEventCreated={(newEvent) => {
            // Check if it fits current filter before prepending, or just prepend anyway
            if (filter === 'all' || newEvent.category === filter) {
              setEvents(prev => [newEvent, ...prev]);
            }
          }} 
          user={user}
        />
      )}
    </div>
  );
};

export default Events;
