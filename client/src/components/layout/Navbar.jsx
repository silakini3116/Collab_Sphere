import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  HiOutlineSearch,
  HiOutlineBell,
  HiMenu,
  HiX
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const res = await api.get('/notifications?limit=10');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif._id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setIsNotifOpen(false);
      if (notif.relatedModel === 'Project') {
        navigate('/projects');
      } else if (notif.relatedModel === 'Event') {
        navigate('/events');
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Events', path: '/events' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-500 py-3 h-[72px] navbar-fade-down flex items-center ${
      scrolled 
        ? 'bg-white/85 backdrop-blur-md border-b border-slate-100/50 shadow-md' 
        : 'bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
    }`}>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left Side: Logo & Subtitle */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-headings font-bold text-lg tracking-tight text-slate-900 leading-none">
              Collab<span className="text-[#4F46E5]">Sphere</span>
            </span>
            <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">ECE Platform</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 group ${
                  isActive 
                    ? 'bg-indigo-50/70 text-[#4F46E5]' 
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {/* Underline animated indicator */}
                  <span className={`absolute bottom-1.5 left-5 right-5 h-[2px] bg-[#7C3AED] transition-transform duration-300 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right Side: Search, Notification Bell, User Avatar */}
        <div className="flex items-center gap-4">
          
          {/* Rounded Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-80 pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] bg-slate-50 transition-all duration-300 focus:w-[350px]"
            />
          </form>

          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileMenuOpen(false);
              }}
              className={`p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-all relative focus:outline-none cursor-pointer border-none bg-transparent ${
                unreadCount > 0 ? 'animate-[swing_1.5s_ease-in-out_infinite]' : ''
              }`}
            >
              <HiOutlineBell className="h-5.5 w-5.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl bg-white border border-slate-100 py-1 z-50 max-h-96 overflow-y-auto animate-slideDown">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                  <p className="text-sm text-slate-800 font-bold">Notifications</p>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-[#4F46E5] hover:text-[#4338ca] font-semibold border-none bg-transparent cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        onClick={() => handleNotifClick(notif)}
                        className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.isRead ? 'bg-indigo-50/30 font-semibold' : ''
                        }`}
                      >
                        <p className="text-xs text-slate-700 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center focus:outline-none cursor-pointer border-none bg-transparent transition-transform duration-300 hover:scale-105"
            >
              <img
                className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/20 hover:ring-indigo-500 transition-all"
                src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5&color=fff`}
                alt={user?.name || 'User profile'}
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl bg-white border border-slate-100 py-1.5 z-50 animate-slideDown">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm text-slate-900 font-bold truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none border-none bg-transparent cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <HiX className="h-6 w-6" />
            ) : (
              <HiMenu className="h-6 w-6" />
            )}
          </button>

        </div>
      </div>

      {/* Mobile Menu List Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex flex-col gap-3 shadow-lg animate-slideDown">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `text-base font-semibold transition-colors py-2 ${
                  isActive ? 'text-[#4F46E5]' : 'text-slate-800 hover:text-[#4F46E5]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {/* Mobile Search Input */}
          <form onSubmit={handleSearch} className="relative mt-2 flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-full text-sm placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] bg-slate-50"
            />
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
