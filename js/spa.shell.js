/*
 * spa.shell.js
 * shell module for spa
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
   vars:true,
   white:true
*/
/*global $, spa*/
spa.shell = (function () {
  //----------begin module scope variables-----------
  var configMap = {
    main_html: String()
      + '<div class="spa-shell-head">'
      + '<div class="spa-shell-head-logo"></div>'
      + '<div class="spa-shell-head-acct"></div>'
      + '<div class="spa-shell-head-search"></div>'
      + '</div>'
      + '<div class="spa-shell-main">'
      + '<div class="spa-shell-main-nav"></div>'
      + '<div class="spa-shell-main-content"></div>'
      + '</div>'
      + '<div class="spa-shell-foot"></div>'
      + '<div class="spa-shell-chat"></div>'
      + '<div class="spa-shell-modal"></div>',
    chat_extend_time: 1000,
    chat_retract_time: 300,
    chat_extend_height: 450,
    chat_retract_height: 15,
    chat_extended_title: '点击关闭',
    chat_retracted_title: '点击展开',
    anchor_schema_map: {
      chat: { open: true, closed: true }
    }
  },
    stateMap = {
      $container: null,
      is_chat_retracted: true,
      anchor_map: {}
    },
    jqueryMap = {},

    copyAnchorMap, setJqueryMap, toggleChat,
    changeAnchorPart, onHashchange,
    onClickChat, initModule;
  //-----------end module scope variables-----------

  //--------begin utility handlers--------------

  // return copy of stored anchor map; minimizes overhead
  copyAnchorMap = function () {
    return $.extend(true, {}, stateMap.anchor_map);
  }
  //--------end utility handlers---------------
  //--------begin dom methods-------------
  //begin dom method /changeAnchorPart/
  changeAnchorPart = function (arg_map) {
    var anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    //begin merge changes into anchor map
    KEYVAL:
    for (key_name in arg_map) {
      if (arg_map.hasOwnProperty(key_name)) {
        //skip dependent keys during iteration
        if (key_name.indexOf('_') === 0) { continue KEYVAL }
        //update independent key value
        anchor_map_revise[key_name] = arg_map[key_name]
        key_name_dep = '_' + key_name;
        if (arg_map[key_name_dep]) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    //end merge changes into anchor map

    //begin attempt to update uri; revert if not successful
    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    }
    catch (error) {
      //replace uri with existing state
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }
    //end attempt to update uri; revert if not successful
    return bool_return;
  }
  //end dom method /changeAnchorPart/
  //begin dom method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container: $container,
      $chat: $container.find('.spa-shell-chat')
    };
  }
  //end dom method /setJqueryMap/

  //begin dom method /toggleChat/
  toggleChat = function (do_extend, callback) {
    var px_chat_ht = jqueryMap.$chat.height(),
      is_open = px_chat_ht === configMap.chat_extend_height,
      is_closed = px_chat_ht === configMap.chat_retract_height,
      is_sliding = !is_open && !is_closed;

    //avoid race condition
    if (is_sliding) { return false; }
    //begin extend chat slider
    if (do_extend) {
      jqueryMap.$chat.animate({ height: configMap.chat_extend_height },
        configMap.chat_extend_time,
        function () {
          jqueryMap.$chat.attr('title', configMap.chat_extended_title);
          stateMap.is_chat_retracted = false
          if (callback) { callback(jqueryMap.$chat) }
        });
      return true;
    }
    //end extend chat slider
    //begin retract chat slider
    jqueryMap.$chat.animate({ height: configMap.chat_retract_height },
      configMap.chat_retract_time,
      function () {
        jqueryMap.$chat.attr('title', configMap.chat_retracted_title);
        stateMap.is_chat_retracted = true
        if (callback) { callback(jqueryMap.$chat) }
      });
    return true;
    //end retract chat slider
  }
  //end dom method /toggleChat/




  //---------end dom methods-----------


  //----------begin event handlers----------
  //begin event method /onHashchange/
  onHashchange = function (event) {
    var anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_chat_previous, _s_chat_proposed,
      s_chat_proposed;

    //attempt to parse anchor
    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    //convenience vars
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;
    //begin adjust chat component if changed
    if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch (s_chat_proposed) {
        case 'open':
          toggleChat(true);
          break;
        case 'closed':
          toggleChat(false);
          break;
        default:
          toggleChat(false);
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }
    //end adjust chat component if changed
    return false
  };
  //end event method /onHashchange/

  //end event  method /onClickChat/
  onClickChat = function (event) {
    if (toggleChat(stateMap.is_chat_retracted)) {
      changeAnchorPart({ chat: (stateMap.is_chat_retracted ? 'open' : 'closed') });
    }
    return false;
  }
  //end event method /onClickChat/
  //----------end event handlers------------

  //----------begin public methods-------------
  //begin public method /initModule/
  initModule = function ($container) {
    // load html and map jquery collections
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    $(window).bind('hashchange', onHashchange)
      .trigger('hashchange')
    //initialize chat slider and bind click handler
    stateMap.is_chat_retracted = true;
    jqueryMap.$chat.attr('title', configMap.chat_retracted_title)
      .click(onClickChat);
  }
  //end public method /initModule/
  return { initModule: initModule }
  //----------end public methods---------------

})()