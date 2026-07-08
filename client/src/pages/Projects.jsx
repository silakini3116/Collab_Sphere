import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiOutlineUserGroup, HiPlus, HiOutlineCode, HiOutlineLightBulb, HiX } from 'react-icons/hi';

const ProjectCard = ({ project, onJoinRequest, onEdit, onDelete, onViewRequests, isOwner }) => {
  return (
    <div className="glass-card p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="badge badge-category mb-2">{project.category}</span>
          <h3 className="text-xl font-bold text-surface-900 line-clamp-2">{project.title}</h3>
        </div>
      </div>
      
      <p className="text-sm text-surface-600 line-clamp-3 mb-4">
        {project.overview}
      </p>

      <div className="mb-4">
        <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-2 flex items-center gap-1">
          <HiOutlineCode className="w-4 h-4" /> Tech Stack
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {project.techStack?.map((tech, i) => (
            <span key={i} className="text-[11px] font-medium bg-surface-100 text-surface-700 px-2 py-1 rounded-md border border-surface-200">
              {tech}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mb-4 flex-grow">
        <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-2 flex items-center gap-1">
          <HiOutlineUserGroup className="w-4 h-4" /> Roles Needed
        </h4>
        <div className="flex flex-col gap-2 text-sm text-surface-600">
          {project.rolesNeeded?.map((role, i) => (
            <div key={i}>
              <span className="font-semibold">{role.role}:</span> {role.skills?.join(', ')}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-surface-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <img 
            src={project.postedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${project.postedBy?.name}&background=6366f1&color=fff`} 
            alt="" className="w-8 h-8 rounded-full border border-surface-200" 
          />
          <div>
            <div className="text-sm font-bold text-surface-900">{project.postedBy?.name}</div>
          </div>
        </div>
        
        {isOwner ? (
          <div className="flex gap-2">
            <button onClick={() => onEdit(project)} className="text-indigo-600 text-sm font-semibold hover:underline">Edit</button>
            <button onClick={() => onViewRequests(project)} className="text-indigo-600 text-sm font-semibold hover:underline">Requests</button>
            <button onClick={() => onDelete(project._id)} className="text-red-600 text-sm font-semibold hover:underline">Delete</button>
          </div>
        ) : (
          <button 
            onClick={() => onJoinRequest(project._id)}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-colors"
          >
            Request to Join
          </button>
        )}
      </div>
    </div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [requestNote, setRequestNote] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', overview: '', category: 'AI', commitment: '', benefits: '',
    contact: { email: '', phone: '' }, techStack: '', rolesNeeded: [{ role: '', skills: '' }]
  });

  const categories = ['all', 'AI', 'ML', 'IoT', 'Embedded', 'Robotics', 'Web', 'Mobile App', 'Other'];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let url = `/projects?category=${filter}`;
      if (search) url += `&search=${search}`;
      
      const res = await api.get(url);
      setProjects(res.data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filter, search]);

  const handlePostProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        techStack: typeof formData.techStack === 'string' ? formData.techStack.split(',').map(s => s.trim()).filter(Boolean) : formData.techStack,
        rolesNeeded: formData.rolesNeeded
          .filter(r => r.role.trim())  // drop blank role rows
          .map(r => ({ 
            role: r.role.trim(), 
            skills: typeof r.skills === 'string' ? r.skills.split(',').map(s => s.trim()).filter(Boolean) : r.skills 
          }))
      };

      if (isEditing) {
        await api.patch(`/projects/${editingProjectId}`, payload);
        toast.success('Project updated successfully!');
      } else {
        await api.post('/projects', payload);
        toast.success('Project posted successfully!');
      }
      
      setShowModal(false);
      setIsEditing(false);
      setEditingProjectId(null);
      fetchProjects();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.details?.[0]?.msg || 'Failed to save project';
      toast.error(errorMsg);
      console.error('Project save error:', err.response?.data || err);
    }
  };

  const handleEditClick = (project) => {
    setIsEditing(true);
    setEditingProjectId(project._id);
    setFormData({
      title: project.title || '',
      overview: project.overview || '',
      category: project.category || 'AI',
      commitment: project.commitment || '',
      benefits: project.benefits || '',
      contact: {
        email: project.contact?.email || '',
        phone: project.contact?.phone || ''
      },
      techStack: project.techStack ? project.techStack.join(', ') : '',
      rolesNeeded: project.rolesNeeded && project.rolesNeeded.length > 0 
        ? project.rolesNeeded.map(r => ({ role: r.role || '', skills: r.skills ? r.skills.join(', ') : '' }))
        : [{ role: '', skills: '' }]
    });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setIsEditing(false);
    setEditingProjectId(null);
    setFormData({
      title: '', overview: '', category: 'AI', commitment: '', benefits: '',
      contact: { email: '', phone: '' }, techStack: '', rolesNeeded: [{ role: '', skills: '' }]
    });
    setShowModal(true);
  };

  const handleViewRequests = async (project) => {
    setSelectedProjectId(project._id);
    setSelectedProjectTitle(project.title);
    setShowRequestsModal(true);
    fetchRequestsForProject(project._id);
  };

  const fetchRequestsForProject = async (projectId) => {
    try {
      setRequestsLoading(true);
      const res = await api.get(`/projects/${projectId}/requests`);
      setRequests(res.data.requests);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId, status) => {
    try {
      const res = await api.patch(`/projects/${selectedProjectId}/requests/${requestId}`, { status });
      const updatedRequest = res.data.request;
      // Update the request in state immediately so email/contact appears right away
      setRequests(prev => prev.map(r => r._id === requestId ? { ...r, ...updatedRequest } : r));
      toast.success(status === 'accepted' ? '✅ Request accepted! Contact info is now visible.' : 'Request declined.');
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${status} request`);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${selectedProjectId}/requests`, { note: requestNote });
      toast.success('Request sent!');
      setShowRequestModal(false);
      setRequestNote('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Deleted successfully');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Project Collaboration</h1>
          <p className="text-surface-600">Find project partners or join an existing team.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={handleCreateClick}>
            <HiPlus className="w-5 h-5" /> Post Project
          </button>
        </div>
      </div>

      <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto gap-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="w-full md:w-72">
          <input type="text" placeholder="Search projects..." className="input-field py-1.5" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-80 skeleton"></div>)}
        </div>
      ) : projects.length > 0 ? (
        <div className="card-grid">
          {projects.map(project => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              isOwner={user?._id === project.postedBy?._id}
              onJoinRequest={(id) => { setSelectedProjectId(id); setShowRequestModal(true); }}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onViewRequests={handleViewRequests}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card">
          <HiOutlineLightBulb />
          <h3 className="text-xl font-bold text-surface-900 mb-2">No projects found</h3>
          <p>Be the first to post a project in this category!</p>
        </div>
      )}

      {/* Post Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{isEditing ? 'Edit Project' : 'Post a Project'}</h2>
              <button onClick={() => setShowModal(false)}><HiX className="w-6 h-6 text-gray-500" /></button>
            </div>
            <form onSubmit={handlePostProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Overview</label>
                <textarea required className="input-field h-24" value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tech Stack (comma separated)</label>
                  <input className="input-field" value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <input className="input-field" type="email" value={formData.contact.email} onChange={e => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Phone</label>
                  <input className="input-field" value={formData.contact.phone} onChange={e => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})} />
                </div>
              </div>

              {/* Dynamic Roles Needed */}
              <div className="border-t border-surface-200 pt-4">
                <label className="block text-sm font-bold text-surface-900 mb-2">Roles Needed</label>
                <div className="space-y-3">
                  {formData.rolesNeeded.map((roleObj, idx) => (
                    <div key={idx} className="flex gap-3 items-end border border-surface-200 p-3 rounded-lg bg-surface-50 relative">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-surface-500 mb-1">Role Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Frontend Developer" 
                          className="input-field py-1.5 text-sm"
                          value={roleObj.role}
                          onChange={(e) => {
                            const updatedRoles = [...formData.rolesNeeded];
                            updatedRoles[idx].role = e.target.value;
                            setFormData({ ...formData, rolesNeeded: updatedRoles });
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-xs font-semibold text-surface-500 mb-1">Skills Needed (comma separated)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. React, Tailwind" 
                          className="input-field py-1.5 text-sm"
                          value={roleObj.skills}
                          onChange={(e) => {
                            const updatedRoles = [...formData.rolesNeeded];
                            updatedRoles[idx].skills = e.target.value;
                            setFormData({ ...formData, rolesNeeded: updatedRoles });
                          }}
                        />
                      </div>
                      {formData.rolesNeeded.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const updatedRoles = formData.rolesNeeded.filter((_, i) => i !== idx);
                            setFormData({ ...formData, rolesNeeded: updatedRoles });
                          }}
                          className="px-2.5 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-bold transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData({
                        ...formData,
                        rolesNeeded: [...formData.rolesNeeded, { role: '', skills: '' }]
                      });
                    }}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 mt-1 font-semibold"
                  >
                    <HiPlus className="w-4 h-4" /> Add Another Role
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="btn-primary">{isEditing ? 'Update Project' : 'Post Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Request to Join</h2>
            <form onSubmit={handleRequestSubmit}>
              <textarea 
                required className="input-field h-32 mb-4" 
                placeholder="Write a short note on why you'd be a good fit..."
                value={requestNote} onChange={e => setRequestNote(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Requests Modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-surface-200">
              <div>
                <h2 className="text-2xl font-bold text-surface-900">Project Join Requests</h2>
                <p className="text-sm text-surface-500 mt-1">Review requests for <span className="font-semibold text-indigo-600">"{selectedProjectTitle}"</span></p>
              </div>
              <button 
                onClick={() => {
                  setShowRequestsModal(false);
                  setSelectedProjectId(null);
                  setSelectedProjectTitle('');
                  setRequests([]);
                }}
                className="p-1 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <HiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto min-h-[300px] max-h-[60vh] pr-2">
              {requestsLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req._id} className="border border-surface-200 rounded-xl p-4 bg-surface-50 hover:bg-white transition-colors duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 pb-3 border-b border-surface-100">
                        <div className="flex items-center gap-3">
                          <img 
                            src={req.applicant?.profilePhoto || `https://ui-avatars.com/api/?name=${req.applicant?.name || 'User'}&background=6366f1&color=fff`} 
                            alt="" 
                            className="w-10 h-10 rounded-full border border-surface-200 object-cover" 
                          />
                          <div>
                            <h4 className="font-bold text-surface-900">{req.applicant?.name}</h4>
                            <p className="text-xs text-surface-500">{req.applicant?.year} • {req.applicant?.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge text-xs ${
                            req.status === 'accepted' ? 'badge-status-recruiting bg-green-100 text-green-800' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Message Note</p>
                        <p className="text-sm text-surface-700 bg-white p-3 rounded-lg border border-surface-100 whitespace-pre-wrap">
                          {req.note}
                        </p>
                      </div>

                      {req.applicant?.skills && req.applicant.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {req.applicant.skills.map((skill, idx) => (
                              <span key={idx} className="text-[10px] bg-surface-200 text-surface-700 px-2 py-0.5 rounded-md font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {req.status === 'accepted' && req.applicant?.email && (
                        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800 animate-fadeIn">
                          <p className="font-semibold">Contact Info Unlocked:</p>
                          <p className="mt-1">Email: <a href={`mailto:${req.applicant.email}`} className="underline hover:text-indigo-950 font-medium">{req.applicant.email}</a></p>
                        </div>
                      )}

                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2 mt-4 pt-2">
                          <button 
                            onClick={() => handleRespondToRequest(req._id, 'rejected')}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors"
                          >
                            Decline
                          </button>
                          <button 
                            onClick={() => handleRespondToRequest(req._id, 'accepted')}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                          >
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                  <p className="text-lg font-bold">No requests received yet</p>
                  <p className="text-sm mt-1">When someone requests to join your project, it will appear here.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-3 border-t border-surface-200 flex justify-end">
              <button 
                onClick={() => {
                  setShowRequestsModal(false);
                  setSelectedProjectId(null);
                  setSelectedProjectTitle('');
                  setRequests([]);
                }}
                className="px-4 py-2 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg font-semibold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
