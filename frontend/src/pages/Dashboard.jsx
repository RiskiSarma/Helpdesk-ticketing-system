import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import TicketTable from '../components/TicketTable';
import CreateTicketModal from '../components/CreateTicketModal';
import UpdateStatusModal from '../components/UpdateStatusModal';
import TicketDetailModal from '../components/TicketDetailModal';
import DeleteModal from '../components/DeleteModal';
import {
  getDashboardStats,
  getCategories,
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../api/ticketApi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, total_pages: 1 });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusModalTicket, setStatusModalTicket] = useState(null);
  const [detailModalTicket, setDetailModalTicket] = useState(null);
  const [deleteModalTicket, setDeleteModalTicket] = useState(null);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Gagal memuat statistik dashboard:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.warn('Gagal memuat kategori:', err);
    }
  };

  const fetchTickets = useCallback(
    async (page = 1) => {
      try {
        setLoadingTickets(true);
        const params = {
          page,
          limit: 5,
        };
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;

        const res = await getTickets(params);
        if (res.success) {
          setTickets(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          } else {
            const total = (res.data || []).length;
            setPagination({
              page,
              limit: 5,
              total,
              total_pages: Math.max(1, Math.ceil(total / 5)),
            });
          }
        }
      } catch (err) {
        console.warn('Gagal memuat tiket:', err);
      } finally {
        setLoadingTickets(false);
      }
    },
    [searchTerm, statusFilter, priorityFilter]
  );

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTickets(1);
  }, [fetchTickets]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchCategories(), fetchTickets(pagination.page)]);
    setIsRefreshing(false);
    showFeedback('success', 'Data berhasil diperbarui!');
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleCreateTicket = async (ticketData) => {
    const res = await createTicket(ticketData);
    showFeedback('success', `Tiket ${res.data?.ticket_number || ''} berhasil dibuat!`);
    await Promise.all([fetchStats(), fetchTickets(1)]);
  };

  const handleUpdateTicket = async (ticketId, ticketData) => {
    await updateTicket(ticketId, ticketData);
    showFeedback('success', 'Data tiket berhasil diperbarui!');
    await Promise.all([fetchStats(), fetchTickets(pagination.page)]);
  };

  const handleDeleteTicket = async (ticketId) => {
    await deleteTicket(ticketId);
    showFeedback('success', 'Tiket berhasil dihapus!');
    const targetPage = tickets.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
    await Promise.all([fetchStats(), fetchTickets(targetPage)]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      <Navbar onRefresh={handleRefreshAll} isRefreshing={isRefreshing} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {feedback && (
          <div
            className={`p-3 rounded-xl border shadow-md flex items-center justify-between text-xs transition duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span className="font-bold">{feedback.type === 'success' ? 'Sukses:' : 'Galat:'}</span>
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <section>
          <div className="flex items-center space-x-2 mb-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ringkasan Status Tiket
            </h2>
          </div>
          <StatsCard stats={stats} loading={loadingStats} />
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800">Daftar Tiket Helpdesk</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola tiket masuk, pantau status pengerjaan, dan berikan respon solusi
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nomor / judul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-700 transition"
                >
                  <option value="">Semua Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-700 transition"
                >
                  <option value="">Semua Prioritas</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Buat Tiket Baru
              </button>
            </div>
          </div>

          <TicketTable
            tickets={tickets}
            loading={loadingTickets}
            onViewDetail={(ticket) => setDetailModalTicket(ticket)}
            onUpdateStatus={(ticket) => setStatusModalTicket(ticket)}
            onDeleteTicket={(ticket) => setDeleteModalTicket(ticket)}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              {pagination.total > 0 ? (
                <span>
                  Menampilkan{' '}
                  <span className="font-semibold text-slate-700">
                    {(pagination.page - 1) * 5 + 1}
                  </span>{' '}
                  -{' '}
                  <span className="font-semibold text-slate-700">
                    {Math.min(pagination.page * 5, pagination.total)}
                  </span>{' '}
                  dari total{' '}
                  <span className="font-semibold text-slate-700">
                    {pagination.total}
                  </span>{' '}
                  tiket (Maks. 5 per halaman)
                </span>
              ) : (
                <span>Tidak ada data tiket</span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={pagination.page <= 1 || loadingTickets}
                onClick={() => fetchTickets(pagination.page - 1)}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-xs bg-white text-slate-700 shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Sebelumnya
              </button>

              {Array.from({ length: pagination.total_pages || 1 }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  disabled={loadingTickets}
                  onClick={() => fetchTickets(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    pagination.page === p
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={pagination.page >= pagination.total_pages || loadingTickets}
                onClick={() => fetchTickets(pagination.page + 1)}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-xs bg-white text-slate-700 shadow-2xs"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTicket}
        categories={categories}
      />

      <UpdateStatusModal
        isOpen={Boolean(statusModalTicket)}
        onClose={() => setStatusModalTicket(null)}
        ticket={statusModalTicket}
        onUpdate={handleUpdateTicket}
        categories={categories}
      />

      <TicketDetailModal
        isOpen={Boolean(detailModalTicket)}
        onClose={() => setDetailModalTicket(null)}
        ticket={detailModalTicket}
      />

      <DeleteModal
        isOpen={Boolean(deleteModalTicket)}
        onClose={() => setDeleteModalTicket(null)}
        ticket={deleteModalTicket}
        onConfirm={handleDeleteTicket}
      />
    </div>
  );
}
