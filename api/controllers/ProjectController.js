var ProjectController = {

    list : function(req, res){
        Project.find()
        .then(function(projects){
            var list = new Array();
            projects.forEach(function(p){
                list.push({
                    id : p.id,
                    name : p.name,
                    path : p.path
                });
            });
            res.json(list);
        });
    },

    create : function(req, res){
        var path = req.params.projectPath;
        var name = req.body.name;
        var password = req.body.password;
		var screenId = req.body.screenId;

        req.session.screenId = screenId;

        Project.create({
            name : name,
            path : path,
            password : password
        })
        .then(function(){
            return res.ok();
        })
        .catch(function(e){
            sails.log.error('Failed to create project: ' + require('util').inspect(e));
            return res.json({ error : 'Failed to create project'});
        });
    },

	open : function(req, res){
        var path = req.params.projectPath;
        var screenId = req.body.screenId;
        var password = req.body.password;

        sails.log.debug('Project.open "' + path + '", by screenId "' + screenId + '"');

        req.session.screenId = screenId;

        Project.findOne({ path : path })
        .then(function(foundProject){
            if(!foundProject){
                return res.json({ error : 'Project not found: ' + path });
            }

            if(password == foundProject.password){
				req.session.authenticated = true;
                // add the screen to the project
                if(!foundProject.hasScreen(screenId)){
                    foundProject.addScreen(screenId, function(updatedProject){
                        sails.log.debug('addScreen callback with ' + require('util').inspect(updatedProject));
                        delete updatedProject.password;
                        return res.json(updatedProject);
                    });
                }
                else {
                    delete foundProject.password;
                    return res.json(foundProject);
                }
            }
            else{
                return res.json({ error : 'Incorrect password' });
            }
        })
        .catch(function(e){
            sails.log.error('Failed to open project "' + path + '": ' + require('util').inspect(e));
            return res.json({ error : 'Failed to open project' });
        });
    },

    update : function(req, res){
        var projectPath = req.params.projectPath;
        var projectInfo = req.body.project;

        if(!req.isSocket){
            sails.log.error('connect: must be socket request');
            res.forbidden();
        }

        Project.update({ path : projectPath }, projectInfo)
        .then(function(updated){
            sails.sockets.broadcast(projectPath , MessengerEvents.ProjectUpdated, updated[0]);
            return res.ok();
        })
        .catch(function(e){
            sails.log.error('Failed to create project: ');
            sails.log.error(e);
            return res.json({ error : 'Failed to create project'});
        });
    },

    connect : function(req, res){
        var projectPath = req.params.projectPath;
        var screenId = req.session.screenId;
        sails.log.debug('connect: ' + projectPath + ' screenId: ' + screenId);

        if(!req.isSocket){
            sails.log.error('connect: must be socket request');
            res.forbidden();
        }
        var cleaned = Project.clean(projectPath);
        var success = Messenger.connect(req, cleaned);
        if(!success){
            sails.log.error('failed to connect to ' + projectPath);
            res.forbidden();
        }

        Messenger.broadcast(cleaned, { id : cleaned,
            event : MessengerEvents.Connected,
            data : {
                screenId : screenId,
                serverDateTime : new Date()
            }
        });
        res.ok();
    },

    disconnect : function(req, res){

    },

    broadcast : function(req, res){
        var screenId = req.session.screenId;
        if(!req.isSocket){
            sails.log.error('broadcast: must be socket request');
            res.forbidden();
        }
        var projectPath = req.params.projectPath;

        var data = req.body.data;
        var cleaned = Project.clean(projectPath);

        Messenger.broadcast(cleaned, { id : cleaned,
            serverDateTime : new Date(),
            screenId : screenId,
            event : MessengerEvents.Broadcast,
            data : data
        });
        res.ok();
    }
};
module.exports = ProjectController;
