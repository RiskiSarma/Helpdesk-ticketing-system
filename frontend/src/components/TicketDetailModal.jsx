import React, { useState, useEffect } from 'react';
import {
  X,
  Ticket,
  User,
  Mail,
  Tag,
  Calendar,
  FileText,
  MessageSquare,
  Send,
} from 'lucide-react';
import { getTicketReplies, addTicketReply } from '../api/ticketApi';

export default function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
}) {
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [senderName, setSenderName] = useState('Staff IT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ticket && isOpen) {
      loadReplies(ticket.id);
    }
  }, [ticket, isOpen]);

  const loadReplies = async (ticketId) => {
    try {
      setLoadingReplies(true);
      setError(null);
      const res = await getTicketReplies(ticketId);
      setReplies(res.data || []);
    } catch (err) {
      setError('Gagal memuat tanggapan tiket.');
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setIsSubmitting(true);
      await addTicketReply(ticket.id, {
        message: replyMessage,
        sender_name: senderName || 'Staff IT',
      });
      setReplyMessage('');
      await loadReplies(ticket.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim tanggapan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{ticket.subject}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 space-y-4 py-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/75 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-500 flex items-center mb-0.5">
                <User className="w-3 h-3 mr-1 text-slate-400" /> Pelapor
              </span>
              <span className="font-bold text-slate-800">{ticket.reporter_name}</span>
            </div>
            <div>
              <span className="text-slate-500 flex items-center mb-0.5">
                <Mail className="w-3 h-3 mr-1 text-slate-400" /> Kontak
              </span>
              <span className="font-bold text-slate-800 truncate block">
                {ticket.reporter_email || ticket.report_email || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 flex items-center mb-0.5">
                <Tag className="w-3 h-3 mr-1 text-slate-400" /> Kategori
              </span>
              <span className="font-bold text-slate-800">
                {ticket.category_name || `Kategori #${ticket.category_id || '-'}`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 flex items-center mb-0.5">
                <Calendar className="w-3 h-3 mr-1 text-slate-400" /> Tanggal
              </span>
              <span className="font-bold text-slate-800">
                {new Date(ticket.created_at || ticket.created).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wider flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Deskripsi Masalah
            </h4>
            <div className="p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 mb-2 text-xs uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Riwayat Tanggapan ({replies.length})
              </span>
            </h4>

            {loadingReplies ? (
              <div className="text-center py-4 text-slate-400 text-xs">Memuat tanggapan...</div>
            ) : replies.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                Belum ada tanggapan atau catatan penanganan untuk tiket ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {replies.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-indigo-700 flex items-center">
                        {r.sender_name}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center">
                        {new Date(r.created_at || r.created).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs whitespace-pre-wrap leading-relaxed text-slate-700">
                      {r.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 space-y-2.5">
            <h4 className="font-bold text-slate-700 text-xs flex items-center">
              <Send className="w-3 h-3 mr-1.5 text-indigo-600" />
              Tambah Tanggapan / Tindakan Solusi
            </h4>
            {error && <p className="text-rose-600 text-xs">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nama Petugas / Pengirim"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Tuliskan catatan progress atau solusi teknis..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="sm:col-span-2 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !replyMessage.trim()}
                className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-3 h-3 mr-1.5" />
                {isSubmitting ? 'Mengirim...' : 'Kirim Tanggapan'}
              </button>
            </div>
          </form>
        </div>

        <div className="pt-3.5 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
