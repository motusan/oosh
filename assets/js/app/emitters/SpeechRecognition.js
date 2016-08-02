define({
    "displayName":"Speech Recognition",
    "emitterObjectName":"SpeechRecognition",
    "getVia": {
        "windowObject" : ["SpeechRecognition", "webkitSpeechRecognition"],
        "member" : "",
        "memberType" : "constructor",
        "returnType" : "returnValue",
        "after" : [
            {
                "member" : "continuous",
                "memberValue" : true,
                "memberType" : "property"
            },
            {
                "member" : "start",
                "memberType" : "method"
            }
        ]
    },
    "events":[
        {
            "name":"result",
            "alias":"speechresult",
            "properties": ["results"]
        },
        "speechend",
        "nomatch",
        {
            "name":"error", "alias":"speecherror"
        }
    ]
});
