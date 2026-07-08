import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCalendar, HiOutlineLightBulb, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineArrowRight } from 'react-icons/hi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="glass-card p-6 flex items-center gap-4 animate-fadeIn">
    <div className={`p-4 rounded-xl ${bg} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-surface-500">{title}</p>
      <h3 className="text-2xl font-bold text-surface-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ events: 0, projects: 0, alumni: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // We fetch basic lists for the dashboard. 
        // In a real app we'd have a specific /dashboard endpoint
        const [eventsRes, projectsRes, alumniRes] = await Promise.all([
          api.get('/events?limit=3&upcoming=true'),
          api.get('/projects?limit=3&sort=views'),
          api.get('/alumni?limit=1')
        ]);

        setRecentEvents(eventsRes.data.events);
        setFeaturedProjects(projectsRes.data.projects);
        
        setStats({
          events: eventsRes.data.total,
          projects: projectsRes.data.total,
          alumni: alumniRes.data.total
        });
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 sm:p-10 text-white shadow-xl animate-slideDown">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-indigo-100 text-lg mb-6">
            Here's what's happening in the {user?.department} department today.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/events" className="btn-primary bg-white text-indigo-700 hover:bg-indigo-50">
              Browse Events
            </Link>
            <Link to="/projects" className="btn-secondary border-indigo-300 text-white hover:bg-white hover:bg-opacity-10">
              Find Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Upcoming Events" value={stats.events} 
          icon={<HiOutlineCalendar className="w-6 h-6" />} color="text-blue-600" bg="bg-blue-100" 
        />
        <StatCard 
          title="Active Projects" value={stats.projects} 
          icon={<HiOutlineLightBulb className="w-6 h-6" />} color="text-amber-600" bg="bg-amber-100" 
        />

        <StatCard 
          title="Alumni Network" value={stats.alumni} 
          icon={<HiOutlineUserGroup className="w-6 h-6" />} color="text-purple-600" bg="bg-purple-100" 
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Events Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-surface-900">Upcoming Events</h2>
            <Link to="/events" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <HiOutlineArrowRight />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentEvents.length > 0 ? recentEvents.map(event => (
              <div key={event._id} className="glass-card p-5 flex gap-4 transition-all hover:scale-[1.01]">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700">
                  <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-black">{new Date(event.date).getDate()}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-category text-[10px] py-0.5 px-2">{event.category}</span>
                    {event.isOfficial && <span className="badge badge-official text-[10px] py-0.5 px-2">Official</span>}
                  </div>
                  <h4 className="text-lg font-bold text-surface-900 truncate">{event.title}</h4>
                  <p className="text-sm text-surface-500 truncate">{event.venue} • {event.time}</p>
                </div>
              </div>
            )) : (
              <div className="glass-card p-8 text-center text-surface-500">
                No upcoming events found.
              </div>
            )}
          </div>
        </div>

        {/* Featured Projects Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-surface-900">Featured Projects</h2>
            <Link to="/projects" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <HiOutlineArrowRight />
            </Link>
          </div>
          
          <div className="space-y-4">
            {featuredProjects.length > 0 ? featuredProjects.map(project => {
              const status = project.rolesNeeded?.length > 0 ? 'Recruiting' : 'Ongoing';
              return (
                <div key={project._id} className="glass-card p-5 transition-all hover:scale-[1.01]">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-surface-900 truncate pr-4">{project.title}</h4>
                    <span className={`badge ${status === 'Recruiting' ? 'badge-status-recruiting' : 'badge-status-ongoing'} text-xs shrink-0`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-surface-600 line-clamp-2 mb-3">
                    {project.overview}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={project.postedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${project.postedBy?.name || 'User'}&background=6366f1&color=fff`} 
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs text-surface-500">{project.postedBy?.name || 'User'}</span>
                    </div>
                    <div className="flex gap-1">
                      {project.techStack?.slice(0, 2).map((tech, i) => (
                        <span key={i} className="text-[10px] font-medium bg-surface-100 text-surface-600 px-2 py-1 rounded-md">
                          {tech}
                        </span>
                      ))}
                      {project.techStack?.length > 2 && (
                        <span className="text-[10px] font-medium bg-surface-100 text-surface-600 px-2 py-1 rounded-md">
                          +{project.techStack.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="glass-card p-8 text-center text-surface-500">
                No featured projects found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
