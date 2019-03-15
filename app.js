const KEY = 'bdqueimadas.sid';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
const fs = require('fs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const i18n = require('i18n');
const compression = require('compression');

const applicationConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, './configurations/Application.json'), 'utf8'));

BASE_URL = applicationConfigurations.BaseUrl;

app.use(compression());
app.use(cookieParser());
app.use(session({
  secret: KEY,
  name: 'BDQueimadas',
  resave: false,
  saveUninitialized: false,
}));

// Setting internationalization
i18n.configure({
  locales: ['pt', 'en', 'es'],
  directory: `${__dirname}/locales`,
  objectNotation: true,
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(i18n.init);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(methodOverride('_method'));
app.use(BASE_URL, express.static(path.join(__dirname, 'public')));
app.use(require('connect-flash')());

app.use((req, res, next) => {
  const match = req.url.match(/^\/([A-Z]{2})([\/\?].*)?$/i);
  if (match) {
    req.lang = match[1];
    req.url = match[2] || '/';

    if (req.lang !== undefined && (req.lang === 'es' || req.lang === 'en')) res.setLocale(req.lang);
  }
  next();
});

module.exports = app;
