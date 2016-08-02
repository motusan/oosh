define('Preferences', function(){
    return {
        /* gets all preferences, or a filtered set, or only the value of the specified one. */
        get : function(filter){
            var prefs = JSON.parse(localStorage.preferences || "{}");
            if(!filter){
                return prefs;
            }

            var matches = false;
            var matchCount = 0;
            for(var ndx in prefs){
                if(prefs.hasOwnProperty(ndx) && ndx.indexOf(filter)===0){
					if(!matches){
						matches = {};
					}
                    matches[ndx] = prefs[ndx];
                    matchCount++;
                }
            }
            return matchCount == 1 ? matches[ndx] : matches;
        },

        /* adds preferences if they don't already exist */
        add : function(newPrefs){
            var prefs = JSON.parse(localStorage.preferences || "{}");
            for(var ndx in newPrefs){
                if(prefs.hasOwnProperty(ndx)){
                    console.error('Preferences: "' + ndx + '" already exists, ignoring request to add it');
                }
                else{
                    prefs[ndx] = newPrefs[ndx];
                }
            }
            localStorage.preferences = JSON.stringify(prefs);
        },

        /* updates only preferences that already exist */
        update : function(updatedPrefs){
            var prefs = JSON.parse(localStorage.preferences || "{}");
            for(var ndx in updatedPrefs){
                if(!prefs.hasOwnProperty(ndx)){
                    console.error('Preferences: "' + ndx + '" does not exist, ignoring request to update it');
                }
                else{
                    prefs[ndx] = updatedPrefs[ndx];
                }
            }
            localStorage.preferences = JSON.stringify(prefs);
        }
    };
});
