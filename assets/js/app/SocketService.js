//define('SocketService', ['js/dependencies/socket.io.js', 'js/dependencies/sails.io.repo.js'],
define('SocketService', ['js/dependencies/socket.io.js', 'js/dependencies/sails.io.repo.js'],
        function(socketIOClient, sailsIOClient){
    var io = sailsIOClient(socketIOClient);
    var onConnectCallback;

    //var socket = io.sails.connect();
    var socketEventHandlerRemovers = {};

    var Events = {
        Connected : 'Connected',
        Disconnected : 'Disconnected',
        Broadcast : 'Broadcast',
        ProjectUpdated : 'ProjectUpdated'
    };

    var unregisterSocketEventHandlers = function(){
        for(var ndx in socketEventHandlerRemovers){
            var func = socketEventHandlerRemovers[ndx];
            func();
        }
        socketEventHandlerRemovers = {};
    };

    var registerSocketEventHandlers = function(){
        if(!socketEventHandlerRemovers){
            socketEventHandlerRemovers = {};
        }
        else{
            unregisterSocketEventHandlers();
        }

        for(var eventName in socketEvents){
            var eventHandler = socketEvents[eventName];
            registerSocketEventHandler(eventName, eventHandler);
        }
    };

    var registerSocketEventHandler = function(eventName, func){
        var removeFunc = io.socket.on(eventName, function(msg){
            func(msg);
        });
        socketEventHandlerRemovers[eventName] = removeFunc;
    };

	io.socket.on('connect', function(ev){
		console.log('socket connected');
	});
	io.socket.on('disconnect', function(ev){
		console.log('socket disconnected');
	});
	io.socket.on('reconnect', function(ev){
		console.log('socket reconnected');
	});
	io.socket.on('error', function(err){
		console.log('*** socket error: ' + JSON.stringify(err));
	});
	io.socket.on('sails:parseError', function(ev){
		console.log('*** parse error: ' + JSON.stringify(ev));
	});
	io.socket.on('reconnecting', function(ev){
		console.log('socket reconnecting...');
	});

    return {
        Events : Events,

        connect : function(projectPath){
            io.socket.get('/project/connect/'  + projectPath, function(resp){
                if(typeof onConnectCallback == 'function'){
                    onConnectCallback();
                }
            });
        },

        broadcast : function(projectPath, data, cb){
            //sails.sockets.broadcast(projectPath, eventName, data);
            var payload = {
                event : Events.Broadcast,
                data : data
            };
            io.socket.post('/project/broadcast/' + projectPath, payload, function(resp){
                if(typeof cb == 'function'){
                    cb(resp);
                }
            });
        },

        updateProject : function(projectPath, project, cb){
            io.socket.post('/project/update/' + projectPath, {
                project : project
            }, function(resp){
                if(typeof cb == 'function'){
                    cb(resp);
                }
            });
        },

        onConnect : function(cb){
            onConnectCallback = cb;
        },

        registerSocketEventHandler : registerSocketEventHandler,
        registerSocketEventHandlers : registerSocketEventHandlers,
        unregisterSocketEventHandlers : unregisterSocketEventHandlers
    };
});
