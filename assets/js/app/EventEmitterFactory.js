define('EventEmitterFactory', ['ValueResolver'], function(valueResolver){
    var emitters = [];
    var emitterConfigurations = [];
    var nonProvidedEmitterConfigurations = [];
    var providedEmitterConfigurations = [];

    var ret = {
        addEmitterConfiguration : function(emitterConf){
            emitterConfigurations.push(emitterConf);
        },

        getEmitters : function(){
            return emitters;
        },

        /*
        Parses the emitter configuration in emitters directory, builds the array of event emitters, and
        configures their event listeners.

        There are two kinds of emitters: non-provided and provided.
        Non-provided emitters can be accessed any time through well-known browser window properties, e.g. window.document.
        Provided emitters can only be accessed after specific code is executed. For example, MIDIInput is the
        emitter for MIDI in events (note on/off, etc.). To access a MIDIInput object, first, the
        window.navigator.requestMIDIAccess method must be called. This returns a Promise that holds a MIDIAccess object.
        This object fires statechange (connect/disconnect) events, which receive port (MIDIInput) objects.
        When those objects are received during a connect type statechange, event listeners can be then be added for them.
        (Emitter configurations can use simple filters (eq, neq) to filter events based on their attributes.)

        Also, the MIDIAccess contains an inputs property, which is an Iterable containing MIDIInput objects currently
        connected. These MIDIInput objects are also event emitters, and can be specified in the MIDIAccess
        emitter configuration as containedEmitters.
        */

        ready : function(callback){
            if(emitterConfigurations.length === 0){
                console.error('No event emitters configured! Nothing to do!');
                return callback({ error : 'No event emitters configured'});
            }
            var nonProvidedEmitterConfigurations = emitterConfigurations.filter(function(emConf){
                return !emConf.getVia.runtimeProvidedObject;
            });
            var providedEmitterConfigurations = emitterConfigurations.filter(function(emConf){
                return emConf.getVia.runtimeProvidedObject;
            });

            var addProvidedObjectEventHandler = function(emitter, evConf){
                var evName = typeof evConf == 'string' ? evConf : evConf.name;
                emitter.addEventListener(evName, function(ev){
                    var eventProperties = {};

                    if(!evConf.properties){
                        eventProperties = ev;
                    }
                    else{
                        evConf.properties.forEach(function(propConf){
                            if(typeof propConf == 'string'){
                                eventProperties[propConf] = ev[propConf];
                            }
                        });
                    }
                    broadcastEvent(evConf.alias || evName, emitter, eventProperties);
                });
            };

            var addEventHandler = function(emitter, evConf){
                var evName = typeof evConf == 'string' ? evConf : evConf.name;
                emitter.addEventListener(evName, function(ev){
                    var eventProperties = {};

                    // to work around double event trigger (for once, looks like not my code)
                    if(emitters.find(function(emitter){
                        return emitter == ev.port;
                    })){
                        return false;
                    }

                    if(!evConf.properties){
                        eventProperties = ev;
                    }
                    else{
                        evConf.properties.forEach(function(propConf){
                            if(typeof propConf == 'string'){
                                eventProperties[propConf] = ev[propConf];
                            }
                            else if(typeof propConf == 'object'){
                                var evProp = ev[propConf.name];
                                eventProperties[propConf.name] = evProp;

                                if(propConf.containedItemProperties){
                                    var dest = [];
                                    var container = ev[propConf.name];
									if(!container){
										console.error('Property ' + propConf.name + ' was not found on the event');
									}
									else{
	                                    for(var i=0; i<container.length; i++){
	                                        var item = container[i];
	                                        var it = {};
	                                        propConf.containedItemProperties.forEach(function(pname){
	                                            it[pname] = item[pname];
	                                        });
	                                        dest.push(it);
	                                    }
	                                    eventProperties[propConf.name] = dest;
	                                    //jQuery('.messages').append(JSON.stringify(dest));
									}
                                }

                                if(propConf.isEventEmitter){
                                    var foundEmitterConf = providedEmitterConfigurations.find(function(foundConf){
                                        if(foundConf.emitterObjectName != propConf.emitterObjectName){
                                            return false;
                                        }
                                        if(propConf.filter){
                                            for(var ndx in propConf.filter){
                                                var propFilter = propConf.filter[ndx];
                                                if(propFilter.eq && evProp[ndx] != propFilter.eq){
                                                    return false;
                                                }
                                                else if(propFilter.neq && evProp[ndx] == propFilter.neq){
                                                    return false;
                                                }
                                                // TODO: other filters
                                            }
                                        }
                                        return true;
                                    });

                                    if(foundEmitterConf){
                                        var providedObj = ev[foundEmitterConf.emitterObjectName];
                                        emitters.push(providedObj);
                                        foundEmitterConf.events.forEach(function(evConf2){
                                            addProvidedObjectEventHandler(providedObj, evConf2);
                                        });
                                    }
                                }
                            }
                        });

                    }
                    broadcastEvent(evConf.alias || evName, emitter, eventProperties);
                });
            };

            var addEventHandlers = function(emitter, emitterConf){
                emitterConf.events.forEach(function(evConf){
                    addEventHandler(emitter, evConf);
                });
            };

            var addEmitter = function(emitter, emitterConf){
                addEventHandlers(emitter, emitterConf);
                emitters.push(emitter);
                if(emitters.length == nonProvidedEmitterConfigurations.length){
                    callback(emitters);
                }

                var containedEmitters = emitterConf.containedEmitters;
                if(containedEmitters && containedEmitters.length > 0){
                    containedEmitters.forEach(function(containedEmitterConf){
                        /*
                        "container" : "inputs",
                        "emitterObjectName" : "port"
                        */

                        var obj = valueResolver.resolve(containedEmitterConf.container, emitter);

                        var foundEmitterConf = providedEmitterConfigurations.find(function(foundConf){
                            return foundConf.emitterObjectName == containedEmitterConf.emitterObjectName;
                        });

                        if(foundEmitterConf){
                            var cntEmArray = obj.forEach ? obj : [obj]; // an iterable, as in MIDIAccess.inputs
                            cntEmArray.forEach(function(cntEm){
                                if(containedEmitterConf.filter){
                                    for(var ndx in containedEmitterConf.filter){
                                        var filter = containedEmitterConf.filter[ndx];
                                        if(filter.eq && cntEm[ndx] != filter.eq){
                                            return false;
                                        }
                                        else if(filter.neq && cntEm[ndx] == filter.neq){
                                            return false;
                                        }
                                        // TODO: other filters
                                    }
                                }

                                emitters.push(cntEm);
                                foundEmitterConf.events.forEach(function(evConf3){
                                    addProvidedObjectEventHandler(cntEm, evConf3);
                                });
                            });
                        }
                    });
                }
            };

            var doAfter = function(emitter, afterConf){
                if(!afterConf){
                    return;
                }
                afterConf.forEach(function(afterItem){
                    if(afterItem.member){
                        if(afterItem.memberType == 'method'){
                            var afterFn = emitter[afterItem.member];
                            afterFn.apply(emitter);
                        }
                        else if(afterItem.memberType == 'property'){
                            emitter[afterItem.member] = afterItem.memberValue;
                        }
                    }
                });
            };

            var initializeEmitters = function(emitterConfigurations, completeCallback){
                emitterConfigurations.forEach(function(emConf){
                    var emitterName = emConf.emitterObjectName;
                    var getVia = emConf.getVia;
                    var containedEmitters = emConf.containedEmitters;

                    if(getVia.windowObject){
                        var windowObject = getVia.windowObject;
                        var member = getVia.member;
            /*
                                "member" : "requestMIDIAccess",
                                "memberType" : "method",
                                "returnType" : "promise"|"returnValue"|"callback"
            */

                        var objNames = typeof windowObject == 'object' ? windowObject : [windowObject];

                        objNames.forEach(function(objName){
                            var obj = valueResolver.resolve(objName, window);

                            var emitterGetter = member ? obj[member] : obj;

                            if(emitterGetter){
                                var memType = getVia.memberType;
                                var params = getVia.memberParameters;
                                var retType = getVia.returnType;

                                if(memType=='property'){
                                    addEmitter(emitterGetter, emConf);
                                    doAfter(emitterGetter, getVia.after);
                                }

                                else if(memType=='constructor'){
                                    // TODO: support parameters
                                    var em = new emitterGetter();
                                    addEmitter(em, emConf);
                                    doAfter(em, getVia.after);
                                }

                                else if(memType=='method' || memType=='constructor'){
                                    var returnValue;
                                    if(params){
                                        returnValue = emitterGetter.apply(obj, params);
                                    }
                                    else{
                                        returnValue = emitterGetter.apply(obj);
                                    }

                                    if(retType=='returnValue'){
                                        addEmitter(returnValue, emConf);
                                        doAfter(returnValue, getVia.after);
                                    }
                                    else if(retType=='promise'){
                                        returnValue.then(function(result){
                                            addEmitter(result, emConf);
                                            doAfter(result, getVia.after);
                                        });
                                    }
                                    else if(retType=='callback'){
                                        // TODO
                                    }
                                }
                            }
                        });
                    }
                });
            };

            // iterate over the emitter configurations and initialize them
            initializeEmitters(emitterConfigurations, callback);
        }
    };

    var broadcastEvent = function(eventName, emitter, properties){
        //console.log('broadcastEvent: ' + eventName);
        var event = new CustomEvent('oosh.' + eventName, { 'detail': {
                emitter : emitter,
                properties : properties
            }
        });

        window.dispatchEvent(event);
    };

    return ret;
});
