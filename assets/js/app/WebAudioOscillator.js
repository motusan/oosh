define('WebAudioOscillator', [], function(){
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var oscillatorMap = {};
    var gainMap = {};
	var isPlayingMap = {};

	var isPlaying = function(id){
		return isPlayingMap[id] && isPlayingMap[id] === true;
	};

	var setPlaying = function(id, oscIsPlaying){
		isPlayingMap[id] = oscIsPlaying;
	};

    // cfg = { id, frequency, gain, detune }
    var createOscillator = function(cfg){
        var oscillator = audioContext.createOscillator();
        oscillator.type = cfg.type;
        oscillatorMap[cfg.id] = oscillator;
        if(cfg.detune) oscillator.detune.value = cfg.detune; // value in cents
        if(cfg.frequency) oscillator.frequency.value = cfg.frequency; // value in hertz
        if(cfg.gain){
            // automatically create a gain for it if gain is set
            var gain = createGain({
                id : cfg.id + 'Gain',
                gain : cfg.gain
            });
            oscillator.connect(gain);
        }
        return oscillator;
    };

    // cfg = { id, frequency, gain, detune }
    var change = function(cfg){
        var oscillator = oscillatorMap[cfg.id];
        if(cfg.detune) oscillator.detune.value = cfg.detune; // value in cents
        if(cfg.frequency) oscillator.frequency.value = cfg.frequency; // value in hertz
        if(cfg.gain){
            // if gain was specified, then use the implicitly created gain
            gainMap[cfg.id + 'Gain'].gain.value = cfg.gain;
        }
        return oscillator;
    };

    // cfg: { id, gain }
    var createGain = function(cfg){
        var gain = audioContext.createGain();
        gain.gain.value = cfg.gain;
        gainMap[cfg.id] = gain;
        gain.connect(audioContext.destination);
        return gain;
    };

    var getOscillator = function(id){
        var found = oscillatorMap.hasOwnProperty(id) ? oscillatorMap[id] : false;
        return found;
    };

    var getGain = function(gainId){
        var found = gainMap.hasOwnProperty(gainId) ? gainMap[gainId] : false;
        return found;
    };

    var deleteOscillator = function(id){
        delete oscillatorMap[id];
        delete gainMap[id + 'Gain'];
    };

    var deleteGain = function(id){
        delete gainMap[id];
    };

    return {
        play : function(cfg){
            // info = { id, freq, gain, detune }
            var oscillator = getOscillator(cfg.id);

            if(!oscillator){
                oscillator = createOscillator(cfg);
                //oscillator.start();
            }
            else{
                oscillator = change(cfg);
            }

			if(!isPlaying(cfg.id)){
				oscillator.start();
				setPlaying(cfg.id, true);
			}

        },

        stop : function(cfg){
            var gain = getGain(cfg.id + 'Gain');
            if(!gain){
                console.error('gain not found');
                return false;
            }
            gain.disconnect(audioContext.destination);
            deleteOscillator(cfg.id);
            deleteGain(cfg.id + 'Gain');
			setPlaying(cfg.id, false);
        },

        change : change
    };
});
