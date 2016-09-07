define(function(){
	var isLearnMode = false, isPlayMode = false;
	var areaId = null;
	var area = null;
	var toggleLearnButton = null, togglePlayButton = null;
	var events = [];

	var addTimeDiffs = function(){
		for(var i=0; i<events.length - 1; i++){
			var event = events[i];
			var nextEvent = events[i + 1];
			event.ttl = nextEvent.timestamp - event.timestamp;
		}
	};

	var saveEvents = function(){
		var pm = require('ProjectManager');
		var areaConf = pm.findScreenArea(pm.getLocalScreen(), areaId);
		areaConf.widget.configuration.events = events;
		pm.updateScreenArea(areaConf);
	};

	var setNextEvent = function(ndx){
		if(ndx >= events.length - 1 || !isPlayMode){
			publicMethods.stopPlaying();
			return false;
		}
		var ev = events[ndx];
		var nextEv = events[ndx + 1];

		setTimeout(function(){
			Oosh.broadcast(nextEv.event);
			setNextEvent(ndx + 1);
		}, ev.ttl);
	};

    var publicMethods = {
        "id" : "Learner",
        "name" : "Learner",
        "description" : "Captures events for input to another widget (e.g., to replay at a later time).",
        "template" : "main",
        "triggers" : [
            {
                "name":"FiredEvent",
                "event":{
                    "name": "*",
                },
                "targets": [{
                    "type": { "widget": "Learner" },
                    "action":"add",
                    "parameters": {
                        "event": {
                            "input" : "event"
                        },
                    }
                }]
            }
        ],

		toggleLearnMode : function(){
			if(!isLearnMode){
				publicMethods.startLearning();
			}
			else{
				publicMethods.stopLearning();
			}
			return isLearnMode;
		},

		startLearning : function(opts){
			if(isPlayMode){
				return false;
			}
			isLearnMode = true;
			publicMethods.removeAll();
			var ts = (new Date()).getTime();
			events.push({ event : 'start', timestamp : ts });

			toggleLearnButton.text('Stop Learning')
				.removeClass('start-learning')
				.addClass('stop-learning');

			return true;
		},

		stopLearning : function(){
			if(!isLearnMode){
				return false;
			}
			isLearnMode = false;
			var ts = (new Date()).getTime();
			events.push({ event : 'stop', timestamp : ts });

			addTimeDiffs();
			saveEvents();

			toggleLearnButton.text('Start Learning')
				.removeClass('stop-learning')
				.addClass('start-learning');

			console.dir(events);
			return true;
		},

        add : function(msg){
			if(!isLearnMode){
				return;
			}
            var ev = msg.event;
            var msgEl = area.find('.messages');
            msgEl.append('<div class="message">' + ev.screenId + ':' + ev.event + ':' +
                    JSON.stringify(ev.detail ? ev.detail.properties : ev) + '</div>');
            msgEl.scrollTop(msgEl.scrollTop() + msgEl.find('.message:last').position().top);

			var ts = (new Date()).getTime();
			events.push({ event : ev, timestamp : ts });
        },

		removeAll : function(){
			events = [];
		},

		togglePlayMode : function(){
			if(!isPlayMode){
				publicMethods.startPlaying();
			}
			else{
				publicMethods.stopPlaying();
			}
			return isPlayMode;
		},

		startPlaying : function(){
			if(isLearnMode){
				return false;
			}
			isPlayMode = true;

			togglePlayButton.text('Stop Playing')
				.removeClass('start-playing')
				.addClass('stop-playing');

			// includes initial silence:
			//setNextEvent(0);

			// starts with first note:
			Oosh.broadcast(events[1].event);
			setNextEvent(1);
		},

		stopPlaying : function(){
			isPlayMode = false;

			togglePlayButton.text('Start Playing')
				.removeClass('stop-playing')
				.addClass('start-playing');
		},

        initializeWidget : function(params){
			var pm = require('ProjectManager');
			areaId = params.areaId;
			var areaConf = pm.findScreenArea(pm.getLocalScreen(), areaId);
			if(areaConf.widget.configuration.events){
				events = areaConf.widget.configuration.events;
			}

			area = jQuery('#' + params.areaId);
			toggleLearnButton = area.find('button.toggle-learn-mode');
			togglePlayButton = area.find('button.toggle-play-mode');

			toggleLearnButton.on('click', publicMethods.toggleLearnMode);
			togglePlayButton.on('click', publicMethods.togglePlayMode);
		}
    };
	return publicMethods;
});
