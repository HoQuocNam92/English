'use client';
import { useRouter } from 'next/navigation';
import { completeCreation, CreatePage } from '@/shared/ui/CreatePage';
import { confirmDialog } from '@/shared/ui/AppFeedback';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';
import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

export default function LearnerGroups({ createOnly = false }: { createOnly?: boolean }){
 const router = useRouter();
 const [saving, setSaving] = React.useState(false);
 const [groups,setGroups]=React.useState<any[]>([]),[goals,setGoals]=React.useState<any[]>([]),[learners,setLearners]=React.useState<any[]>([]); const [name,setName]=React.useState(''),[goalId,setGoalId]=React.useState(''),[error,setError]=React.useState(''),[loading,setLoading]=React.useState(true);
 const load = React.useCallback(async () => {
   setLoading(true); setError('');
   try {
     if (createOnly) {
       const response = await apiClient.get<any>('/career-goals');
       setGoals(response.data ?? response ?? []);
     } else {
       const [g, c, u] = await Promise.all([apiClient.get<any[]>('/learner-groups'), apiClient.get<any>('/career-goals'), apiClient.get<any>('/users?role=learner&limit=100')]);
       setGroups(g); setGoals(c.data ?? c ?? []); setLearners(u.data ?? u ?? []);
     }
   } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể tải nhóm học viên'); }
   finally { setLoading(false); }
 }, [createOnly]);
 React.useEffect(() => { void load(); }, [load]);
 const create=async(e:React.FormEvent)=>{e.preventDefault();if(!name.trim() || saving)return;setSaving(true);setError('');try{await apiClient.post('/learner-groups',{name,careerGoalId:goalId||null});if(createOnly){completeCreation(router, '/admin/learner-groups', 'Đã thêm nhóm học viên.');return;}setName('');setGoalId('');await load()}catch(e){setError(e instanceof ApiClientError?e.message:'Không thể tạo nhóm')}finally{setSaving(false)}};
 const add=async(groupId:string,learnerId:string)=>{if(!learnerId)return;try{await apiClient.post(`/learner-groups/${groupId}/members`,{learnerId});await load()}catch(e){setError(e instanceof ApiClientError?e.message:'Không thể thêm học viên')}};
 const remove=async(groupId:string,learnerId?:string)=>{try{await apiClient.delete(learnerId?`/learner-groups/${groupId}/members/${learnerId}`:`/learner-groups/${groupId}`);await load()}catch(e){setError(e instanceof ApiClientError?e.message:'Không thể cập nhật nhóm')}};
 const groupForm = (<form onSubmit={create} className="space-y-5 p-6">
   <h1 className="text-xl font-bold">Thêm nhóm học viên</h1>
   <label className="block text-sm font-medium">Tên nhóm học viên *<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-outline-variant px-3"/></label>
   <label className="block text-sm font-medium">Mục tiêu nghề nghiệp<Dropdown value={goalId} onChange={e=>setGoalId(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-outline-variant px-3"><option value="">Chọn mục tiêu nghề nghiệp</option>{goals.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</Dropdown></label>
   {error&&<p role="alert" className="rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</p>}
   <div className="flex justify-end gap-3 border-t border-outline-variant/40 pt-4"><button type="button" disabled={saving} onClick={()=>router.push('/admin/learner-groups')} className="h-10 rounded-xl border border-outline-variant px-4 text-sm font-medium">Hủy</button><button disabled={saving || loading} className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Tạo nhóm'}</button></div>
 </form>);
 if(createOnly)return <CreatePage backHref="/admin/learner-groups">{groupForm}</CreatePage>;
 return <div><PageHeader title="Phân nhóm học viên" description="Quản lý nhóm theo mục tiêu nghề nghiệp Cloud, Security, Data, BA và các hướng chuyên môn khác" action={<button type="button" onClick={()=>router.push('/admin/learner-groups/new')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white"><span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>Thêm nhóm học viên</button>}/>{error&&<div className="mt-4 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</div>}<div className="mt-5 grid gap-4 xl:grid-cols-2">{loading?<p>Đang tải...</p>:groups.map(group=><article key={group.id} className="rounded-2xl border border-outline-variant bg-white p-5"><div className="flex justify-between gap-3"><div><h2 className="text-lg font-bold">{group.name}</h2><p className="mt-1 text-sm text-on-surface-variant">{group.careerGoal?.name??'Chưa gắn mục tiêu nghề nghiệp'} · {group._count?.members??group.members?.length??0} học viên</p></div><ActionGroup><ActionButton action="delete" onClick={async()=>{if(await confirmDialog(`Bạn có muốn xóa nhóm “${group.name}” hay không?`, { title: 'Xóa nhóm học viên', confirmLabel: 'Xóa', tone: 'danger' })) await remove(group.id)}} /></ActionGroup></div><Dropdown defaultValue="" onChange={e=>{void add(group.id,e.target.value);e.currentTarget.value=''}} className="mt-4 h-10 w-full rounded-xl border border-outline-variant px-3 text-sm"><option value="">Thêm học viên vào nhóm...</option>{learners.filter(l=>!group.members?.some((m:any)=>m.learnerId===l.id)).map(l=><option key={l.id} value={l.id}>{l.userDetail?.displayName??l.email}</option>)}</Dropdown><div className="mt-3 divide-y divide-outline-variant/40">{group.members?.map((m:any)=><div key={m.learnerId} className="flex items-center justify-between py-2.5"><div><p className="text-sm font-semibold">{m.learner.userDetail?.displayName??m.learner.email}</p><LevelBadge level={m.learner.learnerProfile?.level} fallback="Chưa có trình độ" /></div><ActionGroup><ActionButton action="remove" onClick={()=>void remove(group.id,m.learnerId)} /></ActionGroup></div>)}{!group.members?.length&&<p className="py-4 text-sm text-on-surface-variant">Nhóm chưa có học viên.</p>}</div></article>)}</div></div>;
}
