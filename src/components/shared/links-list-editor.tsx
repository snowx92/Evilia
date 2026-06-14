'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Override the "Add" button label. */
  addLabel?: string;
};

/**
 * Editable list of URL inputs. Each row has a delete button; an "Add" footer
 * button appends a fresh empty row. Designed for `affiliateLinks` and similar
 * `string[]` fields — strip empty rows on submit at the call site.
 */
export function LinksListEditor({
  value,
  onChange,
  placeholder = 'https://',
  addLabel,
}: Props) {
  const { t } = useTranslation();

  const update = (idx: number, next: string) => {
    const copy = value.slice();
    copy[idx] = next;
    onChange(copy);
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const add = () => {
    onChange([...value, '']);
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {value.length === 0 && (
          <li className="text-[11px] text-muted-foreground">
            {t('seller.noAffiliateLinks')}
          </li>
        )}
        {value.map((link, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Input
              type="url"
              dir="ltr"
              placeholder={placeholder}
              value={link}
              onChange={(e) => update(idx, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => remove(idx)}
              aria-label={t('common.delete')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        {addLabel ?? t('users.fields.addAffiliateLink')}
      </Button>
    </div>
  );
}
