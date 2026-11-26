import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/catagories');
  return response.data;
};

export const getTickets = async (params = {}) => {
  const response = await api.get('/tickets', { params });
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

export const updateTicket = async (id, ticketData) => {
  const response = await api.put(`/tickets/${id}`, ticketData);
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const response = await api.put(`/tickets/${id}/status`, { status });
  return response.data;
};

export const deleteTicket = async (id) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};

export const getTicketReplies = async (id) => {
  const response = await api.get(`/tickets/${id}/replies`);
  return response.data;
};

export const addTicketReply = async (id, replyData) => {
  const response = await api.post(`/tickets/${id}/replies`, replyData);
  return response.data;
};

export default api;