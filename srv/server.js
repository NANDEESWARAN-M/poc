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
let encodeUrl = bodyParser.urlencoded({ extended: false });
const lib = require('./lib.js');
const xssec = require('@sap/xssec');
const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {
    session: false
}));


app.use(bodyParser.json());

//controlroom

app.post('/csrv/addtenant', encodeUrl,  (req, res) =>{
    //step1:insert into tenant name in company table
 
    let sql1 = 'INSERT INTO "COMPANY" ("COMPNAME")  VALUES(\''+req.body.tname+'\');';
    req.db.exec(sql1, function (err, results) {
        if (err) {
           console.log(err.toString());
        }
        console.log(results);
    });

    // step2:using compid insert tmail into account
    let sql2 = 'INSERT INTO "ACCOUNT" ("COMPID","ACCOUNT")  VALUES ((SELECT "COMPID" FROM "COMPANY" WHERE "COMPANY".COMPNAME=\''+req.body.tname+'\'),\''+req.body.tmail+'\');';
    req.db.exec(sql2, function (err, results) {
        if (err) {
            console.log(err.toString());
            
        }
        console.log(results);
    });
    // step3:using compid insert url into tenant
    var url="https://"+req.body.tname+".cfapps.eu10-004.hana.ondemand.com/index.html";
    let sql3 = 'INSERT INTO "TENANTS" ("COMPID","TURL")  VALUES ((SELECT "COMPID" FROM "COMPANY" WHERE "COMPANY".COMPNAME=\''+req.body.tname+'\'),\''+url+'\')';
    req.db.exec(sql3, function (err, results) {
        if (err) {
            console.log(err.toString());
            
        }
        console.log(results);
    });
    // step4:assign setup role collection to tmail
    lib.setupUser(req.body.tmail).then(
        function (result) {
           console.log(result);
          //  res.status(200).send(result);
        },
        function (err) {
            console.log(err.message);
            // console.log();
            // res.status(403).send(err.message);
        });
    //step5:create a subaccount and redirect to sub to app for tenant
    lib.createSubaccount(req.body.tname,req.body.tmail).then(
        function (result) {

          var string = encodeURIComponent(result);
          res.redirect('/csrv/sub?tid='+string);
        //  res.redirect('/supplier?data=123');
           
        },
        function (err) {
          // console.log(err.message);
          // return err.message;
          res.status(400);
           
          
        });

   
    //  res.send("dsml");
    
   });


   app.get('/csrv/sub', function (req, res) {
    var tid = req.query.tid;
    console.log(tid);
console.log(decodeURIComponent(tid));
    // var tenantid="ca930bd7-acc4-484a-af1f-dda599daf9d3";
    lib.subscribeApp(decodeURIComponent(tid)).then(
      function (result) {
        console.log(result);
        res.send("tenant.html");
       
      
         
      },
      function (err) {
        console.log(err.message);
        res.status(400);
         
        
      });

});
   app.get('/csrv/username', function (req, res) {
  
    res.status(200).json(req.user);

});


app.get('/srv/gettenants', function (req, res) {
    let sql = 'SELECT "COMPNAME","ACCOUNT","TURL" FROM "COMPANY","ACCOUNT","TENANTS" WHERE COMPANY.COMPID=ACCOUNT.COMPID AND  COMPANY.COMPID=TENANTS.COMPID;';
    req.db.exec(sql, function (err, results) {
        if (err) {
            res.type('text/plain').status(500).send('ERROR: ' + err.toString());
            return;
        }
        res.status(200).json(results);
    });

    
  
});

//setup


app.get('/ssrv/username', function (req, res) {
  
    res.status(200).json(req.user);

});


app.get('/ssrv/getemployee', function (req, res) {
    let sql = 'SELECT "SACCOUNT" FROM "RELATION" WHERE RELATION=\'employee\' AND DACCOUNT=\''+req.user.id+'\');';
    req.db.exec(sql, function (err, results) {
        if (err) {
            res.type('text/plain').status(500).send('ERROR: ' + err.toString());
            return;
        }
        res.status(200).json(results);
    });

    
  
});
app.post('/ssrv/addemployee', encodeUrl,  (req, res) =>{
    //step1:insert into tenant name in company table
 
    let sql1 = 'INSERT INTO "RELATION" ("SACCOUNT","RELATION","DACCOUNT")  VALUES (\''+req.body.account+'\',\'employee\',\''+req.user.id+'\');';
    req.db.exec(sql1, function (err, results) {
        if (err) {
            console.log(err.toString());
            
        }
        console.log(results);
    });

    // step2:using compid insert tmail into account
    let sql2 = 'INSERT INTO "ACCOUNT" ("COMPID","ACCOUNT")  VALUES ((SELECT "COMPID" FROM "ACCOUNT" WHERE ACCOUNT.ACCOUNT=\''+req.user.id+'\'),\''+req.body.account+'\');';
    req.db.exec(sql2, function (err, results) {
        if (err) {
            console.log(err.toString());
            
        }
        console.log(results);
    });

    // step3:assign user role collection to account
    lib.appUser(req.body.account).then(
        function (result) {
           console.log(result);
          //  res.status(200).send(result);
        },
        function (err) {
            console.log(err.message);
            // console.log();
            // res.status(403).send(err.message);
        });
 

   
     res.redirect("/setup.html");
    
   });






















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

// app.use('/', router);

const port = process.env.PORT || 5001;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});