define({
    "id" : "KeyboardSynth",
    "name" : "Keyboard Synth",
    "description" : "Use the computer keyboard to trigger the WebAudioOscillator synthesizer.",
    "template" : "main",
    "triggers" :  [
        {
            "name":"groupmap oosh.keydown => webaudio.oscillator.start",
            "event":{
                "name": "oosh.keydown",
                "properties":{
                    "detail:properties:code": ["KeyA", "KeyW", "KeyS", "KeyE", "KeyD", "KeyF",
                            "KeyT", "KeyG", "KeyY", "KeyH", "KeyU", "KeyJ", "KeyK", "KeyO",
                            "KeyL", "KeyP", "Semicolon", "Quote"]
                }
            },
            "targets": [{
                "type": "WebAudioOscillator",
                "action":"play",
                "parameters": {
                    "id": {
                        "input" : "event:detail:properties:code"
                    },
                    "type" : "triangle",
                    "detune" : 0,
                    "gain" : 1,
                    "frequency" : {
                        "input" : "event:detail:properties:code",
                        "transform":[
                            {
                                "map": {
                                    "KeyA" : 1, "KeyW" : 2, "KeyS" : 3, "KeyE" : 4, "KeyD" : 5,
                                    "KeyF" : 6, "KeyT" : 7 , "KeyG" : 8, "KeyY" : 9, "KeyH" : 10,
                                    "KeyU" : 11, "KeyJ" : 12, "KeyK" : 13, "KeyO" : 14, "KeyL" : 15,
                                    "KeyP" : 16, "Semicolon" : 17, "Quote" : 18
                                }
                            },
                            {"add": 2},
                            {"exponentOf": 1.059463094359},
                            {"multiply": 440}
                        ]
                    }
                }
            }]
        },
        {
            "name":"groupmap oosh.keyup => webaudio.oscillator.stop",
            "event":{
                "name": "oosh.keyup",
                "properties":{
                    "detail:properties:code": ["KeyA", "KeyW", "KeyS", "KeyE", "KeyD", "KeyF",
                            "KeyT", "KeyG", "KeyY", "KeyH", "KeyU", "KeyJ", "KeyK", "KeyO",
                            "KeyL", "KeyP", "Semicolon", "Quote"]
                }
            },
            "targets": [{
                "type": "WebAudioOscillator",
                "action": "stop",
                "parameters": {
                    "id": {
                        "input" : "event:detail:properties:code"
                    }
                }
            }]
        }
    ]
});
