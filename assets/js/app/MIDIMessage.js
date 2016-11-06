define('MIDIMessage', [], function(){
    var midiAccess = false;
	var Constants = {
		NoteOn : { "between" : [ 144,159 ]},
		ActiveSensing : 254,
		TimingClock : 248
	};

    var onMIDIInit = function(midi){
        midiAccess = midi;
        console.log('onMIDIInit: MIDI access inititialized');
        midiAccess.outputs.forEach(function(output){
            console.dir(output);
        });
    };
    var onMIDIReject = function(err){
        console.error('Could not get access to MIDI: ');
        console.dir(err);
    };

    if(navigator.requestMIDIAccess){
        navigator.requestMIDIAccess().then(onMIDIInit, onMIDIReject);
    }
    else{
        console.error('Could not initialize MIDI');
    }

    return {
        send : function(cfg){
            // cfg : { port, status, data1, data2 }
            var output = midiAccess.outputs.get(cfg.port);
            output.send([ cfg.status, cfg.data1, cfg.data2 ]);
        },

		Constants : Constants
    };
});
