var express = require('express');
var router = express.Router();
const axios = require('axios');
const events = require('events');
const eventEmitter = new events.EventEmitter();
var crypto = require('crypto');

const reqData = require('./Req');
//secret message api key shared by partner        
var partnerApiKey = '2bh7Ptx0pdYn9NWv5a9S1WPaer2BQ3U4R40pygAqnQMy6X2q0q';
var subscriptionEmailList = [];

router.post('/webhook/events/subscription/email', (req, res) => {

    var payload = req.body;
    let emailId = payload.email ? payload.email : undefined;
    if (emailId === undefined) {
        console.error('unable to add email-id to subscription list')
        res.json({
            errorCode: 500,
            errorDesc: 'Unable to add email id'
        }).status(500)
    } else {
        if (subscriptionEmailList.includes(emailId)) {
            res.json({
                "status": "No emailId added",
                "moreInfo": "emailId exists in the Subscription list"
            }).status(400);
        } else {
            subscriptionEmailList.push(emailId);

            if (subscriptionEmailList.includes(emailId)) {
                const data = {
                    emailId,
                    payload,
                    partnerApiKey
                }
                eventEmitter.emit('emailAdded', data)
                res.json({ "message": "eventTriggered", subscriptionList: subscriptionEmailList });
            }
        }
    }

})


//Create an event handler:
var publishEventToConsumer = function (data) {
    const { emailId, payload, partnerApiKey } = data;
    console.log('email added to list!' + emailId);

    const signature = generateSignature(partnerApiKey, payload);

    console.log(signature);

    //const URL = 'https://jsonplaceholder.typicode.com/todos';
    const URL = 'https://ws-qa4.hondaweb.com/REST/Webhook/event/1.0'
    //const URL = "https://4536-27-7-43-102.in.ngrok.io/localtest/sandbox/testhook/consume";
    const body = payload;
    const hdrs = {
        "X-Hub-Signature": signature,
        "Authorization": "Basic c2VydmljZV93ZWJob29rX2FwaWM6RmVlZEA0NDg=",
        "hondaHeaderType.country_code": "US",
        "hondaHeaderType.messageId": 09988,
        "hondaHeaderType.version": '',
        "hondaHeaderType.language_code": '',
        "hondaHeaderType.businessId": '',
        "hondaHeaderType.clientPartnerId": '',
        "hondaHeaderType.systemId": '',
        "hondaHeaderType.collectedTimeStamp": '',
        "hondaHeaderType.siteId": ''
    }
    axios
        .post(URL, body, { headers: hdrs })
        .then(response => {
            console.log('********** Response from APIC: ********');
            console.log(response.data);
            return;
        })
        .catch(error => {
            console.log(error);
        });

}

//Assign the event handler to an event:
eventEmitter.on('emailAdded', publishEventToConsumer);


//generate signature using hmac-sha1
const generateSignature = (partnerApiKey, payload) => {

    var strPayload = JSON.stringify(payload);
    //convert api key and payload into bytes
    var encodedKey = Buffer.from(partnerApiKey);
    var encodedPayload = Buffer.from(strPayload);

    var hashedResult = crypto.createHmac('sha1', encodedKey).update(encodedPayload).digest('hex');
    var verifySignature = `sha1=${hashedResult}`
    console.log(verifySignature);
    return verifySignature;
}

module.exports = router;