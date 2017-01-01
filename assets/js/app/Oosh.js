define('Oosh', ['EventEmitterFactory', 'WidgetFactory', 'ProjectManager',
'ModalManager', 'OoshJsonEditor', 'Preferences', 'AreaManager', 'FileManager'],
function(eventEmitterFactory, widgetFactory, projectManager,
    modalManager, jsonEditor, preferences, areaManager, fileManager){

	var doScreenIdCheck = function(){
		var prefs = preferences.get();

        if(!prefs.screenId){
            modalManager.showModal('screen-info', {
                preferences : prefs
            });
            return false;
        }
	};

    return {
        preferences : preferences,
        modalManager : modalManager,
        projectManager : projectManager,
        areaManager : areaManager,
		fileManager : fileManager,
        //eventEmitterFactory : eventEmitterFactory,
        //widgetFactory : widgetFactory,

        showGeneric : function(opts){
            return modalManager.showGeneric(opts);
        },

        showModal : function(dlgName, data){
            return modalManager.showModal(dlgName, data);
        },

        show : function(dlgName, data){
            return modalManager.show(dlgName, data);
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

		createProject : function(opts, loadedCallback){
			var prefs = preferences.get();
			opts.screenId = prefs.screenId;
			doScreenIdCheck();

			projectManager.create(opts);
		},

        openProject : function(projectPath, loadedCallback){
			var prefs = preferences.get();
			doScreenIdCheck();

			var pwd = projectPath == prefs.defaultProjectPath ?
					prefs.defaultProjectPassword : prompt('Enter the project password');
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
        },

		getProject : function(){
			return projectManager.getProject();
		}
    };
});
