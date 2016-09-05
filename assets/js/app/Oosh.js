define('Oosh', ['EventEmitterFactory', 'WidgetFactory', 'ProjectManager',
'ModalManager', 'OoshJsonEditor', 'Preferences', 'AreaManager', 'FileManager'],
function(eventEmitterFactory, widgetFactory, projectManager,
    modalManager, jsonEditor, preferences, areaManager, fileManager){

    return {
        preferences : preferences,
        modalManager : modalManager,
        projectManager : projectManager,
        areaManager : areaManager,
		fileManager : fileManager,
        //eventEmitterFactory : eventEmitterFactory,
        //widgetFactory : widgetFactory,

        showModal : function(dlgName, data){
            modalManager.showModal(dlgName, data);
        },

        show : function(dlgName, data){
            modalManager.show(dlgName, data);
        },

        dismissModal : function(dlgName){
            modalManager.dismissModal(dlgName);
        },

        getEmitters : function(){
            return eventEmitterFactory.getEmitters();
        },

        getWidgetConfigurations : function(){
            return widgetFactory.getWidgetConfigurations();
        },

        broadcast : function(msg){
            projectManager.broadcast(msg);
        },

        loadEmitters : function(emitterConfs, readyCallback){
            emitterConfs.forEach(function(conf){
                eventEmitterFactory.addEmitterConfiguration(conf);
            });

            eventEmitterFactory.ready(readyCallback);
        },

        loadWidgets : function(widgetConfs, readyCallback){
            widgetConfs.forEach(function(conf){
                widgetFactory.addWidgetConfiguration(conf);
            });
            readyCallback(widgetConfs);
        },

        openProject : function(projectPath, loadedCallback){
			var prefs = preferences.get();

            if(!prefs.screenId){
                modalManager.showModal('screen-info', {
                    preferences : prefs
                });
                return false;
            }

			var pwd = prefs.defaultProjectPassword || prompt('Enter the project password');
            if(!pwd){
                alert('No password, no project!');
                return false;
            }
			
            projectManager.open({
                path : projectPath,
                screenId : prefs.screenId,
                password : pwd,
                callback : loadedCallback
            });
        }
    };
});
