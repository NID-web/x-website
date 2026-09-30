import clsx from "clsx";
import { Fragment, type ReactNode } from "react";

// THE body-copy renderer: every section body and standfirst on the site goes
// through here, clamped (ClampedProse) or not (SectionBody). A body string is
// paragraphs separated by blank lines, with a closed set of tags — p, ul, ol,
// li, strong, em — parsed into React elements. Anything else in the string is
// text: nothing is ever set as HTML (lib/content/format.ts, richParagraphs).

type Tag = "p" | "ul" | "ol" | "li" | "strong" | "em";
type Node = string | { tag: Tag; children: Node[] };

const TOKEN = /<(\/?)(p|ul|ol|li|strong|em)>/g;
const BLOCK = new Set<Tag>(["p", "ul", "ol"]);

/** The three entities the body string escapes, in the order that keeps
 *  "&amp;lt;" a literal "&lt;". */
const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function parse(chunk: string): Node[] {
  const root: Node[] = [];
  const stack: Array<{ tag: Tag; children: Node[] }> = [];
  const top = () => (stack.length ? stack[stack.length - 1]!.children : root);
  let last = 0;
  for (const m of chunk.matchAll(TOKEN)) {
    if (m.index! > last) top().push(decode(chunk.slice(last, m.index)));
    const tag = m[2] as Tag;
    if (!m[1]) {
      const node = { tag, children: [] as Node[] };
      top().push(node);
      stack.push(node);
    } else {
      // A close with no matching open is ignored; one that skips opens closes
      // them too, so bad nesting degrades to text in the nearest element.
      const at = stack.map((n) => n.tag).lastIndexOf(tag);
      if (at >= 0) stack.length = at;
    }
    last = m.index! + m[0].length;
  }
  if (last < chunk.length) top().push(decode(chunk.slice(last)));
  return root;
}

function inline(nodes: Node[], key = ""): ReactNode {
  // A lone string renders as exactly that text — no fragment, no key — so a
  // plain paragraph's HTML is what it was before lists existed.
  if (nodes.length === 1 && typeof nodes[0] === "string") return nodes[0];
  return nodes.map((n, i) =>
    typeof n === "string" ? (
      <Fragment key={`${key}${i}`}>{n}</Fragment>
    ) : n.tag === "strong" || n.tag === "em" ? (
      <n.tag key={`${key}${i}`}>{inline(n.children, `${key}${i}.`)}</n.tag>
    ) : n.tag === "ul" || n.tag === "ol" ? (
      list(n.tag, n.children, `${key}${i}`)
    ) : (
      // A p or li where only inline content belongs: its text, unwrapped.
      <Fragment key={`${key}${i}`}>{inline(n.children, `${key}${i}.`)}</Fragment>
    ),
  );
}

// Markers inherit the body colour; the 30px indent is the event board's.
const LIST = { ul: "list-disc pl-7.5", ol: "list-decimal pl-7.5" } as const;

function list(tag: "ul" | "ol", items: Node[], key: string, className?: string): ReactNode {
  const Tag = tag;
  return (
    <Tag key={key} className={clsx(LIST[tag], className)}>
      {items.map((item, i) =>
        typeof item === "object" && item.tag === "li" ? (
          <li key={i}>{inline(item.children, `${key}.${i}.`)}</li>
        ) : typeof item === "string" && !item.trim() ? null : (
          // Content between items that is not an item: kept, as an item.
          <li key={i}>{inline([item], `${key}.${i}.`)}</li>
        ),
      )}
    </Tag>
  );
}

export function Prose({
  text,
  blockClassName,
  spacing = "margin",
}: {
  /** Paragraphs separated by blank lines, as `Section.body` authors them. */
  text: string;
  /** Classes for every block — paragraphs and lists — where the container
   *  does not set the type itself. */
  blockClassName?: string;
  /** `margin`: the container spaces paragraphs with `[&>p+p]:mt-4` (it may be
   *  line-clamped, which drops a flex gap), so a list adds its own margins.
   *  `gap`: the container is a flex column with a gap. */
  spacing?: "margin" | "gap";
}) {
  const listSpacing = spacing === "margin" ? "not-first:mt-4 not-last:mb-4" : undefined;
  return text.split(/\n{2,}/).map((chunk, i) => {
    const nodes = parse(chunk);
    const only = nodes.length === 1 && typeof nodes[0] === "object" ? nodes[0] : undefined;
    if (only && (only.tag === "ul" || only.tag === "ol")) {
      return list(only.tag, only.children, String(i), clsx(blockClassName, listSpacing));
    }
    const children = only && BLOCK.has(only.tag) ? only.children : nodes;
    return (
      <p key={i} className={blockClassName}>
        {inline(children, `${i}.`)}
      </p>
    );
  });
}
