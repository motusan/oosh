define(function(){
	/*
	bend| playbackRate
	--------------------
	-64	|	-3.4
	0	|	1
	64	|	3.4


	6.8056469327705775 / 128 = 0.05316911666227014

	default base value = 1
	playbackRate = baseValue + (bend * 0.05316911666227014)
	*/

    return {
        "id" : "ExpressionController",
        "name" : "ExpressionController",
        "description" : "Map pitch bend and mod wheel to oscillators and audio sources.",
        "template" : "main",
        "triggers" :  [
            {
                "name":"bend",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        ":detail:properties:data[0]" : "224",
                    }
                },
                "targets": [{
                    "type": { "widget": "ExpressionController" },
                    "action":"onExpression",
                    "parameters": {
						"changes":[
							{
								"targetType" : "WebAudioBuffer",
								"expressionType" : "bend",
								"params":{
									"playbackRate":{
			                            "transform":[
			                                {"add": ":event:detail:properties:data[2]"},
											{"multiply": 0.05316911666227014}
			                            ]
			                        }
								}
							}
						]
                    }
                }]
            },

            {
                "name":"mod",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        ":detail:properties:data[0]" : "176",
                    }
                },
                "targets": [{
                    "type": { "widget": "ExpressionController" },
                    "action":"onExpression",
                    "parameters": {
						"changes":[
							{
								"targetType" : "WebAudioBuffer",
								"expressionType" : "mod",
								"params":{
									"playbackRate":{
			                            "transform":[
			                                {"add": ":event:detail:properties:data[2]"},
											{"multiply": 0.05316911666227014}
			                            ]
			                        }
								}
							}
						]
                    }
                }]
            }
        ],

        onExpression : function(params){
			if(!params.changes) return;
			var ev = params._context.event;
			var expressionValue = ev.detail.properties.data["2"];
			params.changes.forEach(function(change){
				// target types: WebAudioBuffer, WebAudioOscillator, etc.
				var targetType = require(change.targetType);
				targetType.setExpression(change, { event : ev, expressionValue : expressionValue });
			});
        },

        initializeWidget : function(params){
			var targetTypeIds = ['WebAudioBuffer'];
			targetTypeIds.forEach(function(targetTypeId){
				var targetType = require(targetTypeId);
				var change = {
					"targetType" : "WebAudioBuffer",
					"expressionType" : "bend",
					"params":{
						"playbackRate":{
							"transform":[
								{"add": 1},
								{"multiply": 0.05316911666227014}
							]
						}
					}
				};
				//targetType.setExpression(change, { });
			});
			console.log('Express yourself!');
        }
    };
});

/*
	Each target
*/
