"use strict";

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

/**
 * This configuration JavaScript file provides one configuration object that
 * contains map and layers objects that framework uses for OpenLayers. Also,
 * configuration properties may be provided for the animation that wraps
 * multiple animation layers.
 *
 * Notice, instead of instantiating map and layers directly here,
 * they are instantiated later. Then, framework still has possibility to fine tune
 * settings if necessary before instantiation.
 *
 * {fi.fmi.metoclient.ui.animator.Config} configuration object structure is:
 * {
 *     // Map contains options object that defines a map that framework creates.
 *     // Object has {className} property that defines the name of the map class as a string.
 *     // In normal cases this is always "OpenLayers.Map" string. Also, object has {args} array
 *     // as a parameter. This array contains items that are used as parameters for the constructor
 *     // when map instance is created. Usually {args} contains only one options object for the map.
 *     // See {OpenLayers.Map} documentation for map arguments.
 *     map : { className : {String}, args : [ {Object}, ... ] },
 *
 *     // Array of layer configuration objects.
 *     // The structure of layer configuration objects are same as in map object above.
 *     // So, in layers array one layer configuration object contains {className} string parameter
 *     // and {args} array. Also, parameters for capability requests may be given in {capabilities}
 *     // object that may also be left {undefined} if capability requests are not required.
 *     // Capabilities {url} and {layer} are mandatory if capability requests are required.
 *     // Capabilities {storedQueryId} is mandatory if capabilities uses WFS instead of WMS.
 *     // WFS may provide faster capabilities responses than WMS from the server.
 *     // Capabilities data is required if "auto" or "join" strings are used with {beginTime} and
 *     // {endTime} properties of layers and sub-layers.
 *
 *     // For example, {className} could be "OpenLayers.Layer.WMS" string and {args} array may contain
 *     // string for name, string for URL, params object and options object.
 *     // See {OpenLayers.Layer.WMS} documentation for the arguments object structures.
 *     // Also, {OpenLayers.Layer.WMTS} layers may be used. For animations, see
 *     // {OpenLayers.Layer.Animation} that describes configuration object for animations.
 *     // Animation may use {OpenLayers.Layer.Animation.WMS} or {OpenLayers.Layer.Animation.WMTS}.
 *     // {OpenLayers.Layer.Animation.WMS} contains animation configuration object inside options object.
 *     // {OpenLayers.Layer.Animation.WMTS} contains animation configuration object in the root level of
 *     // the configuration object.
 *     layers :
 *         [
 *             { className : {String}, args : [ {String|Object|etc}, ... ],
 *               capabilities : { url : {String}, layer : {String}, storedQueryId : {String} } },
 *             ...
 *         ],
 *
 *     // Default zoom level is set for the map and layers when they are created.
 *     defaultZoomLevel : {Integer},
 *
 *     // Animation specific parameters.
 *
 *     // Animation frame rate in ms.
 *     animationFrameRate : {Integer},
 *
 *     // Animation resolution in ms.
 *     animationResolutionTime : {Integer},
 *
 *     // Animation begin delta time in ms from current time.
 *     // Notice, begin time is floored to the resolution time.
 *     // Notice, zero is a special value here. Then, time
 *     // is ceiled to the resolution time because observed
 *     // data is not requested.
 *     animationDeltaToBeginTime : {Integer},
 *
 *    // Animation end delta time in ms from current time.
 *    // Notice, end time is ceiled to the resolution time.
 *    // Notice, zero is a special value here. Then, time
 *    // is floored to the resolution time because future
 *    // data is not requested.
 *    animationDeltaToEndTime : {Integer}
 * }
 */
