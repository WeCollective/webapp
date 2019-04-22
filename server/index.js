/*
  Copyright (c) 2016 WE COLLECTIVE

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/
const express = require('express');
const fs = require('fs');
const helmet = require('helmet'); // protect against common web vulnerabilities
const https = require('https');

const app = express();

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 8081;

if (env === 'production') {
  // REDIRECT TRAFFIC ON HTTP TO HTTPS
  app.use((req, res, next) => {
    if (!req.secure && req.get('X-Forwarded-Proto') !== 'https') {
      res.redirect(`https://${req.get('Host') + req.url}`);
    }
    else {
      next();
    }
  });

  // REDIRECT APEX DOMAIN TO WWW. SUBDOMAIN
  app.use((req, res, next) => {
    const host = req.get('Host');
    if (host.match(/^www\..*/i)) {
      next();
    }
    else {
      res.redirect(301, `https://www.${host + req.url}`);
    }
  });

  // PRERENDER IO
  app.use(require('prerender-node') // eslint-disable-line global-require
    .set('prerenderToken', process.env.PRERENDER_IO_TOKEN));
}

// SECURITY MIDDLEWARE
app.use(helmet());

// SERVE THE NODE MODULES FOLDER
app.use('/dependencies/node', express.static(`${__dirname}/node_modules`));

// SERVE THE ANGULAR APPLICATION
app.use('/', express.static(`${__dirname}/build`));

// Send the index.html for other files to support HTML5Mode
app.all('/*', (req, res) => {
  res.sendFile('index.html', { root: `${__dirname}/build` });
});

// Start the server, mock SSL in local environment.
if (env === 'local') {
  const httpsOptions = {
    cert: fs.readFileSync('../config/ssl/local-cert.pem'),
    key: fs.readFileSync('../config/ssl/local-key.pem'),
    rejectUnauthorized: false,
    requestCert: false,
  };

  https.createServer(httpsOptions, app).listen(port);
}
else {
  app.listen(port);
}

console.log(`\n✅ Server running at https://localhost:${port}/`);
