import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  User,
  Mail,
  Tag,
  AlertTriangle,
  FileText,
  AlignLeft,
  Send,
  AlertCircle,
} from 'lucide-react';

export default function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
}) {
  const [formData, setFormData] = useState({
    reporter_name: '',
    reporter_email: '',
    category_id: categories.length > 0 ? categories[0].id : '',
    priority: 'medium',
    subject: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const err = {};
    if (!formData.reporter_name.trim()) err.reporter_name = 'Nama pelapor wajib diisi';
    if (!formData.reporter_email.trim()) err.reporter_email = 'Email atau kontak wajib diisi';
    if (!formData.category_id) err.category_id = 'Pilih kategori tiket';
    if (!formData.subject.trim()) err.subject = 'Judul tiket wajib diisi';
    if (!formData.description.trim()) err.description = 'Deskripsi masalah wajib diisi';
    else if (formData.description.trim().length < 10)
      err.description = 'Deskripsi minimal 10 karakter';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        category_id: Number(formData.category_id),
      });
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: err.response?.data?.message || 'Gagal menyimpan tiket' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Buat Tiket Baru</h3>
              <p className="text-xs text-slate-500">Laporkan kendala teknis atau permohonan bantuan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.general && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Nama Pelapor *
              </label>
              <input
                type="text"
                name="reporter_name"
                value={formData.reporter_name}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                  errors.reporter_name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.reporter_name && (
                <p className="mt-1 text-xs text-rose-600">{errors.reporter_name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Email Pelapor *
              </label>
              <input
                type="text"
                name="reporter_email"
                value={formData.reporter_email}
                onChange={handleChange}
                placeholder="budi@example.com"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                  errors.reporter_email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.reporter_email && (
                <p className="mt-1 text-xs text-rose-600">{errors.reporter_email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Kategori *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition ${
                  errors.category_id ? 'border-rose-400' : 'border-slate-300'
                }`}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-xs text-rose-600">{errors.category_id}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Tingkat Prioritas
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
              >
                <option value="low">Low (Rendah)</option>
                <option value="medium">Medium (Sedang)</option>
                <option value="high">High (Tinggi)</option>
                <option value="urgent">Urgent (Mendesak)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Judul Tiket / Kendala *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Contoh: Printer divisi keuangan tidak bisa mencetak"
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                errors.subject ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-rose-600">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
              <AlignLeft className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Deskripsi Masalah *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan secara rinci kronologi masalah yang dialami..."
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? 'Menyimpan...' : 'Kirim Tiket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
