import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {App} from './App';

function clientMain() {
  const rootDiv = document.getElementById('react-root');
  const root = ReactDOM.createRoot(rootDiv);
  root.render(<App/>);
}

clientMain();
