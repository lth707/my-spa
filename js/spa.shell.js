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
    'use strict';
    //----------begin module scope variables-----------
    var configMap = {
        main_html: String() +
            '<div class="spa-shell-head">' +
            '<div class="spa-shell-head-logo">' +
            '<h1>SPA</h1>' +
            '<p>javascript end to end</p>' +
            '</div>' +
            '<div class="spa-shell-head-acct"></div>' +
            '<div class="spa-shell-head-search"></div>' +
            '</div>' +
            '<div class="spa-shell-main">' +
            '<div class="spa-shell-main-nav"></div>' +
            '<div class="spa-shell-main-content"></div>' +
            '</div>' +
            '<div class="spa-shell-foot"></div>' +
            '<div class="spa-shell-modal"></div>',
        chat_extend_time: 1000,
        chat_retract_time: 300,
        chat_extend_height: 450,
        chat_retract_height: 15,
        chat_extended_title: '点击关闭',
        chat_retracted_title: '点击展开',
        anchor_schema_map: {
            chat: { opened: true, closed: true }
        },
        resize_interval: 20
    },
        stateMap = {
            $container: null,
            anchor_map: {},
            resize_idto: undefined
        },
        jqueryMap = {},

        copyAnchorMap, setJqueryMap,
        changeAnchorPart, onHashchange, onResize,
        setChatAnchor, initModule,
        onTapAcct, onLogin, onLogout;
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
        } catch (error) {
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
            $acct: $container.find('.spa-shell-head-acct'),
            $nav: $container.find('.spa-shell-main-nav')
        };
    }
    //end dom method /setJqueryMap/

    onTapAcct = function (event) {
        var acct_text, user_name, user = spa.model.people.get_user();
        if (user.get_is_anon()) {
            user_name = prompt('please sign-in');
            spa.model.people.login(user_name);
            jqueryMap.$acct.text('... processing ...');
        } else {
            spa.model.people.logout();
        }
        return false;
    };

    onLogin = function (event, login_user) {
        jqueryMap.$acct.text(login_user.name);
    };
    onLogout = function () {
        jqueryMap.$acct.text('please sign-in');
    };

    //---------end dom methods-----------


    //----------begin event handlers----------

    //begin event handler /onResize/
    onResize = function () {
        if (stateMap.resize_idto) { return true; }
        spa.chat.handleResize();
        stateMap.resize_idto = setTimeout(function () {
            stateMap.resize_idto = undefined;
        }, configMap.resize_interval);
        return true;
    }

    //end event handler /onResize/
    //begin event handler /onHashchange/
    onHashchange = function (event) {
        var anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            is_ok = true,
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
                case 'opened':
                    is_ok = spa.chat.setSliderPosition('opened');
                    break;
                case 'closed':
                    is_ok = spa.chat.setSliderPosition('closed');
                    break;
                default:
                    is_ok = spa.chat.setSliderPosition('closed');
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        if (!is_ok) {
            if (anchor_map_previous) {
                $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                stateMap.anchor_map = anchor_map_previous;
            } else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        //end adjust chat component if changed
        return false
    };
    //end event handler /onHashchange/


    //----------end event handlers------------

    //----------begin callback------------
    //begin callback method /setChatAnchor/
    setChatAnchor = function (position_type) {
        return changeAnchorPart({ chat: position_type });
    }
    //end callback method /setChatAnchor/
    //----------end callback-------------

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
        $.gevent.subscribe($container, 'spa-login', onLogin);
        $.gevent.subscribe($container, 'spa-logout', onLogout);

        jqueryMap.$acct
            .text('please sign-in')
            .bind('utap', onTapAcct);
        //configure and initialize feature modules
        spa.chat.configModule({
            set_chat_anchor: setChatAnchor,
            chat_model: spa.model.chat,
            people_model: spa.model.people
        });
        spa.chat.initModule(jqueryMap.$container);

        spa.avtr.configModule({
            chat_model: spa.model.chat,
            people_model: spa.model.people
        })
        spa.avtr.initModule(jqueryMap.$nav)
        $(window)
            .bind('resize', onResize)
            .bind('hashchange', onHashchange)
            .trigger('hashchange')
    }
    //end public method /initModule/
    return { initModule: initModule }
    //----------end public methods---------------

})()