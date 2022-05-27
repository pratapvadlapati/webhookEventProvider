# webhookEventProvider
this repo will update email-subscription list(an Array) and based on this change it fires an event to call event-consumer URL(APIC in our case).

#To test this event-provider
clone this repo
##use below commands

#install required modules
## npm install

#start the application
## npm start

url to test quickly:
METHOD: POST

http://localhost:3000/webhook/events/subscription/email

Sample Request:

{
    "email": "youremail@anydomain.com"
}

Expected Response:

{
    "message": "eventTriggered",
    "subscriptionList": [
        "givenEmailidInReq@anydomain.com"
    ]
}
