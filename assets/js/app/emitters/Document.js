define({
    "displayName":"Document",
    "emitterObjectName":"Document",
    "getVia": {
        "windowObject" : ":document",
        "member" : "",
        "memberType" : "property"
    },
    "events":[
        { "name":"mousedown", "properties":["target","which","x","y"] },
        { "name":"mouseup", "properties":["target","which","x","y"] },
        {"name":"keydown",  "properties":["code","keyCode"] },
        {"name":"keyup",  "properties":["code","keyCode"] },

        { "name":"touchstart", "properties": [{"name":"changedTouches",
                                            "containedItemProperties": ["identifier","screenX","screenY","clientX","clientY","pageX","pageY","target"] }] },
        { "name":"touchend", "properties": [{"name":"changedTouches",
                                            "containedItemProperties": ["identifier","screenX","screenY","clientX","clientY","pageX","pageY","target"] }] },
        { "name":"touchcancel", "properties": [{"name":"changedTouches",
                                            "containedItemProperties": ["identifier","screenX","screenY","clientX","clientY","pageX","pageY","target"] }] },
        { "name":"touchmove", "properties": [{"name":"changedTouches",
                                            "containedItemProperties": ["identifier","screenX","screenY","clientX","clientY","pageX","pageY","target"] }] },

        { "name":"gesturestart" },
        { "name":"gesturechange" },
        { "name":"gestureend" },

        { "name":"drop", "properties": [
			{"name":"dataTransfer", "containedItemProperties": ["files", "items"] },
			{"name":"currentTarget", "containedItemProperties": ["files", "items"] },
			{"name":"clientX"},{"name":"clientY"}
		] },
        { "name":"dragover", "properties": [
			{"name":"dataTransfer", "containedItemProperties": ["files", "items"] },
			{"name":"currentTarget", "containedItemProperties": ["files", "items"] },
			{"name":"clientX"},{"name":"clientY"}
		] },
        { "name":"dragend", "properties": [
			{"name":"dataTransfer", "containedItemProperties": ["files", "items"] },
			{"name":"currentTarget", "containedItemProperties": ["files", "items"] },
			{"name":"clientX"},{"name":"clientY"}
		] }
    ]
});
