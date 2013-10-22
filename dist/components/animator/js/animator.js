// Strict mode for whole file.
"use strict";

// "use strict";

/**
 * This configuration factory JavaScript file provides map and layers objects
 * that framework uses for OpenLayers. This uses config file to create OpenLayers
 * map and layers.
 */

// Requires OpenLayers
if ( typeof OpenLayers === "undefined" || !OpenLayers) {
    throw "ERROR: OpenLayers is required for fi.fmi.metoclient.ui.animator.Factory!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

/**
 * This provides the configuration map object and layers array that the framework uses for OpenLayers.
 */
fi.fmi.metoclient.ui.animator.Factory = (function() {

    /**
     * @private
     *
     * Function to provide {bind} if an older browser does not support it natively.
     *
     * This will provide IE8+ support.
     * See, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
     *
     * This function is called during the construction of this sigleton instance to make sure
     * function is available.
     */
    (function() {
        if (!Function.prototype.bind) {
            Function.prototype.bind = function(oThis) {
                if ("function" !== typeof this) {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw "Function.prototype.bind - what is trying to be bound is not callable";
                }

                var aArgs = Array.prototype.slice.call(arguments, 1);
                var fToBind = this;
                var fNOP = function() {
                };
                var fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };

                fNOP.prototype = this.prototype;
                var FNOP = fNOP;
                fBound.prototype = new FNOP();

                return fBound;
            };
        }
    })();

    /**
     * @private
     *
     * Floor the given date to the given resolution.
     *
     * @param {Date} date Date object whose value is floored.
     *                    Operation is ignored if {undefined} or {null}
     * @param {Integer} resolution Resolution that the date should be floored to.
     *                             Operation is ignored if {undefined}, {null}, zero or negative value.
     */
    function floorDate(date, resolution) {
        if (date && resolution && resolution > 0) {
            var time = date.getTime();
            if (time !== resolution) {
                time -= time % resolution;
                date.setTime(time);
            }
        }
    }

    /**
     * @private
     *
     * Ceil the given date to the given resolution.
     *
     * @param {Date} date Date object whose value is ceiled.
     *                    Operation is ignored if {undefined} or {null}
     * @param {Integer} resolution Resolution that the date should be ceiled to.
     *                             Operation is ignored if {undefined}, {null}, zero or negative value.
     */
    function ceilDate(date, resolution) {
        if (date && resolution && resolution > 0) {
            var time = date.getTime();
            if (time !== resolution) {
                var reminder = time % resolution;
                if (reminder) {
                    time += resolution - time % resolution;
                    date.setTime(time);
                }
            }
        }
    }

    /**
     * Constructor for new instatiation.
     * This function provides the public API and also contains private instance specific functionality.
     *
     * @param {Object} configuration Map and layer configuration object.
     *                               May be {undefined} or {null} but then operations are ignored.
     */
    var _constructor = function(configuration) {
        // Private member variables.
        //--------------------------

        // Map and layer configuration object.
        var _config = configuration;

        // OpenLayers related map and layers variables.
        // See corresponding get funtions below to create content.
        var _map;
        var _layers = [];

        // Animation setting related variables that are initialized
        // when corresponding get functionas are called first time.
        var _resolution;
        var _beginDate;
        var _endDate;

        // Private member functions.
        //--------------------------

        /**
         * Creates a constuctor wrapper function that may be instantiated with {new}.
         *
         * @param {Function} constructor Constructor function.
         *                               Operaion ignored if {undefined} or {null}.
         * @param {Array} args Arguments array that contains arguments that are given for the constructor.
         *                     May be {undefined} or {null}.
         * @return {Function} Wrapper function for constructor with given arguments.
         *                    This can be used with {new} to instantiate.
         *                    Notice, returned funtion needs to be surrounded with parentheses when {new} is used.
         *                    For example, new (constructorWrapper(constructor, args));
         */
        var constructorWrapper = function(constructor, args) {
            var wrapper;
            if (constructor) {
                var params = [constructor];
                if (args) {
                    params = params.concat(args);
                }
                wrapper = constructor.bind.apply(constructor, params);
            }
            return wrapper;
        };

        /**
         * Create instance of the class with the given class name and arguments
         *
         * @param {String} className Name of the class to be instantiated.
         *                           Operation ignored if {undefined}, {null} or empty.
         * @param {Array} args Arguments array that contains arguments that are given for the constructor.
         *                     May be {undefined} or {null}.
         * @return {Object} New Instance of the class with given arguments.
         */
        var createInstance = function(className, args) {
            var instance;
            if (className) {
                // Check namespaces of the class
                // and create function that contains possible namespaces.
                var nameArr = className.split(".");
                var constructor = (window || this);
                if (constructor) {
                    for (var i = 0, len = nameArr.length; i < len; i++) {
                        constructor = constructor[nameArr[i]];
                    }
                    if ("function" === typeof constructor) {
                        // Function was successfully created.
                        // Create instance with the given arguments.
                        // Notice, parentheses are required around wrapper function.
                        instance = new (constructorWrapper(constructor, args))();
                    }
                }
            }
            return instance;
        };

        /**
         * Check layer configurations through and find the greatest value for resolution if any.
         * @return {Integer} Resolution value.
         *                   May be {undefined}.
         */
        function getAnimationResolutionFromLayers() {
            var resolution;
            if (_config) {
                var layerConfigs = _config.layers;
                if (layerConfigs) {
                    // Configurations are provided for layers.
                    // Check all the layers through.
                    for (var i = 0; i < layerConfigs.length; ++i) {
                        var config = layerConfigs[i];
                        if (config && config.args) {
                            // Layers are created by providing arguments list in configuration.
                            // Check from the given arguments if any of them contains animation configuration.
                            for (var j = 0; j < config.args.length; ++j) {
                                var arg = config.args[j];
                                if (arg) {
                                    var animation = arg.animation;
                                    if (animation) {
                                        // Animation configuration is given. Check if resolution is also given for the animation.
                                        if (!resolution || animation.resolutionTime !== undefined && animation.resolutionTime !== null && resolution < animation.resolutionTime) {
                                            // Take the greatest resolution of them all.
                                            resolution = animation.resolutionTime;
                                        }
                                        // Use the first animation that is found from the arguments.
                                        // Therefore, no need to browse other arguments through any more.
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return resolution;
        }

        /**
         * Check layer configurations through and find the smallest value for animation begin date if any.
         * @return {Integer} Begin date.
         *                   May be {undefined}.
         */
        function getAnimationBeginDateFromLayers() {
            var date;
            if (_config) {
                var layerConfigs = _config.layers;
                if (layerConfigs) {
                    for (var i = 0; i < layerConfigs.length; ++i) {
                        var config = layerConfigs[i];
                        if (config && config.args) {
                            // Layers are created by providing arguments list in configuration.
                            // Check from the given arguments if any of them contains animation configuration.
                            for (var j = 0; j < config.args.length; ++j) {
                                var arg = config.args[j];
                                if (arg) {
                                    var animation = arg.animation;
                                    if (animation) {
                                        if (animation.beginTime !== undefined && animation.beginTime !== null) {
                                            var tmpDate = animation.beginTime;
                                            if (!( tmpDate instanceof Date)) {
                                                tmpDate = new Date(tmpDate);
                                            }
                                            if (date === undefined || tmpDate.getTime() < date) {
                                                // Take the smallest date of them all.
                                                date = tmpDate;
                                            }
                                        }
                                        // Use the first animation that is found from the arguments.
                                        // Therefore, no need to browse other arguments through any more.
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return date;
        }

        /**
         * Check layer configurations through and find the greatest value for animation end date if any.
         * @return {Integer} End date.
         *                   May be {undefined}.
         */
        function getAnimationEndDateFromLayers() {
            var date;
            if (_config) {
                var layerConfigs = _config.layers;
                if (layerConfigs) {
                    for (var i = 0; i < layerConfigs.length; ++i) {
                        var config = layerConfigs[i];
                        if (config && config.args) {
                            // Layers are created by providing arguments list in configuration.
                            // Check from the given arguments if any of them contains animation configuration.
                            for (var j = 0; j < config.args.length; ++j) {
                                var arg = config.args[j];
                                if (arg) {
                                    var animation = arg.animation;
                                    if (animation) {
                                        if (animation.endTime !== undefined && animation.endTime !== null) {
                                            var tmpDate = animation.endTime;
                                            if (!( tmpDate instanceof Date)) {
                                                tmpDate = new Date(tmpDate);
                                            }
                                            if (date === undefined || tmpDate.getTime() > date) {
                                                // Take the smallest date of them all.
                                                date = tmpDate;
                                            }
                                        }
                                        // Use the first animation that is found from the arguments.
                                        // Therefore, no need to browse other arguments through any more.
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return date;
        }

        // Public functions for API.
        // ------------------------

        /**
         * See API for function description.
         */
        function getMap() {
            // Create map if it has not been created yet.
            if (!_map && _config && _config.map && _config.map.className) {
                var args;
                if (_config.map.args && _config.map.args.length > 0) {
                    args = _config.map.args;
                    var options = args[0];
                    if (!options.theme) {
                        // Notice! This setting should be used in all configurations,
                        // unless you really know what you are doing. Do not use default
                        // theme but own style.css instead.
                        options.theme = null;
                    }
                }
                _map = createInstance(_config.map.className, args);
            }
            return _map;
        }

        /**
         * See API for function description.
         */
        function getLayers() {
            // Create layers only if map is available and if layers have not been created before.
            if (getMap() && _config && _config.layers && _layers.length === 0) {
                var layerConfigs = _config.layers;
                // Layer is defined outside of loop and reseted to undefined
                // inside the loop to make sure value is correct for every loop.
                var layer;
                for (var i = 0; i < layerConfigs.length; ++i) {
                    var config = layerConfigs[i];
                    // Reset layer to undefined for this loop.
                    layer = undefined;
                    if (config && config.className && config.args) {
                        // Layers are created by providing arguments list in configuration.
                        // Check from the given arguments if any of them contains animation configuration.
                        for (var j = 0; j < config.args.length; ++j) {
                            var arg = config.args[j];
                            if (arg) {
                                var animation = arg.animation;
                                if (animation) {
                                    // Check animation resolution of the layer.
                                    if (animation.resolutionTime === undefined) {
                                        // Make sure that at least a default resolution is set for animation layer.
                                        animation.resolutionTime = getAnimationResolution();
                                    }
                                    // Check if layer configuration has set begin and end times for animation.
                                    // If whole animation has the values but layer itself does not,
                                    // use animation values also for the layer as default.
                                    if (animation.beginTime === undefined) {
                                        animation.beginTime = getAnimationBeginDate();
                                    }
                                    if (animation.endTime === undefined) {
                                        animation.endTime = getAnimationEndDate();
                                    }
                                    if (animation.resolutionTime) {
                                        // Make sure that animation begin time of the layer is set on the correct resolution time.
                                        // This is required if layer itself has defined its own resolution instead of
                                        // using animation resolution.
                                        if (!(animation.beginTime instanceof Date)) {
                                            animation.beginTime = new Date(animation.beginTime);
                                        }
                                        floorDate(animation.beginTime, animation.resolutionTime);
                                        // Make sure that animation end time of the layer is set on the correct resolution time.
                                        // This is required if layer itself has defined its own resolution instead of
                                        // using animation resolution.
                                        if (!(animation.endTime instanceof Date)) {
                                            animation.endTime = new Date(animation.endTime);
                                        }
                                        ceilDate(animation.endTime, animation.resolutionTime);
                                    }
                                    // Use the first animation that is found from the arguments.
                                    // Therefore, no need to browse other arguments through any more.
                                    break;
                                }
                            }
                        }
                        layer = createInstance(config.className, config.args);
                    }
                    if (layer) {
                        _layers.push(layer);
                    }
                }
            }
            return _layers;
        }

        /**
         * See API for function description.
         */
        function getDefaultZoomLevel() {
            return _config ? _config.defaultZoomLevel : undefined;
        }

        /**
         * See API for function description.
         */
        function getAnimationFrameRate() {
            return _config ? _config.animationFrameRate : undefined;
        }

        /**
         * See API for function description.
         */
        function getAnimationResolution() {
            // Set resolution once.
            if (_resolution === undefined) {
                _resolution = _config ? _config.animationResolutionTime : undefined;
                if (!_resolution) {
                    // Because resolution was not defined for animation,
                    // check it from layer configurations.
                    _resolution = getAnimationResolutionFromLayers();
                    if (!_resolution) {
                        throw "ERROR: Animation configuration missing resolution time!";
                    }
                }
            }
            return _resolution;
        }

        /**
         * See API for function description.
         */
        function getAnimationBeginDate() {
            // Set begin date once.
            if (_beginDate === undefined && _config) {
                // Check if time has been given directly for the animation.
                if (_config.animationDeltaToBeginTime !== undefined) {
                    // Use animation setting.
                    // Only zero or positive values are accepted. Others are ignored.
                    if (_config.animationDeltaToBeginTime >= 0) {
                        _beginDate = new Date();
                        if (_config.animationDeltaToBeginTime) {
                            // Positive delta value given.
                            _beginDate.setTime(_beginDate.getTime() - _config.animationDeltaToBeginTime);
                            floorDate(_beginDate, getAnimationResolution());

                        } else {
                            // Zero value for delta is a special case because it informs that observed data is not wanted.
                            // Notice, this ceils the value above current time if resolution greater than zero and if
                            // current time is not exactly on resolution.
                            ceilDate(_beginDate, getAnimationResolution());
                        }
                    }

                } else {
                    // Check if time can be gotten from layer configurations because
                    // it was not given for animation directly.
                    _beginDate = getAnimationBeginDateFromLayers();
                    // Floor to the exact resolution time.
                    if (_beginDate !== undefined) {
                        floorDate(_beginDate, getAnimationResolution());
                    }
                }

                if (_beginDate === undefined) {
                    throw "ERROR: Animation configuration missing proper begin time!";
                }
            }
            // Make copy. Then, possible changes do not affect the original object.
            return _beginDate === undefined ? undefined : new Date(_beginDate.getTime());
        }

        /**
         * See API for function description.
         */
        function getAnimationEndDate() {
            // Set end date once.
            if (_endDate === undefined && _config) {
                // Check if time has been given directly for the animation.
                if (_config.animationDeltaToEndTime !== undefined) {
                    // Only zero or positive values are accepted. Others are ignored.
                    if (_config.animationDeltaToEndTime >= 0) {
                        _endDate = new Date();
                        if (_config.animationDeltaToEndTime) {
                            // Positive delta value given.
                            _endDate.setTime(_endDate.getTime() + _config.animationDeltaToEndTime);
                            ceilDate(_endDate, getAnimationResolution());

                        } else {
                            // Zero value for delta is a special case because it informs that future data is not wanted.
                            // Notice, this floors the value below current time if resolution greater than zero and if
                            // current time is not exactly on resolution.
                            floorDate(_endDate, getAnimationResolution());
                        }
                    }

                } else {
                    // Check if time can be gotten from layer configurations because
                    // it was not given for animation directly.
                    _endDate = getAnimationEndDateFromLayers();
                    // Ceil to the exact resolution time.
                    if (_endDate !== undefined) {
                        ceilDate(_endDate, getAnimationResolution());
                    }
                }

                if (_endDate === undefined) {
                    throw "ERROR: Animation configuration missing proper end time!";
                }
            }
            // Make copy. Then, possible changes do not affect the original object.
            return _endDate === undefined ? undefined : new Date(_endDate.getTime());
        }

        // Public config API.
        //-------------------

        /**
         * @return {OpenLayers.Map} Map for OpenLayers.
         *                          May be {undefined} or {null}. Then,
         *                          framework will not use any map and will not use layers either.
         */
        this.getMap = getMap;

        /**
         * @return [{OpenLayers.Layer}] Layer array for OpenLayers.
         *                              May not be {undefined} or {null}, but may be empty.
         */
        this.getLayers = getLayers;

        /**
         * @return {Integer} Default zoom level that should be used with the map when layers are added to it.
         *                   For example, {OpenLayers.setCenter} function can use this information together with
         *                   {OpenLayers.getCenter()} function.
         */
        this.getDefaultZoomLevel = getDefaultZoomLevel;

        /**
         * @return {Integer} Frame rate in milliseconds that is used for the animation.
         */
        this.getAnimationFrameRate = getAnimationFrameRate;

        /**
         * @return {Integer} Animation resolution time in milliseconds that is used for the animation.
         */
        this.getAnimationResolution = getAnimationResolution;

        /**
         * Notice, this gives the animation default begin time.
         * Different animation layers may have their own begin times configured.
         * This gives only time for the whole animation.
         *
         * @return {Date} Default value for animation begin time.
         *                If configuraton provides the value, it is used.
         *                Notice, date is floored to the nearest animation resolution time if
         *                time and resolution are given in configuration.
         *                May be {undefined} if not set in configuration.
         */
        this.getAnimationBeginDate = getAnimationBeginDate;

        /**
         * Notice, this gives the animation default end time.
         * Different animation layers may have their own begin times configured.
         * This gives only time for the whole animation.
         *
         * @return {Date} Default value for animation end time.
         *                If configuraton provides the value, it is used.
         *                Notice, date is ceiled to the nearest animation resolution time if
         *                time and resolution are given in configuration.
         *                May be {undefined} if not set in configuration.
         */
        this.getAnimationEndDate = getAnimationEndDate;
    };

    // Constructor function for new instantiation.
    return _constructor;
})();

// "use strict";

//Requires Raphael JS
if ( typeof Raphael === "undefined" || !Raphael) {
    throw "ERROR: Raphael JS is required for fi.fmi.metoclient.ui.animator.AnimationControl!";
}

//"Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

/**
 * Controller povides time slider to control animations.
 */
fi.fmi.metoclient.ui.animator.Controller = (function() {

    var _labelFontFamily = "Arial";
    var _labelFontSize = 12;

    function getTimeStr(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var timeStr = hours > 9 ? hours : "0" + hours;
        timeStr += ":";
        timeStr += minutes > 9 ? minutes : "0" + minutes;
        return timeStr;
    }

    /**
     * Constructor that is provided from this class for public instantiation.
     *
     * @param {Object} element
     * @param {Object} width
     * @param {Object} height
     */
    var _constructor = function(element, width, height) {
        var that = this;
        var _paper = new Raphael(element, width, height);
        var _model;
        var _timeController;

        // Initialization configurations.
        var _scaleConfig = {
            // Corner radius.
            radius : 5,
            x : 0,
            y : 0,
            width : width,
            height : height - 35,
            bgColor : Raphael.rgb(88, 88, 88),
            cellReadyColor : Raphael.rgb(148, 191, 119),
            cellErrorColor : Raphael.rgb(154, 37, 0),
            cellLoadingColor : Raphael.rgb(148, 191, 191),
            strokeBgColor : Raphael.rgb(191, 191, 191),
            obsBgColor : Raphael.rgb(178, 216, 234),
            fctBgColor : Raphael.rgb(231, 166, 78)
        };
        _scaleConfig.bgHeight = Math.floor(2 * _scaleConfig.height / 3);
        // Make progress cell height a little bit smaller than remaining area.
        // Then, background color is shown a little bit in behind.
        _scaleConfig.progressCellHeight = _scaleConfig.height - _scaleConfig.bgHeight - 2;

        var _sliderConfig = {
            height : 30,
            width : 65,
            bgColor : Raphael.rgb(88, 88, 88),
            strokeBgColor : Raphael.rgb(191, 191, 191)
        };
        // Notice, that polygon is drawn by using path. See, _sliderBg variable.
        // Notice, the polygon path height is 7 and tip height is 3. Therefore, use corresponding ration here.
        _sliderConfig.sliderTipHeight = _sliderConfig.height * (3 / 7);
        // Polygon path width is 14. Scale to the width given here.
        _sliderConfig.scaleX = _sliderConfig.width / 14;
        _sliderConfig.scaleY = (_sliderConfig.height + _sliderConfig.sliderTipHeight) / 7;
        // The tip x position is 4 in the plygon path. So, use that with the scale.
        _sliderConfig.sliderTipDx = Math.floor(4 * _sliderConfig.scaleX);
        // Make slider overlap the scale a little bit.
        _sliderConfig.y = _scaleConfig.y + _scaleConfig.height - Math.floor(_sliderConfig.sliderTipHeight / 3);

        // Scale functions that are required for scale initializations.
        //-------------------------------------------------------------

        /**
         * This is required to make sure slider is not hidden when it is in the side.
         * This happends if it is outside of the paper. Therefore, use padding that
         * takes this into account.
         */
        function getScalePadding() {
            // Notice, exact value can be calculated by _sliderConfig.width - _sliderConfig.sliderTipDx.
            // But it may be better to use constant. Then, for example UI CSS desing may be easier to do if
            // values are constants.
            return 50;
        }

        function nextFrame() {
            _timeController.proposeNextFrame();
        }

        function previousFrame() {
            _timeController.proposePreviousFrame();
        }

        // Handle mouse scroll event.
        function handleMouseScroll(e) {
            if (e.originalEvent.wheelDelta > 0) {
                // Scrolling up.
                nextFrame();

            } else {
                // Scrolling down.
                previousFrame();
            }
            // Prevent scrolling of the page.
            e.preventDefault();
        }

        function getObsWidth() {
            var width = 0;
            if (getForecastStartTime()) {
                // Forecast start time is given. So, calculate the width.
                width = _model && Math.floor((getEndTime() - getStartTime()) ? getScaleAreaWidth() * (getForecastStartTime() - getStartTime()) / (getEndTime() - getStartTime()) : 0);

            } else {
                // Observation takes the whole scale width if forecast is not used.
                width = getScaleAreaWidth();
            }
            if (width < 0) {
                width = 0;
            }
            return width;
        }

        function getFctWidth() {
            var width = _model ? getScaleAreaWidth() - getObsWidth() : 0;
            if (width < 0) {
                width = 0;
            }
            return width;
        }

        /**
         * @return X relative to the window.
         */
        function getScaleAreaOffsetX() {
            return jQuery(_scaleContainer.node).offset().left + getScalePadding();
        }

        // Scale initializations.
        //-----------------------

        // Scale variables.
        // Collection of scale tick elements.
        var _tickSet = _paper.set();
        // Colleciton of progress cell elements.
        var _progressCellSet = _paper.set();

        // Create scale UI components.
        // Scale container is used in the background of the scale elements.
        // Its purpose is just to provide information about the area and its position.
        var _scaleContainer = _paper.rect(_scaleConfig.x, _scaleConfig.y, _scaleConfig.width, _scaleConfig.height, _scaleConfig.radius);
        _scaleContainer.attr('fill', _scaleConfig.bgColor);
        _scaleContainer.attr('stroke', _scaleConfig.strokeBgColor);
        // Keep it hidden in the background.
        _scaleContainer.attr('opacity', 0);

        // Background behind obs and fct.
        var _background = _paper.rect(_scaleConfig.x + getScalePadding(), _scaleConfig.y, getObsWidth() + getFctWidth(), _scaleConfig.height);
        _background.attr('fill', _scaleConfig.bgColor);
        _background.attr('stroke-width', 0);

        var _obsBackground = _paper.rect(_scaleConfig.x + getScalePadding(), _scaleConfig.y, getObsWidth(), _scaleConfig.bgHeight);
        _obsBackground.attr('fill', _scaleConfig.obsBgColor);
        _obsBackground.attr('stroke-width', 0);

        var _fctBackground = _paper.rect(_scaleConfig.x + getScalePadding() + getObsWidth(), _scaleConfig.y, getFctWidth(), _scaleConfig.bgHeight);
        _fctBackground.attr('fill', _scaleConfig.fctBgColor);
        _fctBackground.attr('stroke-width', 0);

        var _leftHotSpot = _paper.rect(_scaleConfig.x + getScalePadding(), _scaleConfig.y, getScalePadding(), _scaleConfig.height);
        // Fill is required. Otherwise, click does not work.
        _leftHotSpot.attr('fill', Raphael.rgb(0, 0, 0)).attr('opacity', 0);
        _leftHotSpot.click(previousFrame);

        var _rightHotSpot = _paper.rect(_scaleConfig.x + width - 2 * getScalePadding(), _scaleConfig.y, getScalePadding(), _scaleConfig.height);
        // Fill is required. Otherwise, click does not work.
        _rightHotSpot.attr('fill', Raphael.rgb(0, 0, 0)).attr('opacity', 0);
        _rightHotSpot.click(nextFrame);

        // Handle mouse wheel over the scale.
        jQuery([_scaleContainer.node, _background.node, _obsBackground.node, _fctBackground.node, _leftHotSpot.node, _rightHotSpot.node]).bind('mousewheel', handleMouseScroll);

        // Slider functions that are required for slider initializations.
        //---------------------------------------------------------------

        /**
         * Set label text according to the position of the slider.
         */
        function resetSliderLabelText() {
            var x = jQuery(_sliderBg.node).offset().left;
            var date = new Date(timeToResolution(posToTime(x)));
            _sliderLabel.attr('text', getTimeStr(date));
        }

        /**
         * @param {Integer} x X position relative to the window origin.
         *                    Notice, x should refere to new x position of the
         *                    left side of slider.
         */
        function moveSliderTo(x) {
            var delta = x - jQuery(_sliderBg.node).offset().left;
            var newTipX = x + _sliderConfig.sliderTipDx;
            var scaleX = getScaleAreaOffsetX();
            if (delta && newTipX >= scaleX && newTipX <= scaleX + getScaleAreaWidth()) {
                _slider.transform("...T" + delta + ",0");
                resetSliderLabelText();
                resetHotSpots();
            }
        }

        // Slider drag flow callback functions are required for slider initializations.
        //-----------------------------------------------------------------------------

        /**
         * @param x X position of the mouse.
         * @param y Y position of the mouse.
         * @param event DOM event object.
         */
        function startDragMove(x, y, event) {
            _timeController.proposePause();
            _dragStartX = jQuery(_sliderBg.node).offset().left;
        }

        /**
         * @param dx shift by x from the start point
         * @param dy shift by y from the start point
         * @param x X position of the mouse.
         * @param y Y position of the mouse.
         * @param event DOM event object.
         */
        function dragMove(dx, dy, x, y, event) {
            // Notice, the given x is the position of the mouse,
            // not the exact position of the left side of the slider.
            // Also, dx is relative to the drag start position, not
            // to the previous  movement.
            var newTime = posToTime(_dragStartX + dx);
            _timeController.proposeTimeSelectionChange(newTime);
        }

        /**
         * @param event DOM event object.
         */
        function finalizeDragMove(event) {
            _dragStartX = undefined;
        }

        // Slider initalizations.
        //-----------------------

        // Collects all the slider elements.
        var _slider = _paper.set();
        // This is updated when slider is dragged.
        var _dragStartX;

        //polygon:
        var _sliderBg = _paper.path("M0,2L0,7L14,7L14,2L6,2L4,0L2,2Z");
        _sliderBg.attr('fill', _sliderConfig.bgColor);
        _sliderBg.attr('stroke', _sliderConfig.strokeBgColor);
        _sliderBg.transform("S" + _sliderConfig.scaleX + "," + _sliderConfig.scaleY + ",0,0T0," + _sliderConfig.y);

        var _sliderLabel = _paper.text(32, _sliderConfig.y + 26, "00:00").attr("text-anchor", "start").attr("font-family", _labelFontFamily).attr("font-size", _labelFontSize).attr("fill", Raphael.rgb(191, 191, 191));

        _slider.push(_sliderBg);
        _slider.push(_sliderLabel);

        // Set drag handlers.
        _slider.drag(dragMove, startDragMove, finalizeDragMove, this, this, this);

        // Reset initial time for label.
        resetSliderLabelText();

        // Handle mouse wheel over the slider.
        jQuery([_sliderBg.node, _sliderLabel.node]).bind('mousewheel', handleMouseScroll);

        // Move slider to the initial position.
        // Notice, because this is the first move, use also _sliderConfig.sliderTipDx to set tip position to the beginning.
        // Otherwise, left side should be given.
        moveSliderTo(getScaleAreaOffsetX() - _sliderConfig.sliderTipDx);

        // Private functions.
        //-------------------

        // Redraw scale and slider elements.
        function redrawAll() {
            redrawScaleBackground();
            redrawTimeCells();
            redrawTics();
            redrawSlider();
            resetHotSpots();
            // Make sure hot spots are in front.
            _leftHotSpot.toFront();
            _rightHotSpot.toFront();
        }

        function resetHotSpots() {
            var sliderTipOffsetX = jQuery(_sliderBg.node).offset().left + _sliderConfig.sliderTipDx;
            // Left hot spot always starts from the same place. Only length changes.
            // Left hot spot width is to the position of the slider tip.
            var leftWidth = sliderTipOffsetX - jQuery(_background.node).offset().left;
            if (leftWidth < 0) {
                leftWidth = 0;
            }
            _leftHotSpot.attr("width", leftWidth);

            // Right hot spot position and width change when slider moves.
            var rightWidth = _background.attr("width") - leftWidth;
            if (rightWidth < 0) {
                rightWidth = 0;
            }
            _rightHotSpot.attr("x", _leftHotSpot.attr("x") + leftWidth).attr("width", rightWidth);
        }

        // Private slider functions.
        //--------------------------

        function redrawSlider() {
            _slider.toFront();
            resetSliderLabelText();
        }

        // Position and time converted functions for slider.
        //--------------------------------------------------

        /**
         * Change time to the resolution time.
         *
         * Scaling and movement of elements may not provide exact times that correspond
         * resolution times. This ties to fix the value if it is not even to resolution.
         */
        function timeToResolution(time) {
            var resolution = getResolution();
            if (time !== undefined && time !== null && resolution) {
                // Use a little bit of a magic value here.
                // The time may be a little bit below correct value because of
                // position and scaling roundings. By adding a small time here
                // the time may increase just enough to create correct result
                // after flooring.
                time += Math.floor(resolution / 4);
                time -= time % resolution;
            }
            return time;
        }

        /**
         * @param {Integer} x X position of the left side of the slider relative to window origin.
         * @return {Integer} Time corresponding to the left side of the slider.
         */
        function posToTime(x) {
            // Container may not be located to the origin of the window.
            // Therefore, take the correct position into account.
            // Also notice, correct time should be identified by the tip position.
            var sliderOffset = getScaleAreaOffsetX() - _sliderConfig.sliderTipDx;
            var time = Math.floor(getStartTime() + ((x - sliderOffset) * getTimeScale()));
            if (time < getStartTime()) {
                time = getStartTime();

            } else if (time > getEndTime()) {
                time = getEndTime();
            }
            return time;
        }

        /**
         * @param {Integer} time Time in milliseconds.
         * @return {Integer} X position of the left side of the slider corresponding to the given time.
         */
        function timeToPos(time) {
            // Container may not be located to the origin of the window.
            // Also notice, correct time should be identified by the tip position.
            var sliderOffset = getScaleAreaOffsetX() - _sliderConfig.sliderTipDx;
            var deltaT = time - getStartTime();
            var timeScale = getTimeScale();
            var position = Math.floor(sliderOffset + ( timeScale ? deltaT / timeScale : 0 ));
            return position;
        }

        // Private scale functions.
        //-------------------------

        function redrawScaleBackground() {
            var obsWidth = getObsWidth();
            var fctWidth = getFctWidth();
            var bgWidth = obsWidth + fctWidth;
            _background.attr("x", _scaleConfig.x + getScalePadding()).attr("width", bgWidth);
            _obsBackground.attr("x", _scaleConfig.x + getScalePadding()).attr("width", obsWidth);
            _fctBackground.attr("x", _scaleConfig.x + getScalePadding() + obsWidth).attr("width", fctWidth);
        }

        /**
         * @param {Integer} x X position of the left side of the slider relative to parent origin, not necessary window.
         * @return {Integer} Time corresponding to the left side of the slider.
         */
        function scalePosToTime(x) {
            var time = Math.floor(getStartTime() + x * getTimeScale());
            if (time < getStartTime()) {
                time = getStartTime();

            } else if (time > getEndTime()) {
                time = getEndTime();
            }
            return time;
        }

        function redrawTimeCells() {
            while (_progressCellSet.length) {
                _progressCellSet.splice(0, 1)[0].remove();
            }
            var resolution = getResolution();
            if (resolution) {
                var begin = getStartTime();
                var end = getEndTime();
                var beginX = getScaleAreaX();
                var beginY = getScaleAreaY() + getScaleAreaHeight() - _scaleConfig.progressCellHeight - 1;
                var cellCount = Math.floor((end - begin) / resolution);
                var cellWidth = getScaleAreaWidth() / cellCount;
                for (var i = 0; i < cellCount; ++i) {
                    var cell = _paper.rect(beginX + i * cellWidth, beginY, cellWidth, _scaleConfig.progressCellHeight);
                    cell.attr("fill", _scaleConfig.bgColor).attr("stroke-width", "0");
                    // Notice, cell ID actually describes the time value in the end of the cell instead of the beginning.
                    // Therefore (i+1) is used. Then, when cell content is loaded, the cell that ends to the selected time
                    // is handled instead of handling cell ahead of the time.
                    cell.node.id = "animationProgressCell_" + (begin + (i + 1) * resolution);
                    _progressCellSet.push(cell);
                    jQuery(cell.node).bind('mousewheel', handleMouseScroll);
                }
            }
        }

        function getCellByTime(time) {
            var cell;
            for (var i = 0; i < _progressCellSet.length; ++i) {
                if (_progressCellSet[i].node.id === "animationProgressCell_" + time) {
                    cell = _progressCellSet[i];
                    cell.attr("fill", _scaleConfig.cellReadyColor);
                    break;
                }
            }
            return cell;
        }

        /**
         * Ticks and major tick labels.
         */
        function redrawTics() {
            while (_tickSet.length) {
                _tickSet.splice(0, 1)[0].remove();
            }
            var resolution = getResolution();
            if (resolution) {
                var begin = getStartTime();
                var end = getEndTime();
                var beginX = getScaleAreaX();
                var cellCount = Math.floor((end - begin) / resolution);
                var cellWidth = getScaleAreaWidth() / cellCount;
                var previousHours;
                for (var i = 0; i <= cellCount; ++i) {
                    var positionX = beginX + i * cellWidth;
                    var date = new Date(begin + i * resolution);
                    // Minor tick height as default.
                    var tickEndY = getScaleAreaHeight() - (_scaleConfig.height - _scaleConfig.bgHeight);
                    var newHour = date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
                    if (newHour || i === 0 || i === cellCount) {
                        // Exact hour, major tick.
                        tickEndY = getScaleAreaHeight() / 4;
                    }

                    if (tickEndY) {
                        var beginY = getScaleAreaY() + getScaleAreaHeight();
                        var tick = _paper.path("M" + positionX + "," + beginY + "V" + tickEndY);
                        tick.attr("stroke", Raphael.getRGB("white")).attr("opacity", 0.5);
                        _tickSet.push(tick);
                        jQuery(tick.node).bind('mousewheel', handleMouseScroll);
                        if (newHour && i < cellCount) {
                            var hourLabel = _paper.text(positionX + 2, getScaleAreaY() + 8, getTimeStr(date)).attr("text-anchor", "start").attr("font-family", _labelFontFamily).attr("font-size", _labelFontSize).attr("fill", Raphael.getRGB("black"));
                            // Check if the hourlabel fits into the scale area.
                            var hourLabelNode = jQuery(hourLabel.node);
                            if (hourLabelNode.offset().left + hourLabelNode.width() <= getScaleAreaOffsetX() + getScaleAreaWidth()) {
                                // Label fits. So, let it be in the UI.
                                _tickSet.push(hourLabel);
                                jQuery(hourLabel.node).bind('mousewheel', handleMouseScroll);

                            } else {
                                // Remove hour label because it overlaps the border.
                                hourLabel.remove();
                            }
                        }
                    }
                    previousHours = date.getHours();
                }
            }
        }

        /**
         * Common function for events that should clear cell color to default.
         */
        function progressCellColorToDefault(event) {
            var items = event.events;
            for (var i = 0; i < items.length; ++i) {
                var time = items[i].time.getTime();
                var cell = getCellByTime(time);
                if (cell) {
                    cell.attr("fill", _scaleConfig.bgColor);
                }
            }
        }

        // Animation event listener callbacks.
        //-----------------------------------
        function loadAnimationStartedCb(event) {
            progressCellColorToDefault(event);
        }

        function loadFrameStartedCb(event) {
            var items = event.events;
            for (var i = 0; i < items.length; ++i) {
                var time = items[i].time.getTime();
                var cell = getCellByTime(time);
                if (cell) {
                    cell.attr("fill", items[i].error ? _scaleConfig.cellErrorColor : _scaleConfig.cellLoadingColor);
                }
            }
        }

        function loadFrameCompleteCb(event) {
            var items = event.events;
            for (var i = 0; i < items.length; ++i) {
                var time = items[i].time.getTime();
                var cell = getCellByTime(time);
                if (cell) {
                    cell.attr("fill", items[i].error ? _scaleConfig.cellErrorColor : _scaleConfig.cellReadyColor);
                }
            }
        }

        function loadGroupProgressCb(event) {
            // No need to do anything here because frames are handled item by item
            // in loadFrameCompleteCb above.
        }

        function loadCompleteCb(event) {
            // No need to do anything here because items are handled already separately.
        }

        function animationFrameContentReleasedCb(event) {
            progressCellColorToDefault(event);
        }

        function frameChangedCb(event) {
            var items = event.events;
            for (var i = 0; i < items.length; ++i) {
                var time = items[i].time.getTime();
                // Propose change to controller which will direct change to slider.
                moveSliderTo(timeToPos(time));
            }
        }

        function getForecastStartTime() {
            return _model ? _model.getForecastStartTime() : 0;
        }

        function getStartTime() {
            return _model ? _model.getStartTime() : 0;
        }

        function getEndTime() {
            return _model ? _model.getEndTime() : 0;
        }

        function getResolution() {
            return _model ? _model.getResolution() : 0;
        }

        /**
         * @return X relative to the parent, not necessary a window.
         */
        function getScaleAreaX() {
            return _scaleContainer.getBBox().x + getScalePadding();
        }

        /**
         * @return Y relative to the parent, not necessary a window.
         */
        function getScaleAreaY() {
            return _scaleContainer.getBBox().y;
        }

        function getScaleAreaWidth() {
            return Math.floor(_scaleConfig.width - 2 * getScalePadding());
        }

        function getScaleAreaHeight() {
            return Math.floor(_scaleContainer.getBBox().height);
        }

        function getTimeScale() {
            return _model && getScaleAreaWidth() ? (_model.getEndTime() - _model.getStartTime()) / getScaleAreaWidth() : 1;
        }

        // Public functions.
        //------------------

        /**
         * See API for description.
         */
        function setTimeModel(model) {
            _model = model;
            model.addTimePeriodChangeListener({
                timePeriodChanged : function(start, end) {
                    redrawAll();
                }
            });

            model.addTimeSelectionChangeListener({
                selectedTimeChanged : function(time) {
                    moveSliderTo(timeToPos(time));
                }
            });

            model.addForecastStartTimeChangeListener({
                forecastStartTimeChanged : function(time) {
                    redrawScaleBackground();
                }
            });

            model.addAnimationEventsListener({
                loadAnimationStartedCb : loadAnimationStartedCb,
                loadFrameStartedCb : loadFrameStartedCb,
                loadFrameCompleteCb : loadFrameCompleteCb,
                loadGroupProgressCb : loadGroupProgressCb,
                loadCompleteCb : loadCompleteCb,
                animationFrameContentReleasedCb : animationFrameContentReleasedCb,
                frameChangedCb : frameChangedCb
            });

            redrawAll();
        }

        /**
         * See API for description.
         */
        function setTimeController(controller) {
            _timeController = controller;
        }

        /**
         * See API for description.
         */
        function remove() {
            _paper.remove();
        }

        // Public API functions
        //======================

        /**
         * Set time model that contains actual information data and listener functions
         * for the slider.
         *
         * @param {Object} model
         */
        this.setTimeModel = setTimeModel;

        /**
         * Set controller.
         *
         * @param {Object} controller
         */
        this.setTimeController = setTimeController;

        /**
         * Remove controller from DOM.
         */
        this.remove = remove;
    };

    return _constructor;
})();

// "use strict";

// Requires lodash
if ("undefined" === typeof _ || !_) {
    throw "ERROR: Lodash is required for fi.fmi.metoclient.ui.animator.Animator!";
}

// Requires jQuery
if ("undefined" === typeof jQuery || !jQuery) {
    throw "ERROR: jQuery is required for fi.fmi.metoclient.ui.animator.Animator!";
}

// Requires OpenLayers
if ("undefined" === typeof OpenLayers || !OpenLayers) {
    throw "ERROR: OpenLayers is required for fi.fmi.metoclient.ui.animator.Animator!";
}

if ("undefined" === typeof OpenLayers.Layer || "undefined" === typeof OpenLayers.Layer.Animation || "undefined" === typeof OpenLayers.Layer.Animation.Utils || !OpenLayers.Layer.Animation.Utils) {
    throw "ERROR: OpenLayers.Layer.Animation.Utils is required for fi.fmi.metoclient.ui.animator.Animator!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

if ("undefined" === typeof fi.fmi.metoclient.ui.animator.Controller || !fi.fmi.metoclient.ui.animator.Controller) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.Controller is required for fi.fmi.metoclient.ui.animator.Animator!";
}

/**
 * API functions are defined in the end of the constructor as priviledged functions.
 * See API description there.
 */
fi.fmi.metoclient.ui.animator.Animator = (function() {

    /**
     * Controller object.
     *
     * Same controller for all the Animator instances.
     * This will trigger and listen events to and from the OpenLayers animation element.
     */
    var MyController = {
        // Use OpenLayers events as a controller and this singleton object as its container.
        events : new OpenLayers.Events(this)
    };

    /**
     * Deep clone callback function for lodash.
     *
     * Same clone function for all the Animator instances.
     *
     * @param value Value that should be deep cloned.
     * @return Clone value. {undefined} if lodash should handle value.
     */
    function cloneDeepCallback(value) {
        var cloneValue;
        if (_.isObject(value) && _.isFunction(value.clone)) {
            cloneValue = value.clone();
        }
        return cloneValue;
    }

    /**
     * Constructor for the instance.
     *
     * Notice, this constructor is returned from {fi.fmi.metoclient.ui.animator.Animator}
     * and can be used for instantiation later.
     */
    var _constructor = function() {
        // Reference to the connection instance object.
        var _me = this;

        // Private variables.
        //-------------------

        // Options that contain for example div IDS.
        var _options;
        var _config;

        // Set when operation is going on.
        var _requestAnimationTime;

        // Keeps track of the current time.
        var _currentTime;

        // Animation listeners are added here during registration.
        var _animationEventsListeners = [];

        // Legend resize function is set to this member variable
        // when new legends are created. By using this member variable,
        // multiple functions are not set if legends are created multiple times.
        var _legendResize;

        // Keeps track of the layers that are loading data.
        // Then, progress bar can be shown accordingly.
        var _loadingLayers = [];

        // Animation controller is set here during initialization.
        var _animationController;
        // Resize function is set to this member variable
        // when new controller is created. By using this member variable,
        // multiple functions are not set if controllers are created multiple times.
        var _animationControllerResize;

        // List of timeouts that should be cleared
        // if reset occurs before timeouts finish.
        var _resetClearTimeouts = [];

        // OpenLayers Animation events and corresponding callbacks.
        // Animation events are forwarded to these functions.
        var _events = {
            scope : this,
            // These are defined here to show which events are used.
            // Actual functions are set for these parameters later.
            animationloadstarted : undefined,
            frameloadstarted : undefined,
            frameloadcomplete : undefined,
            animationloadgroupprogress : undefined,
            animationloadcomplete : undefined,
            animationframecontentreleased : undefined,
            framechanged : undefined
        };

        // OpenLayers Animation layer event callbacks.
        //--------------------------------------------

        _events.animationloadstarted = function(event) {
            progressbarLoadStarted(event.layer);
            firePause();
            jQuery.each(_animationEventsListeners, function(index, value) {
                value.loadAnimationStartedCb(event);
            });
        };

        _events.frameloadstarted = function(event) {
            jQuery.each(_animationEventsListeners, function(index, value) {
                value.loadFrameStartedCb(event);
            });
        };

        _events.frameloadcomplete = function(event) {
            jQuery.each(_animationEventsListeners, function(index, value) {
                value.loadFrameCompleteCb(event);
            });
        };

        _events.animationloadgroupprogress = function(event) {
            jQuery.each(_animationEventsListeners, function(index, value) {
                value.loadGroupProgressCb(event);
            });
        };

        _events.animationloadcomplete = function(event) {
            progressbarLoadComplete(event.layer);
            firePlay();
            jQuery.each(_animationEventsListeners, function(index, value) {
                value.loadCompleteCb(event);
            });
        };

        _events.animationframecontentreleased = function(event) {
            progressbarLoadComplete(event.layer);
            jQuery.each(_animationEventsListeners, function(index, value) {
                value.animationFrameContentReleasedCb(event);
            });
        };

        _events.framechanged = function(event) {
            jQuery.each(_animationEventsListeners, function(index, value) {
                value.frameChangedCb(event);
            });
        };

        // Set and handle window events in this single place.
        //---------------------------------------------------

        jQuery(window).resize(function(e) {
            // Use the function wrappers if they have been set.
            if (_legendResize) {
                _legendResize();
            }
            if (_animationControllerResize) {
                _animationControllerResize();
            }
        });

        // Private functions.
        //-------------------

        // Utils functions.
        //-----------------

        /**
         * Create debounce function from the given function.
         *
         * @param {Function} f Function for debounce.
         *                     May be {undefined} or {null}.
         * @return {Function} Debounce function.
         *                    May be {undefined} if {f} is not a function.
         */
        function createDebounce(f) {
            var debounce;
            if (_.isFunction(f)) {
                debounce = _.debounce(f, 10, {
                    maxWait : 100
                });
            }
            return debounce;
        }

        // Functions that handle events.
        //------------------------------

        /**
         * Update progressbar after layer has started loading.
         *
         * @param {OpenLayers.Layer} layer Layer that has started loading.
         *                                 May be {undefined} or {null}.
         */
        function progressbarLoadStarted(layer) {
            if (layer && -1 === jQuery.inArray(layer, _loadingLayers)) {
                if (!_loadingLayers.length) {
                    // First layer to start loading.
                    // So, start showing progressbar.
                    jQuery(".animatorLoadProgressbar").show();
                }
                // Layer was not in the loading array yet.
                _loadingLayers.push(layer);
            }
        }

        /**
         * Update progressbar after layer has completed loading.
         *
         * @param {OpenLayers.Layer} layer Layer that has completed loading.
         *                                 May be {undefined} or {null}.
         */
        function progressbarLoadComplete(layer) {
            if (layer && _loadingLayers.length) {
                var layerIndex = jQuery.inArray(layer, _loadingLayers);
                if (-1 !== layerIndex) {
                    // Remove layer from loading layers array.
                    _loadingLayers.splice(layerIndex, 1);
                    if (!_loadingLayers.length) {
                        // No loading layers left.
                        // So, stop showing progressbar.
                        jQuery(".animatorLoadProgressbar").hide();
                    }
                }
            }
        }

        // Functions that provide animation default initialization values.
        //----------------------------------------------------------------

        /**
         * @return {Date} Begin date should be gotten from the configuration.
         *                Otherwise, {undefined}.
         */
        function getBeginDate() {
            return _config.getAnimationBeginDate();
        }

        /**
         * @return {Date} Begin date should be gotten from the configuration.
         *                Otherwise, {undefined}.
         */
        function getEndDate() {
            return _config.getAnimationEndDate();
        }

        /**
         * @return {Integer} Animation resolution should be gotten from the configuration.
         *                   Otherwise, {undefined}.
         */
        function getResolution() {
            return _config.getAnimationResolution();
        }

        // UI component handler functions.
        //--------------------------------

        function setPlayAndPause() {
            if (_options) {
                // Add play and pause button handler.
                // Flag to keep drag if pause or play should be used.
                var playCtrl = jQuery("#" + _options.playAndPauseDivId);
                if (playCtrl.length) {
                    playCtrl.click(function() {
                        if (_requestAnimationTime !== undefined) {
                            firePause();

                        } else {
                            firePlay();
                        }
                    });
                }
                // Initialize image.
                // Notice, pause and play actions update images in those functions.
                setPlayAndPauseImage();
            }
        }

        function setPlayAndPauseImage() {
            if (_options) {
                var playCtrl = jQuery("#" + _options.playAndPauseDivId);
                if (playCtrl.length) {
                    // Switch the background image between pause and play.
                    var currentImage = playCtrl.css("background-image");
                    if (_requestAnimationTime !== undefined) {
                        currentImage = currentImage.replace("play.png", "pause.png");
                        playCtrl.css("background-image", currentImage);

                    } else {
                        currentImage = currentImage.replace("pause.png", "play.png");
                        playCtrl.css("background-image", currentImage);
                    }
                }
            }
        }

        // Controller functions that call registered listener functions.
        //--------------------------------------------------------------

        function changeToNextFrame() {
            if (_currentTime === undefined) {
                _currentTime = getBeginDate().getTime();

            } else {
                var deltaTime = getResolution();
                _currentTime = _currentTime + deltaTime > getEndDate().getTime() ? getBeginDate().getTime() : _currentTime + deltaTime;
            }
            MyController.events.triggerEvent("timechanged", {
                time : _currentTime
            });
        }

        function changeToPreviousFrame() {
            if (_currentTime === undefined) {
                _currentTime = getBeginDate().getTime();

            } else {
                var deltaTime = getResolution();
                _currentTime = _currentTime - deltaTime < getBeginDate().getTime() ? getEndDate().getTime() : _currentTime - deltaTime;
            }
            MyController.events.triggerEvent("timechanged", {
                time : _currentTime
            });
        }

        /**
         * Inform listeners about the period change.
         */
        function fireTimePeriodChanged(startTime, endTime, listeners) {
            jQuery.each(listeners, function(index, value) {
                value.timePeriodChanged(startTime, endTime);
            });
        }

        /**
         * Inform listeners that new time is selected.
         */
        function fireSelectedTimeChanged(time, listeners) {
            // Because time change is proposed from outside.
            // Also, make sure animation is updated accordingly.
            _currentTime = time instanceof Date ? time.getTime() : time;
            MyController.events.triggerEvent("timechanged", {
                time : time
            });
            jQuery.each(listeners, function(index, value) {
                value.selectedTimeChanged(time);
            });
        }

        /**
         * Animation should be started.
         */
        function firePlay() {
            if (_requestAnimationTime === undefined) {
                _requestAnimationTime = new Date();
                setPlayAndPauseImage();
                // Start to play animation.
                playAnimation();
            }
        }

        /**
         * Animation should be paused.
         */
        function firePause() {
            if (_requestAnimationTime !== undefined) {
                _requestAnimationTime = undefined;
                setPlayAndPauseImage();
            }
        }

        /**
         * Handle animation loop until stopped by events.
         *
         * See, {firePlay} and {firePause} functions.
         */
        function playAnimation() {
            if (_requestAnimationTime !== undefined && _config) {
                // Loop this until stopped
                requestAnimationFrame(playAnimation);
                // Request animation loops at certain vague frame rate.
                // The requestAnimationFrame loops at time periods that are not
                // really exact. It may be at around 60 fps but may also be much less.
                var currentDate = new Date();
                if (_requestAnimationTime.getTime() + _config.getAnimationFrameRate() < currentDate.getTime()) {
                    // Reset counter because time has passed or animation flow has just been started.
                    _requestAnimationTime = currentDate;
                    // Show next frame, as long as animation is going on.
                    // This will call animation layers and callback will inform controller.
                    changeToNextFrame();
                }
            }
        }

        /**
         * Show next frame of the animation.
         */
        function fireNextFrame() {
            // Trigger event for animator.
            // Notice, when animator handles the event, it also gives the callback event back.
            // Then, the flow automatically continues also here.
            firePause();
            changeToNextFrame();
        }

        /**
         * Show previous frame of the animation.
         */
        function firePreviousFrame() {
            // Trigger event for animator.
            // Notice, when animator handles the event, it also gives the callback event back.
            // Then, the flow automatically continues also here.
            firePause();
            changeToPreviousFrame();
        }

        // Functions to create and to set components for UI.
        //--------------------------------------------------

        /**
         * Fetch legend content from the server and set it into the UI element.
         *
         * @param contentContainer Container into which content is inserted.
         * @param view The element that is used to show selected legend in a bigger dimensions.
         * @param legendInfoObject Object that contains legend information properties.
         * @param select Flag to inform if legend should be set selected.
         */
        function fetchLegendContent(contentContainer, view, legendInfoObject, select) {
            var item = jQuery('<div class="scroll-content-item ui-widget-header"></div>');
            item.css("background-image", "url('" + legendInfoObject.url + "')");
            // Notice, selected class may change the size of the border larger.
            // Therefore, add class before counting container dimensions below.
            if (select) {
                item.addClass("selectedLegend");
                // Set the thumbnail image to view for bigger area.
                view.css("background-image", item.css("background-image"));
            }
            // Content container width is zero before first element is included in it.
            // Initial container width is increased a little bit here. Then, container
            // width has some flexibility in it and it is wide enough for floating elements
            // in all cases.
            var prevContentContainerWidth = contentContainer.width() || 2;
            // Append item to container before checking widths.
            // Then, width query gives a proper result for new dimensions.
            contentContainer.append(item);
            // Make sure content container is wide enough.
            var minWidth = prevContentContainerWidth + item.outerWidth(true);
            if (contentContainer.width() < minWidth) {
                // Update the container width to match the content.
                // Then, float does not change the line for item.
                contentContainer.width(minWidth);
            }
            item.click(function(event) {
                if (!item.hasClass("selectedLegend")) {
                    // Remove possible other selections.
                    jQuery(".scroll-content-item").removeClass("selectedLegend");
                    item.addClass("selectedLegend");
                    // Set the thumbnail image to view for bigger area.
                    view.css("background-image", item.css("background-image"));
                }
            });
        }

        /**
         * Create legend slider components for legend thumbnails.
         */
        function createLegendSlider() {
            // scrollpane parts
            var scrollPane = jQuery(".scroll-pane");
            var scrollContent = jQuery(".scroll-content");

            // Make sure that content width is always at least the outer width of the pane.
            // Then, floating works properly when window is resized and dimensions change.
            if (scrollContent.width() < scrollPane.outerWidth(true)) {
                scrollContent.width(scrollPane.outerWidth(true));
            }

            // build slider
            var scrollbar = jQuery(".scroll-bar").slider({
                slide : function(event, ui) {
                    if (scrollContent.width() > scrollPane.width()) {
                        scrollContent.css("margin-left", Math.round(ui.value / 100 * (scrollPane.width() - scrollContent.width())) + "px");

                    } else {
                        scrollContent.css("margin-left", 0);
                    }
                }
            });

            // append icon to handle
            var handleHelper = scrollbar.find(".ui-slider-handle").mousedown(function() {
                scrollbar.width(handleHelper.width());
            }).mouseup(function() {
                scrollbar.width("100%");
            }).append("<span class='ui-icon ui-icon-grip-dotted-vertical'></span>").wrap("<div class='ui-handle-helper-parent'></div>").parent();

            // change overflow to hidden now that slider handles the scrolling
            scrollPane.css("overflow", "hidden");

            // Reset slider value based on scroll content position.
            var resetValue = function() {
                var remainder = scrollPane.width() - scrollContent.width();
                if (remainder > 0) {
                    remainder = 0;
                }
                var leftVal = scrollContent.css("margin-left") === "auto" ? 0 : parseInt(scrollContent.css("margin-left"), 10);
                var percentage = !remainder ? 0 : Math.round(leftVal / remainder * 100);
                scrollbar.slider("value", percentage);
            };

            // If the slider is 100% and window gets larger, reveal content.
            // Also, scale content if window is resized in any case.
            var reflowContent = function() {
                if (scrollContent.width() > scrollPane.width()) {
                    var showing = scrollContent.width() + parseInt(scrollContent.css("margin-left"), 10);
                    var gap = scrollPane.width() - showing;
                    if (gap > 0) {
                        scrollContent.css("margin-left", (parseInt(scrollContent.css("margin-left"), 10) + gap) + "px");
                    }

                } else {
                    scrollContent.css("margin-left", 0);
                }
            };

            // Size scrollbar and handle proportionally to scroll distance.
            var sizeScrollbar = function() {
                var remainder = scrollContent.width() - scrollPane.width();
                if (remainder < 0) {
                    remainder = 0;
                }
                var proportion = remainder / scrollContent.width();
                var handleSize = scrollPane.width() - (proportion * scrollPane.width());
                scrollbar.find(".ui-slider-handle").css({
                    width : Math.floor(handleSize),
                    "margin-left" : -Math.floor(handleSize / 2)
                });
                handleHelper.width(Math.floor(scrollbar.width() - handleSize));
            };

            // Define new resize function because new slider is initialized.
            // Member variable is used to avoid multiple resizes if slider is recreated.
            // Use debounce to limit frequency of component redraw operations.
            _legendResize = createDebounce(function() {
                // Change handle position on window resize.
                resetValue();
                reflowContent();
                sizeScrollbar();
            });

            // Init scrollbar size.
            // Safari wants a timeout.
            var sizeScrollbarTimeout = setTimeout(function() {
                sizeScrollbar();
                _resetClearTimeouts.splice(_resetClearTimeouts.indexOf(sizeScrollbarTimeout), 1);
                sizeScrollbarTimeout = undefined;
            }, 10);
            _resetClearTimeouts.push(sizeScrollbarTimeout);
        }

        /**
         * Initialize legend slider for legend thumbnails.
         *
         * Notice, slider should be initialized only after thumbnails content is already in its place.
         */
        function initLegendSlider() {
            // Create the actual slider component.
            // Notice, the window resize listener has already been set during animator construction.
            createLegendSlider();
        }

        /**
         * Set legends corresponding to the given layers.
         *
         * @param {String} legendDivId Identifier for legend container.
         * @param {[]} Array of layers for legends.
         */
        function setLegend(legendDivId, layers) {
            if (legendDivId) {
                var i;
                var j;
                var layer;
                var legendInfo;
                var infoObject;
                var legendView;
                var legend = jQuery("#" + legendDivId);
                // Make sure element is empty before appending possible new content.
                legend.empty();
                // Check if there are any legends configured.
                var legendCount = 0;
                for ( i = 0; i < layers.length; ++i) {
                    layer = layers[i];
                    // Check that layer provides legend info getter.
                    // All of the layers may not be animation layers.
                    if (layer.getVisibility() && layer.getLegendInfo) {
                        legendInfo = layer.getLegendInfo();
                        for ( j = 0; j < legendInfo.length; ++j) {
                            infoObject = legendInfo[j];
                            if (infoObject.hasLegend) {
                                // At least one layer has some URL set for legend.
                                ++legendCount;
                            }
                        }
                    }
                }
                if (!legendCount) {
                    // There is no legend available.
                    // Set the corresponding classes for animation and legend elements.
                    legend.addClass("animatorLegendNoLegend");
                    if (_options.animationDivId) {
                        jQuery("#" + _options.animationDivId).addClass("animatorAnimationNoLegend");
                    }

                } else if (1 === legendCount) {
                    // Make sure possible previously set different state classes are removed.
                    legend.removeClass("animatorLegendNoLegend");
                    if (_options.animationDivId) {
                        // Legends div is available. So, make sure legend div is shown.
                        jQuery("#" + _options.animationDivId).removeClass("animatorAnimationNoLegend");
                    }
                    // There is only one legend.
                    // Set the corresponding classes for animation and legend elements.
                    legendView = jQuery('<div class="animatorLegendView animatorLegendViewOne"></div>');
                    legend.append(legendView);
                    // Set the one legend as background image for the view.
                    for ( i = 0; i < layers.length; ++i) {
                        layer = layers[i];
                        // Check that layer provides legend info getter.
                        // All of the layers may not be animation layers.
                        if (layer.getVisibility() && layer.getLegendInfo) {
                            legendInfo = layer.getLegendInfo();
                            for ( j = 0; j < legendInfo.length; ++j) {
                                infoObject = legendInfo[j];
                                if (infoObject.hasLegend) {
                                    legendView.css("background-image", "url('" + infoObject.url + "')");
                                    // There can be only one.
                                    break;
                                }
                            }
                        }
                    }

                } else {
                    // Make sure possible previously set different state classes are removed.
                    legend.removeClass("animatorLegendNoLegend");
                    if (_options.animationDivId) {
                        // Legends div is available. So, make sure legend div is shown.
                        jQuery("#" + _options.animationDivId).removeClass("animatorAnimationNoLegend");
                    }
                    // Some legends are available. So, create legend components.
                    var legendThumbnails = jQuery('<div class="animatorLegendThumbnails"></div>');
                    legendThumbnails.append('<div class="scroll-pane ui-widget ui-widget-header ui-corner-all"><div class="scroll-content"></div><div class="scroll-bar-wrap ui-widget-content ui-corner-bottom"><div class="scroll-bar"></div></div></div>');
                    legend.append(legendThumbnails);
                    legendView = jQuery('<div class="animatorLegendView"></div>');
                    legend.append(legendView);
                    var contentContainer = jQuery(".scroll-content");
                    var firstSelected = false;
                    for ( i = 0; i < layers.length; ++i) {
                        layer = layers[i];
                        // Check that layer provides legend info getter.
                        // All of the layers may not be animation layers.
                        if (layer.getVisibility() && layer.getLegendInfo) {
                            legendInfo = layer.getLegendInfo();
                            for ( j = 0; j < legendInfo.length; ++j) {
                                infoObject = legendInfo[j];
                                if (infoObject.hasLegend) {
                                    fetchLegendContent(contentContainer, legendView, infoObject, !firstSelected);
                                    firstSelected = true;
                                }
                            }
                        }
                    }
                    // Initialize slider for legend after items have been inserted there.
                    initLegendSlider();
                }

            } else if (_options.animationDivId) {
                // Legends div is not available. So, use the whole area for animation.
                jQuery("#" + _options.animationDivId).addClass("animatorAnimationNoLegend");
            }
        }

        /**
         * Set animation legend event listener for animation layers.
         *
         * @param {[]} Array of layers for legends.
         */
        function setAnimationLegendEventListener(layers) {
            // Notice, legends are available only after animation layer load is started.
            // Depending on the configuration, loading may be started when animation layer
            // is added to the map. Then, loading is started asynchronously.
            if (_options.legendDivId) {
                var legendTimeout;
                var legendEventHandler = function(event) {
                    // Use small timeout to make sure legends are not set too close to each other
                    // if multiple actions of same kind are started in a group.
                    if (undefined === legendTimeout) {
                        legendTimeout = setTimeout(function() {
                            setLegend(_options.legendDivId, layers);
                            _resetClearTimeouts.splice(_resetClearTimeouts.indexOf(legendTimeout), 1);
                            legendTimeout = undefined;
                        }, 100);
                        _resetClearTimeouts.push(legendTimeout);
                    }
                };
                var events = {
                    visibilitychanged : legendEventHandler,
                    added : legendEventHandler,
                    removed : legendEventHandler
                };
                for (var i = 0; i < layers.length; ++i) {
                    var layer = layers[i];
                    // Check that layer provides legend info getter.
                    // All of the layers may not be animation layers.
                    if (layer.events && layer.getLegendInfo) {
                        // Register to listen animation legend related events.
                        layer.events.on(events);
                    }
                }
            }
        }

        /**
         * Set OpenLayers layer switcher.
         */
        function setupSwitcher(map, layerSwitcherDivId, maximizeSwitcher) {
            if (map) {
                var layerSwitcherOptions;
                if (layerSwitcherDivId) {
                    layerSwitcherOptions = {
                        div : OpenLayers.Util.getElement(layerSwitcherDivId)
                    };
                }

                // Create switcher by using the given options
                // that may contain div that exists outside of the map.
                var switcher = new OpenLayers.Control.LayerSwitcher(layerSwitcherOptions);

                map.addControl(switcher);

                if (!maximizeSwitcher) {
                    // Make sure switcher is minimized in the beginning.
                    switcher.minimizeControl();
                }

                // Notice, there is no need to handle maximize and minimize separately here.
                // OpenLayers handles it automatically, but .maximizeDiv and .minimizeDiv needs
                // to be set properly in css to make this work. Especially, .maximizeDiv should be
                // set properly outside of the map div to make it show.
            }
        }

        /**
         * Set given layers into the map.
         * Also, register layers and controller to listen events.
         *
         * @param {OpenLayers.Map} map Map that will contain the given layers.
         * @param [{OpenLayers.Layer}] layers Array of layers that will be added to the map.
         */
        function setLayers(map, layers) {
            for (var i = 0; i < layers.length; ++i) {
                var layer = layers[i];
                if (layer.registerController) {
                    // Layer has the required function.
                    // Register layer to listen animation related controller events.
                    layer.registerController(MyController.events);
                }
                if (layer.events) {
                    // Register to listen animation events.
                    layer.events.on(_events);
                }
                // Add layer to map.
                // Notice, this also starts the animation if
                // autoload and autostart have been defined for configuration.
                map.addLayer(layer);
            }
        }

        /**
         * Set layers into the map.
         */
        function setMapAndLayers() {
            if (_options.animationDivId) {
                // Add progressbar element.
                var loadProgressbar = jQuery('<div class="animatorLoadProgressbar"></div>');
                jQuery("#" + _options.animationDivId).append(loadProgressbar);
                loadProgressbar.progressbar({
                    value : false
                });
                // Make sure progress bar element is hidden as default.
                loadProgressbar.hide();
            }
            if (_options.mapDivId) {
                var map = _config.getMap();
                if (map) {
                    // Render map to its position.
                    map.render(_options.mapDivId);
                    var layers = _config.getLayers();
                    if (layers) {
                        setAnimationLegendEventListener(layers);
                        setLayers(map, layers);
                    }
                    // Zoom the map after layers have been inserted.
                    map.setCenter(map.getCenter(), _config.getDefaultZoomLevel());
                    setupSwitcher(map, _options.layerSwitcherDivId, _options.maximizeSwitcher);
                }
            }
        }

        /**
         * Remove controller from DOM.
         */
        function resetCtrl() {
            if (_animationController) {
                _animationController.remove();
                _animationController = undefined;
                _animationControllerResize = undefined;
            }
        }

        /**
         * Create controller.
         *
         * This is called from {createController} function after required checks have been done.
         *
         * @param  {Object} ctrls jQuery object for controller elements.
         *                        May not be {undefined} or {null}.
         * @param {Object} timeModel Time model that is set for controller.
         *                            May not be {undefined} or {null}.
         * @param {Object} timeController Time controller that is set for controller.
         *                                May not be {undefined} or {null}.
         * @return {fi.fmi.metoclient.ui.animator.Controller} New controller object.
         *                                                    May not be {undefined} or {null}.
         */
        function createCtrl(ctrls, timeModel, timeController) {
            var ac = new fi.fmi.metoclient.ui.animator.Controller(ctrls[0], ctrls.width(), ctrls.height());
            ac.setTimeModel(timeModel);
            ac.setTimeController(timeController);
            return ac;
        }

        /**
         * Create time controller and set it into the UI according to the options that have been set during init.
         */
        function createController() {
            if (!_options || !_options.controllerDivId || !_options.playAndPauseDivId) {
                throw "ERROR: Options or properties missing for controller!";
            }

            // Do not create controller if animation has not defined any time period for frames.
            // If no period is given, then only show currently given layers.
            if (getBeginDate() !== undefined && getEndDate() !== undefined) {
                var ctrlSelector = "#" + _options.controllerDivId;
                var ctrls = jQuery(ctrlSelector);
                if (ctrls.length) {
                    var currentTime = (new Date()).getTime();
                    var startTime = getBeginDate().getTime();
                    var endTime = getEndDate().getTime();
                    // Forecast start time.
                    // If end time is less than current time, then forecast is not used and value is left undefined.
                    var fctStart = currentTime <= endTime ? currentTime : undefined;
                    var timePeriodListeners = [];
                    var timeSelectionListeners = [];
                    var fctStartTimeListeners = [];
                    var tickIntervalListeners = [];

                    // Model is used by animation controller to setup slider according to the animation settings.
                    var timeModel = {
                        getStartTime : function() {
                            return startTime;
                        },
                        getEndTime : function() {
                            return endTime;
                        },
                        getResolution : function() {
                            return getResolution();
                        },
                        getForecastStartTime : function() {
                            return fctStart;
                        },
                        addTimePeriodChangeListener : function(l) {
                            timePeriodListeners.push(l);
                        },
                        addTimeSelectionChangeListener : function(l) {
                            timeSelectionListeners.push(l);
                        },
                        addAnimationEventsListener : function(l) {
                            _animationEventsListeners.push(l);
                        },
                        addForecastStartTimeChangeListener : function(l) {
                            fctStartTimeListeners.push(l);
                        },
                        addTickIntervalChangeListener : function(l) {
                            tickIntervalListeners.push(l);
                        }
                    };

                    // Animation controller may use these callback functions to inform
                    // if animation state should be changed because of the actions in the slider.
                    var timeController = {
                        proposeTimePeriodChange : function(startTime, endTime) {

                        },
                        proposeTimeSelectionChange : function(time) {
                            if ((time >= startTime) && (time <= endTime)) {
                                // Make sure steps are in given resolutions.
                                time = time - time % getResolution();
                                fireSelectedTimeChanged(time, timeSelectionListeners);
                            }
                        },
                        proposeNextFrame : function() {
                            fireNextFrame();
                        },
                        proposePreviousFrame : function() {
                            firePreviousFrame();
                        },
                        proposePause : function() {
                            firePause();
                        }
                    };

                    _animationController = createCtrl(ctrls, timeModel, timeController);

                    // Bind to listen for width changes in element to update
                    // controller if necessary. Width is defined as relative
                    // in CSS but height is static.
                    var width = ctrls.width();
                    // Notice, the window resize listener has already been set during animator construction.
                    // Use debounce to limit frequency of component redraw operations.
                    _animationControllerResize = createDebounce(function() {
                        var currentWidth = jQuery(ctrlSelector).width();
                        if (currentWidth !== width) {
                            width = currentWidth;
                            // Simply replace old with a new controller.
                            _animationController.remove();
                            _animationController = createCtrl(ctrls, timeModel, timeController);
                        }
                    });

                    setPlayAndPause();
                }
            }
        }

        /**
         * Remove animator structure from DOM.
         */
        function resetStructure() {
            if (_options) {
                // Notice, _options.animatorContainerDivId is not emptied here.
                // That element is created outside of animator and may also contain
                // some additional elements that are not part of animator. Therefore,
                // only elements that have been created by animator are removed here.
                if (_options.animatorContainerDivId) {
                    // If animator container has been defined, a default structure is used.
                    // Then, removal of the animator container will remove the whole structure.
                    // The structure is created under animator class element during initialization.
                    jQuery("#" + _options.animatorContainerDivId + " > .animator").remove();

                } else {
                    // Default structure is not used. Therefore, every element is removed separately.
                    if (_options.animationDivId) {
                        jQuery("#" + _options.animationDivId).remove();
                    }
                    if (_options.mapDivId) {
                        jQuery("#" + _options.mapDivId).remove();
                    }
                    if (_options.layerSwitcherDivId) {
                        jQuery("#" + _options.layerSwitcherDivId).remove();
                    }
                    if (_options.controllerDivId) {
                        jQuery("#" + _options.controllerDivId).remove();
                    }
                    if (_options.playAndPauseDivId) {
                        jQuery("#" + _options.playAndPauseDivId).remove();
                    }
                    if (_options.logoDivId) {
                        jQuery("#" + _options.logoDivId).remove();
                    }
                    if (_options.legendDivId) {
                        jQuery("#" + _options.legendDivId).remove();
                    }
                }
            }
        }

        /**
         * Create animation structure into DOM according to given {options} and update element IDs in {options}.
         *
         * @param {Object} options Reference to object to update ID properties for the animator elements.
         *                         May be {undefined} or {null} but then operation is ignored.
         */
        function createStructure(options) {
            // Default animator element structure is used and appended into container
            // if options object provides animatorContainerDivId.
            if (options && options.animatorContainerDivId) {
                // Notice, this HTML structure is given in API comments in more readable format.
                var defaultStructure = jQuery('<div class="animator"><div class="animatorAnimation" id="animatorAnimationId"><div class="animatorMap" id="animatorMapId"><div class="animatorLogo" id="animatorLogoId"></div><div class="animatorPlayAndPause" id="animatorPlayAndPauseId"></div></div><div class="animatorController" id="animatorControllerId"></div><div class="animatorLayerSwitcher" id="animatorLayerSwitcherId"></div></div><div class="animatorLegend" id="animatorLegendId"></div></div>');
                jQuery("#" + options.animatorContainerDivId).append(defaultStructure);
                // Set animator IDs for options because container is given and default should be used.
                // Notice, if options contain some of the values, they are overwritten here.
                options.animationDivId = "animatorAnimationId";
                options.mapDivId = "animatorMapId";
                options.layerSwitcherDivId = "animatorLayerSwitcherId";
                options.controllerDivId = "animatorControllerId";
                options.playAndPauseDivId = "animatorPlayAndPauseId";
                options.logoDivId = "animatorLogoId";
                options.legendDivId = "animatorLegendId";
            }
        }

        // Public functions for API.
        //--------------------------

        /**
         * See API for function description.
         */
        function getConfig() {
            return _config;
        }

        /**
         * See API for function description.
         */
        function refresh() {
            // Handle refresh operation same way as window resize event.
            // Notice, jQuery does not seem to provide easy way to listen for
            // resize events targeted directly to div-elements. Therefore,
            // corresponding event is launched here by a separate call to
            // make sure all the necessary components are resized if necessary.
            jQuery(window).resize();
        }

        /**
         * See API for function description.
         */
        function reset() {
            if (_config) {
                var map = _config.getMap();
                if (map) {
                    // Notice, map needs to be destroyed
                    // before container is removed from DOM.
                    map.destroy();
                }
            }

            // Clear possible timeouts.
            while (_resetClearTimeouts.length) {
                clearTimeout(_resetClearTimeouts.pop());
            }

            // Empty arrays.
            _animationEventsListeners = [];
            _loadingLayers = [];

            // Reset member variables.
            _requestAnimationTime = undefined;
            _currentTime = undefined;
            _legendResize = undefined;

            // Reset the DOM structure.
            resetStructure();
            resetCtrl();

            // Reset options and configurations.
            _config = undefined;
            _options = undefined;
        }

        /**
         * See API for function description.
         */
        function init(options) {
            if (!_options && options) {
                // Set options and create config only once.
                _options = options;
                // Configuration object is deep cloned here.
                // Then, if properties are changed during the flow, the content of the original object is not changed.
                _config = new fi.fmi.metoclient.ui.animator.Factory(_.cloneDeep(options.config || fi.fmi.metoclient.ui.animator.Config, cloneDeepCallback));

                // Create animation structure for the content.
                createStructure(options);

                // Use options and configuration object to set map and layers.
                setMapAndLayers();

                // Create slider. Notice, this will set itself according to the options.
                createController();
            }
            return _me;
        }

        //=================================================================
        // Public Connection API is defined here as priviledged functions.
        //=================================================================

        /**
         * Initialize animator with given options.
         *
         * Notice, if animator should be reinitialized with new configuration,
         * {reset} should be called before calling {init} again.
         *
         * Default animator element structure is used and appended into container
         * if options object provides {animatorContainerDivId}.
         *
         * The default HTML structure for container content:
         *        <div class="animator">
         *            <div class="animatorAnimation" id="animatorAnimationId">
         *                <div class="animatorMap" id="animatorMapId">
         *                    <!-- Animator map here. -->
         *                    <div class="animatorLogo" id="animatorLogoId">
         *                        <!-- Animator logo here -->
         *                    </div>
         *                    <div class="animatorPlayAndPause" id="animatorPlayAndPauseId">
         *                        <!-- Animator play and pause button here -->
         *                    </div>
         *                </div>
         *                <div class="animatorController" id="animatorControllerId">
         *                    <!-- Animator controller here. -->
         *                </div>
         *                <div class="animatorLayerSwitcher" id="animatorLayerSwitcherId">
         *                    <!-- Animator map layer ctrl is inserted here.
         *                    Notice, there is no need to add maximize and minimize div separately here.
         *                    OpenLayers handles it automatically, but .maximizeDiv and .minimizeDiv needs
         *                    to be set properly in css to make this work. Especially, .maximizeDiv should be
         *                    set properly if it exists outside of the map div to make it show. Also notice,
         *                    this element is located in HTML after map div here. Then, the switcher is shown
         *                    on top of map layers if controller is located on the map area. -->
         *                </div>
         *            </div>
         *            <div class="animatorLegend" id="animatorLegendId">
         *                <!-- Animator legend here -->
         *            </div>
         *        </div>
         *
         * Notice, options may also define alternative places for some of the elements
         * if {animatorContainerDivId} is not given and an alternative HTML structure is used.
         * Element content is not inserted if {undefined}, {null}, or empty is set for ID value.
         * Also notice, if {animatorContainerDivId} is given, it will always replace other div
         * options by default values.
         *
         * @param {Object} options { animatorContainerDivId: {String},
         *                           animationDivId: {String},
         *                           mapDivId: {String}, layerSwitcherDivId: {String},
         *                           controllerDivId : {String}, playAndPauseDivId : {String},
         *                           logoDivId : {String}, maximizeSwitcher: {Boolean},
         *                           legendDivId : {String},
         *                           config : {Object} }
         *                         May be {undefined} or {null}. But, then initialization is ignored.
         * @return {this} Reference to this This instance.
         */
        this.init = init;

        /**
         * Release existing animator content that has previously been initialized by {init}.
         *
         * Notice, animator needs to be initialized after reset by calling {init} if animator
         * should have and show new content.
         */
        this.reset = reset;

        /**
         * Refresh animator components.
         *
         * This function is provided to make sure that all the animator components, such as
         * the animation controller, are resized properly if container dimensions are changed.
         *
         * Notice, window resize is handled automatically. But, this function needs to be called
         * if animator elements are resized separately and window resize event is not launched.
         * Then, operations corresponding to window resize can be triggered by using this function.
         */
        this.refresh = refresh;

        /**
         * Getter for configuration API object.
         *
         * Configuration API provides getter functions for animation configurations and also for
         * {OpenLayers} components. Then, for example, animation {OpenLayers.Map} is available
         * via the API.
         *
         * See, {fi.fmi.metoclient.ui.animator.Factory} API for more detailed description.
         *
         * @return {Object} Configuration API object.
         *                  May be {undefined} if animator has not been initialized by calling {init}.
         */
        this.getConfig = getConfig;

    };

    // Constructor function is returned for later instantiation.
    return _constructor;

})();
