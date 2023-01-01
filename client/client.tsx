import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import {AppClient} from './App';
import {initJss} from '../lib/useJssStyles';

function clientMain() {
  initJss();
  const rootDiv = document.getElementById('react-root');
  if (!rootDiv) throw new Error("No root container");
  const root = ReactDOM.createRoot(rootDiv);
  root.render(<AppClient/>);
}

clientMain();
