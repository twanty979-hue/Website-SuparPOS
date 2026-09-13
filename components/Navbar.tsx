'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img 
    src="/icon.png" 
    alt="POS Foodscan Icon" 
    className={`object-contain ${className}`}
  />
);

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              POS <span className="text-emerald-500">Foodscan</span>
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
        </div>
      )}
    </nav>
  );
}
