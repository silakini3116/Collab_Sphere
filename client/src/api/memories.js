import api from './axios';

const memoriesAPI = {
  // Year & month overviews
  getYears: () => api.get('/memories/years'),
  getYearData: (year) => api.get(`/memories/${year}`),
  getMonthEvents: (year, month) => api.get(`/memories/${year}/${month}`),

  // Events
  getEvent: (eventId, params = {}) =>
    api.get(`/memories/events/${eventId}`, { params }),
  createEvent: (data) => api.post('/memories/events', data),
  updateEvent: (id, data) => api.put(`/memories/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/memories/events/${id}`),

  // Photos
  uploadPhotos: (eventId, formData, onProgress) =>
    api.post(`/memories/events/${eventId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) =>
        onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  deletePhoto: (photoId) => api.delete(`/memories/photos/${photoId}`),
  updatePhoto: (photoId, data) => api.put(`/memories/photos/${photoId}`, data),
  likePhoto: (photoId) => api.post(`/memories/photos/${photoId}/like`),
  reportPhoto: (photoId, reason) =>
    api.post(`/memories/photos/${photoId}/report`, { reason }),

  // Comments
  getComments: (photoId) => api.get(`/memories/photos/${photoId}/comments`),
  addComment: (photoId, data) =>
    api.post(`/memories/photos/${photoId}/comments`, data),
  deleteComment: (commentId) => api.delete(`/memories/comments/${commentId}`),
  editComment: (commentId, data) =>
    api.put(`/memories/comments/${commentId}`, data),
  likeComment: (commentId) => api.post(`/memories/comments/${commentId}/like`),

  // Discovery
  search: (params) => api.get('/memories/search', { params }),
  getTrending: () => api.get('/memories/trending'),
};

export default memoriesAPI;
