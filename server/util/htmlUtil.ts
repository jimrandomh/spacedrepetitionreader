import sanitize from 'sanitize-html';
import cheerio from 'cheerio';

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

function parseCssNumber(n: string): {value: number|null, units: string} {
  const parsed = /^\s*([0-9]*(\.[0-9]*)?)([a-zA-Z%]*)\s*$/.exec(n);
  if (!parsed) {
    return {
      value: null,
      units: "px",
    };
  }
  const unitsStr = parsed[3];
  const units = unitsStr?.length>0 ? unitsStr : "px";
  return {
    value: parseFloat(parsed[1]),
    units,
  };
}

export function postprocessFeedHtml(html: string): string {
  const $ = cheerio.load(html, {}, true);
  
  // Find images which have both width and height attributes, where both are in
  // pixels. If the specified width/height is large (width>500px), rewrite them
  // so that a max-width can be applied without breaking the aspect ratio.
  const images = $('img');
  for (let i=0; i<images.length; i++) {
    const image = $(images[i])
    const widthAttr = image.attr('width')
    const heightAttr = image.attr('height');
    if (widthAttr && heightAttr) {
      const {value: width, units: widthUnits} = parseCssNumber(widthAttr);
      const {value: height, units: heightUnits} = parseCssNumber(widthAttr);
      if (width && height  && widthUnits==='px' && heightUnits==='px' && width>500) {
        const aspect = width / height;
        image.removeAttr('height');
        const styleAttr = image.attr('style');
        const addedStyle = `aspect-ratio: ${aspect}`;
        if (styleAttr && styleAttr.length > 0) {
          image.attr('style', `${styleAttr}; ${addedStyle}`);
        } else {
          image.attr('style', addedStyle);
        }
      }
    }
  }
  
  return $.html();
}

