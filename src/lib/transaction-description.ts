/**
 * Returns a description safe to render in the UI for a wallet transaction.
 *
 * The backend's `description` field for system-generated entries (commission,
 * withdrawal) often embeds a raw Firebase uid or saleId
 * (e.g. "Commission from sale jWx1A0sZBsYl2rUltWrFwQpAz1r1"). End users don't
 * understand UIDs, so we suppress the description for those types and the
 * row's title falls back to the human transaction-type label.
 *
 * Admin-written types (`bonus`, `adjustment`) come from the wallet-adjust
 * form, so their descriptions are safe to render as-is.
 */
export function getSafeTxDescription(
  type: string | undefined,
  description: string | null | undefined,
): string | undefined {
  if (!description) return undefined;
  if (type === 'commission' || type === 'withdrawal') return undefined;
  return description;
}
