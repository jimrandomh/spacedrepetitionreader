import express, { Express } from 'express';
import path from 'path';
import { addApiEndpoints } from './api/apiEndpoints';
import { getStaticStylesheet } from './staticStylesheet';
import {initJss} from '../lib/useJssStyles';
import process from 'process';
import { getConfig } from './util/getConfig';
import { addCardsDueCronjob } from './cardsDueNotification';
import { renderSSR } from './render';
import { getPrisma } from './db';
import { getUserFromReq, updateUserLastVisitAt } from './api/auth';

const projectRoot = path.join(__dirname, '..');
const staticFilesPath = path.join(projectRoot, 'static');

function serverStartup() {
  const app = express()
  const port = getConfig().port;
  
  initJss();
  addApiEndpoints(app);
  addCardsDueCronjob();
  serverRoutes(app);
  
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}

function serverRoutes(app: Express) {
  app.use('/static', express.static(staticFilesPath))
  //app.use('/', express.static(path.join(projectRoot, 'index.html')));
  app.use('/client.js', express.static(path.join(projectRoot, 'build/client.js')));
  app.use('/client.js.map', express.static(path.join(projectRoot, 'build/client.js.map')));
  app.get('/styles.css', (req, res) => {
    const {css,hash} = getStaticStylesheet();
    
    const requestedHash = req.query?.hash;
    if (requestedHash === hash) {
      res.writeHead(200, {
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Type": "text/css; charset=utf-8"
      });
      res.end(css);
    } else {
      res.writeHead(404);
      res.end("");
    }
  });
  app.get('*', async (req, res) => {
    if (req.url === '/favicon.ico') {
      res.status(404);
      res.end('');
      return;
    }

    const db = getPrisma();
    const currentUser = await getUserFromReq(req, db);
    const {status, html} = await renderSSR(currentUser, req, res, req.url)
    res.writeHead(status);
    res.end(html);
    
    if (currentUser) {
      void updateUserLastVisitAt(currentUser, db);
    }
  });
  
  console.log(`Serving static files from ${staticFilesPath}`);
}



process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

serverStartup();
