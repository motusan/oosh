module.exports = {
	identity: 'Project',
	datastore: 'locomongo',
	primaryKey: 'id',
	attributes: {
		id: {
	       type: 'number',
	       autoIncrement: true,
	       unique: true
	    },
		name: {
            type : 'STRING',
            minLength: 8,
			maxLength: 256,
			unique: true,
			required: true
        },
		path : {
			type : 'STRING',
            minLength: 4,
			maxLength: 256,
			unique: true,
			required: true
		},
        password: {
			type: 'STRING',
			minLength: 4,
			maxLength: 256,
			required: true
		},

        screens : {
			type: 'json',
			columnType: 'array'
		},

		hasScreen : function(screenInfoOrId){
			var screenId = screenInfoOrId.id || screenInfoOrId;
			if(!this.screens){
				return false;
			}
			var screenFound = false;
			this.screens.forEach(function(test){
				if(test.id == screenId){
					screenFound = true;
				}
			});
			return screenFound;
		},

		addScreen : function(screenInfoOrId, cb){
			sails.log.debug('addScreen');
			var screenInfo = typeof screenInfoOrId == 'object' ?
					screenInfoOrId : { id : screenInfoOrId, name : screenInfoOrId, host : '', areas : [] };

			if(!this.screens){
				this.screens = [];
			}

			// for new Sails/waterline (https://sailsjs.com/documentation/reference/waterline-orm/models/replace-collection):
			// this.screens.push(screenInfo);
			// return this.save(function(err, updates){
			// 	cb(updates);
			// });
			Project.replaceCollection(this.path, 'screens').members(screenInfo);
			Project.findOne({ path : this.path })
	        .then(function(foundProject){
				delete foundProject.password;
				cb(foundProject);
			});
		}
    },

	clean : function(projectPath){
        var cleaned = projectPath.replace(/[^a-zA-Z0-9_]/gm, '_').substr(0, 255);
        return cleaned;
    }
};
