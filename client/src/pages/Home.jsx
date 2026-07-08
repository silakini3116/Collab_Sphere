import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Lenis from 'lenis';
import { 
  HiOutlineHome, 
  HiOutlineCalendar, 
  HiOutlineLightBulb, 
  HiOutlineBriefcase, 
  HiOutlinePhotograph, 
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineBell,
  HiMenu,
  HiX
} from 'react-icons/hi';
import { 
  FaTwitter, 
  FaGithub, 
  FaLinkedin, 
  FaInstagram, 
  FaArrowRight 
} from 'react-icons/fa';

import './Home.css';

// Importing generated assets
import eceHeroImg from '../assets/ece_students_hero.png';
import eceBuildingImg from '../assets/ece_dept_building.png';
import laptopMockupImg from '../assets/collabsphere_laptop_mockup.png';
import projectExpoImg from '../assets/project_expo_showcase.png';

const Home = () => {
  const { user, logout, login, register } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Lenis smooth scroll initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
  
  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form input data states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    year: '1st Year',
    registerNumber: ''
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const openAuthModal = (tab) => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    // Reset forms
    setLoginData({ email: '', password: '' });
    setRegData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      year: '1st Year',
      registerNumber: ''
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      return toast.error('Please fill in all fields');
    }

    setIsSubmitting(true);
    try {
      await login(loginData.email, loginData.password);
      closeAuthModal();
      navigate('/');
    } catch (error) {
      // Error handled in Context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsSubmitting(true);
    try {
      const payload = { ...regData, role };
      if (role === 'teacher') {
        delete payload.year;
        delete payload.registerNumber;
      }

      await register(payload);
      closeAuthModal();
      navigate('/');
    } catch (error) {
      // Error handled in Context
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Track scroll position to update sticky navbar blur/background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations (fade in)
  const sectionsRef = useRef([]);
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);



  // About statistics
  const aboutStats = [
    { count: '30+', label: 'Faculty Members' },
    { count: '600+', label: 'Students' },
    { count: '8+', label: 'Laboratories' },
    { count: '20+', label: 'Industry Partners' }
  ];

  // ECE Core Areas data
  const coreAreas = [
    {
      title: 'Artificial Intelligence',
      description: 'Implementing intelligent systems, machine learning pipelines, and deep neural networks in hardware and software applications.',
      icon: <HiOutlineBrain className="w-8 h-8 text-indigo-400" />
    },
    {
      title: 'Internet of Things',
      description: 'Designing interconnected sensors, smart gateways, and robust protocols for automated monitoring and control networks.',
      icon: <HiOutlineGlobe className="w-8 h-8 text-cyan-400" />
    },
    {
      title: 'Embedded Systems',
      description: 'Developing high-performance firmware, real-time operating systems (RTOS), and micro-architecture level programming.',
      icon: <HiOutlineCpu className="w-8 h-8 text-purple-400" />
    },
    {
      title: 'Communication Systems',
      description: 'Building modern RF communications, 5G wireless networks, antenna design, and fiber-optic networking protocols.',
      icon: <HiOutlineWifi className="w-8 h-8 text-pink-400" />
    },
    {
      title: 'VLSI Design',
      description: 'Synthesizing integrated circuits, FPGA programming, CMOS design layout, and hardware description languages (Verilog/VHDL).',
      icon: <HiOutlineChip className="w-8 h-8 text-indigo-400" />
    },
    {
      title: 'Signal Processing',
      description: 'Analyzing, modifying, and synthesizing signals like audio, video, images, and telemetry data using DSP processors.',
      icon: <HiOutlineWaveform className="w-8 h-8 text-cyan-400" />
    },
    {
      title: 'Robotics',
      description: 'Integrating sensors, actuators, control loops, and autonomous navigation architectures for precise physical agency.',
      icon: <HiOutlineCube className="w-8 h-8 text-purple-400" />
    }
  ];

  // Activities Data
  const technicalClubs = [
    { name: 'IEEE Student Branch', icon: <HiOutlineBookOpen className="text-indigo-500 w-5 h-5" /> },
    { name: 'IoT Club', icon: <HiOutlineGlobe className="text-cyan-500 w-5 h-5" /> },
    { name: 'Coding Club', icon: <HiOutlineTerminal className="text-purple-500 w-5 h-5" /> },
    { name: 'Innovation Club', icon: <HiOutlineChip className="text-pink-500 w-5 h-5" /> }
  ];

  const activitiesList = [
    { name: 'Hackathons', icon: <HiCheckCircle className="text-emerald-500 w-5 h-5" /> },
    { name: 'Technical Workshops', icon: <HiCheckCircle className="text-emerald-500 w-5 h-5" /> },
    { name: 'Mini Projects', icon: <HiCheckCircle className="text-emerald-500 w-5 h-5" /> },
    { name: 'Paper Presentations', icon: <HiCheckCircle className="text-emerald-500 w-5 h-5" /> },
    { name: 'Project Expo', icon: <HiCheckCircle className="text-emerald-500 w-5 h-5" /> },
    { name: 'Technical Competitions', icon: <HiCheckCircle className="text-emerald-500 w-5 h-5" /> }
  ];

  // Why CollabSphere list
  const collabBenefits = [
    { emoji: '🚀', text: 'Discover Projects' },
    { emoji: '📅', text: 'Participate in Events' },
    { emoji: '👥', text: 'Collaborate with Students' },
    { emoji: '💡', text: 'Build Innovative Ideas' },
    { emoji: '🤝', text: 'Work as a Team' },
    { emoji: '📚', text: 'Learn Through Practice' }
  ];

  // Quick helper to scroll to the next element
  const scrollToNextSection = (index) => {
    sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-scroll-container bg-[#FFFFFF] font-body text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Mouse cursor radial spotlight glow */}
      <div 
        className="mouse-radial-glow pointer-events-none fixed z-50 rounded-full w-[400px] h-[400px] blur-[120px] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hidden lg:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      ></div>

      {/* Sticky transparent navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 py-4 navbar-fade-down ${
        scrolled ? 'nav-scrolled px-6 md:px-12' : 'nav-transparent px-6 md:px-12'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-headings font-bold text-xl tracking-tight text-slate-900 leading-none">
                Collab<span className="text-[#4F46E5]">Sphere</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">ECE Platform</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#hero" className="home-nav-link active">Home</a>
            <Link to="/projects" className="home-nav-link">Projects</Link>
            <Link to="/events" className="home-nav-link">Events</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/search" className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-all nav-search-btn">
                  <HiOutlineSearch className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-all">
                    <HiOutlineBell className="w-5 h-5" />
                  </button>
                </div>
                <Link to="/profile" className="flex items-center gap-2">
                  <img
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/20 hover:ring-indigo-500 transition-all nav-profile-img"
                    src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff`}
                    alt={user.name}
                  />
                </Link>
              </>
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal('login')} 
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-[#4F46E5] transition-all cursor-pointer bg-transparent border-none"
                >
                  Login
                </button>
                <button 
                  onClick={() => openAuthModal('register')} 
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338ca] rounded-full transition-all shadow-md shadow-indigo-500/25 cursor-pointer border-none"
                >
                  Register
                </button>
              </>
            )}

            {/* Mobile menu toggle button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
            >
              {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown list */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex flex-col gap-3 shadow-lg animate-slideDown">
            <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 hover:text-[#4F46E5] transition-colors py-2">Home</a>
            <Link to="/projects" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 hover:text-[#4F46E5] transition-colors py-2">Projects</Link>
            <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 hover:text-[#4F46E5] transition-colors py-2">Events</Link>
          </div>
        )}
      </nav>

      {/* SECTION 1: HERO (100vh) */}
      <section 
        id="hero" 
        ref={(el) => (sectionsRef.current[0] = el)}
        className="home-section relative overflow-hidden bg-[#FFFFFF] fade-in-section"
      >
        <div className="circuit-grid-light"></div>
        
        {/* Floating particles decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-2">
          <div className="absolute w-1.5 h-1.5 bg-indigo-400/40 rounded-full top-[20%] left-[15%] animate-float-particle" style={{ animationDelay: '0s', animationDuration: '8s' }} />
          <div className="absolute w-2 h-2 bg-purple-400/30 rounded-full top-[60%] left-[8%] animate-float-particle" style={{ animationDelay: '2s', animationDuration: '10s' }} />
          <div className="absolute w-1.5 h-1.5 bg-cyan-400/40 rounded-full top-[35%] left-[80%] animate-float-particle" style={{ animationDelay: '1.5s', animationDuration: '9s' }} />
          <div className="absolute w-2 h-2 bg-pink-400/25 rounded-full top-[75%] left-[75%] animate-float-particle" style={{ animationDelay: '4s', animationDuration: '12s' }} />
        </div>

        <div className="glow-blob glow-blob-primary -top-20 -left-20"></div>
        <div className="glow-blob glow-blob-accent bottom-10 right-10"></div>
        
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 pt-10 sm:pt-16">
          <div className="lg:col-span-6 flex flex-col justify-center text-left">

            <h1 className="font-headings text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6 flex flex-col gap-1 overflow-hidden">
              <span className="hero-title-line line-1">Department of</span>
              <span className="hero-title-line line-2">Electronics &</span>
              <span className="hero-title-line line-3">Communication</span>
              <span className="hero-title-line line-4 text-gradient">Engineering</span>
            </h1>
            
            <p className="text-lg text-slate-600 font-medium mb-8 max-w-lg hero-subtitle">
              Empowering Future Innovators Through Technology. Connect, collaborate, and co-create hardware and software solutions.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-10 hero-buttons">
              {user ? (
                <Link to="/projects" className="btn-premium-glow px-8 py-3.5 text-base flex items-center gap-3">
                  Explore Projects <FaArrowRight className="text-sm" />
                </Link>
              ) : (
                <button 
                  onClick={() => openAuthModal('login')}
                  className="btn-premium-glow px-8 py-3.5 text-base flex items-center gap-3 cursor-pointer border-none"
                >
                  Explore Projects <FaArrowRight className="text-sm" />
                </button>
              )}
              {user ? (
                <Link to="/events" className="px-8 py-3.5 text-base font-semibold text-slate-800 bg-[#FFFFFF] border-2 border-slate-200 hover:border-slate-400 rounded-full shadow-sm transition-all flex items-center gap-2">
                  View Events
                </Link>
              ) : (
                <button 
                  onClick={() => openAuthModal('login')}
                  className="px-8 py-3.5 text-base font-semibold text-slate-800 bg-[#FFFFFF] border-2 border-slate-200 hover:border-slate-400 rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  View Events
                </button>
              )}
            </div>
            

          </div>

          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative border border-slate-100 hero-image-animate">
              <img 
                src={eceHeroImg} 
                alt="ECE Students collaborating on electronics projects" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
            </div>
            {/* Subtle electronics layout graphics decoration */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 border-2 border-dashed border-[#06B6D4]/30 rounded-full pointer-events-none animate-spin-slow"></div>
            <div className="absolute -top-8 -left-8 w-24 h-24 border-2 border-dashed border-[#7C3AED]/20 rounded-full pointer-events-none animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div 
          onClick={() => scrollToNextSection(1)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 z-20 text-slate-400 hover:text-[#4F46E5] transition-colors"
        >
          <span className="text-xs font-bold uppercase tracking-widest">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full scroll-indicator-dot"></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT THE DEPARTMENT (100vh) */}
      <section 
        id="about" 
        ref={(el) => (sectionsRef.current[1] = el)}
        className="home-section relative overflow-hidden bg-[#FFFFFF] fade-in-section"
      >
        <div className="circuit-grid-light"></div>
        <div className="glow-blob glow-blob-secondary top-1/4 right-0"></div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 pt-10 sm:pt-16">
          <div className="lg:col-span-6 flex flex-col justify-center text-left about-left">

            <h2 className="font-headings text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              About <span className="text-[#4F46E5]">ECE</span>
            </h2>
            
            <p className="text-base text-slate-600 mb-8 leading-relaxed max-w-xl">
              The Department of Electronics & Communication Engineering at CollabSphere is dedicated to fostering academic excellence, high-impact research, and pioneering industry-oriented learning. From embedded systems design to advanced wireless communication networks, our programs prepare students to build, innovate, and lead the future technologies that connect our world.
            </p>

            {/* Four statistics cards in grid */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {aboutStats.map((item, index) => (
                <div key={index} className="glass-panel-light p-5 rounded-[20px] border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-all hover:scale-105 duration-300 about-card-item">
                  <span className="font-headings text-3xl font-bold text-slate-900 mb-1">
                    <CountUpNumber target={item.count} />
                  </span>
                  <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center items-center about-right-image-container">
            <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-100 relative">
              <img 
                src={eceBuildingImg} 
                alt="ECE Department Building" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent"></div>
            </div>
            
            {/* Circuit pattern overlay graphic decoration */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-48 opacity-30 flex flex-col justify-between items-center text-slate-400 font-bold tracking-widest text-[9px] pointer-events-none">
              <span>● ● ● ● ●</span>
              <span>● ● ● ● ●</span>
              <span>● ● ● ● ●</span>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div 
          onClick={() => scrollToNextSection(2)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-1 z-20 text-slate-400 hover:text-[#4F46E5] transition-colors"
        >
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full scroll-indicator-dot"></div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ECE CORE AREAS (100vh) */}
      <section 
        id="core-areas" 
        ref={(el) => (sectionsRef.current[2] = el)}
        className="home-section relative overflow-hidden bg-[#0F172A] text-white fade-in-section"
      >
        <div className="circuit-grid-dark"></div>
        
        {/* Neon particles decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-2">
          <div className="absolute w-2 h-2 bg-[#06B6D4]/30 rounded-full top-[15%] left-[25%] animate-float-particle" style={{ animationDelay: '1s', animationDuration: '7s' }} />
          <div className="absolute w-1.5 h-1.5 bg-[#7C3AED]/40 rounded-full top-[50%] left-[85%] animate-float-particle" style={{ animationDelay: '3s', animationDuration: '9s' }} />
          <div className="absolute w-2.5 h-2.5 bg-[#4F46E5]/30 rounded-full top-[80%] left-[40%] animate-float-particle" style={{ animationDelay: '0s', animationDuration: '11s' }} />
        </div>

        <div className="glow-blob glow-blob-primary -top-40 right-20"></div>
        <div className="glow-blob glow-blob-accent bottom-0 left-20"></div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 flex flex-col justify-center relative z-10 pt-10 sm:pt-16 pb-12">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
<h2 className="font-headings text-4xl sm:text-5xl font-bold mb-4 animate-slide-up">
              Explore Our <span className="text-[#06B6D4]">ECE Core Areas</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Delve into specialized electronics fields that form the building blocks of modern industrial technology and computing platforms.
            </p>
          </div>

          {/* Core Areas Cards layout (Flex-wrap / Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {coreAreas.map((area, i) => (
              <TiltCard 
                key={i} 
                className="core-area-card glass-panel-dark p-6 rounded-[20px] flex flex-col h-full border border-slate-800/50"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center mb-4 border border-slate-700/50 shadow-inner">
                  {area.icon}
                </div>
                <h3 className="font-headings text-lg font-bold mb-2 text-slate-100">{area.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{area.description}</p>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Scroll down indicator */}
        <div 
          onClick={() => scrollToNextSection(3)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-1 z-20 text-slate-500 hover:text-white transition-colors"
        >
          <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full scroll-indicator-dot"></div>
          </div>
        </div>
      </section>

      {/* SECTION 4: STUDENT ACTIVITIES (100vh) */}
      <section 
        id="activities" 
        ref={(el) => (sectionsRef.current[3] = el)}
        className="home-section relative overflow-hidden bg-[#FFFFFF] fade-in-section"
      >
        <div className="circuit-grid-light"></div>
        <div className="glow-blob glow-blob-secondary -bottom-20 left-10"></div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:items-center relative z-10 pt-10 sm:pt-16">
          
          {/* Collage of students (Left) */}
          <div className="lg:col-span-6">
            <div className="collage-grid">
              <div className="collage-item collage-1">
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80" alt="Hackathon" />
                <span className="collage-label">Hackathons</span>
              </div>
              <div className="collage-item collage-2">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80" alt="Workshops" />
                <span className="collage-label">Workshops</span>
              </div>
              <div className="collage-item collage-3">
                <img src={projectExpoImg} alt="Project Expo" />
                <span className="collage-label">Project Expo</span>
              </div>
              <div className="collage-item collage-4">
                <img src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80" alt="Coding competitions" />
                <span className="collage-label">Coding Competitions</span>
              </div>
              <div className="collage-item collage-5">
                <img src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80" alt="Technical symposium" />
                <span className="collage-label">Paper Presentation</span>
              </div>
            </div>
          </div>

          {/* Student Activities details (Right) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">

            <h2 className="font-headings text-4xl sm:text-5xl font-bold text-slate-900 mb-8">
              Student <span className="text-[#7C3AED]">Activities</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Technical Clubs column */}
              <div>
                <h3 className="font-headings text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#7C3AED] rounded-full"></span> Technical Clubs
                </h3>
                <ul className="flex flex-col gap-4">
                  {technicalClubs.map((club, idx) => (
                    <li key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl hover:bg-indigo-50/50 hover:-translate-y-0.5 transition-all club-item">
                      <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100">
                        {club.icon}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{club.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities Column */}
              <div>
                <h3 className="font-headings text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#06B6D4] rounded-full"></span> Events & Activities
                </h3>
                <ul className="flex flex-col gap-3">
                  {activitiesList.map((activity, idx) => (
                    <li key={idx} className="flex items-center gap-3 activity-item">
                      {activity.icon}
                      <span className="text-sm text-slate-600 font-medium">{activity.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div 
          onClick={() => scrollToNextSection(4)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-1 z-20 text-slate-400 hover:text-[#4F46E5] transition-colors"
        >
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full scroll-indicator-dot"></div>
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY COLLABSPHERE? (100vh) */}
      <section 
        id="why-collabsphere" 
        ref={(el) => (sectionsRef.current[4] = el)}
        className="home-section relative overflow-hidden bg-slate-50/80 fade-in-section"
      >
        <div className="circuit-grid-light"></div>
        <div className="glow-blob glow-blob-primary -top-20 right-10"></div>
        <div className="glow-blob glow-blob-accent bottom-20 left-10"></div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 pt-10 sm:pt-16">
          
          {/* Left Text and checklist */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">

            <h2 className="font-headings text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Why <span className="text-gradient">CollabSphere?</span>
            </h2>
            
            <p className="text-base text-slate-600 mb-8 leading-relaxed max-w-xl">
              CollabSphere connects ECE students through collaborative projects and technical events, creating a space to innovate, learn, and grow together.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              {collabBenefits.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm benefit-item">
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <span className="text-sm font-semibold text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Laptop Mockup and Floating Cards */}
          <div className="lg:col-span-6 flex justify-center items-center relative">
            {/* Rotating glowing circles behind laptop */}
            <div className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 blur-[60px] animate-spin-slow pointer-events-none -z-1"></div>
            <div className="laptop-mockup-container">
              {/* Laptop screen mock */}
              <div className="laptop-frame">
                <div 
                  className="laptop-screen"
                  style={{ backgroundImage: `url(${laptopMockupImg})` }}
                >
                </div>
              </div>
              <div className="laptop-keyboard"></div>

              {/* Floating glass cards */}
              <div className="floating-glass-card fg-card-1 glass-panel-light">
                <span className="font-headings text-xl font-bold text-[#4F46E5]">120+</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Projects</span>
              </div>
              


              <div className="floating-glass-card fg-card-3 glass-panel-light">
                <span className="font-headings text-xl font-bold text-[#06B6D4]">25+</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Events</span>
              </div>

              <div className="floating-glass-card fg-card-4 glass-panel-light">
                <span className="font-headings text-xl font-bold text-slate-900">300+</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alumni</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div 
          onClick={() => scrollToNextSection(5)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-1 z-20 text-slate-400 hover:text-[#4F46E5] transition-colors"
        >
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full scroll-indicator-dot"></div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA + FOOTER COMBINED */}
      <section
        id="cta"
        ref={(el) => (sectionsRef.current[5] = el)}
        className="home-section relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white fade-in-section flex-col justify-between"
      >
        <div className="circuit-grid-dark"></div>
        <div className="cta-glow-container">
          <div className="particle w-96 h-96 top-1/4 left-10 glow-blob-primary" style={{ transform: 'scale(1.5)', opacity: 0.1 }}></div>
          <div className="particle w-80 h-80 bottom-10 right-10 glow-blob-secondary" style={{ transform: 'scale(1.2)', opacity: 0.1 }}></div>
        </div>

        {/* CTA Content */}
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10 pt-16 sm:pt-24 pb-12 sm:pb-16">
<h2 className="font-headings text-4xl sm:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Ready to Collaborate?
          </h2>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Join hundreds of ECE students building innovative projects and technologies. Elevate your learning through teamwork.
          </p>

          {user ? (
            <Link to="/projects" className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338ca] hover:to-[#6d28d9] text-white font-bold text-lg rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 cta-breathing-btn">
              Explore Projects <FaArrowRight className="text-sm" />
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal('register')}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338ca] hover:to-[#6d28d9] text-white font-bold text-lg rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 cursor-pointer border-none cta-breathing-btn"
            >
              Get Started <FaArrowRight className="text-sm" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="border-t border-white/5"></div>
        </div>

        {/* Footer Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">

          {/* Logo and brief */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold text-lg">
                C
              </div>
              <span className="font-headings font-bold text-lg tracking-tight text-white">
                Collab<span className="text-[#4F46E5]">Sphere</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Official Collaboration and Project Repository Platform for the Electronics and Communication Engineering Department.
            </p>
            <div className="flex gap-3 mt-2">
              <a href="#" className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-full transition-all text-sm"><FaTwitter /></a>
              <a href="#" className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-full transition-all text-sm"><FaGithub /></a>
              <a href="#" className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-full transition-all text-sm"><FaLinkedin /></a>
              <a href="#" className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-full transition-all text-sm"><FaInstagram /></a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-headings font-bold text-white text-xs tracking-wider uppercase mb-5">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li><Link to="/projects" className="hover:text-[#4F46E5] transition-colors">Projects</Link></li>
              <li><Link to="/events" className="hover:text-[#4F46E5] transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-2">
            <h3 className="font-headings font-bold text-white text-xs tracking-wider uppercase mb-5">Contact Information</h3>
            <div className="flex flex-col gap-2.5 text-sm text-slate-400">
              <p className="font-semibold text-slate-300 text-base">Department of Electronics & Communication Engineering</p>
              <p className="text-slate-500">CollabSphere Campus, Block-E</p>
              <p className="flex items-center gap-2">
                <span className="text-[#4F46E5] font-semibold">Email:</span> ece@collabsphere.edu
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#4F46E5] font-semibold">Phone:</span> +91 96765 43210
              </p>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 border-t border-white/5 pt-6">
          <p>© {new Date().getFullYear()} CollabSphere ECE Department. All rights reserved.</p>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </section>

      {/* Premium Glassmorphic Auth Modal */}
      <div className={`auth-modal-overlay ${isAuthModalOpen ? 'active' : ''}`} onClick={closeAuthModal}>
        <div className="auth-modal-content glass-panel-dark" onClick={(e) => e.stopPropagation()}>
          <button className="auth-modal-close" onClick={closeAuthModal}>×</button>
          
          {/* Logo and Intro */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg mb-3">
              C
            </div>
            <h2 className="font-headings text-2xl font-bold text-white">
              {authTab === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {authTab === 'login' ? 'Access your CollabSphere account' : 'Join the ECE Department Collaboration Platform'}
            </p>
          </div>

          {/* Tabs */}
          <div className="auth-tab-container">
            <button 
              className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
              onClick={() => setAuthTab('login')}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
              onClick={() => setAuthTab('register')}
            >
              Sign Up
            </button>
          </div>

          {/* Form rendering */}
          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="modal-input-group">
                <label className="modal-label">College Email ID</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="you@srmist.edu.in"
                  className="modal-input"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />
              </div>
              <div className="modal-input-group">
                <label className="modal-label">Password</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="modal-input"
                  value={loginData.password}
                  onChange={handleLoginChange}
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full btn-premium-glow py-3.5 text-sm font-semibold rounded-xl flex justify-center items-center mt-6 cursor-pointer border-none"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              {/* Role Selection */}
              <div className="role-toggle-group">
                <div 
                  className={`role-toggle-card ${role === 'student' ? 'active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  <span>Student</span>
                </div>
                <div 
                  className={`role-toggle-card ${role === 'teacher' ? 'active' : ''}`}
                  onClick={() => setRole('teacher')}
                >
                  <span>Teacher</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="modal-input-group">
                  <label className="modal-label">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    placeholder="John Doe"
                    className="modal-input"
                    value={regData.name}
                    onChange={handleRegChange}
                  />
                </div>
                <div className="modal-input-group">
                  <label className="modal-label">College Email ID</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="john.doe@srmist.edu.in"
                    className="modal-input"
                    value={regData.email}
                    onChange={handleRegChange}
                  />
                </div>
              </div>

              <div className="modal-input-group">
                <label className="modal-label">Department</label>
                <select 
                  name="department"
                  required
                  className="modal-input modal-select"
                  value={regData.department}
                  onChange={handleRegChange}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>

              {role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="modal-input-group">
                    <label className="modal-label">Academic Year</label>
                    <select 
                      name="year"
                      required
                      className="modal-input modal-select"
                      value={regData.year}
                      onChange={handleRegChange}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="modal-input-group">
                    <label className="modal-label">Register Number</label>
                    <input 
                      type="text" 
                      name="registerNumber"
                      required
                      placeholder="RA21110..."
                      className="modal-input"
                      value={regData.registerNumber}
                      onChange={handleRegChange}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="modal-input-group">
                  <label className="modal-label">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    required
                    minLength="6"
                    placeholder="••••••••"
                    className="modal-input"
                    value={regData.password}
                    onChange={handleRegChange}
                  />
                </div>
                <div className="modal-input-group">
                  <label className="modal-label">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    required
                    minLength="6"
                    placeholder="••••••••"
                    className="modal-input"
                    value={regData.confirmPassword}
                    onChange={handleRegChange}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full btn-premium-glow py-3.5 text-sm font-semibold rounded-xl flex justify-center items-center mt-6 cursor-pointer border-none"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};

// Helper mock components for icons that might be missing in react-icons
const HiOutlineBrain = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props} className={`${props.className || ''} icon-brain`}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
    <path d="M12 6v12M8 10h8M9 14h6"></path>
  </svg>
);

const HiOutlineWifi = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props} className={`${props.className || ''} icon-wifi`}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3"></line>
  </svg>
);

const HiOutlineWaveform = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props} className={`${props.className || ''} icon-wave`}>
    <path d="M3 10v4M6 6v12M9 11v2M12 4v16M15 8v8M18 5v14M21 10v4"></path>
  </svg>
);

const HiArrowDown = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const HiCheckCircle = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const HiChevronRight = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const HiOutlineBookOpen = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const HiOutlineChip = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props} className={`${props.className || ''} icon-chip`}>
    <rect x="4" y="4" width="16" height="16" rx="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="15" x2="23" y2="15"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="15" x2="4" y2="15"></line>
  </svg>
);

const HiOutlineCpu = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props} className={`${props.className || ''} icon-chip`}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="15" x2="23" y2="15"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="15" x2="4" y2="15"></line>
  </svg>
);

const HiOutlineGlobe = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const HiOutlineTerminal = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

const HiOutlineCube = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props} className={`${props.className || ''} icon-robot-eyes`}>
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="8" cy="16" r="2"></circle>
    <circle cx="16" cy="16" r="2"></circle>
    <path d="M12 11V8M9 8h6M12 5V3"></path>
  </svg>
);

// Dynamic 3D tilt component wrapper
const TiltCard = ({ children, className }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 10;
    const rotateY = (x - centerX) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.03)`;
    card.style.boxShadow = '0 20px 40px rgba(79, 70, 229, 0.15)';
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    cardRef.current.style.boxShadow = 'none';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: 'transform 0.15s ease-out, box-shadow 0.3s ease' }}
    >
      {children}
    </div>
  );
};

// Dynamic count-up counter component
const CountUpNumber = ({ target, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  const numericTarget = parseInt(target, 10) || 0;
  const suffix = target.replace(/[0-9]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * numericTarget));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(numericTarget);
      }
    };

    window.requestAnimationFrame(step);
  }, [hasStarted, numericTarget, duration]);

  return <span ref={elementRef}>{count}{suffix}</span>;
};

export default Home;
