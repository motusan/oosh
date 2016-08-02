define('AreaManager', ['WidgetFactory', 'js/dependencies/jquery-ui/jquery-ui.min.js',
        "js/dependencies/jquery.ui.touch-punch/jquery.ui.touch-punch.min.js"],
    function(widgetFactory, jqueryui, jquitp){

        var onDrop = function(area, draggable){
            var widgetConf = draggable.data('widget');
            if(widgetConf){
                require('AreaManager').addAreaWidget(area, widgetConf.id);
                require('ProjectManager').update();
            }
        };

        var onMoveOrResize = function(area, ev, ui){
            var shapeDef = [ui.position.left, ui.position.top,
                        ev.target.clientWidth, ev.target.clientHeight].join(',');
            area.shapeDefinition = shapeDef;
            var pm = require('ProjectManager');
            pm.updateScreenArea(area);
            //pm.update();
        };

        var renderArea = function(area){
            var areaEl = jQuery('<div class="area"/>');
            var shape = area.shapeDefinition.split(',');
            areaEl.attr('id', area.id);
            if(area.draggable){
                areaEl.draggable({
                    stop: function(ev, ui){
                        onMoveOrResize(area, ev, ui);
                    }
                });
            }
            areaEl.css({
                position: 'absolute',
                left: shape[0] + 'px',
                top: shape[1] + 'px',
                width: shape[2] + 'px',
                height: shape[3] + 'px',
            });

            areaEl.css(area.style);
            areaEl.droppable({
                accept: '.widget-conf a',
                activeClass: 'area-drop-active',
                hoverClass: 'area-drop-hover',
                drop: function(event, ui) {
                    var target = jQuery(this);
                    var draggable = ui.draggable;
                    jQuery('.area').css('z-index', 'auto');
                    onDrop(area, draggable);
                }
            });
            jQuery('body').append(areaEl);
            if(area.resizable){
                areaEl.resizable({ stop: function(ev, ui){ onMoveOrResize(area, ev, ui); }
                });
            }
            if(area.widget){
                widgetFactory.renderWidget(area);
            }
        };

        var publicMethods = {
            renderScreenAreas : function(){
                var screen = require('ProjectManager').getLocalScreen();
                screen.areas.forEach(function(area){
                    renderArea(area);
                });
            },

            createScreenArea : function(screen){
                var now = (new Date()).getTime();
                var newArea = {
                        id : 'area' + now,
                        name : 'Area ' + now,
                        shapeType : 'rect',
                        draggable : true,
                        resizable : true,
                        style : {
                            //"border" : "2px dashed #99ee99",
                            "border-radius" : "10px",
                            "padding" : "4px",
                            "background-color" : "#aaa",
                            "cursor" : "pointer",
                            "opacity" : 0.6
                        },
                        shapeDefinition : '50,50,150,150',
                        widget : false
                };
                screen.areas.push(newArea);
                require('ProjectManager').updateScreen(screen);
                renderArea(newArea);
                return newArea;
            },

			/*
            updateScreenArea : function(screen, area){
                var areas = screen.areas;
                for(var i=0; i<areas; i++){
                    var test = areas[i];
                    if(test.id == area.id){
                        screen.areas[i] = area;
                        require('ProjectManager').update();
                        return true;
                    }
                }
                return false;
            },
			*/

            addAreaWidget : function(area, widgetIdOrConf){
                var widgetId = widgetIdOrConf.id || widgetIdOrConf;
                var conf = widgetIdOrConf.id ? widgetIdOrConf : widgetFactory.getWidgetConfiguration(widgetIdOrConf);
                area.widget = {
                    id : widgetId,
                    configuration : conf
                };
                widgetFactory.renderWidget(area);
/*
                var widget = require('js/app/widgets/' + area.widget.name + '/widget');
                var initFn = widget.initializeWidget;
                if(typeof initFn == 'function')
                initFn({
                    areaId : area.id
                });
*/
            }
        };
        return publicMethods;
});
