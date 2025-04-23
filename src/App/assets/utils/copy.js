/* -----------------------------------------------------------------------
 * copy.js  ·  Shared clipboard helper for code blocks, buttons, etc.
 * -----------------------------------------------------------------------
 * Usage examples
 * -----------------------------------------------------------------------
 * import { copyToClipboard, enableCopyOnCodeBlocks } from "/theme/copy.js";
 *
 * // 1. Attach to a button (Bless page)
 * copyBtn.addEventListener("click", () => copyToClipboard(copyBtn, address));
 *
 * // 2. Auto‑enable click‑to‑copy on every <pre><code> (Docs page)
 * enableCopyOnCodeBlocks();
 * ---------------------------------------------------------------------*/

/**
 * Briefly flashes an element by toggling the `copied` class.
 * The page’s CSS decides the visual effect (background flash, tooltip, etc.).
 */
function flash(el, className = "copied", duration = 700) {
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), duration);
}

/**
 * Fallback copy via a hidden <textarea> for older browsers or HTTP pages.
 */
function fallbackCopy(text, el) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand("copy");
        flash(el);
    } catch (err) {
        console.error("Fallback copy failed:", err);
    } finally {
        document.getSelection()?.removeAllRanges();
        document.body.removeChild(ta);
    }
}

/**
 * Copy arbitrary **text** to the clipboard and flash a target element.
 *
 * @param {HTMLElement} el   The element to flash/animate (usually the trigger)
 * @param {string}      text The text you’d like to copy
 */
export async function copyToClipboard(el, text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            flash(el);
            return;
        } catch {
            /* fall through to fallback */
        }
    }
    fallbackCopy(text, el);
}

/**
 * Enable click‑to‑copy on all code blocks that match a selector.
 * Ideal for Docs/tutorial pages.
 *
 * @param {string} selector  CSS selector to match <code> elements
 */
export function enableCopyOnCodeBlocks(selector = "pre > code") {
    document.querySelectorAll(selector).forEach((code) => {
        code.style.cursor = "pointer";
        code.addEventListener("click", () => copyToClipboard(code, code.innerText));
    });
}

/**
 * Auto‑init when imported as a module in a page that already contains
 * <pre><code> blocks *and* no explicit call was made within the first tick.
 * (This keeps the API explicit but convenient.)
 */
setTimeout(() => {
    if (document.querySelector("pre > code:not([data-copy-init])")) {
        enableCopyOnCodeBlocks();
    }
}, 0);