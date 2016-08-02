var Messenger = {
    /**
     * Messenger manages the application's socket communications.
     * The projectStream is the "room" id (the Project's path is used for this)
     */
    connect : function(req, projectStream){
        sails.log.debug('Messenger.connect to ' + projectStream);
        if(!req.isSocket){
            sails.log.error('Messenger.connect: not a socket request');
            return false;
        }

        sails.sockets.join(req.socket, projectStream);
        return true;
    },

    disconnect : function(req, projectStream){
        if(!req.isSocket){
            sails.log.error('Messenger.disconnect: not a socket request');
            return false;
        }

        sails.sockets.leave(req.socket, projectStream);
        return true;
    },

    /*
     *  data : {
            emitter : id of the event emitter
            event : id of the event being fired
            detail : event-specific data payload
        }
     */
    broadcast : function(projectStream, data){
        /*
        sails.log.debug('Messenger.broadcast ' + data.event +
                ' to ' + projectStream + ":\n" + JSON.stringify(data));
        */
        sails.sockets.broadcast(projectStream, MessengerEvents.Broadcast, data);
        return true;
    }
};

module.exports = Messenger;
