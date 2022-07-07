const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    uaa: { tag: 'xsuaa' }
    ,
    hana: { tag: 'hana' }
});

// placed before authentication - business user info from the JWT will not be set as HANA session variables (XS_)
const hdbext = require('@sap/hdbext');
app.use(hdbext.middleware(services.hana));

const xssec = require('@sap/xssec');
const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {
    session: false
}));


app.use(bodyParser.json());

app.get('/srv', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
        res.status(200).send('poc');
    } else {
        res.status(403).send('Forbidden');
    }
});

app.get('/srv/user', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
        res.status(200).json(req.user);
    } else {
        res.status(403).send('Forbidden');
    }
});




app.get('/srv/sales', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
        let sql = 'SELECT * FROM "poc.db::sales"';
        req.db.exec(sql, function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
    } else {
        res.status(403).send('Forbidden');
    }
});

app.get('/srv/session', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
        req.db.exec('SELECT * FROM M_SESSION_CONTEXT', function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
    } else {
        res.status(403).send('Forbidden');
    }
});

app.get('/srv/db', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
        req.db.exec('SELECT SYSTEM_ID, DATABASE_NAME, HOST, VERSION, USAGE FROM M_DATABASE', function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
    } else {
        res.status(403).send('Forbidden');
    }
});

app.get('/srv/connections', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
        req.db.exec(`SELECT TOP 10 USER_NAME, CLIENT_IP, CLIENT_HOST, START_TIME FROM M_CONNECTIONS WHERE OWN='TRUE' ORDER BY START_TIME DESC`, function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
    } else {
        res.status(403).send('Forbidden');
    }
});



const port = process.env.PORT || 5001;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});