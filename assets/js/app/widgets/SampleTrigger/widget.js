define(['ValueFilter'], function(valueFilter){
	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	var source = null;

    return {
		"areaSampleTriggerMap" : {}, /* areaId -> {
			triggerMidiMessages : [],
			triggerKeyCodes : [],
			audioBuffer : <audioBuffer>
		}
		*/
        "id" : "SampleTrigger",
        "name" : "SampleTrigger",
        "description" : "Drop audio samples on the area and trigger them via mouse, keyboard, or MIDI message",
        "template" : "main",
        "triggers" : [
			{
                "name":"oosh.midimessage => sample.start",
                "event":{
                    "name": "oosh.midimessage"
                },
	            "targets": [
					{
		                "type": { "widget": "SampleTrigger" },
		                "action":"onMidiMessage",
		                "parameters": {
							"data1" : { "input" : "event:detail:properties:data[0]" },
							"data2" : { "input" : "event:detail:properties:data[1]" },
							"data3" : { "input" : "event:detail:properties:data[2]" },
		                    "screenId": { "input" : "screenId" },
		                    "areaId": { "input" : "area:id" }
		                }
		            }
				]
	        },
            {
	            "name":"oosh.keydown => sample.start",
	            "event":{
	                "name": "oosh.keydown"
	            },
	            "targets": [
					{
		                "type": { "widget": "SampleTrigger" },
		                "action":"onKeyDown",
		                "parameters": {
							"code" : { "input" : "event:detail:properties:code" },
		                    "screenId": { "input" : "screenId" },
		                    "areaId": { "input" : "area:id" }
		                }
		            }
				]
	        },
	        {
	            "name":"oosh.keyup => sample.stop",
	            "event":{
	                "name": "oosh.keyup"
	            },
	            "targets": [
					{
		                "type": { "widget": "SampleTrigger" },
		                "action":"onKeyUp",
		                "parameters": {
							"code" : "event:detail:properties:code",
		                    "screenId": { "input" : "screenId" },
		                    "areaId": { "input" : "area:id" }
		                }
		            }
				]
	        }
		],

        onMidiMessage : function(params){
			console.dir(params);
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var info = sampleTrigger.areaSampleTriggerMap[params.areaId];
			if(!info){
				return;
			}

			var matches = info.triggerMidiMessages.filter(function(item){
				return valueFilter.test(item.filter, params);
			});

			if(matches.length > 0){
				matches.forEach(function(match){

					var action = match.action;
					if(action == 'play'){
						info.source = sampleTrigger.playBuffer(info.audioBuffer, match.playbackRate);
						sampleTrigger.areaSampleTriggerMap[params.areaId] = info;
					}
					else if(action == 'stop'){
						info.source.stop(0);
					}
					else if(action == 'transform'){
						var trxTargets = match.targets;
						trxTargets.forEach(function(trxTarget){
							var targetName = trxTarget.name;
							if(name=='source'){
								var source = info.source;
								/*
								{
									"filters": [],
									"action": "...",
									"targets": [{
										"object": "source",
										"property": "playbackRate",
										"transforms": [{
											"input" : "event:detail:properties:data[1]",
											"transform": [
												{"prefix": "osc2"}
											]
										}]
									}]
								}
								*/
							}
						});
					}
				});
			}
        },

        onKeyDown : function(params){
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var info = sampleTrigger.areaSampleTriggerMap[params.areaId];
			if(!info){
				return;
			}
			var found = info.triggerKeyCodes.find(function(test){
				return test == params.code;
			});

			if(found){
				var source = sampleTrigger.playBuffer(info.audioBuffer);
				info.source = source;
			}
        },

        onKeyUp : function(params){
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var info = sampleTrigger.areaSampleTriggerMap[params.areaId];
			if(!info){
				return;
			}
			var found = info.triggerKeyCodes.find(function(test){
				return test == params.code;
			});

			if(found){
				info.source.stop(0);
			}
        },

		onAudioDataLoaded : function(audioData, areaId){
			audioContext.decodeAudioData(audioData)
			.then(function(decodedData) {
				var sampleTrigger = require('widgets/SampleTrigger/widget');
				var info = sampleTrigger.areaSampleTriggerMap[areaId];
				if(!info){
					info = {
						triggerKeyCodes : [],
						triggerMidiMessages : []
					};
				}
				info.audioBuffer = decodedData;
				sampleTrigger.areaSampleTriggerMap[areaId] = info;

				var source;
				var area = jQuery('#' + areaId);
				area.on('mousedown', function(e){
					source = sampleTrigger.playBuffer(info.audioBuffer);
				});
				area.on('mouseup', function(e){
					source.stop(0);
				});
			});
		},

		playBuffer : function(buffer, playbackRate){
			var source = audioContext.createBufferSource();
			var rate = playbackRate ? playbackRate.value : 1;
			source.buffer = buffer;
			source.connect(audioContext.destination);
			source.playbackRate.value = rate;
			source.start(0);
			return source;
		},

		onFilesDrop : function(files, areaId){
			for(var i = 0; i<files.length; i++){
				var file = files[i];
				var reader = new FileReader();
			    reader.onload = function(ev){
					var sampleTrigger = require('widgets/SampleTrigger/widget');
					sampleTrigger.onAudioDataLoaded(ev.target.result, areaId);
				};
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
				var path = project.path + '/' + screen.id + '/' + areaId + '/' + filename;
				fm.getFileAudioData(path, function(data){
					sampleTrigger.onAudioDataLoaded(data, areaId);
					jQuery('#' + areaId + ' .uploaded-filename').text(filename);
				});
			}
		},

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

        initializeWidget : function(params){
			var sampleTrigger = require('widgets/SampleTrigger/widget');
			var fm = require('FileManager');

			sampleTrigger.loadWidgetFiles(params.areaId);
			sampleTrigger.loadTriggers(params.areaId);

			var area = jQuery('#' + params.areaId);
			area.on('drop', function(ev){
				ev.preventDefault();
				ev.stopPropagation();
				var files = ev.originalEvent.dataTransfer.files;
				sampleTrigger.onFilesDrop(files, params.areaId);
				var jqXHR = area.find('input').fileupload('send', { files : files })
					    .success(function (result, textStatus, jqXHR) {
							console.log('upload success: ');
							console.dir(files);
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

			area.find('a.add-key').on('click', function(){
				sampleTrigger.promptForTriggerKeyCodes(this, params);
			});
        },

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
		}
	};
});
