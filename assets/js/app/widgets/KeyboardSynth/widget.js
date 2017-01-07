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
                    ":detail:properties:code": ["Digit2","Digit3", "Digit4","Digit5","Digit6", "Digit8","Digit9","Minus", "Equal",
							"KeyQ","KeyW","KeyE","KeyR","KeyT","KeyY","KeyU","KeyI","KeyO","KeyP","BracketLeft","BracketRight",
							"KeyS","KeyD", "KeyG","KeyH","KeyJ", "KeyL","Semicolon",
                            "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma","Period","Slash"]
                }
            },
            "targets": [{
                "type": "WebAudioOscillator",
                "action":"play",
                "parameters": {
                    "id": {
                        "input" : ":event:detail:properties:code"
                    },
                    "type" : "triangle",
                    "detune" : 0,
                    "gain" : 1,
                    "frequency" : {
                        "input" : ":event:detail:properties:code",
                        "transform":[
                            {
								"map":{
									"KeyQ" : 1, "Digit2" : 2, "KeyW" : 3, "Digit3" : 4, "KeyE" : 5,
									"KeyR" : 6, "Digit5" : 7, "KeyT" : 8, "Digit6" : 9, "KeyY" : 10, "Digit7" : 11, "KeyU" : 12,
									"KeyI" : 13, "Digit9" : 14, "KeyO" : 15, "Digit0" : 16, "KeyP" : 17, "BracketLeft" : 18, "Plus" : 19, "BracketRight" : 20,
									"KeyZ" : 25, "KeyS" : 26, "KeyX" : 27, "KeyD" : 28, "KeyC" : 29,
									"KeyV" : 30, "KeyG" : 31, "KeyB" : 32, "KeyH" : 33, "KeyN" : 34, "KeyJ" : 35, "KeyM" : 36,
									"Comma" : 37, "KeyL" : 38, "Period" : 39, "Semicolon" : 40, "Slash" : 41
								}
                            },
                            {"subtract": 26},
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
                    ":detail:properties:code": ["Digit2","Digit3", "Digit4","Digit5","Digit6", "Digit8","Digit9","Minus", "Equal",
							"KeyQ","KeyW","KeyE","KeyR","KeyT","KeyY","KeyU","KeyI","KeyO","KeyP","BracketLeft","BracketRight",
							"KeyS","KeyD", "KeyG","KeyH","KeyJ", "KeyL","Semicolon",
                            "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma","Period","Slash"]
                }
            },
            "targets": [{
                "type": "WebAudioOscillator",
                "action": "stop",
                "parameters": {
                    "id": {
                        "input" : ":event:detail:properties:code"
                    }
                }
            }]
        }
    ]
});
