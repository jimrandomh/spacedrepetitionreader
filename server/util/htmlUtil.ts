import sanitize from 'sanitize-html';

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      "img",
      "address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
      "h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
      "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
      "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
      "em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s",
      "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var",
      "wbr", "caption", "col", "colgroup", "table", "tbody", "td", "tfoot",
      "th", "thead", "tr",
      "iframe",
    ],
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      iframe: ["src", "allowfullscreen"],
      td: ['rowspan','colspan'],
      th: ['rowspan','colspan'],
    },
    allowedIframeHostnames: [
      "www.youtube.com", "youtube.com",
    ],
  });
}
