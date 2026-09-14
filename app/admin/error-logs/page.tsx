'use client';

import React, { useState, useEffect } from 'react';

// --- 🎨 Icons ---
const IconBug = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="8" height="14" x="8" y="6" rx="4" />
    <path d="m19 7-3 2" />
    <path d="m5 7 3 2" />
    <path d="m19 19-3-2" />
    <path d="m5 19 3-2" />
    <path d="M20 13h-4" />
    <path d="M4 13h4" />
    <path d="m10 4 1 2" />
    <path d="m14 4-1 2" />
  </svg>
);

const IconPhone = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
);

const IconServer = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </svg>
);

const IconCheck = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCopy = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconRefresh = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const IconTrash = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconStore = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
  </svg>
);

interface ErrorLogItem {
  id: string;
  error_source: 'APP' | 'API';
  error_name: string | null;
  error_message: string;
  stack_trace: string | null;
  screen_name: string | null;
  endpoint: string | null;
  status_code: number | null;
  brand_id: string | null;
  user_id: string | null;
  user_email: string | null;
  app_version: string;
  platform: string | null;
  device_info: any;
  request_payload: any;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  brands?: {
    id: string;
    name: string;
    logo_url?: string;
  } | null;
}

const MIGRATION_SQL = `CREATE TABLE IF NOT EXISTS public.app_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_source TEXT NOT NULL CHECK (error_source IN ('APP', 'API')),
    error_name TEXT,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    screen_name TEXT,
    endpoint TEXT,
    status_code INTEGER,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    user_id UUID,
    user_email TEXT,
    app_version TEXT DEFAULT '2.1.1',
    platform TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    request_payload JSONB,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.app_error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON public.app_error_logs(error_source);
CREATE INDEX IF NOT EXISTS idx_error_logs_brand_id ON public.app_error_logs(brand_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_is_resolved ON public.app_error_logs(is_resolved);
ALTER TABLE public.app_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to error logs" ON public.app_error_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read/write error logs" ON public.app_error_logs FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');`;

