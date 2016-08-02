define({
    "displayName":"MIDI Connect/Disconnect",
    "emitterObjectName":"MIDIAccess",
    "getVia": {
        "windowObject" : "navigator",
        "member" : "requestMIDIAccess",
        "memberType" : "method",
        "memberParameters": false,
        "returnType" : "promise",
    },
    "containedEmitters": [
        {
            "container" : "inputs",
            "emitterObjectName" : "port"
        }
    ],
    "events":[
        {
            "name":"statechange",
            "properties": ["target",
                {
                    "name" : "port",
                    "emitterObjectName" : "port",
                    "isEventEmitter" : true,
                    "filter" : {
                        "type":{
                            "eq":"input"
                        },
                        "state":{
                            "eq":"connected"
                        }
                    }
                }
                , "timeStamp"]
        }
    ]
});
