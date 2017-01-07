define(['ValueFilter', 'MIDIMessage', 'ProjectManager'], function(valueFilter, midiMessage, projectManager){
	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	var source = null;
	var noteOnMap = {};

	var findTrigger = function(areaId, nameRegex){
		var area = projectManager.findScreenArea(projectManager.getLocalScreen(), areaId);
		var found = area.widget.configuration.triggers.find(function(trigger){
			return trigger.name.match(nameRegex);
		});
		return found || false;
	};

	var onDragOver = function(ev){
		var areaId = jQuery(this).attr('id');
		var cell = jQuery(ev.target);
		cell.attr('class').split(' ').forEach(function(cls){
			var parts = cls.split('-');
			if(parts[0]=='note' && parts.length===2){
				var note = parts[1]; // must be note-
				var params = {
					areaId : areaId,
					midiNote : note
				};
				drawCellOverlay(params);
				setTimeout(function(){
					removeCellOverlay(params);
				}, 1000);
			}
		});

		ev.preventDefault();
		ev.stopPropagation();
	};

	var onMidiNoteOn = function(params){
		drawCellOverlay(params);
		noteOnMap['note-' + params.midiNote] = params.rcvdTime;
    };

	var onMidiNoteOff = function(params){
        var cell = jQuery('#' + params.areaId + ' .note-' + params.midiNote);
		jQuery('#cell-lbl-' + params.midiNote).remove();
        cell.removeClass('note-on');
    };

	var onFilesDrop = function(files, areaId, target){
		var note = false;
		console.log('onFilesDrop');

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
				var area = projectManager.findScreenArea(projectManager.getLocalScreen(), areaId);
				var trigger = createTriggerTarget({
					file : file.name,
					note : note,
					areaId : areaId
				});
				area.widget.configuration.triggers.push(trigger);
				projectManager.updateScreenArea(area);
			};
		};

		for(var i = 0; i<files.length; i++){
			var file = files[i];
			var reader = new FileReader();
		    reader.onload = createOnLoadFn(file);
		    reader.readAsArrayBuffer(file);
		}
		markTriggerCells(areaId);
	};

	var addWidgetFiles = function(files, areaId){
		var file = files[0];
		var area = projectManager.findScreenArea(projectManager.getLocalScreen(), areaId);
		var areaConf = area.widget.configuration;
		var widgetFiles = areaConf.files;
		if(!widgetFiles){
			areaConf.files = [];
			widgetFiles = areaConf.files;
		}
		widgetFiles.push({
			filename : file.name,
			type : file.type,
			size : file.size
		});
		//projectManager.updateScreenArea(area);
	};

	var loadWidgetFiles = function(areaId){
		var project = projectManager.getProject();
		var screen = projectManager.getLocalScreen();
		var areaConf = projectManager.findScreenArea(screen, areaId);
		if(!areaConf.widget || !areaConf.widget.configuration){
			return false;
		}
		var widgetFiles = areaConf.widget.configuration.files;
		if(widgetFiles){
			var filename = widgetFiles[0].filename;

			jQuery('#' + areaId + ' .uploaded-filename').text(filename);
		}
	};

	var drawGrid = function(area){
		var note = 0;
		var tbody = area.find('.note-table tbody');
		for(var i=0; i<8; i++){
			var row = jQuery('<tr></tr>');
			tbody.append(row);
			for(var j=0; j<16; j++){
				row.append('<td class="note-' + note + ' note"><a href="#"></a></td>');
				note++;
			}
		}
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

	var markTriggerCells = function(areaId){
		var areaConf = projectManager.findScreenArea(projectManager.getLocalScreen(), areaId).widget.configuration;
		areaConf.triggers.forEach(function(trigger){
			if(trigger.name && trigger.name.startsWith('oosh.midimessage.')){
				var targetNdx = trigger.event.properties[':detail:properties:data[1]'];
				var cell = jQuery('td.note-' + targetNdx);
				cell.data('trigger', trigger);
				if(trigger.targets.length > 0){
					cell.addClass('has-target');
				}
			}
		});
	};

	var doTriggerEditorDialog = function(areaId, trigger, cell){
		Oosh.showGeneric({
			//selector : '#' + areaId + ' .trigger-editor',
			template : '/js/app/widgets/SimpleSampleMap/TriggerEditor.html',
			buttons : [{ name : 'ok', label : 'OK'}, { name : 'close', label : 'Close'}],
			ok : function(){
				console.log('ok');
			},
			cancel : function(){
				console.log('cancel');
			}
		})
		.then(function(dlg){
			if(!trigger){
				cell.attr('class').split(' ').forEach(function(cls){
					var parts = cls.split('-');
					if(parts[0]=='note' && parts.length===2){
						trigger = createTriggerTarget({
							note : parts[1],
							file : false,
							areaId : areaId
						});
					}
				});
			}
			dlg.find('.trigger-name').text(trigger.name);
			var list = dlg.find('.target-list table tbody');
			list.empty();
			trigger.targets.forEach(function(target){
				var tr = jQuery('<tr><td><a href="#">' + target.parameters.url +
						'</a><td><td><a href="#" class="remove-target"><i class="fa fa-trash"></i></a></td></tr>');
				list.append(tr);
				var a = tr.find('a.remove-target');
				a.data('target', target);
				a.on('click', function(ev){
					var a = jQuery(this);
					var areaConf = projectManager.findScreenArea(projectManager.getLocalScreen(),
							areaId).widget.configuration;
					var foundNdx = areaConf.triggers.findIndex(function(found){
						return found.name == trigger.name;
					});
					if(foundNdx > -1){
						var foundTrigger = areaConf.triggers[foundNdx];
						var foundNdx2 = foundTrigger.targets.findIndex(function(found){
							return found.parameters.url == target.parameters.url;
						});
						delete foundTrigger.targets[foundNdx2];
						a.parentsUntil('tr').parent().remove();
						markTriggerCells(areaId);
					}
				});
			});
		});
	};

	var createTriggerTarget = function(opts){
		console.log('simpleSampleMap.createTriggerTarget');
		var note = opts.note;
		var file = opts.file;
		var areaId = opts.areaId;
		var playbackRate = opts.playbackRate || 0.063;
		var detune = opts.detune || 100.0;

		var trigger = findTrigger(areaId, new RegExp("oosh\.midimessage\." + note));
		if(!trigger){
			trigger = {
				"name" : "oosh.midimessage." + note,
				"event":{
					"name": "oosh.midimessage",
					"properties":{
						":detail:properties:data[0]" : midiMessage.Constants.NoteOn,
						":detail:properties:data[1]" : note,
						":detail:properties:data[2]" : { "not" : "0" }
					}
				},
				"targets": []
			};
		}

		if(file){
			var target = {
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
			};
			trigger.targets.push(target);
		}

		return trigger;
	};

	// public -------------------------------------------
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
							"rcvdTime" : { "input" : ":event:detail:properties:timeStamp" },
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
							"rcvdTime" : { "input" : ":event:detail:properties:timeStamp" },
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
							"rcvdTime" : { "input" : ":event:detail:properties:timeStamp" },
	                        "screenId": { "input" : ":screenId" },
	                        "areaId": { "input" : ":area:id" }
	                    }
	                }
				]
			}
		],

        initializeWidget : function(params){
			var areaId = params.areaId;
			var cellSelector = '#' + areaId + ' .note-table td';
			var area = jQuery('#' + areaId);
			drawGrid(area);
			var cells = area.find('table td a, body .cell-label');

			cells.on('dragover', function(ev){
				cells.removeClass('dragover');
				jQuery(this).addClass('dragover');
			});
			cells.on('dragend,dragexit', function(ev){
				cells.removeClass('dragover');
			});


			jQuery('body').on('click', cellSelector, function(ev){
				var cell = jQuery(this);
				var trigger = cell.data('trigger');
				doTriggerEditorDialog(areaId, trigger, cell);
			});

			jQuery('body').on('mouseover', cellSelector, function(ev){
				var cell = jQuery(this);
				var trigger = cell.data('trigger');
				if(!trigger){
					return;
				}
				var urls = trigger.targets.map(function(target){
					return !target || !target.parameters ?
							'' : target.parameters.url || '';
				});

				area.find('.sample-url').text(trigger.name + ': ' + urls.join(', '));
			});

			jQuery('body').on('mouseout', cellSelector, function(ev){
				area.find('.sample-url').text('Mouse over a cell to view triggered samples or click a cell to edit');
			});

			cells.on('drop', function(ev){
				ev.preventDefault();
				ev.stopPropagation();
				var files = ev.originalEvent.dataTransfer.files;
				onFilesDrop(files, areaId, ev.target);
				var jqXHR = area.find('input[type="file"]').fileupload('send', { files : files })
					    .success(function (result, textStatus, jqXHR) {
							addWidgetFiles(files, areaId);
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

			require('FileManager').add({
				areaId : areaId,
				parent : area.find('.simplesamplemap'),
				onFileChange : function(ev, data){
					console.log('SimpleSampleMap.initializeWidget -> FileManager.add -> onFileChange');
					addWidgetFiles(data.files, areaId);
					onFilesDrop(data.files, areaId, ev.delegatedEvent.target);
				}
			});

			loadWidgetFiles(areaId);
			markTriggerCells(areaId);
        },

		createTriggerTarget : createTriggerTarget
	};
});