fi.fmi.metoclient.ui.animator.Config = {

    // Map configuration in an object.
    //--------------------------------

    /**
     * Configuration object for OpenLayers map.
     *
     * Notice, defaultZoomLevel is provided separately for the animation.
     */
    map : {
        className : "OpenLayers.Map",
        // Options object that is given for {OpenLayers.Map} object when map is insantiated.
        args : [{
            allOverlays : true,
            projection : 'EPSG:3067',
            maxExtent : new OpenLayers.Bounds(-118331.366408, 6335621.167014, 875567.731907, 7907751.537264),
            // Center about to the middle of Finland.
            center : [400000, 7150000]
        }]
    },

    // Layers configurations in array.
    //--------------------------------

    /**
     * Layers array contains all the layer configurations that will be used to create layers for map.
     * Layers are created in this oreder.
     */
    layers : [
    // Base layer for map
    {
        // Class name for the base layer.
        className : "OpenLayers.Layer.WMS",
        // Arguments that are used as constructor parameters during instantiation.
        args : [
        // Layer name.
        "Map",
        // Layer URL.
        // Base layer is loaded from the service of National Land Survey of Finland to get a nice map.
        // More information about the service: http://kartat.kapsi.fi/
        "http://tiles.kartat.kapsi.fi/taustakartta",
        // Layer params.
        {
            layers : "taustakartta",
            tiled : true
        }]
    },

    // WMS animation layer.
    {
        // Capabilities object contains parameters for capability requests.
        // Capabilities response provides information, for example, about the layer time
        // period that can be used to automatically set begin and end times for animation
        // layers by using "auto" and "join" strings. May be left {undefined} if capability
        // requests are not required. Notice, "auto" and "join" strings should not be
        // used for the layer if {capabilities} is left {undefined}.
        //
        // Also notice, FMI server may give CORS error for capability requests at the moment.
        // If CORS error occurs, you may remove this {capabilities} property and replace
        // "auto" and "join" strings from the layer by using a proper time value.
        //
        // capabilities : {
        //     // URL for capability requests.
        //     // URL is mandatory if capability requests are required.
        //     url : "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/wms",
        //     // Or, alternatively WFS URL could be used.
        //     // url : "http://data.fmi.fi/fmi-apikey/insert-your-apikey-here/wfs",
        //     // Storedquery ID is mandatory if WFS is used.
        //     // storedQueryId : "fmi::radar::composite::rr",
        //     // Layer identifier should be same as the identifier used with the layer object
        //     // that wraps this capabilities object. Layer identifier is mandatory.
        //     layer : "Radar:suomi_rr_eureffin"
        // },
        //
        // Class name defines the class for the layer.
        // Framework will instantiate this class with args given below.
        className : "OpenLayers.Layer.Animation.Wms",
        // Arguments that are passed to constructor as function parameters in the given order.
        // Animation may define name, url, params, options objects.
        // So, the structure corresponds {OpenLayers.Layer.WMS} object constructor parameters.
        // Notice, that options object contains also animation object that gives configuration
        // for animation itself.
        args : [
        // Layer name.
        "Precipitation",
        // Layer URL.
        "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/wms",
        // Layer params.
        {
            layers : "Radar:suomi_rr_eureffin"
        },
        // Layer options.
        {
            // Set animation configurations directly to layer options that are used for layer.
            animation : {
                // Animation period information is left undefined here.
                // Then, factory may set the times automatically. Also,
                // these could be left out because these are undefined.
                // But, these are shown here just as example. Also, proper
                // times could be set here. Then, the given times would be used
                // in framework. Notice, begin time is floored to the resolution
                // and end time is ceiled to the resolution time. Layer resolution is
                // used for loading configuration but alternatively animation resolution
                // may be used by framework if layer has not defined resolution here. Notice,
                // if these values are given they are used for loading even if whole animation
                // level values were given and used for showing all the layers.
                beginTime : undefined,
                endTime : undefined,
                // Let the resolution time be 60 min to be sure observations and forecasts are
                // provided with the given resolution. Notice, if this is not defined, animation
                // resolution is used. Also notice, the layer resolution is used for loading if
                // given here and animation resolution is used for showing animation of all the
                // layers.
                resolutionTime : 60 * 60 * 1000,
                // Browser may limit total number of simultaneous asynchronous requests.
                // Therefore, animation layer may be configured to limit its own asynchronous
                // loads to avoid possible timeouts. Notice, if multiple animation layers are used,
                // each of them have their own limit but browser limits the whole bundle.
                // Also notice, limiting asynchronous loads may slow down the completion of
                // animation loading. So, use limit only if timeouts may occur otherwise.
                maxAsyncLoadCount : 4,
                // For forecasts we use different layer.
                // Notice, we do not need to define default layer here again.
                layers : [{
                    layer : "Radar:suomi_tuliset_rr_eureffin",
                    // Storedquery ID is required if WFS instead of WMS is used for capabilities.
                    // storedQueryId : "fmi::forecast::tuliset::rr",

                    // Forecasts are future data. So, begin time is from now if parent
                    // layer provides frames up to present moment.
                    //
                    // Notice, {beginTime} is floored down to the nearest resolution.
                    // Therefore, the date time should be increased by ( resolution time - 1 )
                    // to make sure that the floored {beginTime} refers to the future and
                    // is on the proper resolution.
                    // For example, (new Date()).getTime() + 60 * 60 * 1000 - 1
                    //
                    // Sometimes it may take a while before the latest observation data
                    // is available in the server. Then, forecast data from the past should
                    // be shown instead. In that case, "join" string may be provided to take
                    // use of capabilities information. Then, the framework automatically checks
                    // the {endTime} for the parent layer and the begin time of this sub-layer
                    // is calculated by using parent layer {endTime} and by using resolution
                    // time to get the next timestep. Notice, use of "join" requires that
                    // {capabilities} object is defined for the layer in this configuration.
                    //
                    // beginTime : "join",
                    beginTime : (new Date()).getTime() + 60 * 60 * 1000 - 1,
                    // End time is not required if layer is meant for all times after {beginTime}.
                    endTime : undefined,
                    // Legend configuration is inherited from the parent animation object.
                    // Notice, legends can also be configured here to override parent
                    // configuration. Just for the purpose of an example, flag is set
                    // also here.
                    hasLegend : true,
                    // Time period specific animation frames may be named.
                    // Then, the frame uses the name for the layer and
                    // the time period specific name is given when legend
                    // is requested via API.
                    name : "Precipitation forecast",
                    // Inform animator that this layer is forecast layer.
                    // This flag may be used to inform that layer should be handled
                    // as a forecast even if its frames would be from the past. Notice,
                    // if parent layer is set as forecast, the sub-layer is automatically
                    // handled as forecast.
                    isForecast : true
                }],
                // Load automatically when layer is added to the map.
                autoLoad : true,
                // Flag to inform if legend may be requested for the layer.
                // Notice, default is false. Notice, this value is inherited
                // as a default value by period specific layers if they are defined.
                hasLegend : true,
                // Time period specific animation frames may be named.
                // Then, the frame uses the name for the layer and
                // the time period specific name is given when legend
                // is requested via API.
                name : "Precipitation",
                // This flag may be used to inform that layer should be handled
                // as a forecast even if its frames would be from the past.
                // This property is shown here as an example and with value {false}
                // which is also a default value and could therefore been left out.
                isForecast : false
            }
        }]
    },

    // Another WMS animation layer.
    {
        // Capabilities object contains parameters for capability requests.
        // Capabilities response provides information, for example, about the layer time
        // period that can be used to automatically set begin and end times for animation
        // layers by using "auto" and "join" strings. May be left {undefined} if capability
        // requests are not required. Notice, "auto" and "join" strings should not be
        // used for the layer if {capabilities} is left {undefined}.
        //
        // Also notice, FMI server may give CORS error for capability requests at the moment.
        // If CORS error occurs, you may remove this {capabilities} property and replace
        // "auto" and "join" strings from the layer by using a proper time value.
        //
        // capabilities : {
        //     // URL for capability requests.
        //     // URL is mandatory if capability requests are required.
        //     url : "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/wms",
        //     // Or, alternatively WFS URL could be used.
        //     // url : "http://data.fmi.fi/fmi-apikey/insert-your-apikey-here/wfs",
        //     // Storedquery ID is mandatory if WFS is used.
        //     // storedQueryId : "fmi::radar::composite::dbz",
        //     // Layer identifier should be same as the identifier used with the layer object
        //     // that wraps this capabilities object. Layer identifier is mandatory.
        //     layer : "Radar:suomi_dbz_eureffin"
        // },
        //
        className : "OpenLayers.Layer.Animation.Wms",
        args : [
        // Layer name.
        "Dbz",
        // Layer URL.
        "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/wms",
        // Layer params.
        {
            layers : "Radar:suomi_dbz_eureffin"
        },
        // Layer options.
        {
            animation : {
                // Flag to inform if legend may be requested for the layer.
                // Notice, default is false. Notice, this value is inherited
                // as a default value by period specific layers if they are defined.
                hasLegend : true,
                // Time period specific animation frames may be named.
                // Then, the frame uses the name for the layer and
                // the time period specific name is given when legend
                // is requested via API.
                name : "Dbz",
                // Notice, observations may be available more frequently
                // than forecasts from server. This animation shows only
                // observation period. Because animationResolutionTime is
                // defined in this config for example purposes, animation
                // layer resolution times are not adjusted automatically
                // according to largest animation resolution time. Therefore,
                // do not set smaller resolution time than in the animation
                // layers that show both observation and forecast. Or, leave
                // animationResolutionTime undefined to automatically use the
                // greatest animation layer resolution. Then, controller has
                // always something to show in every timestep. Resolution is set
                // here as an example, even if this is not needed because use of
                // animation resolution would be enough.
                resolutionTime : 2 * 60 * 60 * 1000,
                // Only observations should be shown for this layer
                // because forecast data should not be available for this layer.
                //
                // Notice, unnecessary empty layer data is not requested
                // from the server when end time is defined here.
                //
                // Also notice, {endTime} is ceiled on the next resolution time.
                // Therefore, the date time is decreased by ( resolution time - 1 )
                // to make sure {endTime} refers to the observation and is on the
                // proper resolution.
                // For example, (new Date()).getTime() - (2 * 60 * 60 * 1000 - 1)
                //
                // Also, notice "auto" string may be used to take use of capabilities
                // information. Then, framework automatically checks the {endTime} for the layer.
                // Notice, use of "auto" requires that {capabilities} object is defined for
                // the layer in this configuration.
                //
                // endTime : "auto",
                endTime : (new Date()).getTime() - (2 * 60 * 60 * 1000 - 1),
                // Fade-in may also be configured for animation if default is not good enough.
                fadeIn : {
                    // For an example, fade-in time is set longer for this animation layer. Resolution
                    // of this animation layer is couple of times greater than in other animation layers.
                    // So, there is a little bit more time to fade-in and fade-out because same frame is
                    // shown for couple of steps when other animation layers change frames. The extra time
                    // available depends also on the animation frame-rate.
                    time : 2000,
                    // Fade-in function may also be defined.
                    // Default is "ease-out".
                    timingFunction : "linear"
                },
                // Fade-out may also be configured if default is not good enough.
                fadeOut : {
                    // For an example, fade-out time is set longer for this animation layer. Resolution
                    // of this animation layer is couple of times greater than in other animation layers.
                    // So, there is a little bit more time to fade-in and fade-out because same frame is
                    // shown for couple of steps when other animation layers change frames. The extra time
                    // available depends also on the animation frame-rate.
                    time : 2000,
                    // Fade-out function may also be defined.
                    timingFunction : "ease-in",
                    // Opacities for multiple fade-out steps.
                    // Notice, each step has its final opacity set
                    // and usually last opacity should be zero to hide the frame.
                    // Also notice, if animation resolution is long and these steps are defined,
                    // previous frame images may be separately visible and animation does not
                    // seem to change frames smoothly. This is most likely the case in this example
                    // because this animation layer has a long resolution set. But, by using
                    // this property, in some cases, you may find a configuration that smoothens
                    // animation by overlapping previous animation frames with different opacities.
                    // For example purposes, the property is set here even if its value provides default
                    // behaviour and the property could be left undefined. You may try, for example,
                    // [0.5, 0.2, 0] to test the effect of the property.
                    opacities : [0]
                },
                // Browser may limit total number of simultaneous asynchronous requests.
                // Therefore, animation layer may be configured to limit its own asynchronous
                // loads to avoid possible timeouts. Notice, if multiple animation layers are used,
                // each of them have their own limit but browser limits the whole bundle.
                // Also notice, limiting asynchronous loads may slow down the completion of
                // animation loading. So, use limit only if timeouts may occur otherwise.
                maxAsyncLoadCount : 4,
                // Load automatically when layer is added to the map.
                autoLoad : true
            },
            // Do not select this layer as default in layer switcher.
            // Notice, autoload above has no effect if this is false.
            visibility : false
        }]
    },

    // Another WMS animation layer.
    {
        className : "OpenLayers.Layer.Animation.Wms",
        args : [
        // Layer name.
        "Temperature",
        // Layer URL.
        "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/wms",
        // Layer params.
        {
            layers : "Weather:temperature"
        },
        // Layer options.
        {
            // Notice, this animation queries observation layer.
            // Therefore, server may not provide any forecast data.
            // For example purposes, begin and end times and resolution
            // are not defined for this animation. Then, general animation
            // configurations are used. In this example general animation
            // resolution is more frequent than in other layers. This
            // animation layer has observation data available with animation
            // resolution. But, it does not have any forecast data. Because
            // forecast data is not available from the server, frames are
            // loaded but their content is empty. Then, controller has empty
            // frames to show in animation frequency and controller time scale
            // is not left with empty slots, which would be the case if content
            // is not loaded at least with animation resolution during whole
            // animation period.
            animation : {
                // Flag to inform if legend may be requested for the layer.
                // Notice, default is false. Notice, this value is inherited
                // as a default value by period specific layers if they are defined.
                // Here, legend is not needed and also default could be used because
                // temperature layer shows numeric values.
                hasLegend : false,
                // Time period specific animation frames may be named.
                // Then, the frame uses the name for the layer and
                // the time period specific name is given when legend
                // is requested via API.
                name : "Temperature",
                // Browser may limit total number of simultaneous asynchronous requests.
                // Therefore, animation layer may be configured to limit its own asynchronous
                // loads to avoid possible timeouts. Notice, if multiple animation layers are used,
                // each of them have their own limit but browser limits the whole bundle.
                // Also notice, limiting asynchronous loads may slow down the completion of
                // animation loading. So, use limit only if timeouts may occur otherwise.
                maxAsyncLoadCount : 4,
                // Load automatically when layer is added to the map.
                autoLoad : true
            },
            // Select this layer as default in layer switcher.
            // Notice, autoload above has no effect if this is false.
            visibility : true
        }]
    }],

    // Additional configuration parameters.
    //-------------------------------------

    // Map and layer related configuration.
    //-------------------------------------

    // Default zoom level for map, when map is shown.
    defaultZoomLevel : 1,

    // Animation configurations.
    //--------------------------

    // Notice, these define animation configurations.
    // These are used by animation controller that handles the UI.
    // Notice, layers may define different values for loading operations.
    // But, these values define how animations are shown. Also notice, if
    // layers do not define begin, end, or resolution times for themselves,
    // these values are used for the animation layer automatically as default.
    // If animation configuration is not set, framework checks layer configurations
    // to check the smallest begin time, greatest end time, and greatest resolution time.

    // Animation shows progress element during asynchronous initialization if set {true}.
    // Element not shown if {undefined}, {null} or {false}.
    showAnimationInitProgress : true,
    // Animation shows progress element during asynchronous content loading if set {true}.
    // Element not shown if {undefined}, {null} or {false}.
    showAnimationLoadProgress : true,

    // Animation refresh interval in ms defines how often animation content
    // should be refreshed by reloading content. Animation is not refreshed
    // if {undefined}, {null} or less or equal to zero.
    animationRefreshInterval : 15 * 60 * 1000,

    // Animation frame rate in ms.
    animationFrameRate : 500,
    // Animation resolution in ms.
    // Notice, above layers have two hour resolution used for one animation and another
    // have smaller resolution. But, by defining the animation resolution here, UI will
    // use this resolution. Some of the animations have new frames more frequently
    // than others. Therefore, it might be best to use resolution according to the
    // greatest resolution of layers. Also notice, if animationResolutionTime
    // is not defined here, the greatest layer resolution is automatically used.
    // Also notice, if animation resolution is smaller than in any of the animations
    // in a certain time period, animation controller shows empty timesteps in the
    // timescale in places that there is no content loaded and to show.
    animationResolutionTime : 30 * 60 * 1000,
    // Animation begin delta time in ms from current time.
    // Positive value is towards past.
    // Notice, begin time is floored to the resolution time.
    // Notice, zero is a special value here. Then, time
    // is ceiled to the resolution time because observed
    // data is not requested.
    animationDeltaToBeginTime : 3 * 60 * 60 * 1000,
    // Animation end delta time in ms from current time.
    // Positive value is towards future.
    // Notice, end time is ceiled to the resolution time.
    // Notice, zero is a special value here. Then, time
    // is floored to the resolution time because future
    // data is not requested.
    animationDeltaToEndTime : 2 * 60 * 60 * 1000

};
