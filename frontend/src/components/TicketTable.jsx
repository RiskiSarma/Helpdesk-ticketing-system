import React from 'react';
import {
  Eye,
  Edit3,
  Trash2,
  Inbox,
} from 'lucide-react';

export default function TicketTable({
  tickets,
  loading,
  onViewDetail,
  onUpdateStatus,
  onDeleteTicket,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500 text-white shadow-2xs">
            Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500 text-white shadow-2xs">
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500 text-white shadow-2xs">
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-600 text-white shadow-2xs">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white shadow-2xs">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-500 text-white shadow-2xs">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500 text-white shadow-2xs">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-500 text-white shadow-2xs">
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-500 text-white shadow-2xs">
            {priority || '-'}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
        <p className="mt-3 text-xs font-medium text-slate-500">Memuat data tiket...</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <Inbox className="mx-auto h-12 w-12 text-slate-300" strokeWidth={1.5} />
        <h3 className="mt-3 text-sm font-bold text-slate-800">Tidak ada tiket</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Belum ada tiket yang terdaftar atau tidak ada tiket yang cocok dengan filter pencarian Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/95 sticky top-0 z-10 text-xs font-bold text-slate-600 uppercase tracking-wider backdrop-blur-xs shadow-2xs">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                No. Tiket
              </th>
              <th scope="col" className="px-5 py-3.5">
                Judul & Pelapor
              </th>
              <th scope="col" className="px-5 py-3.5">
                Kategori
              </th>
              <th scope="col" className="px-5 py-3.5">
                Prioritas
              </th>
              <th scope="col" className="px-5 py-3.5">
                Status
              </th>
              <th scope="col" className="px-5 py-3.5">
                Tanggal
              </th>
              <th scope="col" className="px-5 py-3.5 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-slate-50/60 transition duration-150"
              >
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="font-mono text-xs font-bold bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100/80">
                    {ticket.ticket_number}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-slate-900 line-clamp-1">
                    {ticket.subject}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5 space-x-1">                   
                    <span className="text-slate-400">
                      {ticket.reporter_email || ticket.report_email || '-'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="text-xs text-slate-700 font-medium">
                    {ticket.category_name || `Kategori #${ticket.category_id || '-'}`}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {getPriorityBadge(ticket.priority)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {getStatusBadge(ticket.status)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                  {formatDate(ticket.created_at || ticket.created)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-center">
                  <div className="inline-flex items-center space-x-1.5">
                    <button
                      onClick={() => onViewDetail(ticket)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      title="Lihat Detail & Tanggapan"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                    </button>
                    <button
                      onClick={() => onUpdateStatus(ticket)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                      title="Edit Tiket"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                    </button>
                    <button
                      onClick={() => onDeleteTicket(ticket)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                      title="Hapus Tiket"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
