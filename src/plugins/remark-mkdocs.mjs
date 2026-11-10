/**
 * Remark / Preprocessor plugin to support MkDocs-style Admonitions & Details in Astro Starlight.
 *
 * Supports:
 *  - Standard admonitions: `!!! <type> ["<title>"]`
 *  - Collapsible details (closed): `??? <type> ["<title>"]`
 *  - Collapsible details (open): `???+ <type> ["<title>"]`
 *  - Nested admonitions & details
 *  - Inner markdown content with code blocks, lists, quotes, and links
 */

import { fromMarkdown } from 'mdast-util-from-markdown';
import { directiveFromMarkdown } from 'mdast-util-directive';
import { directive } from 'micromark-extension-directive';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

const VARIANT_MAP = {
  note: 'note',
  seealso: 'note',
  abstract: 'note',
  summary: 'note',
  tldr: 'note',
  info: 'note',
  todo: 'note',
  quote: 'note',
  cite: 'note',
  tip: 'tip',
  hint: 'tip',
  important: 'tip',
  success: 'tip',
  check: 'tip',
  done: 'tip',
  experiment: 'tip',
  warning: 'caution',
  caution: 'caution',
  attention: 'caution',
  question: 'caution',
  help: 'caution',
  faq: 'caution',
  danger: 'danger',
  error: 'danger',
  bug: 'danger',
  failure: 'danger',
  fail: 'danger',
  missing: 'danger',
  example: 'note',
  snippet: 'note',
};

const DEFAULT_TITLES = {
  note: 'Note',
  seealso: 'See Also',
  abstract: 'Abstract',
  summary: 'Summary',
  tldr: 'TL;DR',
  info: 'Info',
  todo: 'To-Do',
  quote: 'Quote',
  cite: 'Cite',
  tip: 'Tip',
  hint: 'Hint',
  important: 'Important',
  success: 'Success',
  check: 'Check',
  done: 'Done',
  experiment: 'Experiment',
  warning: 'Warning',
  caution: 'Caution',
  attention: 'Attention',
  question: 'Question',
  help: 'Help',
  faq: 'FAQ',
  danger: 'Danger',
  error: 'Error',
  bug: 'Bug',
  failure: 'Failure',
  fail: 'Failure',
  missing: 'Missing',
  example: 'Example',
  snippet: 'Snippet',
};

// SVG icons matching Starlight asides
const ICONS = {
  note: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="starlight-aside__icon"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm0-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0v-4a1 1 0 0 0-1-1Zm0-4a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z"/></svg>`,
  tip: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="starlight-aside__icon"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7ZM9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9v1Z"/></svg>`,
  caution: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="starlight-aside__icon"><path d="M12 16a1 1 0 1 0 1 1 1 1 0 0 0-1-1Zm10.67 1.47-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4.93 21h14.14a2 2 0 0 0 1.74-3.53ZM12 8a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1Z"/></svg>`,
  danger: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="starlight-aside__icon"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm3.71-11.71a1 1 0 0 0-1.42 0L12 10.59l-2.29-2.3a1 1 0 0 0-1.42 1.42L10.59 12l-2.3 2.29a1 1 0 0 0 1.42 1.42L12 13.41l2.29 2.3a1 1 0 0 0 1.42-1.42L13.41 12l2.3-2.29a1 1 0 0 0 0-1.42Z"/></svg>`,
};

/**
 * Splits frontmatter from markdown body.
 */
export function splitFrontmatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) {
      const frontmatter = content.slice(0, end + 4);
      const body = content.slice(end + 4);
      return { frontmatter, body };
    }
  }
  return { frontmatter: '', body: content };
}

/**
 * Transforms MkDocs admonition blocks in raw Markdown text.
 */
