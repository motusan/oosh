define(['ValueFilter', 'MIDIMessage'], function(valueFilter, midiMessage){
	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	var source = null;
	var noteOnMap = {};

	var onDragOver = function(ev){
		var areaId = jQuery(this).attr('id');
		var cell = jQuery(ev.target);
		var cls = cell.attr('class');
		var parts = cls.split('-');
		if(parts.length != 2){
			return false;
		}
		var note = parts[1]; // must be note-
		var params = {
			areaId : areaId,
			midiNote : note
		};
		drawCellOverlay(params);
		setTimeout(function(){
			removeCellOverlay(params);
		}, 1000);

		ev.preventDefault();
		ev.stopPropagation();
	};

	var drawCellOverlay = function(params){
		// params = { areaId, midiNote }
		var area = jQuery('#' + params.areaId);
		var cell = area.find('.note-' + params.midiNote);
		var label = jQuery('<div class="cell-label" id="cell-lbl-' + params.midiNote + '"><a href="#">' + params.midiNote + '</a></div>');
		label.css({
			position: 'absolute',
			left: cell.offset().left + 'px',
			top: cell.offset().top + 'px',
			width: cell.width() + 'px',
			height: cell.height() + 'px'
		});
		jQuery('body').append(label);
        cell.addClass('note-on');

		// for percussion hits, it disappears too quick, so force it show on screen for 1 sec
		setTimeout(function(){
			if(!cell.hasClass('note-on')){
				jQuery('body').append(label);
	            cell.addClass('note-on');
				setTimeout(function(){
					removeCellOverlay(params);
				}, 1000);
			}
		}, 25);

	};

	var removeCellOverlay = function(params){
		// params = { areaId, midiNote }
		var area = jQuery('#' + params.areaId);
		var cell = area.find('.note-' + params.midiNote);
		jQuery('#cell-lbl-' + params.midiNote).remove();
		cell.removeClass('note-on');
	};

    return {
        "id" : "SimpleSampleMap",
        "name" : "SimpleSampleMap",
        "description" : "Drop audio samples on grid cells (corresponding to MIDI note-on messages.) Click cells to modify sample settings.",
        "template" : "main",
        "triggers" : [
            {
                "name":"oosh.midimessage => widgetAction.onMidiNoteOn",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        ":detail:properties:data[0]" : midiMessage.Constants.NoteOn,
                        ":detail:properties:data[1]" : { "lessThan" : 128 },
                        ":detail:properties:data[2]" : { "not" : 0 }
                    }
                },
                "targets": [
					{
						"type": { "widget": "SimpleSampleMap" },
						"action":"onMidiNoteOn",
						"parameters": {
							"midiNote" : { "input" : ":event:detail:properties:data[1]" },
							"rcvdTime" : { "input" : ":event:detail:properties:receivedTime" },
							"screenId": { "input" : ":screenId" },
							"areaId": { "input" : ":area:id" }
						}
					}
				]
			},
            {
                "name":"oosh.midimessage => widgetAction.onMidiNoteOff1",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        ":detail:properties:data[0]" : 128,
                        ":detail:properties:data[1]" : { "lessThan" : 128 },
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
	                            "input" : ":event:detail:properties:data[1]",
								"transform": [
									{"prefix": "WebAudioBuffer-"}
								]
	                        }
						}
	                },
	                {
	                    "type": { "widget": "SimpleSampleMap" },
	                    "action":"onMidiNoteOff",
	                    "parameters": {
	                        "midiNote" : { "input" : ":event:detail:properties:data[1]" },
							"rcvdTime" : { "input" : ":event:detail:properties:receivedTime" },
	                        "screenId": { "input" : ":screenId" },
	                        "areaId": { "input" : ":area:id" }
	                    }
	                }
				]
			},
            {
                "name":"oosh.midimessage => widgetAction.onMidiNoteOff2",
                "event":{
                    "name": "oosh.midimessage",
                    "properties":{
                        ":detail:properties:data[1]" : { "lessThan" : 128 },
                        ":detail:properties:data[2]" : 0,
                    }
                },
                "targets": [
					{
	                    "type": "WebAudioBuffer",
	                    "action":"stop",
						"parameters": {
							"areaId": {
	                            "input" : ":areaId"
	                        },
	                        "id": {
	                            "input" : ":event:detail:properties:data[1]",
								"transform": [
									{"prefix": "WebAudioBuffer-"}
								]
	                        }
						}
	                },
	                {
	                    "type": { "widget": "SimpleSampleMap" },
	                    "action":"onMidiNoteOff",
	                    "parameters": {
	                        "midiNote" : { "input" : ":event:detail:properties:data[1]" },
							"rcvdTime" : { "input" : ":event:detail:properties:receivedTime" },
	                        "screenId": { "input" : ":screenId" },
	                        "areaId": { "input" : ":area:id" }
	                    }
	                }
				]
			}
		],

		onMidiNoteOn : function(params){
			drawCellOverlay(params);
			noteOnMap['note-' + params.midiNote] = params.rcvdTime;
        },

		onMidiNoteOff : function(params){
            var cell = jQuery('#' + params.areaId + ' .note-' + params.midiNote);
			jQuery('#cell-lbl-' + params.midiNote).remove();
            cell.removeClass('note-on');
        },

		onFilesDrop : function(files, areaId, target){
			var simpleSampleMap = require('widgets/SimpleSampleMap/widget');
			var pm = require('ProjectManager');
			var note = false;

			if(target){
				var cls = jQuery(target).attr('class');
				if(!cls){
					var id = jQuery(target).parent().attr('id');
					note = id.split('-')[2];
				}
				else{
					note = cls.split('-')[1];
				}
			}

			var createOnLoadFn = function(file){
				return function(ev){
					//SimpleSampleMap.onAudioDataLoaded(ev.target.result, areaId);
					var areaConf = pm.findScreenArea(pm.getLocalScreen(), areaId);
					var trigger = simpleSampleMap.createTrigger({
						file : file.name,
						note : note
					});
					areaConf.widget.configuration.triggers.push(trigger);
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
			var SimpleSampleMap = require('widgets/SimpleSampleMap/widget');
			var project = pm.getProject();
			var screen = pm.getLocalScreen();
			var areaConf = pm.findScreenArea(screen, areaId);
			if(!areaConf.widget || !areaConf.widget.configuration){
				return false;
			}
			var widgetFiles = areaConf.widget.configuration.files;
			if(widgetFiles){
				var filename = widgetFiles[0].filename;

				jQuery('#' + areaId + ' .uploaded-filename').text(filename);
			}
		},

		drawGrid : function(area){
			var note = 0;
			area.find('.widget').append('<table><tbody></tbody></table>');
			var tbody = area.find('tbody');
			for(var i=0; i<8; i++){
				var row = jQuery('<tr></tr>');
				tbody.append(row);
				for(var j=0; j<16; j++){
					row.append('<td class="note-' + note + '"><a href="#"></a></td>');
					note++;
				}
			}
		},

        initializeWidget : function(params){
			var simpleSampleMap = require('widgets/SimpleSampleMap/widget');
			var fm = require('FileManager');

			//SimpleSampleMap.loadTriggers(params.areaId);

			var area = jQuery('#' + params.areaId);
			simpleSampleMap.drawGrid(area);
			var cells = area.find('table td a, body .cell-label');
			cells.on('dragover', function(ev){
				cells.removeClass('dragover');
				jQuery(this).addClass('dragover');
			});
			cells.on('dragend,dragexit', function(ev){
				cells.removeClass('dragover');
			});

			cells.on('drop', function(ev){
				console.dir('ev: ', ev);
				ev.preventDefault();
				ev.stopPropagation();
				var files = ev.originalEvent.dataTransfer.files;
				simpleSampleMap.onFilesDrop(files, params.areaId, ev.target);
				var jqXHR = area.find('input').fileupload('send', { files : files })
					    .success(function (result, textStatus, jqXHR) {
							simpleSampleMap.addWidgetFiles(files, params.areaId);
						})
					    .error(function (jqXHR, textStatus, errorThrown) {
							console.error(errorThrown);
						});
			});
			area.on('dragover', onDragOver);

			area.on('dragexit', function(ev){
				cells.removeClass('dragover');
			});

			area.on('dragend', function(ev){
				ev.dataTransfer.clearData();
			});

			fm.add({
				areaId : params.areaId,
				parent : area.find('.simplesamplemap'),
				onFileChange : function(ev, data){
					simpleSampleMap.addWidgetFiles(data.files, params.areaId);
					simpleSampleMap.onFilesDrop(data.files, params.areaId, ev.delegatedEvent.target);
				}
			});

			simpleSampleMap.loadWidgetFiles(params.areaId);
        },


		createTrigger : function(opts){
			var note = opts.note;
			var file = opts.file;
			var playbackRate = opts.playbackRate || 0.063;
			var detune = opts.detune || 100.0;

			var trigger = {
				"name":"oosh.midimessage." + note + " => ",
				"event":{
					"name": "oosh.midimessage",
					"properties":{
						":detail:properties:data[0]" : midiMessage.Constants.NoteOn,
						":detail:properties:data[1]" : note,
						":detail:properties:data[2]" : { "not" : "0" }
					}
				},
				"targets": [
				{
	                "type": "WebAudioBuffer",
	                "action":"play",
	                "parameters": {
	                    "url" : file,
						"areaId": {
	                        "input" : ":areaId"
	                    },
	                    "id": {
	                        "input" : ":event:detail:properties:data[1]",
							"transform": [
								{"prefix": "WebAudioBuffer-"}
							]
	                    },
	                    "gain" : {
	                        "input" : ":event:detail:properties:data[2]",
	                        "transform":[ {"divide" : 127} ]
	                    }
	                }
				}]
			};

			return trigger;
		}
	};
});
