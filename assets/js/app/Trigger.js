define('Trigger', ['ValueFilter', 'WebAudioOscillator', 'MIDIMessage', 'Transformer', 'ValueResolver'],
        function(valueFilter, webaudioOsc, midimessage, transformer, valueResolver){

    var targetTypes = {
        'WebAudioOscillator' : webaudioOsc,
        'MIDIMessage' : midimessage,
        'Widget' : 'widget'
    };

    var getWidget = function(targetInfo){
        var widget = require('widgets/' + targetInfo.type.widget + '/widget');
        return widget;
    };

    /* opts: { eventInfo, trigger, context } */
    var executeTargetActions = function(opts){
        var eventInfo = opts.eventInfo;
        var trigger = opts.trigger;
        var context = opts.context;
        //var targetInfo = trigger.target;

        trigger.targets.forEach(function(targetInfo){
            executeTargetAction(targetInfo, context, eventInfo);
        });
    };

    var executeTargetAction = function(targetInfo, context, eventInfo){
        var targetTypeName = targetInfo.type.widget ? targetInfo.type.widget : targetInfo.type;
        var target = targetInfo.type.widget ? getWidget(targetInfo) : targetTypes[targetTypeName];
        var actionName = targetInfo.action;
        var actionFn = target[actionName];

        console.log('executeTargetAction: ' + targetTypeName + '.' + actionName);

        if(!actionFn){
            console.error('Invalid target action: ' + actionName);
            return false;
        }
        var paramMap = {};
        context.event = eventInfo;
        for(var paramName in targetInfo.parameters){
            var val = targetInfo.parameters[paramName];
            if(val.input){
                // context : { screenId, area, event }
                finalValue = transformer.transformValue(val, context);
            }
            else{
                finalValue = val;
            }
            paramMap[paramName] = finalValue;
        }
        actionFn(paramMap);
    };

    var passFilter = function(eventInfo, trigger){
        var filterProps = trigger.event.properties;
        if(!filterProps){
            return true;
        }

        var result = valueFilter.test(filterProps, eventInfo);
        return result;
    };

    return {
        process : function(eventInfo, screen){

            // iterates over the areas and sees if the event should trigger something
            screen.areas.forEach(function(area){
                if(area.widget && area.widget.configuration && area.widget.configuration.triggers){
                    var triggers = area.widget.configuration.triggers;
                    triggers.forEach(function(trigger){
                        if(trigger.event.name == eventInfo.event || trigger.event.name == '*'){
                            /* anything that needs to be made available in filters and as values can be
                            injected via context */
                            var context = {
                                screenId : screen.id,
                                area : area
                            };
                            var opts = {
                                eventInfo : eventInfo,
                                trigger : trigger,
                                context : context
                            };

                            if(passFilter(eventInfo, trigger)){
                                executeTargetActions(opts);
                            }
                        }
                    });
                }
            });
        }
    };
});
