define(['ValueFilter'], function(valueFilter){
	var area = null;

	var applyFilters = function(ev){
		var pm = require('ProjectManager');
		var areaConf = pm.findScreenArea(pm.getLocalScreen(), area.attr('id'));
		var filters = areaConf.widget.configuration.filters;
		if(!filters){
			return true;
		}

		var passFilter = true;
		filters.forEach(function(filter){
			if(filter.exclude){
				var excludeFilter = filter.exclude;
				if(valueFilter.test(excludeFilter, { event : ev })){
					passFilter = false;
				}
			}
		});
		return passFilter;
	};

    return {
        "id" : "EventSpy",
        "name" : "Event Spy",
        "description" : "Most fundamental Oosh tool. Taps in to the event stream and shows you what's happening on what screens.",
        "template" : "main",
        "triggers" :  [
            {
                "name":"log all events to the EventSpy widget",
                "event":{
                    "name": "*",
                },
                "targets": [{
                    "type": { "widget": "EventSpy" },
                    "action":"screenLog",
                    "parameters": {
                        "event": {
                            "input" : "event"
                        },
                    }
                }]
            }
        ],
		filters : [
			{
				"exclude": {
					"event:detail:properties:data:0":{
						"oneOf":[248, 254]
					}
				}
			}
		],

		initializeWidget : function(params){
			area = jQuery('#' + params.areaId);
		},

        screenLog : function(msg){
            var ev = msg.event;
            var msgEl = area.find('.messages');

			if(applyFilters(ev)){
	            msgEl.append('<div class="message">' + ev.screenId + ':' + ev.event + ':' +
	                    JSON.stringify(ev.detail ? ev.detail.properties : ev) + '</div>');
	            msgEl.scrollTop(msgEl.scrollTop() + msgEl.find('.message:last').position().top);
			}
        }
    };
});