export function transformMkdocsAdmonitions(content) {
  if (!content || typeof content !== 'string') return content;

  const lines = content.split('\n');
  const output = [];
  let i = 0;

  // Regex matching start of MkDocs admonition:
  // (indent)(!!! or ??? or ???+)(space)(type)(optional title in quotes or raw)
  const ADMONITION_START = /^(\s*)(\!{3}|\?{3}\+?)\s+([a-zA-Z0-9_-]+)(?:\s+(?:"([^"]*)"|'([^']*)'|(.*)))?$/;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(ADMONITION_START);

    if (match) {
      const baseIndent = match[1];
      const marker = match[2];
      const rawType = match[3].toLowerCase();
      let title = match[4] ?? match[5] ?? match[6] ?? '';
      title = title.trim();

      const isDetails = marker.startsWith('???');
      const isOpen = marker === '???+';
      const variant = VARIANT_MAP[rawType] || 'note';
      const displayTitle =
        title ||
        DEFAULT_TITLES[rawType] ||
        rawType.charAt(0).toUpperCase() + rawType.slice(1);

      // Collect body lines indented by baseIndent + 4 spaces (or tabs/2+ spaces)
      const bodyLines = [];
      i++;
      let detectedIndent = null;

      while (i < lines.length) {
        const nextLine = lines[i];

        if (nextLine.trim() === '') {
          // Check if subsequent non-empty line is indented
          let j = i + 1;
          while (j < lines.length && lines[j].trim() === '') {
            j++;
          }
          if (j < lines.length) {
            const peekLine = lines[j];
            const peekIndent = peekLine.match(/^\s*/)[0];
            const minIndent = detectedIndent || (baseIndent.length + 4);
            if (peekIndent.length >= minIndent) {
              bodyLines.push(nextLine);
              i++;
              continue;
            }
          }
          break;
        }

        const indentMatch = nextLine.match(/^\s*/)[0];
        if (detectedIndent === null && indentMatch.length > baseIndent.length) {
          detectedIndent = indentMatch.length;
        }

        const minIndent = detectedIndent || (baseIndent.length + 4);
        if (indentMatch.length >= minIndent) {
          const stripped = nextLine.slice(minIndent);
          bodyLines.push(stripped);
          i++;
        } else {
          break;
        }
      }

      // Recursively process nested admonitions inside the body
      const processedBody = transformMkdocsAdmonitions(bodyLines.join('\n'));

      if (isDetails) {
        const iconSvg = ICONS[variant] || ICONS.note;
        output.push(
          `${baseIndent}<details class="starlight-aside starlight-aside--${variant} admonition-details"${isOpen ? ' open' : ''}>`,
          `${baseIndent}<summary class="starlight-aside__title">${iconSvg}<span>${displayTitle}</span></summary>`,
          `${baseIndent}<div class="starlight-aside__content">`,
          '',
          processedBody,
          '',
          `${baseIndent}</div>`,
          `${baseIndent}</details>`
        );
      } else {
        output.push(
          `${baseIndent}:::${variant}[${displayTitle}]`,
          processedBody,
          `${baseIndent}:::`
        );
      }
    } else {
      output.push(line);
      i++;
    }
  }

  return output.join('\n');
}

/**
 * Remark plugin that transforms MkDocs admonition syntax into Starlight Container Directives & Details.
 */
export function remarkMkdocsAdmonitions() {
  return function transformer(tree, file) {
    if (!file.value || typeof file.value !== 'string') return;
    if (!file.value.includes('!!!') && !file.value.includes('???')) return;

    const { frontmatter, body } = splitFrontmatter(file.value);
    const transformedBody = transformMkdocsAdmonitions(body);

    const newAst = fromMarkdown(transformedBody, {
      extensions: [directive(), gfm()],
      mdastExtensions: [directiveFromMarkdown(), gfmFromMarkdown()],
    });

    tree.children = newAst.children;
  };
}

/**
 * Vite plugin to preprocess Markdown/MDX files for MkDocs syntax before Astro/Starlight loads them.
 */
export function vitePluginMkdocsAdmonitions() {
  return {
    name: 'vite-plugin-mkdocs-admonitions',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.md') || id.endsWith('.mdx')) {
        const { frontmatter, body } = splitFrontmatter(code);
        const transformedBody = transformMkdocsAdmonitions(body);
        return {
          code: frontmatter + transformedBody,
          map: null,
        };
      }
    },
  };
}

export default function mkdocsIntegration() {
  return {
    name: 'starlight-mkdocs-integration',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          markdown: {
            remarkPlugins: [remarkMkdocsAdmonitions],
          },
          vite: {
            plugins: [vitePluginMkdocsAdmonitions()],
          },
        });
      },
    },
  };
}
