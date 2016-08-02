define('WidgetFactory', ['require', 'ValueResolver'], function(require, valueResolver){
    var widgetConfigurations = [];
    var getWidgetConfiguration = function(widgetId){
        var widgetConf = widgetConfigurations.find(function(test){
            return test.id == widgetId;
        });
        return widgetConf;
    };

    var getWidgetConfigurations = function(){
            return widgetConfigurations;
    };

    return {
        getWidgetConfigurations : getWidgetConfigurations,
        getWidgetConfiguration : getWidgetConfiguration,

        addWidgetConfiguration : function(widgetConf){
            widgetConfigurations.push(widgetConf);
        },

        renderWidget : function(area){
            var widgetId = area.widget.id;
            var parentElementSelector = '#' + area.id;
            var widgetPath = '/js/app/widgets/' + widgetId;

            var widgetConf = getWidgetConfiguration(widgetId);
            if(!widgetConf){
                console.error('Unknown widget ID: ' + widgetId);
                return;
            }

            var callInitFn = function(){
                var widget = require('widgets/' + widgetConf.id + '/widget');
                var initFn = widget.initializeWidget;
                if(typeof initFn == 'function')
                initFn({
                    areaId : area.id
                });
            };

            // load the template (default is main.js) into the parent
            if(widgetConf.template){
                var parent = jQuery(parentElementSelector);
                jQuery.get(widgetPath + '/' + widgetConf.template + '.html')
                .fail(function(xhr, status, err){
                    console.error(err);
                })
                .done(function(html){
                    parent.find('widget').remove();
                    parent.prepend(html);
                    callInitFn();
                });
            }
            else{
                callInitFn();
            }
        }
    };
});
