define('WebAudioBuffer', [], function(){
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var sourceMap = {};
    var gainMap = {};
	var bufferCache = {};

    // cfg = { id, file|url, playbackRate, gain, detune }
    var createBufferSource = function(cfg){
		var source = audioContext.createBufferSource();
		var onBufferLoaded = function(buffer){
			source.buffer = buffer;
			sourceMap[cfg.id] = source;
			if(cfg.detune) source.detune.value = cfg.detune; // value in cents
			if(cfg.playbackRate) source.playbackRate.value = cfg.playbackRate;
			if(cfg.gain){
				// automatically create a gain for it if gain is set
				var gain = createGain({
					id : cfg.id + 'Gain',
					gain : cfg.gain
				});
				source.connect(gain);
			}
		};

		if(cfg.file){
			loadBufferFromFile(cfg.file, onBufferLoaded);
		}
		else if(cfg.url){
			loadBufferFromUrl(cfg._context.area.id + '/' + cfg.url, onBufferLoaded);
		}
        return source;
    };

    // cfg = { id, playbackRate, gain, detune }
    var change = function(cfg){
        var source = sourceMap[cfg.id];
        if(cfg.detune) source.detune.value = cfg.detune; // value in cents
        if(cfg.playbackRate) source.playbackRate.value = cfg.playbackRate;
        if(cfg.gain){
            // if gain was specified, then use the implicitly created gain
            getGain(cfg.id + 'Gain').gain.value = cfg.gain;
        }
        return source;
    };

    // cfg: { id, gain }
    var createGain = function(cfg){
        var gain = audioContext.createGain();
        gain.gain.value = cfg.gain;
        gainMap[cfg.id] = gain;
        gain.connect(audioContext.destination);
        return gain;
    };

    var getBufferSource = function(id){
        var found = sourceMap.hasOwnProperty(id) ? sourceMap[id] : false;
        return found;
    };

    var getGain = function(gainId){
        var found = gainMap.hasOwnProperty(gainId) ? gainMap[gainId] : false;
        return found;
    };

	var loadBufferFromFile = function(filename, cb){
		var audioBuffer = bufferCache[filename];
		if(audioBuffer){
			return cb(audioBuffer);
		}
		var reader = new FileReader();
		reader.onload = function(ev){
			var audioData = ev.target.result;
			audioContext.decodeAudioData(audioData)
			.then(function(decodedData) {
				audioBuffer = decodedData;
				bufferCache[filename] = audioBuffer;
				cb(audioBuffer);
			});
		};
		reader.readAsArrayBuffer(filename);
	};

	var loadBufferFromUrl = function(url, cb){
		var projectManager = require('ProjectManager');
		if(url.indexOf('http') !== 0){
			url = '/file/get/' + projectManager.getProject().path +
					'/' + projectManager.getScreenId() + '/' + url;
		}
		var audioBuffer = bufferCache[url];
		if(audioBuffer){
			return cb(audioBuffer);
		}
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			var audioData = request.response;
			audioContext.decodeAudioData(audioData)
			.then(function(decodedData) {
				audioBuffer = decodedData;
				bufferCache[url] = audioBuffer;
				cb(audioBuffer);
			});
		};
		request.send();
	};

    var deleteBufferSource = function(id){
        delete sourceMap[id];
        delete gainMap[id + 'Gain'];
    };

    var deleteGain = function(id){
        delete gainMap[id];
    };

    return {
		loadSample : function(cfg){
			createBufferSource(cfg);
		},

        play : function(cfg){
            // cfg = { id, freq, gain, detune }
            var source = createBufferSource(cfg);
			source.start(0);
        },

        stop : function(cfg){
			//console.log('WebAudioBuffer.stop: ');
			//console.dir(cfg);
            var gain = getGain(cfg.id + 'Gain');
            if(gain){
				gain.gain.value = 0;
			}
        },

        change : change
    };
});
