import React from 'react';
import {
  Ticket,
  Clock,
  Hourglass,
  CheckCircle2,
  Flame,
} from 'lucide-react';

export default function StatsCard({ stats, loading }) {
  const cards = [
    {
      title: 'Total Tiket',
      value: stats?.total ?? 0,
      icon: <Ticket className="w-5 h-5 text-slate-400" />,
      subtext: 'Seluruh tiket tercatat',
    },
    {
      title: 'Tiket Baru',
      value: stats?.status?.open ?? 0,
      badge: 'Open',
      icon: <Clock className="w-5 h-5 text-slate-400" />,
      subtext: 'Menunggu penanganan',
    },
    {
      title: 'Mendesak',
      value: stats?.urgent_active ?? 0,
      badge: 'Urgent',
      icon: <Flame className="w-5 h-5 text-slate-400" />,
      subtext: 'Perlu respon cepat',
    },
    {
      title: 'Diproses',
      value: stats?.status?.in_progress ?? 0,
      badge: 'In Progress',
      icon: <Hourglass className="w-5 h-5 text-slate-400" />,
      subtext: 'Dalam pengerjaan tim IT',
    },
    {
      title: 'Selesai',
      value: stats?.status?.resolved ?? 0,
      badge: 'Resolved',
      icon: <CheckCircle2 className="w-5 h-5 text-slate-400" />,
      subtext: 'Penanganan telah selesai',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {item.title}
            </span>
            <div className="flex items-center justify-center">
              {item.icon}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {loading ? (
                <div className="h-7 w-12 bg-slate-200 animate-pulse rounded"></div>
              ) : (
                item.value
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{item.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
