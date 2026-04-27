import { REMARK_CLASSES, REMARK_LABELS } from '../utils/remarkClassifier';
import type { RemarkType } from '../types';

interface Props {
  remarkType: RemarkType;
  rawRemark?: string;
}

export function RemarkBadge({ remarkType, rawRemark }: Props) {
  if (remarkType === 'none') return null;

  const classes = REMARK_CLASSES[remarkType];
  const label = REMARK_LABELS[remarkType];

  return (
    <span
      title={rawRemark}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}
