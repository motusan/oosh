module.exports = {
	identity: 'Project',
	connection: 'locomongo',
	attributes: {
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
			alphanumericdashed : true,
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
			type: 'ARRAY'
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

			this.screens.push(screenInfo);
			return this.save(function(err, updates){
				cb(updates);
			});
		}
    },

	clean : function(projectPath){
        var cleaned = projectPath.replace(/[^a-zA-Z0-9_]/gm, '_').substr(0, 255);
        return cleaned;
    }
};
