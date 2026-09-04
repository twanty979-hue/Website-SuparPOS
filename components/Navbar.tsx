'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img 
    src="/icon.png" 
    alt="SuparPOS Icon" 
    className={`object-contain ${className}`}
  />
);

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ avatar_url?: string; full_name?: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('avatar_url, full_name')
            .eq('id', session.user.id)
            .single();
            
          setProfile(profileData as { avatar_url?: string; full_name?: string } | null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkUser();
  }, []);

  const getAvatarUrlForNavbar = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`; 
  };

  const navLinks = [
    { href: '/', label: 'หน้าแรก' },
    { href: '/features', label: 'จุดเด่น' },
    { href: '/pricing', label: 'ราคา' },
    { href: '/manual', label: 'วิธีใช้งาน' },
    { href: '/download', label: 'ดาวน์โหลด', hasIcon: true },
    { href: '/setup-printer', label: 'ตั้งค่าเครื่องพิมพ์' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 py-3.5 px-6 lg:px-12 bg-white/95 backdrop-blur-md text-slate-700 border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300 overflow-hidden border border-emerald-100">
            <LogoIcon className="w-full h-full p-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-800 leading-none group-hover:text-emerald-600 transition-colors">
              Supar<span className="text-emerald-500">POS</span>
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-7 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors relative group flex items-center gap-1.5 py-1 ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-600 hover:text-emerald-500'
                }`}
              >
                {link.hasIcon && (
                  <i className="fa-solid fa-cloud-arrow-down text-emerald-500 text-sm"></i>
                )}
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </Link>
            );
          })}

          {/* Auth Button */}
          {isAuthLoading ? (
            <div className="w-24 h-10 bg-slate-200 animate-pulse rounded-full"></div>
          ) : user ? (
            <Link
              href="https://app.suparpos.com"
              className="flex items-center gap-3 p-1 pr-4 bg-white border border-slate-200 rounded-full hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center border border-slate-100">
                {profile?.avatar_url ? (
                  <img
                    src={getAvatarUrlForNavbar(profile.avatar_url)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fa-solid fa-user text-emerald-500 text-sm"></i>
                )}
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
                {profile?.full_name?.split(' ')[0] || 'แดชบอร์ด'}
              </span>
            </Link>
          ) : (
            <Link
              href="https://app.suparpos.com"
              className="relative px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-full transition-all shadow-md shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 overflow-hidden group text-sm"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine"></span>
              <span className="relative z-10">เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-2xl focus:outline-none hover:text-emerald-500 transition-colors p-1"
          aria-label="Toggle Navigation"
        >
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-lg text-gray-800 shadow-2xl md:hidden flex flex-col items-center py-6 gap-5 border-t border-gray-100 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base transition-colors ${
                  isActive ? 'text-emerald-600 font-black' : 'text-slate-700 font-medium hover:text-emerald-600'
                }`}
              >
                {link.hasIcon && (
                  <i className="fa-solid fa-cloud-arrow-down text-emerald-500 text-sm mr-1.5"></i>
                )}
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 w-4/5 flex justify-center">
            {!isAuthLoading && user ? (
              <Link
                href="https://app.suparpos.com"
                className="flex items-center gap-3 text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/30 w-full justify-center"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={getAvatarUrlForNavbar(profile.avatar_url)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fa-solid fa-user text-white text-xs"></i>
                  )}
                </div>
                เข้าสู่แดชบอร์ด
              </Link>
            ) : (
              <Link
                href="https://app.suparpos.com"
                className="text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/30 w-full text-center"
              >
                สมัครใช้งานฟรี
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
