"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRichTextHtml = sanitizeRichTextHtml;
/** Server-side HTML sanitization for product/collection descriptions (defense in depth). */
function sanitizeRichTextHtml(html) {
    if (!html?.trim())
        return '';
    let out = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<iframe\b(?![^>]*src=["']https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/[^"']+["'])[^>]*>[\s\S]*?<\/iframe>/gi, '')
        .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"')
        .replace(/src\s*=\s*["']\s*javascript:[^"']*["']/gi, 'src=""');
    return out.trim();
}