export default function AdminErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLogItem[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ErrorLogItem | null>(null);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'APP' | 'API'>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [resolvedFilter, setResolvedFilter] = useState<'ALL' | 'UNRESOLVED' | 'RESOLVED'>('UNRESOLVED');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({ total: 0, app: 0, api: 0, unresolved: 0 });

  useEffect(() => {
    fetchLogs();
  }, [sourceFilter, brandFilter, resolvedFilter, page]);

  const fetchLogs = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (sourceFilter !== 'ALL') params.set('source', sourceFilter);
      if (brandFilter !== 'ALL') params.set('brand_id', brandFilter);
      if (resolvedFilter !== 'ALL') params.set('resolved', resolvedFilter);
      if (searchTerm.trim()) params.set('q', searchTerm.trim());

      const res = await fetch(`/api/admin/error-logs?${params.toString()}`);
      const data = await res.json();

      if (res.status === 404 && data.needsMigration) {
        setNeedsMigration(true);
        return;
      }

      if (data.success) {
        setLogs(data.data || []);
        setStats(data.stats || { total: 0, app: 0, api: 0, unresolved: 0 });
        setBrands(data.brands || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setNeedsMigration(false);
      }
    } catch (err) {
      console.error('Fetch error logs failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleToggleResolve = async (logItem: ErrorLogItem) => {
    try {
      const nextState = !logItem.is_resolved;
      const res = await fetch('/api/admin/error-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logItem.id, is_resolved: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => prev.map(l => l.id === logItem.id ? { ...l, is_resolved: nextState, resolved_at: nextState ? new Date().toISOString() : null } : l));
        setStats(prev => ({
          ...prev,
          unresolved: nextState ? Math.max(0, prev.unresolved - 1) : prev.unresolved + 1
        }));
        if (selectedLog?.id === logItem.id) {
          setSelectedLog(prev => prev ? { ...prev, is_resolved: nextState } : null);
        }
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันลบรายการข้อผิดพลาดนี้หรือไม่?')) return;
    try {
      const res = await fetch(`/api/admin/error-logs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => prev.filter(l => l.id !== id));
        if (selectedLog?.id === id) setSelectedLog(null);
        fetchLogs(true);
      }
    } catch (err) {
      alert('ลบไม่สำเร็จ');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('⚠️ คำเตือน: คุณต้องการล้างประวัติข้อผิดพลาดทั้งหมดหรือไม่?')) return;
    try {
      const res = await fetch('/api/admin/error-logs?clear_all=true', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchLogs(true);
      }
    } catch (err) {
      alert('ล้างข้อมูลไม่สำเร็จ');
    }
  };

  const copyToClipboard = (text: string, label = 'คัดลอกแล้ว') => {
    navigator.clipboard.writeText(text);
    alert(label);
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'เมื่อสักครู่';
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} ชม. ที่แล้ว`;
      const diffDay = Math.floor(diffHour / 24);
      return `${diffDay} วันที่แล้ว`;
    } catch {
      return '';
    }
  };

  if (needsMigration) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-7 text-[#7F1D1D] max-w-4xl mx-auto my-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-700">
            <IconBug size={24} />
          </div>
          <div>
            <h2 className="font-extrabold text-lg">ยังไม่ได้สร้างตาราง app_error_logs ใน Supabase</h2>
            <p className="text-xs text-red-600 mt-0.5">เปิด Supabase SQL Editor แล้วรันคำสั่งด้านล่างเพื่อเปิดใช้งานระบบตรวจจับบั๊ก:</p>
          </div>
        </div>
        <div className="relative mt-3">
          <pre className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs font-mono overflow-x-auto max-h-72">
            {MIGRATION_SQL}
          </pre>
          <button
            onClick={() => copyToClipboard(MIGRATION_SQL, 'คัดลอก SQL เรียบร้อยแล้ว')}
            className="absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <IconCopy /> คัดลอก SQL
          </button>
        </div>
        <button
          onClick={() => fetchLogs()}
          className="bg-[#2C4A34] hover:bg-[#1E3A27] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
        >
          ลองเชื่อมต่ออีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <IconBug size={18} />
            </div>
            <h1 className="text-xl font-black text-[#2C4A34]">รายงานข้อผิดพลาดและบั๊ก (Error Logs Center)</h1>
          </div>
          <p className="text-xs text-[#608367] mt-1">
            ตรวจจับและวิเคราะห์เฉพาะข้อผิดพลาดจริง แยกชัดเจนระหว่างบั๊กฝั่งแอป (Flutter) และบั๊กฝั่งเซิร์ฟเวอร์ (API)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D0DDD0] text-xs font-bold text-[#2C4A34] hover:bg-[#FAFBF9] flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <IconRefresh className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>

          {stats.total > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 transition"
            >
              <IconTrash />
              ล้างประวัติทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E8ECE8] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">บั๊กทั้งหมด</span>
            <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black">
              #
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.total}</p>
          <span className="text-[10px] text-slate-400">บันทึกเฉพาะกรณี Error จริง</span>
        </div>

        <div className="bg-white border border-rose-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">บั๊กที่เซิร์ฟเวอร์ (API)</span>
            <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <IconServer size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-900 mt-2">{stats.api}</p>
          <span className="text-[10px] text-rose-600 font-medium">HTTP 5xx, เซิร์ฟเวอร์ล้มเหลว</span>
        </div>

        <div className="bg-white border border-indigo-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700">บั๊กที่แอป (APP)</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <IconPhone size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-900 mt-2">{stats.app}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Dart Crash, UI Render Error</span>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">ยังไม่ได้รับการแก้ไข</span>
            <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
              !
            </span>
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{stats.unresolved}</p>
          <span className="text-[10px] text-amber-700 font-medium">รอบรรเทา / แก้ไขในโค้ด</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E8ECE8] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Source Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => { setSourceFilter('ALL'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition ${
                sourceFilter === 'ALL' ? 'bg-white text-[#2C4A34] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>
            <button
              onClick={() => { setSourceFilter('APP'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                sourceFilter === 'APP' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-700 hover:text-indigo-900'
              }`}
            >
              <IconPhone size={13} />
              บั๊กที่แอป ({stats.app})
            </button>
            <button
              onClick={() => { setSourceFilter('API'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                sourceFilter === 'API' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <IconServer size={13} />
              บั๊กที่ API ({stats.api})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={resolvedFilter}
              onChange={e => { setResolvedFilter(e.target.value as any); setPage(1); }}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#5F8565]"
            >
              <option value="UNRESOLVED">เฉพาะที่ยังไม่แก้ (Active)</option>
              <option value="RESOLVED">เฉพาะที่แก้แล้ว (Resolved)</option>
              <option value="ALL">สถานะทั้งหมด</option>
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#5F8565]"
            >
              <option value="ALL">ทุกร้านค้า / สาขา</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  ร้าน: {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="ค้นหาตามข้อความ Error, หน้าจอ, หรือ Endpoint..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#5F8565]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#2C4A34] text-white text-xs font-bold hover:bg-[#1E3A27] transition"
          >
            ค้นหา
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setPage(1); fetchLogs(); }}
              className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200"
            >
              ล้าง
            </button>
          )}
        </form>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white border border-[#E8ECE8] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F8565]"></div>
            <span className="text-xs text-slate-400 font-semibold">กำลังโหลดรายการข้อผิดพลาด...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <IconCheck size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">ยอดเยี่ยม! ไม่พบข้อผิดพลาดตามเงื่อนไขที่เลือก</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ระบบไม่พบบั๊กหรือข้อผิดพลาดที่ค้างอยู่ หรือเงื่อนไขการค้นหาไม่ตรงกับรายการใด
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map(log => {
              const isApi = log.error_source === 'API';
              return (
                <div
                  key={log.id}
                  className={`p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-start justify-between gap-3 ${
                    log.is_resolved ? 'opacity-60 bg-slate-50/40' : ''
                  }`}
                >
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Source Badge */}
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                          isApi
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {isApi ? <IconServer size={11} /> : <IconPhone size={11} />}
                        {isApi ? 'บั๊กที่ API' : 'บั๊กที่แอป'}
                      </span>

                      {/* Brand Tag */}
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                        <IconStore size={11} />
                        {log.brands?.name ? `ร้าน: ${log.brands.name}` : (log.brand_id ? `ร้าน ID: ${log.brand_id.slice(0, 8)}...` : 'ไม่ระบุร้าน')}
                      </span>

                      {/* Screen / Endpoint Tag */}
                      {log.screen_name && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          หน้า: {log.screen_name}
                        </span>
                      )}
                      {log.endpoint && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {log.status_code ? `[${log.status_code}] ` : ''}{log.endpoint}
                        </span>
                      )}

                      {/* Platform */}
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {log.platform || 'app'} (v{log.app_version})
                      </span>

                      {/* Relative Time */}
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">
                        {formatRelativeTime(log.created_at)}
                      </span>
                    </div>

                    {/* Error Message */}
                    <p className="text-xs font-bold text-slate-900 line-clamp-2 break-all">
                      {log.error_name ? <span className="text-rose-600 font-mono font-extrabold mr-1.5">{log.error_name}:</span> : null}
                      {log.error_message}
                    </p>

                    {/* Stack trace snippet */}
                    {log.stack_trace && (
                      <p className="text-[10.5px] font-mono text-slate-500 line-clamp-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {log.stack_trace.split('\n')[0]}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition"
                    >
                      ดูรายละเอียด
                    </button>

                    <button
                      onClick={() => handleToggleResolve(log)}
                      title={log.is_resolved ? 'ทำเครื่องหมายว่ายังไม่แก้' : 'ทำเครื่องหมายว่าแก้แล้ว'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                        log.is_resolved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <IconCheck size={13} />
                      {log.is_resolved ? 'แก้แล้ว' : 'ทำว่าแก้แล้ว'}
                    </button>

                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="ลบรายการนี้"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#E8ECE8] bg-[#FAFBF9] flex items-center justify-between text-xs text-slate-600">
            <span>หน้า {page} จาก {totalPages} หน้า</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ดูรายละเอียดข้อผิดพลาด (Inspect Modal) ── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAFBF9] border-b border-[#E8ECE8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                    selectedLog.error_source === 'API'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                  }`}
                >
                  {selectedLog.error_source === 'API' ? <IconServer size={13} /> : <IconPhone size={13} />}
                  {selectedLog.error_source === 'API' ? 'บั๊กที่เซิร์ฟเวอร์ (API)' : 'บั๊กที่แอปพลิเคชัน (APP)'}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {formatDateTime(selectedLog.created_at)}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-800 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Context Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">ร้านค้าที่พบ</span>
                  <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5 truncate">
                    {selectedLog.brands?.name || selectedLog.brand_id || 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">จุดเกิดเหตุ</span>
                  <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5 truncate">
                    {selectedLog.screen_name ? `หน้า ${selectedLog.screen_name}` : (selectedLog.endpoint || '-')}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">อุปกรณ์ / OS</span>
                  <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5 truncate">
                    {selectedLog.platform} (แอป v{selectedLog.app_version})
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">สถานะการแก้ไข</span>
                  <span className={`font-extrabold text-[11px] block mt-0.5 ${selectedLog.is_resolved ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedLog.is_resolved ? '✓ แก้ไขแล้ว' : '⚠️ ยังไม่แก้'}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              <div>
                <span className="text-xs font-extrabold text-slate-900 block mb-1.5">
                  ข้อความข้อผิดพลาด (Error Message):
                </span>
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-rose-950 font-mono text-xs break-all leading-relaxed">
                  {selectedLog.error_name && (
                    <div className="font-bold text-rose-800 mb-1">
                      Type: {selectedLog.error_name}
                    </div>
                  )}
                  {selectedLog.error_message}
                </div>
              </div>

              {/* Endpoint & Status Code (If API) */}
              {selectedLog.endpoint && (
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block mb-1.5">
                    API Endpoint & Status:
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs flex items-center gap-2">
                    <span className="font-bold text-rose-700">{selectedLog.status_code || 500}</span>
                    <span className="text-slate-800">{selectedLog.endpoint}</span>
                  </div>
                </div>
              )}

              {/* Stack Trace */}
              {selectedLog.stack_trace && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-slate-900">
                      ตำแหน่งโค้ดและ Stack Trace (ชี้เป้าบรรทัดที่มีปัญหา):
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedLog.stack_trace || '', 'คัดลอก Stack Trace แล้ว')}
                      className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <IconCopy size={12} />
                      คัดลอก Trace
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap">
                    {selectedLog.stack_trace}
                  </pre>
                </div>
              )}

              {/* Request Payload / Device Info */}
              {selectedLog.device_info && Object.keys(selectedLog.device_info).length > 0 && (
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block mb-1.5">
                    ข้อมูลเครื่อง (Device Context):
                  </span>
                  <pre className="bg-slate-100 p-3 rounded-xl text-[11px] font-mono overflow-x-auto text-slate-700">
                    {JSON.stringify(selectedLog.device_info, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#FAFBF9] border-t border-[#E8ECE8] flex items-center justify-between">
              <button
                onClick={() => handleToggleResolve(selectedLog)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedLog.is_resolved
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <IconCheck size={14} />
                {selectedLog.is_resolved ? 'เปลี่ยนกลับเป็นยังไม่แก้' : 'ทำเครื่องหมายว่าแก้แล้ว'}
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
