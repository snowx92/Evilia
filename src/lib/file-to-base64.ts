/** Max payload size per file (3 MB). Base64 inflates by ~33%. */
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

export type FileToBase64Error =
  | { kind: 'too-large'; maxBytes: number }
  | { kind: 'not-image' }
  | { kind: 'read-failed' };

/**
 * Read a File and return a `data:<mime>;base64,<...>` string.
 * Rejects with a {@link FileToBase64Error} if the file is too large, not an
 * image, or unreadable.
 */
export function fileToBase64(
  file: File,
  opts: { maxBytes?: number; imageOnly?: boolean } = {},
): Promise<string> {
  const maxBytes = opts.maxBytes ?? MAX_ATTACHMENT_BYTES;
  return new Promise((resolve, reject) => {
    if (opts.imageOnly && !file.type.startsWith('image/')) {
      reject({ kind: 'not-image' } satisfies FileToBase64Error);
      return;
    }
    if (file.size > maxBytes) {
      reject({ kind: 'too-large', maxBytes } satisfies FileToBase64Error);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject({ kind: 'read-failed' } satisfies FileToBase64Error);
    };
    reader.onerror = () => reject({ kind: 'read-failed' } satisfies FileToBase64Error);
    reader.readAsDataURL(file);
  });
}
