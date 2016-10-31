define(['ValueFilter'], function(valueFilter){
	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	var source = null;

    return {
        "id" : "SampleTrigger",
        "name" : "SampleTrigger",
        "description" : "Drop audio samples on the area and trigger them via mouse, keyboard, or MIDI message",
        "template" : "main",
        "triggers" : [
            {
                "name":"oosh.midimessage => webaudio.buffer.start",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        "detail:properties:data[0]" : "144",
                        "detail:properties:data[1]" : { "lessThan" : 72 },
                        "detail:properties:data[2]" : { "not" : "0" }
                    }
                },
                "targets": []
			},
            {
                "name":"oosh.midimessage => webaudio.buffer.stop1",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        "detail:properties:data[0]" : "128",
                        "detail:properties:data[1]" : { "lessThan" : 72 },
                    }
                },
                "targets": [
					{
	                    "type": "WebAudioBuffer",
	                    "action":"stop",
						"parameters": {
							"areaId": {
	                            "input" : "areaId"
	                        },
	                        "id": {
	                            "input" : "event:detail:properties:data[1]"
	                        }
						}
	                }
				]
			},
            {
                "name":"oosh.midimessage => webaudio.buffer.stop2",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        "detail:properties:data[2]" : "0",
                        "detail:properties:data[1]" : { "lessThan" : 72 },
                    }
                },
                "targets": [
					{
	                    "type": "WebAudioBuffer",
	                    "action":"stop",
						"parameters": {
							"areaId": {
	                            "input" : "areaId"
	                        },
	                        "id": {
	                            "input" : "event:detail:properties:data[1]"
	                        }
						}
	                }
				]
			}
		],

		onFilesDrop : function(files, areaId){
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var pm = require('ProjectManager');
			
			var createOnLoadFn = function(file){
				return function(ev){
					//sampleTrigger.onAudioDataLoaded(ev.target.result, areaId);
					var areaConf = pm.findScreenArea(pm.getLocalScreen(), areaId);
					var target = sampleTrigger.createTriggerTarget({
						file : file.name
					});
					var triggers = areaConf.widget.configuration.triggers;
					triggers.forEach(function(trigger){
						if(trigger.name == 'oosh.midimessage => webaudio.buffer.start'){
							trigger.targets = [target];
						}
					});
					pm.updateScreenArea(areaConf);
				};
			};

			for(var i = 0; i<files.length; i++){
				var file = files[i];
				var reader = new FileReader();
			    reader.onload = createOnLoadFn(file);
			    reader.readAsArrayBuffer(file);
			}
		},


		addWidgetFiles : function(files, areaId){
			var file = files[0];
			var pm = require('ProjectManager');
			var areaConf = pm.findScreenArea(pm.getLocalScreen(), areaId);
			var widgetFiles = areaConf.widget.configuration.files;
			if(!widgetFiles){
				areaConf.widget.configuration.files = [];
				widgetFiles = areaConf.widget.configuration.files;
			}
			widgetFiles.push({
				filename : file.name,
				type : file.type,
				size : file.size
			});
			pm.updateScreenArea(areaConf);
		},



		loadWidgetFiles : function(areaId){
			var pm = require('ProjectManager'), fm = require('FileManager');
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var project = pm.getProject();
			var screen = pm.getLocalScreen();
			var areaConf = pm.findScreenArea(screen, areaId);
			if(!areaConf.widget || !areaConf.widget.configuration){
				return false;
			}
			var widgetFiles = areaConf.widget.configuration.files;
			if(widgetFiles){
				var filename = widgetFiles[0].filename;
				//var path = project.path + '/' + screen.id + '/' + areaId + '/' + filename;
				//fm.getFileAudioData(path, function(data){
				//	sampleTrigger.onAudioDataLoaded(data, areaId);
					jQuery('#' + areaId + ' .uploaded-filename').text(filename);
				//});
			}
		},

		/*
		setTriggerKeyCodes : function(keyCodes, areaId){
			var pm = require('ProjectManager');
			var areaConf = pm.findScreenArea(pm.getLocalScreen(), areaId);
			if(!areaConf.widget || !areaConf.widget.configuration){
				return false;
			}
			areaConf.widget.configuration.triggerKeyCodes = keyCodes;
			pm.updateScreenArea(areaConf);
		},

		loadTriggers : function(areaId){
			var pm = require('ProjectManager'), fm = require('FileManager');
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var project = pm.getProject();
			var screen = pm.getLocalScreen();
			var areaConf = pm.findScreenArea(screen, areaId);
			if(!areaConf.widget || !areaConf.widget.configuration){
				return false;
			}
			var triggerKeyCodes = areaConf.widget.configuration.triggerKeyCodes;
			var triggerMidiMessages = areaConf.widget.configuration.triggerMidiMessages;

			if(triggerKeyCodes){
				jQuery('#' + areaId).find('a.add-key').text(triggerKeyCodes.join(','));
				var info = sampleTrigger.areaSampleTriggerMap[areaId];
				if(!info){
					info = {
						audioBuffer : false
					};
				}
				info.triggerKeyCodes = triggerKeyCodes;
				info.triggerMidiMessages = triggerMidiMessages;
				sampleTrigger.areaSampleTriggerMap[areaId] = info;
			}
		},
		*/

        initializeWidget : function(params){
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var fm = require('FileManager');

			//sampleTrigger.loadTriggers(params.areaId);

			var area = jQuery('#' + params.areaId);
			area.on('drop', function(ev){
				ev.preventDefault();
				ev.stopPropagation();
				var files = ev.originalEvent.dataTransfer.files;
				sampleTrigger.onFilesDrop(files, params.areaId);
				var jqXHR = area.find('input').fileupload('send', { files : files })
					    .success(function (result, textStatus, jqXHR) {
							sampleTrigger.addWidgetFiles(files, params.areaId);
						})
					    .error(function (jqXHR, textStatus, errorThrown) {
							console.error(errorThrown);
						});
			});
			area.on('dragover', function(ev){
				ev.preventDefault();
				ev.stopPropagation();
			});
			area.on('dragend', function(ev){
				ev.dataTransfer.clearData();
			});

			fm.add({
				areaId : params.areaId,
				parent : area.find('.sampletrigger'),
				onFileChange : function(ev, data){
					sampleTrigger.addWidgetFiles(data.files, params.areaId);
					sampleTrigger.onFilesDrop(data.files, params.areaId);
				}
			});

			sampleTrigger.loadWidgetFiles(params.areaId);

			/*
			area.find('a.add-key').on('click', function(){
				sampleTrigger.promptForTriggerKeyCodes(this, params);
			});
			*/
        },

		/*
		promptForTriggerKeyCodes : function(keyLinkElement, params){
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var link = jQuery(keyLinkElement);
			var info = sampleTrigger.areaSampleTriggerMap[params.areaId];
			if(!info){
				sampleTrigger.areaSampleTriggerMap[params.areaId] = {
					audioBuffer : false,
					triggerKeyCodes : [],
					triggerMidiMessages : []
				};
			}

			var keys = info.triggerKeyCodes.join(',');
			var key = prompt('Enter the key(s) that will trigger the sample.', keys);
			if(!key){
				return false;
			}

			link.text(key);
			var keyArray = key.split(',');
			sampleTrigger.areaSampleTriggerMap[params.areaId].triggerKeyCodes = keyArray;
			sampleTrigger.setTriggerKeyCodes(keyArray, params.areaId);
		},
		*/

		createTriggerTarget : function(opts){
			var defaults = opts.defaults || {};
			var file = opts.file;
			var eventFilters = opts.eventFilters || {
				"detail:properties:data[0]" : "144",
				"detail:properties:data[1]" : { "lessThan" : 72 },
				"detail:properties:data[2]" : { "not" : "0" }
			};
			var playbackRate = opts.playbackRate || 0.063;
			var detune = opts.detune || 100.0;

			var trigger = Object.assign({
                "type": "WebAudioBuffer",
                "action":"play",
                "parameters": {
                    "url" : file,
					"areaId": {
                        "input" : "areaId"
                    },
                    "id": {
                        "input" : "event:detail:properties:data[1]"
                    },
                    "playbackRate" : {
                        "input" : "event:detail:properties:data[1]",
                        "transform":[ {"multiply" : playbackRate } ]
                    },
                    "detune" : {
                        "input" : "event:detail:properties:data[1]",
                        "transform":[ {"multiply" : detune } ]
                    },
                    "gain" : {
                        "input" : "event:detail:properties:data[2]",
                        "transform":[ {"divide" : 127} ]
                    }
                }
			}, defaults);
			return trigger;
		}
	};
});
