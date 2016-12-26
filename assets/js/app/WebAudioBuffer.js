define('WebAudioBuffer', [], function(){
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var sourceMap = {};
	var expressions = {
		/* bend : {

		},
		mod : {

		}
		*/
	};
	var currentExpressionValues = {
		bend : 64,
		mod : 0
	};
    var gainMap = {};
	var bufferCache = {};

    // opts = { id, file|url, playbackRate, gain, detune }
    var createBufferSource = function(opts){
		var source = audioContext.createBufferSource();
		var sourceInfo = {
			source : source,
			isPlaying : false,
			baseValues : {}
		};

		var onBufferLoaded = function(buffer){
			source.buffer = buffer;
			var gain;
			sourceMap[opts.id] = sourceInfo;
			if(opts.detune) source.detune.value = opts.detune; // value in cents
			if(opts.playbackRate) source.playbackRate.value = opts.playbackRate;
			if(opts.gain){
				// automatically create a gain for it if gain is set
				gain = createGain({
					id : opts.id + 'Gain',
					gain : opts.gain
				});
				source.connect(gain);
			}
			sourceInfo.baseValues = {
				detune : source.detune.value,
				playbackRate : source.playbackRate.value,
				gain : gain.gain.value
			};

			source.addEventListener('ended', function(ev){
				sourceInfo.isPlaying = false;
			});

			// if there are expressions to apply (bend, mod), apply them now
			applyExpressionsToSource(sourceInfo);
		};

		if(opts.file){
			loadBufferFromFile(opts.file, onBufferLoaded);
		}
		else if(opts.url){
			loadBufferFromUrl(opts.url, onBufferLoaded);
		}
        return sourceInfo;
    };

	/* Modifies the *base* values, i.e. expressions are applied after */
    // opts = { id, playbackRate, gain, detune }
    var change = function(opts){
		var sourceWrapper = sourceMap[opts.id];
        var source = sourceWrapper.source;
		setBaseValues(opts);
        if(opts.detune) source.detune.value = opts.detune; // value in cents
        if(opts.playbackRate) source.playbackRate.value = opts.playbackRate;
        if(opts.gain){
            // if gain was specified, then use the implicitly created gain
            getGain(opts.id + 'Gain').gain.value = opts.gain;
        }

		sourceInfo = applyExpressionsToSource(sourceInfo);
        return sourceInfo;
    };

	var setBaseValues = function(opts){
		var bvs = sourceMap[opts.id].baseValues;
		['detune','playbackRate','gain'].forEach(function(attrName){
			if(opts.hasOwnProperty(attrName)){
				bvs[attrName] = opts[attrName];
			}
		});
	};


	/* apply bend, mod, etc. expressions to a source */
	var applyExpressionsToSource = function(srcInfo){
		//console.log('applyExpressionsToSource: ' + JSON.stringify(expressions));
		for(var expressionType in expressions){ // bend, mod, ...
			if(expressions.hasOwnProperty(expressionType)){
				var expr = expressions[expressionType];
				var context = {
					event : {
						detail : {
							properties : {
								data : { "2" : currentExpressionValues[expressionType] }
							}
						}
					}
				};
				applyExpressionToSource(srcInfo, expr, context);
			}
		}
        return srcInfo;
	};

	/* called when an expression controller event is fired */
	var setExpression = function(opts, context){
		expressions[opts.expressionType] = opts.params;
		currentExpressionValues[opts.expressionType] = context.expressionValue;
		for(var ndx in sourceMap){
			if(sourceMap.hasOwnProperty(ndx) && sourceMap[ndx].isPlaying){
				var sourceInfo = sourceMap[ndx];
				applyExpressionToSource(sourceInfo, opts.params, context);
			}
		}
	};

	/* applies one type of expression to a source.
	an expression is a continual transformation, triggered by e.g. pitch bend or mod wheel
	movement, and applied to a source. State is tracked separately from the source because they can be
	triggered before a source is created. */
	var applyExpressionToSource = function(sourceInfo, trxfm, context){
		var transform = JSON.parse(JSON.stringify(trxfm));
		var transformer = require('Transformer');
		var source = sourceInfo.source;
		if(!source){
			return false;
		}

		var transformResult = {};
		for(var paramName in transform){
			if(transform.hasOwnProperty(paramName) && transform[paramName]){
				var param = transform[paramName];
				var finalVal = false;
				if(param.transform){
					if(!param.input){
						param.input = sourceInfo.baseValues[paramName];
					}
					finalVal = transformer.transformValue(param, context);
				}
				else {
					finalVal = param;
				}
				transformResult[paramName] = finalVal;
			}
		}

		if(transformResult.detune) source.detune.value = transformResult.detune; // value in cents
		if(transformResult.playbackRate) source.playbackRate.value = transformResult.playbackRate;
		if(transformResult.gain){
			// if gain was specified, then use the implicitly created gain
			getGain(transform.id + 'Gain').gain.value = transformResult.gain;
		}
	};

	var removeExpression = function(opts){
		delete expressions[opts.expressionType];
	};

    // opts: { id, gain }
    var createGain = function(opts){
        var gain = audioContext.createGain();
        gain.gain.value = opts.gain;
        gainMap[opts.id] = gain;
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
			url = '/file/get/' + projectManager.getProject().path + '/' + url;
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
        play : function(opts){
            // opts = { id, freq, gain, detune }
            var sourceInfo = createBufferSource(opts);
			sourceInfo.source.start(0);
			sourceInfo.isPlaying = true;
        },

        stop : function(opts){
            var gain = getGain(opts.id + 'Gain');
            if(gain){
				gain.gain.value = 0;
				sourceMap[opts.id].isPlaying = false;
			}
        },

        change : change,
		setExpression : setExpression,
		removeExpression : removeExpression,
		applyExpressionsToSource : applyExpressionsToSource,
		getGain : getGain,
		getBufferSource : getBufferSource,

		getAllBufferSources : function(){
			var all = [];
			for(var id in sourceMap){
				all.push(sourceMap[id]);
			}
			return all;
		},

		getBufferSourceMap : function(){
			return sourceMap;
		}
    };
});
