import {components as appComponents} from '../components/app';
import {components as cardComponents} from '../components/cards';
import {components as formComponents} from '../components/forms';
import {components as layoutComponents} from '../components/layout';
import {components as errorPageComponents} from '../components/pages/errorPages';
import {components as metaPageComponents} from '../components/pages/metaPages';
import {components as widgetComponents} from '../components/widgets';
import {components as debugComponents} from '../components/debug';
import {components as settingsComponents} from '../components/settings';
import {components as emailComponents} from '../components/emails';
import {getStylesFrom} from '../lib/useJssStyles';
import { allRoutes } from '../lib/routes';
import crypto from 'crypto';
import fs from 'fs';

const allComponents = {
  ...appComponents,
  ...cardComponents,
  ...formComponents,
  ...layoutComponents,
  ...errorPageComponents,
  ...metaPageComponents,
  ...widgetComponents,
  ...debugComponents,
  ...settingsComponents,
  ...emailComponents,
};

const nonJssStylesheets: string[] = [
  "static/globalStyles.css",
  "static/react-datepicker.css",
];

function renderStaticStylesheet(isForEmail: boolean): string {
  const sb = [];
  
  for(const route of allRoutes) {
    const extractedStyles = getStylesFrom(route.name, route.component);
    if (extractedStyles) {
      sb.push(extractedStyles.styles);
    }
  }
  for(const componentName of Object.keys(allComponents)) {
    const componentFn = (allComponents as any)[componentName];
    const extractedStyles = getStylesFrom(componentName, componentFn);
    if (extractedStyles) {
      sb.push(extractedStyles.styles);
    }
  }
  
  if (!isForEmail) {
    // The stylesheet used for email excludes non-JSS stylesheets, and in particular excludes react-datepicker.css, which would trigger an infinite-loop bug in `juice` if it was included. See https://github.com/Automattic/juice/issues/471
    for (const path of nonJssStylesheets) {
      sb.push(fs.readFileSync(path, 'utf-8'));
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
    const css = renderStaticStylesheet(false);
    const hash = crypto.createHash('sha256').update(css).digest('hex');
    staticStylesheet = {css, hash};
  }
  return staticStylesheet;
}

let emailStylesheet: StylesheetWithHash|null = null;
export function getEmailStylesheet(): StylesheetWithHash {
  if(emailStylesheet===null) {
    const css = renderStaticStylesheet(true);
    const hash = crypto.createHash('sha256').update(css).digest('hex');
    emailStylesheet = {css, hash};
  }
  return emailStylesheet;
}
