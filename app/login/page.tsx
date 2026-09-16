'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { clearBrowserData } from '@/lib/clearBrowserData';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resettingSession, setResettingSession] = useState(false);
  const resetStarted = useRef(false);

  // Recovery State: 'none' | 'request' | 'verify'
  const [recoveryStep, setRecoveryStep] = useState<'none' | 'request' | 'verify'>('none');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'suparpos.com' || host === 'www.suparpos.com') {
        window.location.href = 'https://app.suparpos.com/';
        return;
      }
    }

    const checkSession = async () => {
      const resetReason = searchParams.get('reset');
      if (resetReason === 'store_changed') {
        if (resetStarted.current) return;
        resetStarted.current = true;
        setResettingSession(true);

        await supabase.auth.signOut({ scope: 'local' });
        await clearBrowserData();

        window.history.replaceState({}, '', '/login');
        setSuccessMsg('สิทธิ์การเข้าถึงร้านมีการเปลี่ยนแปลง ระบบล้างข้อมูลร้านเดิมเพื่อความปลอดภัยแล้ว กรุณาเข้าสู่ระบบใหม่');
        setResettingSession(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('brand_id, role')
          .eq('id', session.user.id)
          .single();

        if (profile?.brand_id) {
          router.replace('/success');
        } else {
          router.replace('/register');
        }
      }
    };
    checkSession();
  }, [router, searchParams]);

  const addGmailSuffix = () => {
    if (!email.includes('@')) setEmail((prev) => prev + '@gmail.com');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/register')}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (sessionError) throw sessionError;

      router.push('/success');
    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  // 1. ส่งรหัส OTP ไปที่อีเมล
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source: 'web' }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'ส่งรหัส OTP ไม่สำเร็จ');
      }

      setSuccessMsg(`ระบบส่งรหัส OTP 8 หลักไปที่อีเมล ${cleanEmail} เรียบร้อยแล้ว`);
      setRecoveryStep('verify');
      setResendCooldown(60);
    } catch (error: any) {
      setErrorMsg(error.message || 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // 2. ยืนยันรหัส OTP และตั้งรหัสผ่านใหม่ทันที
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanOtp = otpCode.trim();

    if (cleanOtp.length < 6) {
      setErrorMsg('กรุณากรอกรหัส OTP ให้ครบถ้วน');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          token: cleanOtp,
          type: 'recovery',
        }),
      });
      const verifyResult = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyResult.error || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
      }
      if (!verifyResult.ticket) {
        throw new Error('ไม่พบรหัสยืนยันความปลอดภัย กรุณาขอ OTP ใหม่');
      }

      const passwordResponse = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword,
          ticket: verifyResult.ticket,
        }),
      });
      const passwordResult = await passwordResponse.json();
      if (!passwordResponse.ok) {
        throw new Error(passwordResult.error || 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ');
      }

      setSuccessMsg('🎉 เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
      setRecoveryStep('none');
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการตรวจสอบ OTP');
    } finally {
      setLoading(false);
    }
  };

  if (resettingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-blue-400" />
          <h1 className="text-xl font-black">กำลังรักษาความปลอดภัยของข้อมูล</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            กำลังออกจากระบบและล้างข้อมูลร้านเดิมทั้งหมดจากอุปกรณ์นี้ กรุณาอย่าปิดหน้านี้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] relative overflow-hidden p-4">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-200/50 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-200/40 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>

      <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl shadow-slate-900/5 border border-slate-100 backdrop-blur-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-[82px] h-[82px] bg-gradient-to-br from-[#E8F8EC] to-[#D1F3D9] rounded-3xl flex items-center justify-center shadow-lg shadow-green-700/20 mx-auto mb-4 p-2 border border-[#B7E7C3] relative overflow-hidden">
            <Image src="/icon.png" alt="POS FoodScan" fill className="object-contain p-2" priority />
          </div>

          <p className="mb-1 text-sm font-black tracking-[0.12em] text-[#15803D]">POS FoodScan</p>

          <h1 className="text-2xl font-black text-slate-900">
            {recoveryStep === 'verify'
              ? 'กรอกรหัส OTP ยืนยัน'
              : recoveryStep === 'request'
              ? 'ลืมรหัสผ่าน'
              : 'ยินดีต้อนรับกลับ!'}
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">
            {recoveryStep === 'verify'
              ? `กรอกรหัส OTP 8 หลักที่ส่งไปที่ ${email}`
              : recoveryStep === 'request'
              ? 'ระบุอีเมลเพื่อรับรหัส OTP 8 หลักในการตั้งรหัสผ่านใหม่'
              : 'เข้าสู่ระบบ POS FoodScan'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. หน้าล็อกอินปกติ */}
        {recoveryStep === 'none' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">อีเมล</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all font-medium text-slate-800 text-sm"
                  placeholder="ชื่ออีเมลของคุณ"
                />
                {email.length > 0 && !email.includes('@') && (
                  <button type="button" onClick={addGmailSuffix} className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold bg-green-100 text-green-800 px-2.5 py-1 rounded-xl hover:bg-green-200 transition-colors">
                    + @gmail.com
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">รหัสผ่าน</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all font-medium text-slate-800 text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setRecoveryStep('request');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-bold text-green-700 hover:text-green-800 transition-colors cursor-pointer"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-black transition-all shadow-md shadow-green-800/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

            <div className="text-center pt-4">
              <span className="text-xs text-slate-500">ยังไม่มีบัญชีร้านค้า? </span>
              <Link href="/register" className="text-xs font-bold text-green-700 hover:text-green-800 underline">
                สมัครเปิดร้านใหม่
              </Link>
            </div>
          </form>
        )}

        {/* 2. หน้าขอยื่น OTP ลืมรหัสผ่าน (Step 1) */}
        {recoveryStep === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">อีเมลของคุณ</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all font-medium text-slate-800 text-sm"
                  placeholder="กรอกอีเมลที่ใช้สมัคร"
                />
                {email.length > 0 && !email.includes('@') && (
                  <button type="button" onClick={addGmailSuffix} className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold bg-green-100 text-green-800 px-2.5 py-1 rounded-xl hover:bg-green-200 transition-colors">
                    + @gmail.com
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-black transition-all shadow-md shadow-green-800/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'กำลังส่งรหัส OTP...' : 'ส่งรหัสยืนยัน OTP 8 หลัก'}
            </button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => {
                  setRecoveryStep('none');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← ย้อนกลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </form>
        )}

        {/* 3. หน้ายืนยันรหัส OTP 6 หลัก + ตั้งรหัสผ่านใหม่ (Step 2 - ที่นายขอมา!) */}
        {recoveryStep === 'verify' && (
          <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                รหัสยืนยัน OTP 8 หลัก (ส่งไปที่อีเมล {email})
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-green-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600/30 text-center font-black text-2xl tracking-[0.4em] text-slate-900"
                placeholder="12345678"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">รหัสผ่านใหม่</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all font-medium text-slate-800 text-sm"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all font-medium text-slate-800 text-sm"
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">ไม่ได้รับรหัส?</span>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleRequestOtp}
                className="text-[11px] font-bold text-green-700 hover:text-green-800 disabled:text-slate-400 cursor-pointer"
              >
                {resendCooldown > 0 ? `ส่งรหัสใหม่ได้ใน ${resendCooldown} วินาที` : 'ส่งรหัส OTP ใหม่อีกครั้ง'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'กำลังบันทึกรหัสผ่านใหม่...' : 'ยืนยันรหัส OTP และตั้งรหัสผ่านใหม่'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setRecoveryStep('none');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
