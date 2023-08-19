import {components as cardComponents} from '../components/cards';
import {components as formComponents} from '../components/forms';
import {components as layoutComponents} from '../components/layout';
import {components as pageComponents} from '../components/pages';
import {components as widgetComponents} from '../components/widgets';
import {getStylesFrom} from '../lib/useJssStyles';
import crypto from 'crypto';

const allComponents = {
  ...cardComponents,
  ...formComponents,
  ...layoutComponents,
  ...pageComponents,
  ...widgetComponents,
};

function renderStaticStylesheet(): string {
  const sb = [];
  
  for(const componentName of Object.keys(allComponents)) {
    const componentFn = (allComponents as any)[componentName];
    const extractedStyles = getStylesFrom(componentFn);
    if (extractedStyles) {
      const {name:_,styles} = extractedStyles;
      sb.push(styles);
    }
  }
  
  return sb.join('\n');
}

export interface StylesheetWithHash {
  css: string
  hash: string
}
let staticStylesheet: StylesheetWithHash|null = null;
export function getStaticStylesheet(): StylesheetWithHash {
  if(staticStylesheet===null) {
    const css = renderStaticStylesheet();
    const hash = crypto.createHash('sha256').update(css).digest('hex');
    staticStylesheet = {css, hash};
  }
  return staticStylesheet;
}
