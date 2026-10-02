'use client';

import { useState, useEffect } from 'react';

// --- 🎨 Premium Icons ---
const IconTrash = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconAlert = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconCheck = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconUser = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconDatabase = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

const IconRefresh = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

type Brand = {
  id: string;
  name: string;
};

type BackupFile = {
  filename: string;
  timestamp: number;
  customName: string;
  size: number;
  createdAt: string;
};

type TableCount = {
  name: string;
  label: string;
  count: number;
};

export default function AdminClearDataPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Real-time table row counts
  const [tableCounts, setTableCounts] = useState<TableCount[]>([]);

  // Server-side backups states
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [newBackupName, setNewBackupName] = useState<string>('');
  const [selectedBackupFilename, setSelectedBackupFilename] = useState<string>('');
  const [selectedBackupCounts, setSelectedBackupCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch details of selected backup file to compare
  useEffect(() => {
    if (selectedBackupFilename) {
      fetchBackupInfo(selectedBackupFilename);
    } else {
      setSelectedBackupCounts({});
    }
  }, [selectedBackupFilename]);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchBrandsAndCounts(), fetchBackups()]);
    setLoading(false);
  };

  const fetchBrandsAndCounts = async () => {
    try {
      const res = await fetch('/api/admin/clean-data');
      const data = await res.json();
      if (data.success) {
        if (data.brands) {
          setBrands(data.brands);
          if (data.brands.length > 0 && !selectedBrandId) {
            setSelectedBrandId(data.brands[0].id);
          }
        }
        if (data.tableCounts) {
          setTableCounts(data.tableCounts);
        }
      }
    } catch (err) {
      console.error('Failed to load brands/counts:', err);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/admin/backup-restore');
      const data = await res.json();
      if (data.success && data.backups) {
        setBackups(data.backups);
        if (data.backups.length > 0) {
          setSelectedBackupFilename(data.backups[0].filename);
        } else {
          setSelectedBackupFilename('');
        }
      }
    } catch (err) {
      console.error('Failed to load backups list:', err);
    }
  };

  const fetchBackupInfo = async (filename: string) => {
    try {
      const res = await fetch('/api/admin/backup-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-backup-info',
          filename
        })
      });
      const data = await res.json();
      if (data.success && data.counts) {
        setSelectedBackupCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch backup info:', err);
    }
  };

  const handleCleanData = async (actionType: 'clear-transactions' | 'clear-all-transactions' | 'delete-brand') => {
    if (!confirmDelete) {
      alert('กรุณาติ๊กถูกที่กล่องยืนยันก่อนทำรายการลบข้อมูลครับ');
      return;
    }

    const selectedBrandName = brands.find(b => b.id === selectedBrandId)?.name || 'แบรนด์ที่เลือก';
    
    let actionText = '';
    if (actionType === 'clear-all-transactions') {
      actionText = 'ลบข้อมูลธุรกรรมการขายทั้งหมดทุกแบรนด์';
    } else if (actionType === 'clear-transactions') {
      actionText = `ลบข้อมูลธุรกรรมการขายทั้งหมดของแบรนด์ "${selectedBrandName}"`;
    } else if (actionType === 'delete-brand') {
      actionText = `⚠️ ลบแบรนด์ "${selectedBrandName}" พร้อมกับสินค้า สูตรอาหาร โต๊ะ สถิติ และบัญชีผู้ใช้ (Profiles/Auth Accounts) ทั้งหมดของแบรนด์นี้`;
    }

    if (!confirm(actionText + ' ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้!')) {
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/clean-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: actionType === 'clear-all-transactions' ? null : selectedBrandId,
          action: actionType
        })
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'ดำเนินการสำเร็จแล้ว!' });
        setConfirmDelete(false);
        await fetchBrandsAndCounts();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'ดำเนินการล้มเหลว' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setLoading(false);
    }
  };

  // --- 📥 Backup Full System Server-Side ---
  const handleBackup = async () => {
    const backupName = newBackupName.trim();
    if (!backupName) {
      alert('กรุณากรอกชื่อสำหรับบันทึกข้อมูลสำรองก่อนครับ');
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/backup-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'backup',
          name: backupName
        })
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'สำรองข้อมูลทั้งระบบเรียบร้อย!' });
        setNewBackupName('');
        await Promise.all([fetchBackups(), fetchBrandsAndCounts()]);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'การสำรองข้อมูลล้มเหลว' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการสำรองข้อมูล' });
    } finally {
      setLoading(false);
    }
  };

  // --- 📤 Restore Full System Server-Side ---
  const handleRestore = async () => {
    if (!selectedBackupFilename) {
      alert('กรุณาเลือกไฟล์สำรองที่ต้องการกู้คืนก่อนครับ');
      return;
    }
    
    if (!confirmDelete) {
      alert('กรุณาติ๊กถูกที่กล่องยืนยันก่อนทำรายการกู้คืนข้อมูลครับ');
      return;
    }

    const selectedBackup = backups.find(b => b.filename === selectedBackupFilename);
    const backupLabel = selectedBackup 
      ? `"${selectedBackup.customName}" (${selectedBackup.createdAt})` 
      : 'ไฟล์ที่เลือก';

    if (!confirm(`⚠️ คำเตือน: ระบบจะลบข้อมูลปัจจุบันทั้งหมดในทุกตาราง และกู้คืนกลับสู่สถานะเดิมตามไฟล์สำรอง ${backupLabel} ใช่หรือไม่?`)) {
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/backup-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          filename: selectedBackupFilename
        })
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'กู้คืนข้อมูลระบบทั้งหมดสำเร็จ!' });
        setConfirmDelete(false);
        await Promise.all([fetchBrandsAndCounts(), fetchBackups()]);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'การกู้คืนข้อมูลล้มเหลว' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อกู้คืนข้อมูล' });
    } finally {
      setLoading(false);
    }
  };

  // --- ❌ Delete Backup File from Server ---
  const handleDeleteBackupFile = async () => {
    if (!selectedBackupFilename) return;

    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์สำรองข้อมูลนี้ออกจากเซิร์ฟเวอร์ถาวร?')) {
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/backup-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          filename: selectedBackupFilename
        })
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'ลบไฟล์สำเร็จ!' });
        setSelectedBackupFilename('');
        await fetchBackups();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'ลบไฟล์ล้มเหลว' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการลบไฟล์' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-[#EFECE6] pb-5 mb-6">
        <h2 className="text-2xl font-black text-[#2C4A34] flex items-center gap-3">
          <span className="p-2.5 bg-[#E85F5F] text-white rounded-xl shadow-md">
            <IconTrash size={24} />
          </span>
          ระบบจัดการฐานข้อมูลและย้อนระบบ (Database Snapshot & Developer Tools)
        </h2>
        <p className="text-[#608367] text-sm mt-2 font-medium">
          สำรองข้อมูลทั้งระบบเพื่อทำจุดย้อนกลับ (Snapshot), กู้คืนระบบ และล้างยอดขายสำหรับการทดสอบแบบวงรอบหน้าร้าน POS ได้อย่างอิสระ
        </p>
      </div>

      {/* Warning Box */}
      <div className="bg-[#FFF3F3] border border-[#FCD2D2] rounded-2xl p-4 mb-6 flex gap-3 text-xs leading-relaxed">
        <div className="text-[#D32F2F] mt-0.5 shrink-0">
          <IconAlert size={22} />
        </div>
        <div>
          <h4 className="text-[#A81F1F] font-bold mb-0.5">ข้อแนะนำการใช้เครื่องมือประมวลผลข้อมูล</h4>
          <p className="text-[#C62828] font-medium">
            ปุ่มคำสั่งล้างข้อมูลและกู้คืน (Restore) จะมีผลต่อแถวใน Database โดยตรง กรุณาเปิดใช้งานด้วยการติ๊กกล่องยืนยันสีเขียวด้านล่างก่อนใช้งานปุ่มอันตรายต่างๆ ครับ
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div className={`p-4 rounded-xl mb-6 flex gap-3 items-center border ${
          statusMsg.type === 'success' 
            ? 'bg-[#EAFDF1] border-[#C2F5D7] text-[#1E5A35]' 
            : 'bg-[#FFF3F3] border-[#FCD2D2] text-[#A81F1F]'
        }`}>
          <span className={statusMsg.type === 'success' ? 'text-[#2E7D32]' : 'text-[#D32F2F]'}>
            {statusMsg.type === 'success' ? <IconCheck /> : <IconAlert />}
          </span>
          <span className="font-bold text-sm text-left">{statusMsg.text}</span>
        </div>
      )}

      {/* Main Grid Layout - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Side: Backup & Restore Controls (Takes 2.5/4 cols) */}
        <div className="xl:col-span-2.5 space-y-6 lg:col-span-2">
          
          {/* Step 1: Confirmation Checkbox */}
          <div className="bg-white p-4 rounded-xl border border-[#D0DDD0] flex items-start gap-3">
            <input 
              type="checkbox" 
              id="checkbox-confirm"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-[#5F8565] cursor-pointer rounded"
            />
            <label htmlFor="checkbox-confirm" className="text-sm font-bold text-[#2C4A34] select-none cursor-pointer">
              ฉันยืนยันว่าเข้าใจกฎและต้องการสั่งทำลายข้อมูล / กู้คืนย้อนกลับฐานข้อมูลจริง (ติ๊กถูกเพื่อเปิดใช้งานปุ่มอันตราย)
            </label>
          </div>

          {/* 🌿 SECTION 1: FULL SYSTEM SNAPSHOT & ROLLBACK */}
          <div className="bg-white p-6 rounded-2xl border border-[#D5E4D5] space-y-6 shadow-sm">
            <h3 className="font-bold text-base text-[#1E3A27] flex items-center gap-2">
              <span className="p-1.5 bg-[#E2ECE2] text-[#3B5E44] rounded-lg"><IconDatabase size={16} /></span>
              ระบบสำรองและย้อนกลับฐานข้อมูลทั้งระบบ (Full System Backup & Rollback)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Backup */}
              <div className="bg-[#FAF9F5] p-5 rounded-xl border border-[#EFECE6] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-[#2C4A34]">1. สำรองข้อมูลทั้งระบบ</h4>
                  <p className="text-[10px] text-[#608367] leading-relaxed">
                    บันทึกข้อมูลทุกแบรนด์, สินค้า, สูตรอาหาร, โต๊ะ และบัญชีผู้ใช้จริงในระบบลงเซิร์ฟเวอร์
                  </p>
                  <input
                    type="text"
                    placeholder="ตั้งชื่อสำรอง เช่น ก่อนล้างข้อมูล, เทสสินค้าเสร็จ"
                    value={newBackupName}
                    onChange={(e) => setNewBackupName(e.target.value)}
                    disabled={loading}
                    className="w-full bg-white border border-[#D0DDD0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2C4A34] focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleBackup}
                  disabled={loading || !newBackupName.trim()}
                  className={`w-full py-3.5 rounded-xl font-black text-xs text-white transition-all flex items-center gap-2 justify-center shadow active:scale-95 ${
                    loading || !newBackupName.trim()
                      ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                      : 'bg-[#5F8565] hover:bg-[#4C6D51]'
                  }`}
                >
                  <span>สำรองข้อมูลทั้งระบบ</span>
                </button>
              </div>

              {/* Restore */}
              <div className="bg-[#FAF9F5] p-5 rounded-xl border border-[#EFECE6] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-[#A81F1F]">2. ย้อนกลับระบบจากไฟล์สำรอง</h4>
                  <p className="text-[10px] text-[#608367] leading-relaxed">
                    เลือก Snapshot ไฟล์สะสมประวัติสำรองข้อมูลที่จัดเก็บไว้ในเซิร์ฟเวอร์เพื่อกู้คืนสภาพ
                  </p>
                  <select
                    value={selectedBackupFilename}
                    onChange={(e) => setSelectedBackupFilename(e.target.value)}
                    disabled={loading || backups.length === 0}
                    className="w-full bg-white border border-[#D0DDD0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2C4A34] focus:outline-none"
                  >
                    <option value="">-- กรุณาเลือกไฟล์สำรองเพื่อดูเปรียบเทียบ --</option>
                    {backups.map(b => (
                      <option key={b.filename} value={b.filename}>
                        {b.createdAt} - {b.customName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleRestore}
                    disabled={loading || !confirmDelete || !selectedBackupFilename}
                    className={`flex-1 py-3.5 rounded-xl font-black text-xs text-white transition-all flex items-center gap-2 justify-center shadow active:scale-95 ${
                      loading || !confirmDelete || !selectedBackupFilename
                        ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                        : 'bg-[#E85F5F] hover:bg-[#D32F2F]'
                    }`}
                  >
                    <span>กู้คืนข้อมูล (Restore)</span>
                  </button>
                  <button
                    onClick={handleDeleteBackupFile}
                    disabled={loading || !selectedBackupFilename}
                    title="ลบไฟล์สำรองนี้"
                    className={`px-4 rounded-xl font-black text-xs text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center active:scale-95 ${
                      loading || !selectedBackupFilename ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 💥 SECTION 2: DELETE ACTIONS */}
          <div className="bg-white p-6 rounded-2xl border border-[#EFECE6] space-y-5 shadow-sm">
            <h3 className="font-bold text-base text-[#2C4A34] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
              เครื่องมือทำลายข้อมูลและลบร้านค้า (Delete Tools)
            </h3>
            
            {/* Brand Dropdown (Shared for Brand Specific Actions) */}
            <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#EFECE6] flex flex-col gap-2">
              <label className="text-xs font-black text-[#608367]">เลือกแบรนด์ที่ต้องการเคลียร์ข้อมูล/ลบแบรนด์:</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-[#D0DDD0] rounded-xl px-4 py-3 text-xs font-bold text-[#2C4A34] focus:outline-none"
              >
                {brands.length === 0 ? (
                  <option value="">-- ไม่พบรายชื่อแบรนด์ --</option>
                ) : (
                  brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-4">
              
              {/* Action 1: Clear Specific Brand Transactions */}
              <div className="p-4 rounded-xl border border-[#FAF9F5] bg-[#FAF9F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[#2C4A34]">ล้างประวัติการขายเฉพาะของแบรนด์ที่เลือก (Clear Sales Transactions)</h4>
                  <p className="text-[11px] text-[#608367] mt-1">ลบเฉพาะบิลขาย ประวัติชำระเงิน และสต็อกสินค้าของร้านนี้ โดยคงแบรนด์ แคชเชียร์ และสินค้าไว้ครบ</p>
                </div>
                <button
                  onClick={() => handleCleanData('clear-transactions')}
                  disabled={loading || !confirmDelete || !selectedBrandId}
                  className={`px-5 py-3 rounded-xl font-black text-xs text-white transition-all flex items-center gap-2 justify-center shadow active:scale-95 shrink-0 ${
                    loading || !confirmDelete || !selectedBrandId
                      ? 'bg-gray-400 opacity-50 cursor-not-allowed' 
                      : 'bg-[#5F8565] hover:bg-[#4C6D51]'
                  }`}
                >
                  <IconTrash size={14} />
                  <span>ล้างยอดขาย</span>
                </button>
              </div>

              {/* Action 2: Fully Delete Brand */}
              <div className="p-4 rounded-xl border border-red-50 bg-red-50/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[#D32F2F]">ลบแบรนด์ ข้อมูลร้านค้า และบัญชีผู้ใช้ทั้งหมด (Full Brand & Accounts Wipe)</h4>
                  <p className="text-[11px] text-red-600/80 mt-1">ลบสินค้า สูตรอาหาร โต๊ะ บิล และ**ทำลายรหัสล็อกอินในระบบทั้งหมดของแบรนด์นี้ออกจาก Supabase Auth**</p>
                </div>
                <button
                  onClick={() => handleCleanData('delete-brand')}
                  disabled={loading || !confirmDelete || !selectedBrandId}
                  className={`px-5 py-3 rounded-xl font-black text-xs text-white transition-all flex items-center gap-2 justify-center shadow active:scale-95 shrink-0 ${
                    loading || !confirmDelete || !selectedBrandId
                      ? 'bg-gray-400 opacity-50 cursor-not-allowed' 
                      : 'bg-[#D32F2F] hover:bg-[#B71C1C]'
                  }`}
                >
                  <IconUser size={14} />
                  <span>ทำลายแบรนด์ & ไอดีผู้ใช้</span>
                </button>
              </div>

              {/* Action 3: Clear All Transactions */}
              <div className="p-4 rounded-xl border border-[#FAF9F5] bg-[#FAF9F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[#2C4A34]">ล้างประวัติยอดขายรวมทุกแบรนด์ในระบบ (Global Sales Wipe)</h4>
                  <p className="text-[11px] text-[#608367] mt-1">ลบประวัติออเดอร์และการจ่ายเงินทั้งหมดของทุกแบรนด์ใน Database เพื่อรีเซ็ตค่าสรุปผลแดชบอร์ด</p>
                </div>
                <button
                  onClick={() => handleCleanData('clear-all-transactions')}
                  disabled={loading || !confirmDelete}
                  className={`px-5 py-3 rounded-xl font-black text-xs text-white transition-all flex items-center gap-2 justify-center shadow active:scale-95 shrink-0 ${
                    loading || !confirmDelete
                      ? 'bg-gray-400 opacity-50 cursor-not-allowed' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <IconTrash size={14} />
                  <span>ล้างยอดขายรวม</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right Side: LIVE & BACKUP DATABASE COMPARISON TABLE (Takes 1.5/4 cols or 1 col) */}
        <div className="xl:col-span-1.5 lg:col-span-1">
          <div className="bg-[#FAF9F5] border border-[#EFECE6] rounded-2xl p-4 shadow-sm space-y-4 sticky top-6">
            
            <div className="flex justify-between items-center border-b border-[#EFECE6] pb-3">
              <h3 className="font-black text-sm text-[#2C4A34] flex items-center gap-2">
                <span className="text-[#5F8565]"><IconDatabase size={18} /></span>
                ตารางเปรียบเทียบข้อมูล
              </h3>
              <button 
                onClick={fetchBrandsAndCounts}
                disabled={loading}
                title="รีเฟรชข้อมูลปจบ."
                className="p-1.5 hover:bg-[#E2ECE2] rounded-xl text-[#608367] transition-all hover:text-[#2C4A34] active:scale-95 disabled:opacity-40"
              >
                <IconRefresh size={16} />
              </button>
            </div>

            {tableCounts.length === 0 ? (
              <div className="text-center py-8 text-xs font-semibold text-[#8FAF96]">
                กำลังโหลดจำนวนข้อมูล...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D0DDD0] text-[#608367] font-bold">
                      <th className="py-2 pr-2">ชื่อตาราง</th>
                      <th className="py-2 px-2 text-center">ปจบ.</th>
                      {selectedBackupFilename && (
                        <>
                          <th className="py-2 px-2 text-center">สำรอง</th>
                          <th className="py-2 pl-2 text-center">ผลต่าง</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {tableCounts.map(t => {
                      const currentCount = t.count;
                      const backupCount = selectedBackupFilename 
                        ? (selectedBackupCounts[t.name] ?? 0) 
                        : null;
                      
                      const diff = backupCount !== null ? backupCount - currentCount : 0;

                      return (
                        <tr key={t.name} className="hover:bg-[#E2ECE2]/20 transition-all">
                          <td className="py-2.5 pr-2 font-bold text-[#3B5E44]">{t.label}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-[#2C4A34]">
                            {currentCount.toLocaleString()}
                          </td>
                          {backupCount !== null && (
                            <>
                              <td className="py-2.5 px-2 text-center font-bold text-[#2C4A34] bg-white/40">
                                {backupCount.toLocaleString()}
                              </td>
                              <td className="py-2.5 pl-2 text-center">
                                {diff > 0 ? (
                                  <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-black bg-[#EAFDF1] text-[#1E5A35]">
                                    +{diff}
                                  </span>
                                ) : diff < 0 ? (
                                  <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-black bg-[#FFF3F3] text-[#A81F1F]">
                                    {diff}
                                  </span>
                                ) : (
                                  <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-black bg-gray-100 text-gray-400">
                                    0
                                  </span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="pt-2 text-[10px] text-center text-[#8FAF96] font-bold">
              {selectedBackupFilename 
                ? "*คอลัมน์ผลต่างคำนวณจาก [ในไฟล์สำรอง - จำนวนปจบ.]"
                : "*เลือกไฟล์สำรองเพื่อดูเปรียบเทียบก่อนกู้คืน"
              }
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
