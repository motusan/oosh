define({
    "displayName":"MIDI Message",
    "emitterObjectName":"port",
    "getVia": {
        "runtimeProvidedObject" : true
    },
    "events":[
        {
            "name":"midimessage",
            "properties": ["target", "data", "timeStamp"]
        }
    ]
});
