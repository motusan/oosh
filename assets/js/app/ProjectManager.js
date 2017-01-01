define('ProjectManager', ['SocketService', 'Trigger', 'AreaManager', 'OoshJsonEditor',
        'js/dependencies/jquery-ui/jquery-ui.min.js'],
    function(socketService, trigger, areaManager, jsonEditor, jqueryui){
    var screens = [];
    var project = false;
    var screenId = false;

    socketService.onConnect(function(){
        socketService.registerSocketEventHandler(socketService.Events.Connected, onConnected);
        socketService.registerSocketEventHandler(socketService.Events.Broadcast, onBroadcastReceived);
        socketService.registerSocketEventHandler(socketService.Events.ProjectUpdated, onProjectUpdated);
    });

    var onProjectReady = function(opts, data){
        var pm = require('ProjectManager');
        if(data.error){
            console.error(data.error);
            pm.setProject(false);
            return opts.callback(data);
        }
        pm.setProject(data);
        areaManager.renderScreenAreas();
        connect();
        return opts.callback(data);
    };

    var onConnected = function(msg){
        broadcast({
            event : 'ScreenConnected',
            detail : msg
        });
    };

    var onBroadcastReceived = function(msg){
        var pm = require('ProjectManager');
        if(!project){
            return false;
        }
        //console.log('onBroadcastReceived: ' + JSON.stringify(msg));
        var screen = pm.getLocalScreen();
        if(screen){
            trigger.process(msg.data, screen);
        }
        return true;
    };

    var onProjectUpdated = function(updatedProject){
        var pm = require('ProjectManager'), am = require('AreaManager');
        pm.setProject(updatedProject);

		// don't re-render, that should have been done already
		//am.renderScreenAreas();
    };

    var connect = function(){
        socketService.connect(project.path, function(result){
            //console.log('connect');
        });
    };

    var screenLog = function(txt){
        var entry = jQuery('<div>' + txt + '</div>');
        jQuery('.messages').append(entry);
        entry.get(0).scrollIntoView();
    };

    var broadcast = function(msg){
        if(!project){
            return false;
        }
        msg.projectPath = project.path;
        msg.screenId = screenId;
        socketService.broadcast(project.path, msg);
        return true;
    };

    var ret = {
        jsonEditor : jsonEditor,
        broadcast : broadcast,

        create : function(opts){
            jQuery.ajax({
                url : '/project/create/' + encodeURIComponent(opts.path),
                data : {
                    name : opts.name,
                    password : opts.password,
                    screenId : opts.screenId
                },
                type : 'POST',
                method : 'POST'
            })
            .done(function(data){
                onProjectReady(opts, data);
            })
            .fail(function(jqXHR, textStatus, err){
                console.error(err);
            });
        },

        open : function(opts){
            var pm = require('ProjectManager');
            jQuery.ajax({
                //url : '/data/projects/' + projectPath + '.json',
                url : '/project/' + encodeURIComponent(opts.path),
                data : {
                    screenId : opts.screenId,
                    password : opts.password
                },
                type : 'POST',
                method : 'POST'
            })
            .done(function(data){
                pm.setScreenId(data.error ? false : opts.screenId);
                onProjectReady(opts, data);
            })
            .fail(function(jqXHR, textStatus, err){
                console.error(err);
            });
        },

        update : function(changes){
            if(!project){
                console.error('Why no project?');
                return false;
            }

            if(changes){
                if(changes.id && changes.id != project.id ||
                        changes.path && changes.path != project.path){
                    console.error('Cannot change project id or path');
                    return false;
                }
            }
            else{
                changes = project;
            }

            socketService.updateProject(project.path, changes);
        },

        setProject : function(prj){
            project = prj;
            var screen = require('ProjectManager').getLocalScreen();
            jsonEditor.setContent(project);
        },

        getLocalScreen : function(){
            //var proj = require('ProjectManager').getProject();
            if(!project){
                console.error('getLocalScreen: project not found');
                return false;
            }
            var foundScreen = project.screens.find(function(testScreen){
                return testScreen.id == screenId;
            });
            return foundScreen || false;
        },

        getProjectList : function(resultCallback){
            jQuery.ajax({
                url : '/project/list',
                method : 'GET',
                type : 'GET'
            })
            .done(function(resp){
                resultCallback(resp);
            })
            .fail(function(e){
                console.error(e);
            });
        },

        getProject : function(){
            return project;
        },

        getScreenId : function(){
            return screenId;
        },

        setScreenId : function(scrnId){
            screenId = scrnId;
        },

        addScreen : function(screen){
            var pm = require('ProjectManager');
            var found = project.screens.find(function(testScreen){
                return testScreen.id == screen.id;
            });
            if(!found){
                project.screens.push(screen);
                pm.update();
                return true;
            }
            return false;
        },

        updateScreen : function(screen){
            var pm = require('ProjectManager');
            if(project && screenId){
                var foundNdx = project.screens.findIndex(function(testScreen){
                    return testScreen.id == screenId;
                });
                if(foundNdx > -1){
                    project.screens[foundNdx] = screen;
                    pm.update();
                    return true;
                }
            }
            return false;
        },

        updateScreenArea : function(area){
            var pm = require('ProjectManager');
            var screen = pm.getLocalScreen();
            var foundAreaNdx = screen.areas.findIndex(function(testArea){
                return testArea.id == area.id;
            });
            if(foundAreaNdx > -1){
                screen.areas[foundAreaNdx] = area;
                return pm.updateScreen(screen);
            }
            return false;
        },

		findScreenArea : function(screen, areaId){
			var pm = require('ProjectManager');
			if(!areaId && typeof screen == 'string'){
				areaId = screen;
				screen = pm.getLocalScreen();
			}
            var foundAreaNdx = screen.areas.findIndex(function(testArea){
                return testArea.id == areaId;
            });
			if(foundAreaNdx > -1){
                return screen.areas[foundAreaNdx];
            }
			return false;
		}
    };

    return ret;
});
