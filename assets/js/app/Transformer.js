define('Transformer', ['ValueResolver'], function(valueResolver){
    return {
		/*
		The transformer uses a set of instructions to alter an input value

		For example, the value of the input property resolves to an event object containing
		a detail object containing a properties object containing an array property named data.

		"id": {
			"input" : "event:detail:properties:data[1]",
			"transform": [
				{"prefix": "osc2"}
			]
		}

		The transform property is an array of objects. Each object contains a single
		transform operation to be executed on the input value. Operations are executed
		sequentially, the output of each operation serving as the input of the next
		operation.

		Supported operation types:
		* add
		* subtract
		* multiply
		* divide
		* exponent
		* exponentOf
		* map
		* prefix
		* suffix

		*/
        transformValue : function(valueAndInstructions, contextMap){
            var inputValueLocator = valueAndInstructions.input;

            var value = valueResolver.resolve(inputValueLocator, contextMap);

            var instructions = valueAndInstructions.transform;
            if(!instructions){
                return value;
            }

            instructions = instructions.length ? instructions : [instructions];
            instructions.forEach(function(instruction){
                if(instruction.add){
                    value += valueResolver.resolve(instruction.add, contextMap);
                }
                else if(instruction.subtract){
                    value -= valueResolver.resolve(instruction.subtract, contextMap);
                }
                else if(instruction.multiply){
                    value *= valueResolver.resolve(instruction.multiply, contextMap);
                }
                else if(instruction.divide){
                    value /= valueResolver.resolve(instruction.divide, contextMap);
                }
                else if(instruction.exponent){
                    value = Math.pow(value, valueResolver.resolve(instruction.exponent, contextMap));
                }
                else if(instruction.exponentOf){
                    value = Math.pow(valueResolver.resolve(instruction.exponentOf, contextMap), value);
                }
                else if(instruction.map){
                    value = instruction.map[value];
                }
                else if(instruction.prefix){
                    value = valueResolver.resolve(instruction.prefix, contextMap) + '' + value;
                }
                else if(instruction.suffix){
                    value = value + '' + valueResolver.resolve(instruction.suffix, contextMap);
                }
            });
            return value;
        }
    };
});
