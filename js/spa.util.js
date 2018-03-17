/*
 * spa.util.js 
*/
/* jslint 
   browser:true,
   continue:true,
   devel: true,
   indent:2,
   maxerr:50,
   newcap:true,
   nomen:true,
   plusplus:true,
   regexp:true,
   sloppy:true,
   vars:false,
   white:true
*/
/*global $, spa*/

spa.util = (function () {
    var markError, setConfigMap;

    //begin public constructor /makeError/
    markError = function (name_text, msg_text, data) {
        var error = new Error();
        error.name = name_text;
        error.message = msg_text;
        if (data) { error.data = data };
        return error;
    }
    //end public constructor /makeError/

    //begin public method /setConfigMap/
    setConfigMap = function (arg_map) {
        var input_map = arg_map.input_map,
            settable_map = arg_map.settable_map,
            config_map = arg_map.config_map,
            key_name, error;
        for (key_name in input_map) {
            if (input_map.hasOwnProperty(key_name)) {
                if (settable_map.hasOwnProperty(key_name)) {
                    config_map[key_name] = input_map[key_name];
                } else {
                    error = markError('bad input', 'setting config key |' + key_name + '| is not supported');
                    throw error;
                }
            }
        }
    }
    //end public method /setConfigMap/

    return { makeError: markError, setConfigMap: setConfigMap };

})()