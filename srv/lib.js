module.exports = {
    createSubaccount: createSubaccount,
    setupUser: setupUser,
    subscribeApp:subscribeApp,
    appUser:appUser
};



const axios = require('axios');
const qs = require('qs');


async function createSubaccount(tname, tmail) {
    var data = qs.stringify({
        'grant_type': 'password',
        'username': 'bsatchithanantham@kaartech.com',
        'password': 'KAARusa@2022',
        'client_id': 'sb-ut-1b77bd58-97bf-4915-835d-5ed6970fbbe2-clone!b143726|cis-central!b14',
        'client_secret': '751641f3-973e-437a-ba86-e09b0e4e6fd2$TnD6WxzyyGDsxJHPARc5cAKwanr_KaYQJQVKvG2ScIk=',
        'response_type': 'token'
    });
    var config = {
        method: 'post',
        url: 'https://kaartechnologiesinc.authentication.eu10.hana.ondemand.com/oauth/token',
        headers: {
            'Accept': 'application/json;charset=utf8',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'JSESSIONID=EA46E395A436837D5A17E7EBE8ABEF7B; X-Uaa-Csrf=hF4K3KIgSCcOerbGrtrJSB; __VCAP_ID__=af19f0e2-e24b-4fcd-5c6d-d584'
        },
        data: data
    };

    let res1 = await axios(config);
    var data1 = JSON.stringify({
        'displayName': tname,
        'region': 'eu10',
        'subdomain': tname
    });
    let options1 = {
        method: 'post',
        url: 'https://accounts-service.cfapps.eu10.hana.ondemand.com/accounts/v1/subaccounts?subaccountAdmin=' + tmail,
        headers: {
            'Authorization': 'Bearer ' + res1.data.access_token,
            'Content-Type': 'application/json'
        },
        data: data1
    };

    var res2 = await axios(options1);

    return res2.data.guid;
     
 


};
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
async function subscribeApp(tenantid) {
    console.log(1);
    await sleep(20000);
    console.log(2);
    try {
        // get access token
        let options6 = {
            method: 'POST',
            url: 'https://kaar.authentication.eu10.hana.ondemand.com' + '/oauth/token?grant_type=client_credentials&response_type=token',
            headers: {
                'Authorization': 'Basic ' + Buffer.from('sb-appd4-clone!b144159|lps-registry-broker!b14' + ':' + 'd27e42f2-23de-4733-98ba-a2947dfa2d3b$dclydRFiMXL0zVPtEBYe2GVlw0h1n7rDg08stKJJXuo=').toString('base64')
            }
        };
        let res6 = await axios(options6);
      console.log(res6.data);

      










            // get tenantid
            // try {
            //     let options1 = {
            //         method: 'GET',
            //         url: 'https://accounts-service.cfapps.eu10.hana.ondemand.com/accounts/v1/subaccounts?derivedAuthorizations=any&directoryGUID=13091c3e-b776-43eb-b955-e77a088980fc',
            //         headers: {
            //             'Authorization': 'Bearer ' + res6.data.access_token,
            //             'Content-Type': 'application/json'
    
    
            //         }
            //     };
            //     let res1 = await axios(options1);
            //     console.log(res1.data.value);
    
            //     for(i=0;i<res1.data.value.length();i++){
            //         if(res1.data.value[i].displayName==tname){
            //             tenantid=res1.data.value[i].guid;
            //         }
            //     }
            // } catch (err) {
            //     console.log(err.stack);
            //     return err.message;
            // }
     
        try {
            // get subscriptions
            var newdata6=JSON.stringify({
                "subscriptionParams": {}
              });
            let options7 = {
                method: 'POST',
                url: 'https://saas-manager.mesh.cf.eu10.hana.ondemand.com/saas-manager/v1/application/tenants/'+tenantid+'/subscriptions',
                headers: {
                    'Authorization': 'Bearer ' + res6.data.access_token,
                    'Content-Type': 'application/json'


                },
                data:newdata6
            };
            let res7 = await axios(options7);
            return res7.data;
        } catch (err) {
            console.log(err.stack);
            return err.message;
        }
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};

async function setupUser(tmail) {
    try {
        // get access token
        let options = {
            method: 'POST',
            url: 'https://kaar.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token',
            headers: {
                'Authorization': 'Basic ' + Buffer.from('sb-na-c99f820a-1503-4302-8c6b-005db6cd2a66!a144159' + ':' + '9bcd49c3-68e7-468f-8937-207265caa18a$wldIq5VBkfaia8CzjW0i0mKpYGEDBGfX-QyYuDq1kbg=').toString('base64')
            }
        };
        let res = await axios(options);
        // console.log(res.access_token);
        var data1 = JSON.stringify({
            "userName": tmail,
            "emails": [{ "value": tmail }],
            "active": true,
            "verified": true,
            "origin": "sap.default",
            "groups": [{
                "value": "poc_Setup",
                "display": "poc_Setup",
                "type": "DIRECT"
            }]
        });
        try {
            // get subscriptions
            let options1 = {
                method: 'POST',
                url: 'https://api.authentication.eu10.hana.ondemand.com' + '/Users',
                headers: {
                    'Authorization': 'Bearer ' + res.data.access_token,
                    'Content-Type': 'application/json'
                },
                data: data1
            };
            let res1 = await axios(options1);
            return res1.data;
        } catch (err) {
            console.log(err.stack);
            return err.message;
        }
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};


async function appUser(tmail) {
    try {
        // get access token
        let options = {
            method: 'POST',
            url: 'https://kaar.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token',
            headers: {
                'Authorization': 'Basic ' + Buffer.from('sb-na-c99f820a-1503-4302-8c6b-005db6cd2a66!a144159' + ':' + '9bcd49c3-68e7-468f-8937-207265caa18a$wldIq5VBkfaia8CzjW0i0mKpYGEDBGfX-QyYuDq1kbg=').toString('base64')
            }
        };
        let res = await axios(options);
        // console.log(res.access_token);
        var data1 = JSON.stringify({
            "userName": tmail,
            "emails": [{ "value": tmail }],
            "active": true,
            "verified": true,
            "origin": "sap.default",
            "groups": [{
                "value": "poc_User",
                "display": "poc_User",
                "type": "DIRECT"
            }]
        });
        try {
            // get subscriptions
            let options1 = {
                method: 'POST',
                url: 'https://api.authentication.eu10.hana.ondemand.com' + '/Users',
                headers: {
                    'Authorization': 'Bearer ' + res.data.access_token,
                    'Content-Type': 'application/json'
                },
                data: data1
            };
            let res1 = await axios(options1);
            return res1.data;
        } catch (err) {
            console.log(err.stack);
            return err.message;
        }
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};


