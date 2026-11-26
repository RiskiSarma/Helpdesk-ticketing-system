import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Navbar({ onRefresh, isRefreshing }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                Helpdesk Ticketing
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Pusat Bantuan & Penanganan Masalah IT
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 shadow-xs disabled:opacity-50"
              title="Perbarui Data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${
                  isRefreshing ? 'animate-spin text-indigo-600' : ''
                }`}
              />
              {isRefreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
