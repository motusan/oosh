define({
    "displayName":"Audio Context",
    "emitterObjectName":"Audio Context",
    "getVia": {
        "windowObject" : [":AudioContext", ":webkitAudioContext"],
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
