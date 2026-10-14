'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { fileToBase64, type FileToBase64Error } from '@/lib/file-to-base64';
import { emptyLocalized } from '@/lib/localized-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/components/shared/permission-gate';
import { toast } from '@/components/ui/sonner';
import { PERMISSIONS } from '@/lib/permissions';
import { useTranslation } from '@/hooks/use-translation';
import {
  useCreateCatalogProductMutation,
  useDeleteCatalogProductMutation,
  useUpdateCatalogProductMutation,
} from '@/hooks/queries/use-catalog';
import { ApiError } from '@/types/api';
import type {
  CatalogBlockType,
  CatalogManualBlock,
  CatalogProduct,
  CatalogProductInput,
  CatalogProductStatus,
  LocalizedText,
} from '@/types/admin/catalog';
import { BilingualField } from './bilingual-field';

const MAX_IMAGES = 8;
const MAX_BLOCKS = 30;
const MAX_HINT = 80;
const DEFAULT_CURRENCY = 'EGP';
/**
 * Single cap for each picked file AND for all new uploads in one save.
 * Mirrors Backend MediaUploadUtils.MAX_UPLOAD_BYTES; 8 MB raw is ~10.7 MB
 * base64, which fits under the API's 16 MB JSON body limit.
 */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_UPLOAD_LABEL = `${MAX_UPLOAD_BYTES / (1024 * 1024)} MB`;

const STATUSES: CatalogProductStatus[] = ['draft', 'published', 'archived'];
const BLOCK_TYPES: CatalogBlockType[] = ['text', 'link', 'video', 'file', 'image'];

function dataUriBytes(value: string): number {
  if (!value.startsWith('data:')) return 0;
  const comma = value.indexOf(',');
  if (comma < 0) return 0;
  return Math.ceil((value.length - comma - 1) * 0.75);
}

function newUploadBytes(images: string[], blocks: CatalogManualBlock[]): number {
  const imageBytes = images.reduce((sum, url) => sum + dataUriBytes(url), 0);
  const blockBytes = blocks.reduce(
    (sum, block) => sum + dataUriBytes(block.fileUrl ?? ''),
    0,
  );
  return imageBytes + blockBytes;
}

/** Returns the 1-based index + error key of the first incomplete block, if any. */
function findIncompleteBlock(
  blocks: CatalogManualBlock[],
): { index: number; key: 'blockBodyRequired' | 'blockUrlRequired' | 'blockFileRequired' } | null {
  for (const [i, block] of blocks.entries()) {
    switch (block.type) {
      case 'text':
        if (!block.body.en.trim()) return { index: i + 1, key: 'blockBodyRequired' };
        break;
      case 'link':
      case 'video':
        if (!block.url?.trim()) return { index: i + 1, key: 'blockUrlRequired' };
        break;
      case 'file':
      case 'image':
        if (!block.fileUrl?.trim()) return { index: i + 1, key: 'blockFileRequired' };
        break;
      default: {
        const _exhaustive: never = block.type;
        return _exhaustive;
      }
    }
  }
  return null;
}

function newBlock(type: CatalogBlockType): CatalogManualBlock {
  return {
    id: crypto.randomUUID(),
    type,
    title: emptyLocalized(),
    body: emptyLocalized(),
    url: '',
    fileUrl: '',
    fileName: '',
  };
}

function serializeBlocks(blocks: CatalogManualBlock[]): CatalogManualBlock[] {
  return blocks.map((block) => {
    const next: CatalogManualBlock = {
      id: block.id,
      type: block.type,
      title: block.title,
      body: block.body,
    };
    switch (block.type) {
      case 'text':
        return next;
      case 'link':
      case 'video':
        return { ...next, url: block.url?.trim() };
      case 'file':
        return {
          ...next,
          fileUrl: block.fileUrl,
          fileName: block.fileName,
        };
      case 'image':
        return { ...next, fileUrl: block.fileUrl };
      default: {
        const _exhaustive: never = block.type;
        return _exhaustive;
      }
    }
  });
}

