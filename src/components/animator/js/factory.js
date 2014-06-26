"use strict";

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

if ("undefined" === typeof fi.fmi.metoclient.ui.animator.Utils || !fi.fmi.metoclient.ui.animator.Utils) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.Utils is required for fi.fmi.metoclient.ui.animator.Factory!";
}

if ("undefined" === typeof fi.fmi.metoclient.ui.animator.Capabilities || !fi.fmi.metoclient.ui.animator.Capabilities) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.Capabilities is required for fi.fmi.metoclient.ui.animator.Factory!";
}

/**
 * This configuration factory provides the configuration map
 * and layer objects that the framework uses for OpenLayers.
 *
 * Example:
 * // Notice, configuration object may need to be deep cloned to make sure
 * // factory does not change content of the original config object properties.
 * var config = new fi.fmi.metoclient.ui.animator.Factory(
 *                      _.cloneDeep(fi.fmi.metoclient.ui.animator.Config, cloneDeepCallback));
 * // Start asynchronous initialization.
 * config.init(function(factory, errors) {
 *     // Initialization ready.
 * });
 */
fi.fmi.metoclient.ui.animator.Factory = (function() {

    // Private constants.

    // If configuration uses auto for time value,
    // capabilities is used to get the proper time.
    var CAPABILITY_TIME_AUTO = "auto";

    // If configuration sub-layer uses join for time value,
    // capabilities is used to get the proper begin time
    // for the sub-layer.
    var CAPABILITY_TIME_JOIN = "join";

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
                var reminder = time % resolution;
                if (reminder) {
                    time -= reminder;
                    date.setTime(time);
                }
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
                    time += resolution - reminder;
                    date.setTime(time);
                }
            }
        }
    }

    /**
     * Constructor for new instance.
     * This function provides the public API and also contains private instance specific functionality.
     *
     * @param {Object} configuration Map and layer configuration object.
     *                               May be {undefined} or {null} but then operations are ignored.
     */
    var _constructor = function(configuration) {
        // Private member variables.
        //--------------------------
        var _me = this;

        // Map and layer configuration object.
        var _config = configuration;

        // Error objects of asynchronous operations.
        var _errors = [];

        // Capabilities data for configurations.
        // Capabilities objects wrap requested capabilities and
        // other capability related information. Capability objects
        // are set into this array during asynchronous initialization.
        var _capabilitiesContainer = [];

        // OpenLayers related map and layers variables.
        // See corresponding get functions below to create content.
        var _map;
        var _layers = [];

        // Animation setting related variables that are initialized
        // when corresponding get functions are called first time.
        var _resolution;
        var _beginDate;
        var _endDate;

        // Forecast starts from current time as a default.
        // But, layers may define other forecast begin times.
        // Current time or the smallest forecast time from
        // layers is used for the whole animation.
        var _forecastBeginDate = new Date();

        // Private member functions.
        //--------------------------

        /**
         * Asynchronously handles the callback and possible error situations there.
         *
         * @param {function(data, errors)} callback Callback function that is called.
         *                                          Operation is ignored if {undefined} or {null}.
         */
        var handleCallback = function(callback) {
            if (callback) {
                setTimeout(function() {
                    try {
                        callback(_me, _errors);

                    } catch(e) {
                        // Ignore errors that may occur in the callback.
                        // Callback may be provided from outside of this library.
                        if ("undefined" !== typeof console && console) {
                            console.error("ERROR: Callback function error: " + e.toString());
                        }
                    }
                }, 0);
            }
        };

        /**
         * @param {String} layer Layer identifier.
         *                       Operation is ignored if {undefined}, {null} or {empty}.
         * @param {String} url URL used for capability request.
         *                     Proper capability object, that contains information for layer,
         *                     is identified by the URL.
         *                     Operation is ignored if {undefined}, {null} or {empty}.
         * @return {Object} Layer from the loaded capabilities.
         *                  See {fi.fmi.metoclient.ui.animator.Capabilities.getLayer}.
         *                  May be {undefined} if layer is not found.
         */
        function getCapabilityLayer(layer, url) {
            var capabilityLayer;
            if (layer && url) {
                for (var i = 0; i < _capabilitiesContainer.length; ++i) {
                    var capas = _capabilitiesContainer[i];
                    if (capas) {
                        var capabilities = capas.capabilities;
                        if (capabilities && url === capas.url) {
                            var capaLayer = fi.fmi.metoclient.ui.animator.Capabilities.getLayer(capabilities, layer);
                            // Notice, checking is finished if layer is found.
                            // There should be only one match and other URL matches should not exist
                            // in the capabilities array. But, continue search if layer is not found
                            // just to be sure even if capabilities URL matched because this is not
                            // performance critical check.
                            if (capaLayer) {
                                capabilityLayer = capaLayer;
                                // Layer was found here. No need to continue.
                                break;
                            }
                        }
                    }
                }
            }
            return capabilityLayer;
        }

        /**
         * Check the forecast begin date from the configuration.
         *
         * The forecast begin date is updated by the smallest begin date from the layers
         * that have been defined as forecasts if any is found.
         *
         * Notice, this should be called only after {checkConfiguration} has checked
         * the animation layer time values.
         */
        function checkForecastBeginDate() {
            if (_config && _config.layers && _config.layers.length) {
                // The default forecast begin date is ceiled on the resolution.
                // Then, the forecast begins on the animation step that shows the
                // first forecast data. For example, first step after the present
                // moment or exactly on it if present is exactly on the resolution.
                // Also, animation layer specific checks floor the forecast
                // begin date similarly on the first forecast step below.
                ceilDate(_forecastBeginDate, getAnimationResolution());

                // Check all the configuration layers.
                // The forecast begin date is the smallest date for the layer
                // that has been defined as forecast.
                for (var i = 0; i < _config.layers.length; ++i) {
                    var layer = _config.layers[i];
                    if (layer) {
                        // Layers are created by providing arguments list in configuration.
                        for (var j = 0; j < layer.args.length; ++j) {
                            var arg = layer.args[j];
                            if (arg) {
                                var animation = arg.animation;
                                // Notice, the value is always resetted below before using it to update layer properties.
                                // So, no need to reset value to undefined here.
                                var tmpBeginDate;
                                // Check from the given arguments if any of them contains animation configuration.
                                if (animation) {
                                    // Make sure resolution times are used properly when times are adjusted.
                                    // This provides layer specific resolution if available.
                                    var animationResolutionTime = animation.resolutionTime;
                                    if (undefined === animationResolutionTime) {
                                        animationResolutionTime = getAnimationResolution();
                                        if (undefined === animationResolutionTime) {
                                            throw "ERROR: Animation resolution time missing!";
                                        }
                                    }
                                    // Check begin time only from the layer that defines itself as a forecast.
                                    if (animation.isForecast) {
                                        // If begin time is available, make sure Date instance is used.
                                        if (undefined !== animation.beginTime) {
                                            // New date object is created for tmp date instead of using reference to existing object.
                                            tmpBeginDate = animation.beginTime instanceof Date ? new Date(animation.beginTime.getTime()) : new Date(animation.beginTime);

                                        } else {
                                            // Begin time was not defined for layer.
                                            // Then, animation level begin time is used for that layer.
                                            tmpBeginDate = getAnimationBeginDate();
                                        }
                                        // Layer animation begin times are floored when layers are created.
                                        // Floor forecast begin date similarly. Then, layer specific checking can be done.
                                        floorDate(tmpBeginDate, animationResolutionTime);
                                        // Update forecast begin time if the layer has begin time that is smaller than previously set value.
                                        if (undefined !== tmpBeginDate && (undefined === _forecastBeginDate || _forecastBeginDate.getTime() > tmpBeginDate.getTime())) {
                                            // Forecast begin time is always Date instance.
                                            _forecastBeginDate = tmpBeginDate;
                                        }
                                    }
                                    // Check also sub-layers of the animation layer.
                                    // Sub-layer may be forecast even if parent is not.
                                    if (animation.layers) {
                                        for (var k = 0; k < animation.layers.length; ++k) {
                                            var subLayer = animation.layers[k];
                                            // Check begin time from the sub-layer that defines itself as a forecast
                                            // or whose parent is a forecast.
                                            if (subLayer && (subLayer.isForecast || animation.isForecast)) {
                                                // If begin time is available, make sure Date instance is used.
                                                // Notice, sub-layer shold always have begin time set.
                                                if (undefined !== subLayer.beginTime) {
                                                    // New date object is created for tmp date instead of using reference to existing object.
                                                    tmpBeginDate = subLayer.beginTime instanceof Date ? new Date(subLayer.beginTime.getTime()) : new Date(subLayer.beginTime);

                                                } else {
                                                    // Begin time was not defined for layer.
                                                    // Then, animation level begin time is used for that layer.
                                                    // Sub-layer should always have begin time configured. So, we should not come here.
                                                    tmpBeginDate = getAnimationBeginDate();
                                                }
                                                // Layer animation begin times are floored when layers are created.
                                                // Floor forecast begin date similarly. Then, layer specific checking can be done.
                                                floorDate(tmpBeginDate, animationResolutionTime);
                                                // Update forecast begin time if the layer has begin time that is smaller than previously set value.
                                                if (undefined !== tmpBeginDate && (undefined === _forecastBeginDate || _forecastBeginDate.getTime() > tmpBeginDate.getTime())) {
                                                    // Forecast begin time is always Date instance.
                                                    _forecastBeginDate = tmpBeginDate;
                                                }
                                            }
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

        /**
         * Check given {animation} and fine-tune times by using capability information for the layer.
         *
         * If animation times contain capability time strings,
         * they are replaced by proper times from the capabilities information.
         *
         * @param {Object} timeInfo Configuration sub-object that contains time properties
         *                          that are set if necessary.
         *                          Operation is ignored if {undefined} or {null}.
         * @param {Object} capabilityLayer Layer object gotten from capabilities.
         *                                 See {getCapabilityLayer} function.
         *                                 Operation is ignored if {undefined} or {null}.
         * @param {Integer} resolution Animation resolution time.
         *                             May be {undefined} or {null} that are handled as zero.
         */
        function checkAnimationConfigTimes(timeInfo, capabilityLayer, resolution) {
            if (timeInfo && capabilityLayer) {
                if (timeInfo.beginTime === CAPABILITY_TIME_AUTO) {
                    timeInfo.beginTime = fi.fmi.metoclient.ui.animator.Capabilities.getBeginTime(capabilityLayer);
                    // Because begin times are floored on resolution when layers are created,
                    // make sure begin time is within capability limits by ceiling it here.
                    ceilDate(timeInfo.beginTime, resolution);
                }
                if (timeInfo.endTime === CAPABILITY_TIME_AUTO) {
                    timeInfo.endTime = fi.fmi.metoclient.ui.animator.Capabilities.getEndTime(capabilityLayer);
                    // Because end times are ceiled on resolution when layers are created,
                    // make sure end time is within capability limits by flooring it here.
                    floorDate(timeInfo.endTime, resolution);
                }
            }
        }

        /**
         * Check given {animation} and fine-tune values according to the capability information.
         *
         * @param {Object} animation Configuration sub-object that contains time properties
         *                           that are set if necessary.
         *                           Operation is ignored if {undefined} or {null}.
         * @param {Object} capability Configuration sub-object that contains capability information.
         *                            Operation is ignored if {undefined} or {null}.
         */
        function checkConfigurationAnimation(animation, capability) {
            if (animation && capability && capability.url && capability.layer) {
                // Layer configuration provides enough information
                // to get capabilites information from the loaded capabilities.
                var capabilityLayer = getCapabilityLayer(capability.layer, capability.url);
                if (capabilityLayer) {
                    // Make sure resolution times are used properly when times are adjusted.
                    var animationResolutionTime = animation.resolutionTime;
                    if (undefined === animationResolutionTime) {
                        animationResolutionTime = getAnimationResolution();
                        if (undefined === animationResolutionTime) {
                            throw "ERROR: Animation resolution time missing!";
                        }
                    }
                    checkAnimationConfigTimes(animation, capabilityLayer, animationResolutionTime);
                    // Check animation sub-layers.
                    if (animation.layers) {
                        for (var i = 0; i < animation.layers.length; ++i) {
                            var subLayer = animation.layers[i];
                            if (subLayer && subLayer.layer) {
                                // Sub-layer capability layer information can be gotten by using sublayer ID
                                // and parent layer capability URL.
                                checkAnimationConfigTimes(subLayer, getCapabilityLayer(subLayer.layer, capability.url), animationResolutionTime);
                                if (subLayer.beginTime === CAPABILITY_TIME_JOIN) {
                                    // Notice, if join is used, the value set for the parent end time does not matter.
                                    // Parent end time defines end time for the whole animation, including sub layers.
                                    // Join can not be done after whole animation. Instead, end time of the parent
                                    // capability needs to be used to join sub-animation into the middle of the animation.
                                    subLayer.beginTime = fi.fmi.metoclient.ui.animator.Capabilities.getEndTime(capabilityLayer);
                                    if (undefined !== subLayer.beginTime) {
                                        // Notice, configuration animation resolution and capabilities resolution
                                        // may define different values. Animation may use greater resolution.
                                        // Make sure that first frame of animation sub-layer and last frame of
                                        // parent layer will not overlap. Just in case begin time is on the configuration
                                        // resolution, increase time by one. Then, parent layer end time uses capability
                                        // value and sub layer first time after that. In other cases, parent time is
                                        // floored normally on resolution and sub layer time is ceiled to next value.
                                        subLayer.beginTime = new Date(subLayer.beginTime.getTime() + 1);
                                        ceilDate(subLayer.beginTime, animationResolutionTime);

                                    } else {
                                        throw "ERROR: Animation sub-layer missing capability begin time!";
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        /**
         * Check if configuration object content needs to be tuned.
         *
         * Configuration layer times are updated according to capabilities.
         */
        function checkConfiguration() {
            try {
                if (_capabilitiesContainer.length && _config && _config.layers) {
                    for (var i = 0; i < _config.layers.length; ++i) {
                        var layer = _config.layers[i];
                        if (layer && layer.args) {
                            // Layers are created by providing arguments list in configuration.
                            // Check from the given arguments if any of them contains animation configuration.
                            for (var j = 0; j < layer.args.length; ++j) {
                                var arg = layer.args[j];
                                if (arg) {
                                    var animation = arg.animation;
                                    if (animation) {
                                        checkConfigurationAnimation(animation, layer.capabilities);
                                        // Use the first animation that is found from the arguments.
                                        // Therefore, no need to browse other arguments through any more.
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                // Check and set if configuration defines forecast begin dates.
                // Notice, this is called after checkConfiguration has checked
                // the animation layer time values.
                checkForecastBeginDate();

            } catch(e) {
                var errorStr = "ERROR: Configuration check failed: " + e.toString();
                if ("undefined" !== typeof console && console) {
                    console.error(errorStr);
                }
                _errors.push(errorStr);
            }
        }

        /**
         * Initializes capabilities with the given {capabilities} object.
         *
         * Callback is used to inform that flow has finished.
         *
         * @param {Function} callback See {initCapabilities} function for callback description.
         * @param {Object} capabilities Capabilities wrapper object. May be {undefined} or {null}.
         * @param {Array} errors See {init} function for callback {errors} description.
         *                       May be {undefined} or {null}.
         */
        function capabilitiesCallback(callback, capabilities, errors) {
            // Update error and capabilities content.
            if (capabilities) {
                _capabilitiesContainer.push.apply(_capabilitiesContainer, capabilities);
            }
            if (errors) {
                _errors.push.apply(_errors, errors);
            }

            // Check and fine tune configuration before final callback
            // to inform that capabilites are handled.
            checkConfiguration();

            // All asynchronous operations have finished.
            // Finish the flow by calling the callback.
            handleCallback(callback);
        }

        /**
         * Request capabilities information according to the configurations of this factory.
         *
         * Asynchronous function.
         *
         * @param {Function} callback See {init} function for callback description.
         */
        function initCapabilities(callback) {
            // Callback for capabilities operations.
            var optionsCallback = function(capabilities, errors) {
                capabilitiesCallback(callback, capabilities, errors);
            };

            // Options to get capabilities data.
            var options = {
                config : _config,
                callback : optionsCallback
            };

            // Start asynchronous operation.
            // Multiple asynchronous operations may be started.
            fi.fmi.metoclient.ui.animator.Capabilities.getData(options);
        }

        /**
         * Check layer configurations through and find the greatest value for resolution if any.
         *
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
         *
         * @return {Date} Begin date. May be {undefined}.
         *                New date object is created and returned date is not reference to any layer object.
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
                                            if (date === undefined || tmpDate.getTime() < date.getTime()) {
                                                // Take the smallest date of them all.
                                                // Make sure time is a copy of the original time.
                                                // Then, reference to the original object is not returned.
                                                date = new Date(tmpDate.getTime());
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
         *
         * @return {Date} End date. May be {undefined}.
         *                New date object is created and returned date is not reference to any layer object.
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
                                            if (date === undefined || tmpDate.getTime() > date.getTime()) {
                                                // Take the greatest date of them all.
                                                // Make sure time is a copy of the original time.
                                                // Then, reference to the original object is not returned.
                                                date = new Date(tmpDate.getTime());
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
        function getBrowserNotSupportedInfo() {
            return _config ? _config.browserNotSupportedInfo : undefined;
        }

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
                _map = fi.fmi.metoclient.ui.animator.Utils.createInstance(_config.map.className, args);
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
                        layer = fi.fmi.metoclient.ui.animator.Utils.createInstance(config.className, config.args);
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
        function getAnimationRefreshInterval() {
            return _config ? _config.animationRefreshInterval : undefined;
        }

        /**
         * See API for function description.
         */
        function getAnimationAutoStart() {
            return _config && _config.animationAutoStart ? true : false;
        }

        /**
         * See API for function description.
         */
        function showAnimationInitProgress() {
            return _config && _config.showAnimationInitProgress ? true : false;
        }

        /**
         * See API for function description.
         */
        function showAnimationLoadProgress() {
            return _config && _config.showAnimationLoadProgress ? true : false;
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
            if (undefined === _beginDate && _config) {
                // Check if time has been given directly for the animation.
                if (undefined !== _config.animationDeltaToBeginTime) {
                    // Use animation setting.
                    // Notice, positive value of begin time is towards past.
                    // Negative value may be used if begin time should be in the future.
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

                } else {
                    // Check if time can be gotten from layer configurations because
                    // it was not given for animation directly.
                    _beginDate = getAnimationBeginDateFromLayers();
                    // Floor to the exact resolution time.
                    if (undefined !== _beginDate) {
                        floorDate(_beginDate, getAnimationResolution());
                    }
                }

                if (undefined === _beginDate) {
                    throw "ERROR: Animation configuration missing proper begin time!";
                }
            }
            // Make copy. Then, possible changes do not affect the original object.
            return undefined === _beginDate ? undefined : new Date(_beginDate.getTime());
        }

        /**
         * See API for function description.
         */
        function getAnimationEndDate() {
            // Set end date once.
            if (undefined === _endDate && _config) {
                // Check if time has been given directly for the animation.
                if (undefined !== _config.animationDeltaToEndTime) {
                    // Notice, positive value of end time is towards future.
                    // Negative value may be used if end time should be in the past.
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

                } else {
                    // Check if time can be gotten from layer configurations because
                    // it was not given for animation directly.
                    _endDate = getAnimationEndDateFromLayers();
                    // Ceil to the exact resolution time.
                    if (undefined !== _endDate) {
                        ceilDate(_endDate, getAnimationResolution());
                    }
                }

                if (undefined === _endDate) {
                    throw "ERROR: Animation configuration missing proper end time!";
                }
            }
            // Make copy. Then, possible changes do not affect the original object.
            return undefined === _endDate ? undefined : new Date(_endDate.getTime());
        }

        /**
         * See API for function description.
         */
        function getForecastBeginDate() {
            return _forecastBeginDate;
        }

        /**
         * See API for function description.
         */
        function getCapabilities() {
            var capabilities = [];
            // Get capabilities objects from the container.
            for (var i = 0; i < _capabilitiesContainer.length; ++i) {
                capabilities.push(_capabilitiesContainer[i].capabilities);
            }
            return capabilities;
        }

        /**
         * See API for function description.
         */
        function init(callback) {
            if (!callback) {
                var errorStr = "ERROR: Factory init callback is mandatory!";
                if ("undefined" !== typeof console && console) {
                    console.error(errorStr);
                }
                // Throw exception directly because callback is not provided.
                throw errorStr;
            }
            try {
                // Reset asynchronous operation variables before starting new flow.
                _errors = [];

                // Make sure container is empty when initialization is started.
                _capabilitiesContainer = [];

                initCapabilities(callback);

            } catch(e) {
                // An error occurred in synchronous flow.
                // But, inform observer about the error asynchronously.
                // Then, flow progresses similarly through API in both
                // error and success cases.
                var error = e.toString();
                if ("undefined" !== typeof console && console) {
                    console.error("ERROR: Factory init error: " + error);
                }
                _errors.push(error);
                handleCallback(callback);
            }
        }

        // Public config API.
        //-------------------

        /**
         * Initialize configuration information.
         *
         * Asynchronous function that needs to be called before other functions can be used.
         * For example, capabilities data is loaded if required by configurations.
         *
         * Callback is mandatory and is used to follow the progress of the operation.
         *
         * @param {Function} callback Callback is {function(factory, errors)}.
         *                            Mandatory and may not be {undefined} or {null}.
         *                              - factory: Reference to {this} factory. Always provided.
         *                              - errors: Array that contains possible errors that occurred
         *                                        during the flow. Array is always provided even if it
         *                                        may be empty.
         */
        this.init = init;

        /**
         * @return {Array} Array of capabilities objects that may have been loaded during initialization.
         *                 Array is always provided even if it may be empty.
         */
        this.getCapabilities = getCapabilities;

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
         * @return {Integer} Refresh interval in milliseconds that is used for the animation.
         */
        this.getAnimationRefreshInterval = getAnimationRefreshInterval;

        /**
         * @return {Boolean} Animation is automatically started when content has been loaded if {true}. Else {false}.
         */
        this.getAnimationAutoStart = getAnimationAutoStart;

        /**
         * @return {Boolean} Load progress element is shown if {true}. Else {false}.
         */
        this.showAnimationInitProgress = showAnimationInitProgress;

        /**
         * @return {Boolean} Load progress element is shown if {true}. Else {false}.
         */
        this.showAnimationLoadProgress = showAnimationLoadProgress;

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
         *                If configuration provides the value, it is used.
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
         *                If configuration provides the value, it is used.
         *                Notice, date is ceiled to the nearest animation resolution time if
         *                time and resolution are given in configuration.
         *                May be {undefined} if not set in configuration.
         */
        this.getAnimationEndDate = getAnimationEndDate;

        /**
         * Get the forecast begin date for the whole animation.
         *
         * Forecast starts from current time as a default.
         * But, layers may define other forecast begin times.
         *
         * @return {Date} The forecast begin date for the whole animation.
         *                May not be {undefined}.
         */
        this.getForecastBeginDate = getForecastBeginDate;

        /**
         * Get browser not supported information text.
         *
         * @return {String} Browser not supported information text from configuration.
         *                  May be {undefined} if not set in configuration.
         */
        this.getBrowserNotSupportedInfo = getBrowserNotSupportedInfo;
    };

    // Constructor function for new instantiation.
    return _constructor;
})();
