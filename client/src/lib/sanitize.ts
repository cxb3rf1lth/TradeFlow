import DOMPurify from 'isomorphic-dompurify';

/**
 * Shared HTML sanitization helper to ensure any user generated content
 * that needs to be rendered with `dangerouslySetInnerHTML` is safe.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}
