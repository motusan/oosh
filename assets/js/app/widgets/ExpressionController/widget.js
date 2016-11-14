define(function(){
    return {
        "id" : "ExpressionController",
        "name" : "ExpressionController",
        "description" : "Map pitch bend and mod wheel to oscillators.",
        "template" : "main",
        "triggers" :  [
            {
                "name":"bend",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        "detail:properties:data[0]" : "224",
                    }
                },
                "targets": [{
                    "type": { "widget": "ExpressionController" },
                    "action":"onBend",
                    "parameters": {
                        "data1" : { "input" : "event:detail:properties:data[1]" },
						"data2" : { "input" : "event:detail:properties:data[2]" },
                        "screenId": { "input" : "screenId" },
                        "areaId": { "input" : "area:id" }
                    }
                }]
            },

            {
                "name":"mod",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        "detail:properties:data[0]" : "176",
                    }
                },
                "targets": [{
                    "type": { "widget": "ExpressionController" },
                    "action":"onMod",
                    "parameters": {
						"data2" : { "input" : "event:detail:properties:data[2]" },
                        "screenId": { "input" : "screenId" },
                        "areaId": { "input" : "area:id" }
                    }
                }]
            }
/*
            {
                "name":"oosh.midimessage => webaudio.oscillator.stop1",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        "detail:properties:data[0]" : "128",
                        "detail:properties:data[1]" : { "lessThan" : 72 }
                    }
                },
                "targets": [{
                    "type": "WebAudioOscillator",
                    "action":"stop",
                    "parameters": {
                        "id": {
                            "input" : "event:detail:properties:data[1]"
                        }
                    }
                },
*/
        ],

        onBend : function(params){
            console.log(params);
        },

        onMod : function(params){
            console.log(params);
        },

        initializeWidget : function(params){
        }
    };
});
