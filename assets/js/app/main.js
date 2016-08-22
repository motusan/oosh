require.config({
    shim : {
        "bootstrap" : { "deps" :['jquery'] },
        "rangeslider" : { "deps" :['jquery'] },
		"fileupload" : { "deps" :['jquery.ui.widget'] }
    },
    paths: {
        "jquery" : "../../js/dependencies/jquery/jquery.min",
		"jqueryui" : "../../js/dependencies/jquery-ui/jquery-ui.min",
        "bootstrap" : "../../js/dependencies/bootstrap/bootstrap.min",
        "rangeslider" : "../../js/dependencies/rangeslider/rangeslider.min",
		"jquery.ui.widget" : "../../js/dependencies/jquery-File-Upload/jquery.ui.widget",
		"fileupload" : "../../js/dependencies/jquery-File-Upload/jquery.fileupload"
    }
});
requirejs([
    'jquery', 'bootstrap', 'Oosh',
    'emitters/MIDIAccess', 'emitters/MIDIMessage', 'emitters/Document', 'emitters/SpeechRecognition',
    'widgets/KeyboardSynth/widget', 'widgets/EventSpy/widget', 'widgets/BasicWave/widget', 'widgets/Controls/widget',
	 'widgets/SampleTrigger/widget'
    ],

    function(jQuery, bootstrap, Oosh,
            midiAccess, midiMessage, doc, speech,
            keyboardSynth, eventSpy, basicWave, controls, sampleTrigger) {

    jQuery(document).ready(function(){
        window.Oosh = Oosh;


        jQuery('.toolbar li a').on('click', function(){
            var a = jQuery(this);
            var dlgName = a.attr('class');
            dlgName = dlgName.substr(0, dlgName.indexOf('-menuitem'));
            if(dlgName == 'add-widget'){
                Oosh.show(dlgName);
            }
            else{
                Oosh.showModal(dlgName);
            }
        });

		var defProject = Oosh.preferences.get().defaultProjectPath;
		if(defProject){
			Oosh.openProject(defProject, function(project){
				if(project.error){
					console.error(project.error);
					return false;
				}
			});
		}
		else{
			Oosh.showModal('project-list');
		}

        // This is where you specify which emitter configurations and which project to load
        var widgetConfs = [basicWave, controls, eventSpy, keyboardSynth, sampleTrigger];
        Oosh.loadWidgets(widgetConfs, function(widgetCfs){
            console.log("Widgets loaded");
            //console.dir(widgetCfs);
        });

        var emitterConfs = [midiAccess, midiMessage, doc, speech];
        Oosh.loadEmitters(emitterConfs, function(emitters){
            console.log("Emitters loaded");
            //console.dir(emitters);

            // To enable more event types, edit the list of events in the
            // corresponding emitter configuration in the emitters folder
            var listenerMap = {
                //'oosh.mousemove' : function(ev){ var det = ev.detail; return [det.properties.x, det.properties.y]; },
                'oosh.click' :      function(ev){ var det = ev.detail; return [det.properties.x, det.properties.y]; },
                'oosh.midimessage' : function(ev){ var det = ev.detail; return [det.emitter.name, det.properties.data.join(', ')]; },
                'oosh.keydown' :    function(ev){ var det = ev.detail; return [det.properties.code, det.properties.keyCode]; },
                'oosh.keyup' :    function(ev){ var det = ev.detail; return [det.properties.code, det.properties.keyCode]; },
                'oosh.drop' :      function(ev){ var det = ev.detail; return [det.properties.dataTransfer, det.properties.clientX, det.properties.clientY]; },
                'oosh.touchcancel' : function(ev){
                    return ['touchcancel!!!!!!!!!'];
                },
                'oosh.touchend' : function(ev){
                    ev.preventDefault();
                    ev.stopPropagation();
                    setTimeout(function(){
                        var det = ev.detail;
                        var touches = det.properties.touches;
                        var msg = '';

                        touches.forEach(function(touch){
                            msg += JSON.stringify(touch) + ' ';
                        });
                    });
                    return [msg];
                },
                /*
                'oosh.touchstart' : function(ev){
                    ev.preventDefault();
                    ev.stopPropagation();
                    setTimeout(function(){
                        var det = ev.detail;
                        var touches = det.properties.changedTouches;
                        var msg = '';

                        touches.forEach(function(touch){
                            msg += JSON.stringify(touch) + ' ';
                        });
                    });
                    return [msg];
                },
                */

                /*
                'oosh.touchmove' : function(ev){
                    ev.preventDefault();
                    ev.stopPropagation();
                    setTimeout(function(){
                        var det = ev.detail;
                        var touches = det.properties.changedTouches;
                        var msg = '';

                        touches.forEach(function(touch){
                            msg += JSON.stringify(touch) + ' ';
                        });
                        return [msg];
                    });
                },
                */

                'oosh.speechresult' : function(ev){
                    var det = ev.detail;
                    var results = det.properties.results;
                    var size = results.length;
                    var transcript = results[size - 1][0].transcript;
                    return transcript;
                },
                'oosh.gesturestart' :      function(ev){ var det = ev.detail; return [det.properties.rotation, det.properties.scale]; },
                'oosh.gesturechange' :      function(ev){ var det = ev.detail; return [det.properties.rotation, det.properties.scale]; },
                'oosh.gestureend' :      function(ev){ var det = ev.detail; return [det.properties.rotation, det.properties.scale]; },

            };

            var doAddListener = function(evName, listener){
                window.addEventListener(evName, function(ev){
                    var str = '';
                    // function must return the string to display
                    str = listener(ev);

                    if(typeof str == 'object'){
                        str = str.join(', ');
                    }

                    // and broadcast it to everyone in the project
                    Oosh.broadcast({
                        event : evName,
                        detail : ev.detail
                    });
                });
            };

            for(var evName in listenerMap){
                var listener = listenerMap[evName];
                doAddListener(evName, listener);
            }
        });
    });
});
