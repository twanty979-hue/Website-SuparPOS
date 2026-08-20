'use client'

import { FormEvent, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type DeletionRequest = {
  id: string
  email: string
  full_name: string | null
  reason: string | null
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requested_at: string
  processed_at: string | null
}

const labels = {
  pending: 'รอตรวจสอบ',
  processing: 'กำลังดำเนินการ',
  completed: 'ดำเนินการแล้ว',
  rejected: 'ปฏิเสธ',
} as const

const colors = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
} as const

export default function AccountDeletionRequestsPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [requests, setRequests] = useState<DeletionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadRequests = async (activeSession: Session) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/account-deletion-requests', {
        headers: { Authorization: `Bearer ${activeSession.access_token}` },
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'โหลดข้อมูลไม่สำเร็จ')
      setRequests(result.requests)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) void loadRequests(data.session)
      else setLoading(false)
    })
  }, [])

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError || !data.session) {
      setError(signInError?.message || 'เข้าสู่ระบบไม่สำเร็จ')
      return
    }
    setPassword('')
    setSession(data.session)
    await loadRequests(data.session)
  }

  const updateStatus = async (id: string, status: DeletionRequest['status']) => {
    if (!session) return
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/admin/account-deletion-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id, status }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'อัปเดตสถานะไม่สำเร็จ')
      setRequests((items) => items.map((item) => item.id === id ? result.request : item))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'อัปเดตสถานะไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return <div className="mx-auto max-w-md py-10">
      <h2 className="text-2xl font-black text-slate-800">เข้าสู่ระบบผู้ดูแล</h2>
      <p className="mt-2 text-sm text-slate-500">ใช้บัญชีที่ระบุในตัวแปร ADMIN_EMAILS เท่านั้น</p>
      <form onSubmit={signIn} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <input required type="email" placeholder="อีเมลผู้ดูแล" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        <input required type="password" placeholder="รหัสผ่าน" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        <button disabled={submitting} className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white disabled:opacity-50">เข้าสู่ระบบ</button>
      </form>
      {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </div>
  }

  return <div className="mx-auto max-w-6xl py-2">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
      <div><h2 className="text-2xl font-black text-slate-800">คำขอลบบัญชี</h2><p className="mt-1 text-sm text-slate-500">ตรวจสอบคำขอจากผู้ใช้ก่อนดำเนินการลบบัญชีจริง</p></div>
      <button onClick={() => void loadRequests(session)} disabled={loading || submitting} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">รีเฟรช</button>
    </div>
    {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}
    {loading ? <p className="py-16 text-center font-bold text-slate-400">กำลังโหลดคำขอ...</p> : requests.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm font-bold text-slate-400">ยังไม่มีคำขอลบบัญชี</p> : <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">ผู้ใช้</th><th className="px-4 py-3">เหตุผล</th><th className="px-4 py-3">วันที่ขอ</th><th className="px-4 py-3">สถานะ</th><th className="px-4 py-3">จัดการ</th></tr></thead><tbody className="divide-y divide-slate-100">{requests.map((request) => <tr key={request.id} className="align-top"><td className="px-4 py-4"><p className="font-bold text-slate-800">{request.full_name || 'ไม่ระบุชื่อ'}</p><p className="mt-1 text-xs text-slate-500">{request.email}</p></td><td className="max-w-xs px-4 py-4 text-slate-600">{request.reason || '-'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{new Date(request.requested_at).toLocaleString('th-TH')}</td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${colors[request.status]}`}>{labels[request.status]}</span></td><td className="px-4 py-4"><select value={request.status} disabled={submitting} onChange={(event) => void updateStatus(request.id, event.target.value as DeletionRequest['status'])} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700"><option value="pending">รอตรวจสอบ</option><option value="processing">กำลังดำเนินการ</option><option value="completed">ดำเนินการแล้ว</option><option value="rejected">ปฏิเสธ</option></select>{request.processed_at && <p className="mt-2 text-[11px] text-slate-400">ปิดงาน: {new Date(request.processed_at).toLocaleString('th-TH')}</p>}</td></tr>)}</tbody></table></div>}
  </div>
}
