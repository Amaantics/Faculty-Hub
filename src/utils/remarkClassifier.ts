import type { RemarkType } from '../types';

export function classifyRemark(remark: string): RemarkType {
  if (!remark || remark.trim() === '') return 'none';
  const r = remark.toLowerCase();

  if (r.includes('medical') || r.includes('injury') || r.includes('leg injury')) return 'medical_leave';
  if (r.includes('matern')) return 'maternity_leave';
  if (r.includes('on leave')) return 'on_leave';
  if (r.includes('hod room') || r.includes('hod office') || r.includes('hod cabin')) return 'hod_cabin';
  if (r.includes('shifted') || r.includes('shited') || r.includes('shitred')) return 'shifted';
  if (r.includes('sharing') || r.includes('shared')) return 'sharing';
  if (r.includes('left') || r.includes('resigned')) return 'resigned';
  if (r.includes('entrepreneurship')) return 'entrepreneurship';
  if (r.trim()) return 'note';
  return 'none';
}

export const REMARK_LABELS: Record<RemarkType, string> = {
  medical_leave: 'Medical Leave',
  maternity_leave: 'Maternity Leave',
  on_leave: 'On Leave',
  resigned: 'Resigned / Left',
  shifted: 'Shifted Location',
  hod_cabin: 'HOD Cabin',
  sharing: 'Sharing Cabin',
  entrepreneurship: 'Entrepreneurship',
  note: 'Note',
  none: '',
};

export const REMARK_CLASSES: Record<RemarkType, string> = {
  medical_leave: 'bg-orange-100 text-orange-800 border-orange-200',
  maternity_leave: 'bg-pink-100 text-pink-800 border-pink-200',
  on_leave: 'bg-red-100 text-red-700 border-red-200',
  resigned: 'bg-slate-200 text-slate-600 border-slate-300',
  shifted: 'bg-sky-100 text-sky-700 border-sky-200',
  hod_cabin: 'bg-purple-100 text-purple-700 border-purple-200',
  sharing: 'bg-teal-100 text-teal-700 border-teal-200',
  entrepreneurship: 'bg-lime-100 text-lime-700 border-lime-200',
  note: 'bg-slate-100 text-slate-600 border-slate-200',
  none: '',
};
