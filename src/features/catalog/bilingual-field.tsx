'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import type { LocalizedText } from '@/types/admin/catalog';

export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
  required = false,
  placeholderEn,
  placeholderAr,
}: {
  label: string;
  value: LocalizedText;
  /** Emits only the edited locale so callers merge into the latest state. */
  onChange: (patch: Partial<LocalizedText>) => void;
  multiline?: boolean;
  maxLength?: number;
  required?: boolean;
  placeholderEn?: string;
  placeholderAr?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="ms-1 text-destructive">*</span> : null}
      </Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('catalog.english')}
          </p>
          {multiline ? (
            <Textarea
              value={value.en}
              maxLength={maxLength}
              placeholder={placeholderEn}
              rows={4}
              onChange={(e) => onChange({ en: e.target.value })}
            />
          ) : (
            <Input
              value={value.en}
              maxLength={maxLength}
              placeholder={placeholderEn}
              onChange={(e) => onChange({ en: e.target.value })}
            />
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('catalog.arabic')}
          </p>
          {multiline ? (
            <Textarea
              dir="rtl"
              value={value.ar}
              maxLength={maxLength}
              placeholder={placeholderAr}
              rows={4}
              onChange={(e) => onChange({ ar: e.target.value })}
            />
          ) : (
            <Input
              dir="rtl"
              value={value.ar}
              maxLength={maxLength}
              placeholder={placeholderAr}
              onChange={(e) => onChange({ ar: e.target.value })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
