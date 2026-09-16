'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Store, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Building2,
  Check,
  AlertCircle,
  Download,
  ExternalLink,
  Printer,
  Wifi,
  Bell
} from 'lucide-react';

type Step = 'register' | 'otp' | 'store_setup';

const DEFAULT_ONBOARDING_PREVIEW_LIMITS = {
  max_food_items: 50,
  max_products: 50,
  max_tables: 10,
};

function RegisterForm() {
  const router = useRouter();

  // Current Step
  const [step, setStep] = useState<Step>('register');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3: Owner & Store Info
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [useSamePhone, setUseSamePhone] = useState(true);
  // เก็บ UI เดิมไว้แบบซ่อนเพื่อไม่รบกวนงานดีไซน์ค้างเดิม การตั้งค่าจริงอยู่ที่ /onboarding
  const [tableCount, setTableCount] = useState(10);
  const [storeType, setStoreType] = useState('restaurant');
  const planLimits = DEFAULT_ONBOARDING_PREVIEW_LIMITS;
  const limitsLoading = false;
  const limitsWarning: string | null = null;
  const starterFoodCount = 6;

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Initial check: if user already has a session
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setUserId(session.user.id);
        const metadata = session.user.user_metadata || {};
        if (metadata.full_name || metadata.name) {
          setFullName(metadata.full_name || metadata.name || '');
        }

        // Check if user already has brand_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('brand_id, full_name, phone')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.brand_id) {
          router.replace('/success');
        } else {
          // Has account, but needs store setup
          if (profile?.full_name) setFullName(profile.full_name);
          if (profile?.phone) setPhone(profile.phone);
          setStep('store_setup');
        }
      } catch (err) {
        console.error('Initial session check error:', err);
      }
    };
    checkInitialSession();
  }, [router]);

  // Shortcut to add @gmail.com
  const addGmailSuffix = () => {
    if (!email.includes('@')) {
      setEmail((prev) => prev + '@gmail.com');
    }
  };

  // Google OAuth
  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/register')}&source=web`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || 'ไม่สามารถสมัครด้วย Google ได้');
      setLoading(false);
    }
  };

  // Step 1: Submit Register Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('กรุณากรอกอีเมล');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          source: 'web',
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'การสมัครสมาชิกล้มเหลว');
      }

      // If session returned immediately (Auto Confirm enabled)
      if (result.session && result.session.access_token) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        if (result.user?.id) setUserId(result.user.id);
        setStep('store_setup');
        setSuccessMsg('สมัครสมาชิกสำเร็จ! กรุณาตั้งค่าข้อมูลร้านค้าของคุณ');
      } else {
        // Need OTP Email Verification
        setStep('otp');
        setResendCooldown(60);
        setSuccessMsg(`ระบบได้ส่งรหัส OTP 8 หลักไปที่ ${cleanEmail} แล้ว`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input
  const handleOtpChange = (index: number, val: string) => {
    // If pasted full 8 digit code
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 8).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 8) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 7);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    const cleanChar = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanChar;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanChar && index < 7) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const token = otp.join('').trim();
    if (token.length < 8) {
      setErrorMsg('กรุณากรอกรหัส OTP 8 หลักให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          token,
          type: 'signup',
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
      }

      if (result.session) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }

      if (result.user?.id) {
        setUserId(result.user.id);
      }

      setSuccessMsg('ยืนยันรหัส OTP สำเร็จ!');
      setStep('store_setup');
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบ OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type: 'signup',
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'ส่งรหัสใหม่ไม่สำเร็จ');
      setResendCooldown(60);
      setSuccessMsg('ส่งรหัส OTP ใหม่ไปยังอีเมลเรียบร้อยแล้ว');
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการส่ง OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Store Setup & Enter Dashboard
  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanShopName = shopName.trim();
    const effectiveShopPhone = useSamePhone ? cleanPhone : (shopPhone.trim() || cleanPhone);

    if (!cleanFullName) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุลของคุณ');
      return;
    }
    if (!cleanShopName) {
      setErrorMsg('กรุณากรอกชื่อร้านค้า');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
      }

      const activeUserId = userId || session.user.id;

      // 1. บันทึก Profile เจ้าของร้าน
      const profileRes = await fetch('/api/setup/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: activeUserId,
          fullName: cleanFullName,
          phone: cleanPhone,
          avatarUrl: '',
        }),
      });
      const profileResult = await profileRes.json();
      if (!profileRes.ok) {
        throw new Error(profileResult.error || 'บันทึกโปรไฟล์ไม่สำเร็จ');
      }

      // 2. สร้าง Brand ร้านค้าใหม่
      const brandRes = await fetch('/api/setup/brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: activeUserId,
          shopName: cleanShopName,
          shopPhone: effectiveShopPhone,
        }),
      });
      const brandResult = await brandRes.json();
      if (!brandRes.ok) {
        throw new Error(brandResult.error || 'สร้างร้านค้าไม่สำเร็จ');
      }

      const createdBrandId = brandResult.brandId;
      if (!createdBrandId) {
        throw new Error('ไม่พบรหัสร้านค้าที่สร้าง');
      }

      // 3. ไปที่หน้าสร้างร้านสำเร็จ (หน้าแยก /success) พร้อมตัวเลือกระบบดาวน์โหลด 3 ช่องทาง
      router.replace(`/success?email=${encodeURIComponent(email)}&shop=${encodeURIComponent(cleanShopName)}`);

    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการตั้งค่าร้านค้า');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-sky-50 relative overflow-hidden p-4 sm:p-6 font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-brand-300/30 rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/25 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-brand-500/10 border border-white/80 p-6 sm:p-10 relative z-10 transition-all duration-300">
        
        {/* Top Logo & Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-brand-500/15 mx-auto mb-4 p-2 border border-slate-100 relative overflow-hidden group">
            <Image
              src="/icon.png"
              alt="SuparPOS Logo"
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('fallback-icon');
              }}
            />
            <Store className="w-10 h-10 text-brand-500 hidden fallback-icon:block absolute" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100/80 text-brand-600 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            เปิดร้านง่าย ขายคล่อง ทันสมัย
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {step === 'register' && 'สร้างบัญชีร้านค้าใหม่'}
            {step === 'otp' && 'ยืนยันความปลอดภัย'}
            {step === 'store_setup' && 'ตั้งค่าร้านค้าของคุณ'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === 'register' && 'เริ่มต้นใช้งานระบบ SuparPOS ฟรีวันนี้'}
            {step === 'otp' && 'กรอกรหัสยืนยัน 8 หลักที่เราส่งไปยังอีเมล'}
            {step === 'store_setup' && 'เพียงไม่กี่ขั้นตอน ร้านของคุณก็พร้อมขาย'}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mb-8 px-2 sm:px-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-0">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: step === 'register' ? '0%' : step === 'otp' ? '50%' : '100%'
                }}
              />
            </div>

            {/* Step 1 Node */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                step === 'register' 
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-brand-500/30' 
                  : 'bg-emerald-500 text-white'
              }`}>
                {step !== 'register' ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 'register' ? 'text-brand-600' : 'text-slate-500'}`}>
                บัญชีผู้ใช้
              </span>
            </div>

            {/* Step 2 Node */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                step === 'otp' 
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-brand-500/30' 
                  : step === 'store_setup'
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white text-slate-400 border-2 border-slate-200'
              }`}>
                {step === 'store_setup' ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 'otp' ? 'text-brand-600' : 'text-slate-500'}`}>
                ยืนยัน OTP
              </span>
            </div>

            {/* Step 3 Node */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                step === 'store_setup' 
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-brand-500/30' 
                  : 'bg-white text-slate-400 border-2 border-slate-200'
              }`}>
                3
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 'store_setup' ? 'text-brand-600' : 'text-slate-500'}`}>
                ข้อมูลร้านค้า
              </span>
            </div>
          </div>
        </div>

        {/* Global Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && !errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-sm flex items-start gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
            <div className="flex-1 font-medium">{successMsg}</div>
          </div>
        )}

        {/* STEP 1: REGISTER */}
        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                อีเมล <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>
              {!email.includes('@') && email.length > 2 && (
                <button
                  type="button"
                  onClick={addGmailSuffix}
                  className="mt-1.5 text-xs text-brand-600 font-bold hover:text-brand-700 transition-colors inline-flex items-center gap-1"
                >
                  <span>+ เติม @gmail.com อัตโนมัติ</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รหัสผ่าน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ความยาวขั้นต่ำ 6 ตัวอักษร"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-gradient-to-r from-brand-600 to-sky-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-sky-700 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังสมัครสมาชิก...</span>
                </>
              ) : (
                <>
                  <span>สมัครสมาชิกฟรี</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="mt-8 text-center text-sm text-slate-500">
              มีบัญชีอยู่แล้ว? 
              <Link href="/login" className="text-brand-600 font-bold ml-1.5 hover:underline">
                เข้าสู่ระบบที่นี่
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 flex items-center justify-between text-xs">
              <div className="text-slate-600">
                ส่งรหัสไปที่: <strong className="text-slate-900">{email}</strong>
              </div>
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-brand-600 font-bold hover:underline"
              >
                แก้ไขอีเมล
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 text-center mb-3">
                กรอกรหัส OTP 8 หลัก
              </label>
              <div className="flex justify-center gap-1.5 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 8 : 1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 8}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-sky-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-sky-700 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังตรวจสอบรหัส...</span>
                </>
              ) : (
                <>
                  <span>ยืนยันรหัส OTP</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-xs text-slate-500 hover:text-brand-600 font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? (
                  <span>ส่งรหัสใหม่อีกครั้งได้ใน {resendCooldown} วินาที</span>
                ) : (
                  <span>ไม่ได้รับรหัส? ขอรหัส OTP อีกครั้ง</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: STORE & PROFILE SETUP */}
        {step === 'store_setup' && (
          <form onSubmit={handleCompleteSetup} className="space-y-5">
            {/* Section 1: Owner Info */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                <User className="w-4 h-4 text-brand-600" />
                <span>1. ข้อมูลเจ้าของร้าน</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ส่วนตัว
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Shop Info */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                <Store className="w-4 h-4 text-brand-600" />
                <span>2. ข้อมูลร้านค้าของคุณ</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อร้านค้า <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="เช่น ร้านกาแฟใจดี, ส้มตำยกครก"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    เบอร์โทรศัพท์ร้าน
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-brand-600 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={useSamePhone}
                      onChange={(e) => setUseSamePhone(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                    />
                    <span>ใช้เบอร์เดียวกับส่วนตัว</span>
                  </label>
                </div>

                {!useSamePhone ? (
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      placeholder="02-xxx-xxxx หรือ 08x-xxx-xxxx"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 text-xs font-medium">
                    {phone.trim() ? `ใช้เบอร์: ${phone.trim()}` : 'จะใช้เบอร์ส่วนตัวอัตโนมัติ'}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: ค่าเริ่มต้นระบบร้านค้าแบบแอป (Default Initial Configuration) */}
            <div className="hidden p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4" aria-hidden="true">
              <div className="flex items-center gap-2 text-xs font-black text-amber-800 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>3. ข้อมูลเริ่มต้นระบบร้านค้า (เหมือนในแอป)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ประเภทของร้านค้า
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'restaurant', label: '🍳 อาหารตามสั่ง/ไทย' },
                    { id: 'cafe', label: '☕ คาเฟ่/เครื่องดื่ม' },
                    { id: 'noodle', label: '🍜 ก๋วยเตี๋ยว/บะหมี่' },
                    { id: 'shabu', label: '🍲 ชาบู/หมูกระทะ' },
                    { id: 'japanese', label: '🍱 ญี่ปุ่น/นานาชาติ' },
                    { id: 'bar', label: '🍻 ผับ/บาร์/บันเทิง' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setStoreType(type.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                        storeType === type.id
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{type.label}</span>
                      {storeType === type.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    จำนวนโต๊ะเริ่มต้น
                  </label>
                  <span className="text-xs font-black text-amber-700">
                    {tableCount} โต๊ะ (T-01 ถึง T-{String(tableCount).padStart(2, '0')})
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-800">
                  <span>สิทธิ์แพ็กเกจฟรีจากระบบ</span>
                  <span>
                    {limitsLoading
                      ? 'กำลังอ่านลิมิต...'
                      : planLimits.max_tables === 0
                        ? 'โต๊ะไม่จำกัด'
                        : `สูงสุด ${planLimits.max_tables} โต๊ะ`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => {
                    const locked = planLimits.max_tables > 0 && count > planLimits.max_tables;
                    return (
                      <button
                        key={count}
                        type="button"
                        disabled={locked || limitsLoading}
                        onClick={() => setTableCount(count)}
                        title={locked ? `แพ็กเกจฟรีใช้ได้สูงสุด ${planLimits.max_tables} โต๊ะ` : undefined}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          locked
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 line-through'
                            : tableCount === count
                              ? 'cursor-pointer bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'cursor-pointer bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {locked && <Lock className="inline-block h-3 w-3 mr-1 -mt-0.5" />}
                        {count} โต๊ะ
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor="custom-table-count" className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
                    หรือระบุเอง
                  </label>
                  <input
                    id="custom-table-count"
                    type="number"
                    min={1}
                    max={planLimits.max_tables > 0 ? planLimits.max_tables : 100}
                    value={tableCount}
                    disabled={limitsLoading}
                    onChange={(event) => {
                      const requested = Math.max(1, Math.floor(Number(event.target.value) || 1));
                      setTableCount(
                        planLimits.max_tables > 0
                          ? Math.min(requested, planLimits.max_tables)
                          : Math.min(requested, 100),
                      );
                    }}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-black text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 disabled:bg-slate-100"
                  />
                  <span className="text-[10px] text-slate-400">
                    {planLimits.max_tables === 0 ? 'สูงสุด 100 โต๊ะต่อครั้ง' : `เลือกได้ 1–${planLimits.max_tables} โต๊ะ`}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    ระบบสร้างเมนูตัวอย่าง {starterFoodCount} รายการ และหมวดหมู่อัตโนมัติ
                    {planLimits.max_food_items > 0 && ` (ลิมิตอาหาร ${planLimits.max_food_items} รายการ)`}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>ตั้งค่าแบนเนอร์ร้านต้อนรับ และสต็อกสินค้าเริ่มต้น 100 ชิ้น</span>
                </div>
                {limitsWarning && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2 font-semibold text-amber-800">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                    <span>{limitsWarning}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || limitsLoading || !fullName.trim() || !shopName.trim()}
              className="w-full mt-2 py-4 bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-brand-500/25 hover:opacity-95 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึกและสร้างร้านของคุณ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>สร้างร้านและดูแดชบอร์ด</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          ระบบความปลอดภัยระดับสากล • ข้อมูลของคุณถูกเข้ารหัสอย่างปลอดภัย
        </p>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
