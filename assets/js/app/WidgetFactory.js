define('WidgetFactory', ['require', 'ValueResolver', '../../js/dependencies/jsoneditor/jsoneditor.min'],
		function(require, valueResolver, JSONEditor){
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

    var renderWidget = function(area){
        var widgetId = area.widget.id;
        var parentElementSelector = '#' + area.id;
        var widgetPath = '/js/app/widgets/' + widgetId;
		var parent = jQuery(parentElementSelector);

        var widgetConf = getWidgetConfiguration(widgetId);
        if(!widgetConf){
            console.error('Unknown widget ID: ' + widgetId);
            return;
        }

        var callInitFn = function(opts){
            var widget = require('widgets/' + widgetConf.id + '/widget');
            var initFn = widget.initializeWidget;
            if(typeof initFn == 'function'){
            	initFn({ areaId : area.id }, opts);
			}
        };

		// remove existing content if any
        parent.find('.widget').remove();

        // load the template (default is main.js) into the parent
        if(widgetConf.template){
            jQuery.get(widgetPath + '/' + widgetConf.template + '.html')
            .fail(function(xhr, status, err){
                console.error(err);
            })
            .done(function(html){
				parent.prepend(html);
                callInitFn();
				renderWidgetToolbar(area);
            });
        }
        else{
            callInitFn();
			renderWidgetToolbar(area);
        }
    };

	var renderWidgetToolbar = function(area){
		var html = '<div class="toolbar"><i class="fa fa-pencil fa-fw edit-widget-config"></i></div></div>';
		var widget = jQuery('#' + area.id + ' .widget');
		widget.prepend(html);
		widget.find('.toolbar .edit-widget-config').on('click', function(){
			renderWidgetConfigurator(area);
		});
	};

	var renderWidgetConfigurator = function(area){
		if(!area.widget){
			console.error('area has no widget to configure');
			return false;
		}

		var jqArea = jQuery('#' + area.id);
		jqArea.find('.widget').hide();

		var opts = {
			mode : 'form', /* form, tree */
		};

		jqArea.append('<div class="widget-conf"/>');
		var container = jqArea.find('.widget-conf');
		container.append('<div class="toolbar"><i class="fa fa-check fa-fw save-widget-config"></i>' +
				'<i class="fa fa-times fa-fw dismiss-widget-config"></i></div></div>');
		var editor = new JSONEditor(container.get(0));

		var widgetCfg = area.widget.configuration;
		editor.set(widgetCfg);

		container.find('.save-widget-config').on('click', function(){
			var pm = require('ProjectManager');
			var updatedConf = editor.get();
			console.dir(updatedConf);
			area.widget.configuration = updatedConf;

			pm.updateScreenArea(area);
			jqArea.find('.widget-conf').remove();
			renderWidget(area);
		});
		container.find('.dismiss-widget-config').on('click', function(){
			jqArea.find('.widget-conf').remove();
			renderWidget(area);
		});
	};

    var publicMembers = {
        getWidgetConfigurations : getWidgetConfigurations,
        getWidgetConfiguration : getWidgetConfiguration,

        addWidgetConfiguration : function(widgetConf){
            widgetConfigurations.push(widgetConf);
        },

		renderWidget : renderWidget
    };
	return publicMembers;
});
