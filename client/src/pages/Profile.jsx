import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineMail, HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineLocationMarker, HiLink, HiOutlinePencilAlt } from 'react-icons/hi';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isOwnProfile = !id || id === currentUser._id;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          setProfileUser(currentUser);
          setEditForm(currentUser);
        } else {
          const res = await api.get(`/users/${id}`);
          setProfileUser(res.data.user);
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, isOwnProfile]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(s => s.trim());
    setEditForm({ ...editForm, skills: skillsArray });
  };

  const handlePhotoChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Auto upload photo
      const formData = new FormData();
      formData.append('photo', file);
      
      const toastId = toast.loading('Uploading photo...');
      try {
        const res = await api.post('/users/profile/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updateUser(res.data.user);
        setProfileUser(res.data.user);
        toast.success('Photo updated successfully', { id: toastId });
      } catch (error) {
        toast.error('Failed to upload photo', { id: toastId });
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/users/profile', editForm);
      updateUser(res.data.user);
      setProfileUser(res.data.user);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="page-container flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profileUser) {
    return <div className="page-container text-center py-20 text-xl text-surface-500">User not found</div>;
  }

  return (
    <div className="page-container max-w-4xl">
      {/* Profile Header */}
      <div className="glass-card overflow-hidden">
        <div className="h-32 sm:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          {/* Cover photo placeholder */}
        </div>
        
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
            <div className="relative group">
              <img
                src={profileUser.profilePhoto || `https://ui-avatars.com/api/?name=${profileUser.name}&background=6366f1&color=fff&size=256`}
                alt={profileUser.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl object-cover bg-white"
              />
              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="text-sm font-medium">Change Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              )}
            </div>
            
            {isOwnProfile && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary h-10 mb-2 sm:mb-4">
                <HiOutlinePencilAlt className="w-4 h-4" /> Edit Profile
              </button>
            )}
            {isOwnProfile && isEditing && (
              <div className="flex gap-2 mb-2 sm:mb-4">
                <button onClick={() => setIsEditing(false)} className="btn-secondary h-10">Cancel</button>
                <button onClick={handleSaveProfile} className="btn-primary h-10">Save</button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900">{profileUser.name}</h1>
                <span className="badge badge-category capitalize">{profileUser.role}</span>
                {profileUser.verified === false && <span className="badge bg-yellow-100 text-yellow-800">Pending Approval</span>}
              </div>
              
              <div className="text-surface-600 text-lg mb-4 flex items-center gap-2">
                <HiOutlineAcademicCap className="w-5 h-5 text-indigo-500" />
                {profileUser.department} {profileUser.year && `• ${profileUser.year}`}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-surface-500 mb-6 border-b border-surface-200 pb-6">
                <div className="flex items-center gap-1.5">
                  <HiOutlineMail className="w-4 h-4" /> {profileUser.email}
                </div>
                {profileUser.registerNumber && (
                  <div className="flex items-center gap-1.5">
                    <HiOutlineBriefcase className="w-4 h-4" /> Reg No: {profileUser.registerNumber}
                  </div>
                )}
                {profileUser.github && (
                  <div className="flex items-center gap-1.5">
                    <HiLink className="w-4 h-4" /> 
                    <a href={profileUser.github} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">GitHub</a>
                  </div>
                )}
                {profileUser.linkedin && (
                  <div className="flex items-center gap-1.5">
                    <HiLink className="w-4 h-4" /> 
                    <a href={profileUser.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">LinkedIn</a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-surface-900 mb-2">About</h3>
                    <p className="text-surface-600 whitespace-pre-wrap">
                      {profileUser.about || 'No description provided yet.'}
                    </p>
                  </div>
                  
                  {profileUser.skills && profileUser.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-surface-900 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileUser.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-surface-100 text-surface-700 rounded-full text-sm font-medium border border-surface-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileUser.role === 'teacher' && (
                    <div className="grid grid-cols-2 gap-4 bg-surface-50 p-4 rounded-xl border border-surface-100">
                      <div>
                        <span className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Designation</span>
                        <span className="text-surface-900 font-medium">{profileUser.designation || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Office Hours</span>
                        <span className="text-surface-900 font-medium">{profileUser.officeHours || '-'}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Activity Summary / Badges could go here */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 mb-2">Member Since</h3>
                    <p className="text-indigo-700">{new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">Full Name</label>
                  <input type="text" name="name" className="input-field" value={editForm.name || ''} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="input-label">Department</label>
                  <input type="text" name="department" className="input-field" value={editForm.department || ''} onChange={handleEditChange} />
                </div>
                {profileUser.role === 'student' && (
                  <div>
                    <label className="input-label">Year</label>
                    <select name="year" className="input-field" value={editForm.year || ''} onChange={handleEditChange}>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                )}
                {profileUser.role === 'teacher' && (
                  <>
                    <div>
                      <label className="input-label">Designation</label>
                      <input type="text" name="designation" className="input-field" value={editForm.designation || ''} onChange={handleEditChange} />
                    </div>
                    <div>
                      <label className="input-label">Office Hours</label>
                      <input type="text" name="officeHours" className="input-field" value={editForm.officeHours || ''} onChange={handleEditChange} placeholder="e.g. Mon-Wed 2-4 PM" />
                    </div>
                  </>
                )}
                <div>
                  <label className="input-label">GitHub URL</label>
                  <input type="url" name="github" className="input-field" value={editForm.github || ''} onChange={handleEditChange} placeholder="https://github.com/username" />
                </div>
                <div>
                  <label className="input-label">LinkedIn URL</label>
                  <input type="url" name="linkedin" className="input-field" value={editForm.linkedin || ''} onChange={handleEditChange} placeholder="https://linkedin.com/in/username" />
                </div>
              </div>

              <div>
                <label className="input-label">Skills (comma separated)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editForm.skills?.join(', ') || ''} 
                  onChange={handleSkillsChange} 
                  placeholder="React, Node.js, Python, Embedded C" 
                />
              </div>

              <div>
                <label className="input-label">About</label>
                <textarea 
                  name="about" 
                  className="input-field min-h-[120px]" 
                  value={editForm.about || ''} 
                  onChange={handleEditChange}
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
