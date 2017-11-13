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
const express = require('express'); // call express
const helmet = require('helmet'); // protect against common web vulnerabilities

const app = express(); // define our app using express

// SET ENVIRONMENT AND PORT
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
    if (req.get('Host').match(/^www\..*/i)) {
      next();
    }
    else {
      res.redirect(301, `https://www.${req.get('Host') + req.url}`);
    }
  });

  // PRERENDER IO
  // app.use(require('prerender-node').set('prerenderToken', process.env.PRERENDER_IO_TOKEN));
}

// SECURITY MIDDLEWARE
app.use(helmet());

// SERVE THE NODE MODULES FOLDER
app.use('/dependencies/node', express.static(`${__dirname}/node_modules`));

// SERVE THE ANGULAR APPLICATION
app.use('/', express.static(`${__dirname}/public`));

app.all('/dist/bundle.min.js', (req, res) => {
  res.sendFile('/dist/bundle.min.js', { root: `${__dirname}/public` });
});
app.get('/dist/bundle.js', (req, res) => {
  res.sendFile('/dist/bundle.js', { root: `${__dirname}/public` });
});

// Send the index.html for other files to support HTML5Mode
app.all('/*', (req, res) => {
  res.sendFile('index.html', { root: `${__dirname}/public` });
});

// START THE SERVER
app.listen(port);
console.log(`Magic happens on port ${port}!`);
