define('ValueFilter', ['ValueResolver'], function(valueResolver){
    return {
        /*
		Given a set of filters (map of objects) and a context (map of objects),
		returns true if all filter tests pass (return true) or false otherwise.
		Supported operators:
		* not
		* oneOf
		* notOneOf
		* greaterThan
		* greaterThanEqual
		* lessThan
		* lessThanEqual
		* between
		* notBetween

		For example:
		"properties":{
			"detail:properties:data[0]" : 144,
			"detail:properties:data[1]" : { "lessThan" : 72 },
			"detail:properties:data[2]" : { "not" : "0" }
		}
		*/
        test : function(filterMap, context){
            // TODO: convert this to a map (make declarativy)
            for(var filterName in filterMap){
                // single value
                var value = valueResolver.resolve(filterName, context);
                var filterValue = filterMap[filterName];
                if(typeof filterValue == 'string' || typeof filterValue == 'number'){
                    if(value != filterValue){
                        return false;
                    }
                }
                else if(filterValue.not){
                    // negate
                    if(value == filterValue.not){
                        return false;
                    }
                }
                else if(filterValue.oneOf){
                    // set (array)
                    if(!(function(val, filterVal){
                                var found = filterVal.oneOf.findIndex(function(testVal){
                                    return testVal == val;
                                });
                                return found > -1;
                        })(value, filterValue)){
                            return false;
                        }

                }
                else if(filterValue.notOneOf){
                    // negative set
                    if(!(function(val, filterVal){
                                var found = filterVal.notOneOf.findIndex(function(testVal){
                                    return testVal == val;
                                });
                                return found == -1;
                        })(value, filterValue)){
                            return false;
                        }
                }
                else if(filterValue.greaterThan){
                    if(value <= filterValue.greaterThan){
                        return false;
                    }
                }
                else if(filterValue.greaterThanEqual){
                    if(value < filterValue.greaterThanEqual){
                        return false;
                    }
                }
                else if(filterValue.lessThan){
                    if(value >= filterValue.lessThan){
                        return false;
                    }
                }
                else if(filterValue.lessThanEqual){
                    if(value > filterValue.lessThanEqual){
                        return false;
                    }
                }
                else if(filterValue.between){
                    // inclusive range (array of 2 elements)
                    var arr = filterValue.between;
                    if(value < arr[0] || value > arr[1]){
                        return false;
                    }
                }
                else if(filterValue.notBetween){
                    // exclusive range
                    var arr2 = filterValue.notBetween;
                    if(value >= arr2[0] && value <= arr2[1]){
                        return false;
                    }
                }
                else if(filterValue.length){
                    // range of values
                    var matchFound = filterValue.find(function(testValue){
                        return value == testValue;
                    });
                    if(!matchFound){
                        return false;
                    }
                }
            }
            return true;
        }
    };
});
