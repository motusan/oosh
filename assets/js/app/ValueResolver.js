define('ValueResolver', [], function(){
    return {
        /*
         Resolves a value from an object in the inputMap identified by a colon-notation string.
		 For example, the value of the input property resolves to an event object containing
		 a detail object containing a properties object containing an array property named data.

		 "id": {
			 "input" : "event:detail:properties:data[1]",
			 "transform": [
				 {"prefix": "osc2"}
			 ]
		 }

		 The array index notation is used to resolve the value at index 1 of the array.
		 event:detail:properties:data[1]
         */
        resolve : function(str, inputMap, delimiter){
            if(typeof str == 'number'){
                return str;
            }
			if(typeof str !== 'string'){
				console.error('not a string: ' + JSON.stringify(str));
				return false;
			}
			if(str.indexOf(':')!==0){
				return str;
			}
			str = str.substr(1);

            if(!delimiter){
                delimiter = ':'; // had to switch to : due to Mongo issues with dot notation in attribute names
            }

            var parts = str.split(delimiter);
			if(parts.length===0){
				parts = [str];
			}

            var value = inputMap;
            while(parts.length > 0){
                var part = parts.shift();
				// is there a an array/object index being referenced?
                var match = part.match(/(.+)\[([0-9+])\]/);
                if(!match){
					if(typeof value[part] == 'undefined'){
						return false;
					}
					else{
                    	value = value[part];
					}
                }
                else{
                    value = value[match[1]][match[2]];
                }
            }
            return value;
        }
    };
});
