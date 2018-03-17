/*
 * spa.chat.js
 * chat feature module for spa
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

spa.chat = (function () {
    //----------begin module scope variables-----------
    var configMap = {
        main_html: String()
            + '<div style="padding:1em;color:#fff;">'
            + 'Say hello to chat'
            + '</div>',
        settable_map: {}
    },
        stateMap = { $container: null },
        jqueryMap = {},
        setJqueryMap, configModule, initModule;
    //----------end module scope variables----------- 

    //--------begin utility handlers--------------

    //--------end utility handlers---------------

    //--------begin dom methods-------------
    //begin dom method /setJqueryMap/
    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = { $container: $container };
    }
    //end dom method /setJqueryMap/
    //--------end dom methods-------------

    //----------begin event handlers----------


    //----------end event handlers----------


    //----------begin public methods-------------

    //begin public method /configModule/
    configModule = function (input_map) {
        spa.util.setConfigMap({
            input_map: input_map,
            settable_map: configMap.settable_map,
            config_map: configMap
        });
        return true;
    }
    //end public method /configModule/

    //begin public method /initModule/
    initModule = function ($container) {
        // load html and map jquery collections
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();
        return true;
    }
    //end public method /initModule/
    return {
        configModule: configModule,
        initModule: initModule
    }
    //----------end public methods---------------
})();