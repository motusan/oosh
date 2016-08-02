* project contains screens and history of events
* screen contain areas
* areas are parts of the page that can:
  * handle events (websocket, mouse/gesture, keyboard, MIDI, sensor input)
  * send messages (MIDI, websocket, HTTP, screen display)
  * display information

* project : {
    name : <displayName>,
    path : <urlPath>,
    password : <pwd>,
    screens : [],
    events : []
}

* screen : {
    name : <displayName>,
    host : <hostname>,
    userAgent : <browserInfo>
    areas : []
}

* area : {
    name : <displayName>,
    screen : <screenId>,
    shapeType : "rect"|"circle"|"poly",
    shapeDefinition: "x,y,w,h"|"x,y,r",
    eventHandlers : []    
}

* eventHandler : {
    name : <displayName>,
    triggerObject : <objName>,
    eventName : "midimessage"|"mouseenter"|...
}

* message : {
    name : <messageName>,
    messageType : "websocket"|"midiportstate"|"midimessage"|"http",
    targetIdentifier : "*",
    content : {}
}

Example project:

{
    "name" : "Project One",
    "path" : "p1",
    "password" : "m@1Pwd",
    "screens" : [
        {
            "id" : "MbScreen1",
            "name" : "Screen 1 (MacBook)",
            "host" : "localhost",
            "userAgent" :""
            "areas" : [
                {
                    "id" : "area1"
                    "name" : "Area 1",
                    "shapeType" : "rect",
                    "shapeDefinition": "0,0,640,480",
                    "eventHandlers" : [
                        {
                            "name" : "Local Mouse Movement",
                            "trigger" : function(){
                                jQuery('#area1').on('mousemove', function(ev){
                                    Mox2.sendMessage(screenId, areaId, eventId, eventInfo);
                                });
                            },

                        }
                    ]    
                }
            ]
        }
    ],
    events : []    
}
