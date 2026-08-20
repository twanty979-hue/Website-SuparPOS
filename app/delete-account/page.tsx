'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export default function DeleteAccountPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoadingSession(false)
    })
  }, [])

  const signInWithPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError || !data.session) {
      setError(signInError?.message || 'เข้าสู่ระบบไม่สำเร็จ')
      return
    }
    setPassword('')
    setSession(data.session)
  }

  const signInWithGoogle = async () => {
    setError('')
    const redirectTo = `${window.location.origin}/auth/callback?next=/delete-account`
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (googleError) setError(googleError.message)
  }

  const submitRequest = async () => {
    if (!session || !confirmed) return
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      const response = await fetch('/api/account-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reason }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'ส่งคำขอไม่สำเร็จ')
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'ส่งคำขอไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setMessage('')
    setConfirmed(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-white px-4 py-12 text-slate-700">
      <section className="mx-auto max-w-xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline">
          <i className="fa-solid fa-arrow-left" /> กลับสู่ SuparPOS
        </Link>
        <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-slate-200/60">
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-7 text-white">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-xl"><i className="fa-solid fa-user-xmark" /></div>
            <h1 className="text-2xl font-black">ขอลบบัญชี SuparPOS</h1>
            <p className="mt-2 text-sm leading-6 text-white/90">หน้านี้ใช้ส่งคำขอลบบัญชีและข้อมูลที่เกี่ยวข้องอย่างปลอดภัย</p>
          </div>

          <div className="space-y-6 p-6 md:p-8">
            {loadingSession ? <p className="py-8 text-center text-sm font-bold text-slate-400">กำลังตรวจสอบการเข้าสู่ระบบ...</p> : !session ? <>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">เพื่อความปลอดภัย กรุณาเข้าสู่ระบบด้วยบัญชีที่ต้องการลบก่อน เราจะรับคำขอจากเจ้าของบัญชีเท่านั้น</div>
              <form onSubmit={signInWithPassword} className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">อีเมล<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-500 transition focus:ring-2" /></label>
                <label className="block text-sm font-bold text-slate-700">รหัสผ่าน<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-500 transition focus:ring-2" /></label>
                <button disabled={submitting} className="w-full rounded-xl bg-emerald-600 py-3 font-black text-white transition hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบเพื่อดำเนินการ'}</button>
              </form>
              <div className="relative py-1 text-center text-xs text-slate-400 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:bg-slate-200"><span className="relative bg-white px-3">หรือ</span></div>
              <button type="button" onClick={signInWithGoogle} className="w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><i className="fa-brands fa-google mr-2 text-rose-500" />เข้าสู่ระบบด้วย Google</button>
            </> : <>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm"><p className="font-bold text-emerald-900">เข้าสู่ระบบแล้ว</p><p className="mt-1 text-emerald-800">{session.user.email}</p><button type="button" onClick={signOut} className="mt-3 text-xs font-bold text-emerald-700 underline">เปลี่ยนบัญชี</button></div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">การส่งคำขอนี้เป็นการแจ้งให้ทีมงานตรวจสอบและลบบัญชี รวมถึงข้อมูลส่วนบุคคลที่เกี่ยวข้อง ภายใน 30 วัน ข้อมูลบางส่วนอาจเก็บไว้เท่าที่จำเป็นตามกฎหมาย เช่น หลักฐานธุรกรรมทางบัญชีและภาษี</div>
              <label className="block text-sm font-bold text-slate-700">เหตุผล (ไม่บังคับ)<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} rows={4} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none ring-emerald-500 transition focus:ring-2" placeholder="บอกเราได้ว่าต้องการปรับปรุงอะไร" /></label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-rose-600" /><span>ฉันยืนยันว่าต้องการส่งคำขอลบบัญชีนี้ และเข้าใจว่าจะไม่สามารถใช้งานบัญชีได้หลังการดำเนินการเสร็จสิ้น</span></label>
              <button type="button" disabled={!confirmed || submitting || Boolean(message)} onClick={submitRequest} className="w-full rounded-xl bg-rose-600 py-3 font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอลบบัญชี'}</button>
            </>}
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
            {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{message}</p>}
            <p className="text-center text-xs leading-5 text-slate-500">หากเข้าไม่ได้ โปรดติดต่อ <a className="font-bold text-emerald-700 underline" href="mailto:posfoodscan@gmail.com">posfoodscan@gmail.com</a> พร้อมส่งอีเมลที่ใช้สมัครบัญชี</p>
          </div>
        </div>
      </section>
    </main>
  )
}
