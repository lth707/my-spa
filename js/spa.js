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
    $container.html('<h1 style="display:inline-block;margin:25px;">'
      + 'hello world!'
      + '</h1>'
    );
  }
  return { initModule: initModule }
})(jQuery)