function productToForm(product?: CatalogProduct): CatalogProductInput {
  return {
    name: product?.name ?? emptyLocalized(),
    pitch: product?.pitch ?? emptyLocalized(),
    description: product?.description ?? emptyLocalized(),
    images: product?.images ?? [],
    buyUrl: product?.buyUrl ?? '',
    status: product?.status ?? 'draft',
    category: product?.category ?? '',
    sortOrder: product?.sortOrder ?? 0,
    priceHint: product?.priceHint ?? emptyLocalized(),
    earnHint: product?.earnHint ?? emptyLocalized(),
    price: product?.price ?? null,
    currency: product?.currency ?? DEFAULT_CURRENCY,
    manualBlocks: product?.manualBlocks ?? [],
  };
}

export function CatalogForm({ product }: { product?: CatalogProduct }) {
  const { t } = useTranslation();
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CatalogProductInput>(() => productToForm(product));
  const create = useCreateCatalogProductMutation();
  const update = useUpdateCatalogProductMutation();
  const remove = useDeleteCatalogProductMutation();
  const saving = create.isPending || update.isPending;
  const busy = saving || remove.isPending;

  const patch = (partial: Partial<CatalogProductInput>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  type LocalizedKey = 'name' | 'pitch' | 'description' | 'priceHint' | 'earnHint';
  const patchLocalized = (key: LocalizedKey, partial: Partial<LocalizedText>) =>
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...partial } }));

  const updateBlock = (id: string, updater: (prev: CatalogManualBlock) => CatalogManualBlock) =>
    setForm((prev) => ({
      ...prev,
      manualBlocks: prev.manualBlocks.map((item) => (item.id === id ? updater(item) : item)),
    }));

  const moveBlock = (id: string, dir: -1 | 1) =>
    setForm((prev) => {
      const index = prev.manualBlocks.findIndex((item) => item.id === id);
      const swap = index + dir;
      if (index < 0 || swap < 0 || swap >= prev.manualBlocks.length) return prev;
      const manualBlocks = [...prev.manualBlocks];
      [manualBlocks[index], manualBlocks[swap]] = [manualBlocks[swap], manualBlocks[index]];
      return { ...prev, manualBlocks };
    });

  const removeBlock = (id: string) =>
    setForm((prev) => ({
      ...prev,
      manualBlocks: prev.manualBlocks.filter((item) => item.id !== id),
    }));

  const addBlock = (type: CatalogBlockType) =>
    setForm((prev) =>
      prev.manualBlocks.length >= MAX_BLOCKS
        ? prev
        : { ...prev, manualBlocks: [...prev.manualBlocks, newBlock(type)] },
    );

  const removeImage = (index: number) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const onAddImages = async (files: FileList) => {
    const remaining = MAX_IMAGES - form.images.length;
    for (const file of Array.from(files).slice(0, Math.max(remaining, 0))) {
      try {
        const dataUrl = await fileToBase64(file, {
          imageOnly: true,
          maxBytes: MAX_UPLOAD_BYTES,
        });
        setForm((prev) => {
          if (prev.images.length >= MAX_IMAGES) return prev;
          const images = [...prev.images, dataUrl];
          if (newUploadBytes(images, prev.manualBlocks) > MAX_UPLOAD_BYTES) {
            toast.error(t('catalog.payloadTooLarge', { max: MAX_UPLOAD_LABEL }), {
              id: 'catalog-payload-too-large',
            });
            return prev;
          }
          return { ...prev, images };
        });
      } catch (err) {
        const e = err as FileToBase64Error;
        if (e.kind === 'too-large') toast.error(t('common.fileTooLarge', { max: MAX_UPLOAD_LABEL }));
        else if (e.kind === 'not-image') toast.error(t('common.notAnImage'));
        else toast.error(t('common.error'));
      }
    }
  };

  const onAddBlockFile = async (blockId: string, file: File, kind: 'file' | 'image') => {
    try {
      const dataUrl = await fileToBase64(file, {
        imageOnly: kind === 'image',
        maxBytes: MAX_UPLOAD_BYTES,
      });
      setForm((prev) => {
        const manualBlocks = prev.manualBlocks.map((block) =>
          block.id === blockId ? { ...block, fileUrl: dataUrl, fileName: file.name } : block,
        );
        if (newUploadBytes(prev.images, manualBlocks) > MAX_UPLOAD_BYTES) {
          toast.error(t('catalog.payloadTooLarge', { max: MAX_UPLOAD_LABEL }), {
              id: 'catalog-payload-too-large',
            });
          return prev;
        }
        return { ...prev, manualBlocks };
      });
    } catch (err) {
      const e = err as FileToBase64Error;
      if (e.kind === 'too-large') {
        toast.error(t('common.fileTooLarge', { max: MAX_UPLOAD_LABEL }));
      } else if (e.kind === 'not-image') {
        toast.error(t('common.notAnImage'));
      } else {
        toast.error(t('catalog.unsupportedFile'));
      }
    }
  };

  const save = async (status: CatalogProductStatus) => {
    if (busy) return;
    if (!form.name.en.trim()) {
      toast.error(t('common.required'));
      return;
    }
    if (!form.buyUrl.trim()) {
      toast.error(t('common.required'));
      return;
    }
    const incomplete = findIncompleteBlock(form.manualBlocks);
    if (incomplete) {
      toast.error(t(`catalog.errors.${incomplete.key}`, { n: String(incomplete.index) }));
      return;
    }
    const body: CatalogProductInput = {
      ...form,
      status,
      sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
      price: typeof form.price === 'number' && Number.isFinite(form.price) ? form.price : null,
      currency: (form.currency ?? '').trim().toUpperCase() || DEFAULT_CURRENCY,
      manualBlocks: serializeBlocks(form.manualBlocks),
    };
    try {
      if (product) {
        await update.mutateAsync({ id: product.id, body });
        toast.success(t('catalog.saved'));
      } else {
        const created = await create.mutateAsync(body);
        toast.success(t('catalog.saved'));
        router.push(`/admin/catalog/${created.id}`);
      }
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  const onDelete = async () => {
    if (!product || busy) return;
    if (!window.confirm(t('catalog.confirmDelete'))) return;
    try {
      await remove.mutateAsync(product.id);
      toast.success(t('catalog.deleted'));
      router.push('/admin/catalog');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void save(form.status);
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('catalog.fields.name')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <BilingualField
            required
            label={t('catalog.fields.name')}
            value={form.name}
            onChange={(partial) => patchLocalized('name', partial)}
            maxLength={120}
          />
          <BilingualField
            label={t('catalog.fields.pitch')}
            value={form.pitch}
            onChange={(partial) => patchLocalized('pitch', partial)}
            maxLength={280}
          />
          <BilingualField
            multiline
            label={t('catalog.fields.description')}
            value={form.description}
            onChange={(partial) => patchLocalized('description', partial)}
          />
          <div className="space-y-2">
            <Label>
              {t('catalog.fields.buyUrl')}
              <span className="ms-1 text-destructive">*</span>
            </Label>
            <Input
              dir="ltr"
              value={form.buyUrl}
              placeholder={t('catalog.placeholders.buyUrl')}
              onChange={(e) => patch({ buyUrl: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('catalog.fields.status')}</Label>
              <Select
                value={form.status}
                onValueChange={(status) => patch({ status: status as CatalogProductStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('catalog.fields.category')}</Label>
              <Input
                value={form.category}
                maxLength={80}
                onChange={(e) => patch({ category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('catalog.fields.sortOrder')}</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => patch({ sortOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('catalog.hintsNote')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('catalog.fields.price')}</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={form.price ?? ''}
                placeholder={t('catalog.placeholders.price')}
                onChange={(e) =>
                  patch({ price: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">{t('catalog.priceNote')}</p>
            </div>
            <div className="space-y-2">
              <Label>{t('catalog.fields.currency')}</Label>
              <Input
                value={form.currency ?? ''}
                maxLength={3}
                placeholder={DEFAULT_CURRENCY}
                onChange={(e) => patch({ currency: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
          <BilingualField
            label={t('catalog.fields.priceHint')}
            value={form.priceHint}
            onChange={(partial) => patchLocalized('priceHint', partial)}
            maxLength={MAX_HINT}
            placeholderEn={t('catalog.placeholders.priceHint')}
            placeholderAr={t('catalog.placeholders.priceHint')}
          />
          <p className="text-xs text-muted-foreground">{t('catalog.earnHintNote')}</p>
          <BilingualField
            label={t('catalog.fields.earnHint')}
            value={form.earnHint}
            onChange={(partial) => patchLocalized('earnHint', partial)}
            maxLength={MAX_HINT}
            placeholderEn={t('catalog.placeholders.earnHint')}
            placeholderAr={t('catalog.placeholders.earnHint')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{t('catalog.gallery')}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            disabled={form.images.length >= MAX_IMAGES}
          >
            <ImagePlus className="h-4 w-4" />
            {t('catalog.addImage')}
          </Button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void onAddImages(e.target.files);
              e.target.value = '';
            }}
          />
        </CardHeader>
        <CardContent>
          {form.images.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('catalog.addImage')}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {form.images.map((src, index) => (
                <li key={`${src.slice(0, 24)}-${index}`} className="relative overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-36 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-destructive shadow-sm"
                    onClick={() => removeImage(index)}
                    aria-label={t('common.removeImage')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{t('catalog.manual')}</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {BLOCK_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                size="sm"
                disabled={form.manualBlocks.length >= MAX_BLOCKS}
                onClick={() => addBlock(type)}
              >
                <Plus className="h-4 w-4" />
                {t(`catalog.block${type[0].toUpperCase()}${type.slice(1)}`)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.manualBlocks.map((block, index) => (
            <ManualBlockEditor
              key={block.id}
              block={block}
              index={index}
              total={form.manualBlocks.length}
              onChange={(updater) => updateBlock(block.id, updater)}
              onMove={(dir) => moveBlock(block.id, dir)}
              onRemove={() => removeBlock(block.id)}
              onFile={(file) =>
                void onAddBlockFile(block.id, file, block.type === 'image' ? 'image' : 'file')
              }
            />
          ))}
        </CardContent>
      </Card>

      <PermissionGate permission={PERMISSIONS.CATALOG_WRITE}>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={busy}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void save('draft')}
          >
            {t('catalog.saveDraft')}
          </Button>
          <Button
            type="button"
            variant="success"
            disabled={busy}
            onClick={() => void save('published')}
          >
            {t('catalog.publish')}
          </Button>
          {product ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void save('archived')}
              >
                {t('catalog.archive')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() => void onDelete()}
              >
                {remove.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {t('common.delete')}
              </Button>
            </>
          ) : null}
        </div>
      </PermissionGate>
    </form>
  );
}

function ManualBlockEditor({
  block,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onFile,
}: {
  block: CatalogManualBlock;
  index: number;
  total: number;
  onChange: (updater: (prev: CatalogManualBlock) => CatalogManualBlock) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onFile: (file: File) => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const typeLabel = t(
    `catalog.block${block.type[0].toUpperCase()}${block.type.slice(1)}`,
  );

  const fields = (() => {
    switch (block.type) {
      case 'text':
        return (
          <BilingualField
            multiline
            label={t('catalog.fields.blockBody')}
            value={block.body}
            onChange={(partial) =>
              onChange((prev) => ({ ...prev, body: { ...prev.body, ...partial } }))
            }
          />
        );
      case 'link':
      case 'video':
        return (
          <div className="space-y-2">
            <Label>{t('catalog.fields.url')}</Label>
            <Input
              dir="ltr"
              value={block.url ?? ''}
              onChange={(e) => {
                const url = e.target.value;
                onChange((prev) => ({ ...prev, url }));
              }}
            />
          </div>
        );
      case 'file':
      case 'image':
        return (
          <div className="space-y-2">
            <Label>{t('catalog.fields.file')}</Label>
            {block.fileUrl?.startsWith('http') || block.fileUrl?.startsWith('data:image') ? (
              block.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={block.fileUrl} alt="" className="h-24 rounded-lg object-cover" />
              ) : (
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {block.fileName || block.fileUrl}
                </p>
              )
            ) : block.fileName ? (
              <p className="truncate text-xs text-muted-foreground">{block.fileName}</p>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Plus className="h-4 w-4" />
              {t('catalog.addBlock')}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept={
                block.type === 'image'
                  ? 'image/jpeg,image/png,image/webp,image/gif'
                  : 'image/jpeg,image/png,image/webp,image/gif,application/pdf,video/mp4,video/webm'
              }
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                e.target.value = '';
              }}
            />
          </div>
        );
      default: {
        const _exhaustive: never = block.type;
        return _exhaustive;
      }
    }
  })();

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {index + 1}. {typeLabel}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={t('common.prev')}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label={t('common.next')}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={onRemove}
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <BilingualField
        label={t('catalog.fields.blockTitle')}
        value={block.title}
        onChange={(partial) =>
          onChange((prev) => ({ ...prev, title: { ...prev.title, ...partial } }))
        }
        maxLength={200}
      />
      {fields}
    </div>
  );
}
