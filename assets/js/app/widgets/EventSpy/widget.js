define(function(){
	var area = null;

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

		initializeWidget : function(params){
			area = jQuery('#' + params.areaId);
		},

        screenLog : function(msg){
            var ev = msg.event;
            var msgEl = area.find('.messages');
            msgEl.append('<div class="message">' + ev.screenId + ':' + ev.event + ':' +
                    JSON.stringify(ev.detail ? ev.detail.properties : ev) + '</div>');
            msgEl.scrollTop(msgEl.scrollTop() + msgEl.find('.message:last').position().top);
        }
    };
});
