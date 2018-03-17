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
   vars:true,
   white:true
*/
/*global jquery*/

//Module /spa/
//provides chat slider capability
//
var spa = (function ($) {

  // public method /initModule/
  // sets initial state and provides feature
  initModule = function ($container) {
    spa.shell.initModule($container)
  }
  return { initModule: initModule }
})(jQuery)
