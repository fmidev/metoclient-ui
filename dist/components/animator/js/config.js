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
 *     // and {args} array.
 *     // For example, {className} could be "OpenLayers.Layer.WMS" string and {args} array may contain
 *     // string for name, string for URL, params object and options object.
 *     // See {OpenLayers.Layer.WMS} documentation for the arguments object structures.
 *     // Also, {OpenLayers.Layer.WMTS} layers may be used. For animations, see
 *     // {OpenLayers.Layer.Animation} that describes configuration object for animations.
 *     // Animation may use {OpenLayers.Layer.Animation.WMS} or {OpenLayers.Layer.Animation.WMTS}.
 *     // {OpenLayers.Layer.Animation.WMS} contains animation configuration object inside options object.
 *     // {OpenLayers.Layer.Animation.WMTS} contains animation configuration object in the root level of
 *     // the configuration object.
 *     layers : [
 *         { className : {String}, args : [ {String|Object|etc}, ... ] },
 *         ... ],
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
 *     // Notice, time is floored to the resolution time.
 *     // Notice, zero is a special value here. Then, time
 *     // is ceiled to the resolution time because observed
 *     // data is not requested.
 *     animationDeltaToBeginTime : {Integer},
 *
 *    // Animation end delta time in ms from current time.
 *    // Notice, time is ceiled to the resolution time.
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
                    layer : "Weather:precipitation-forecast",
                    // Forecasts are future data. So, begin time is from now.
                    // Notice, beginTime is floored down to the nearest resolution.
                    beginTime : new Date(),
                    // End time is not required if layer is meant for all times after beginTime.
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
                    name : "Precipitation forecast"
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
                name : "Precipitation"
            }
        }]
    },

    // Another WMS animation layer.
    {
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
                // Notice, unnecessary empty layer data is not requested
                // from the server when end time is defined here.
                // Also notice, endTime is ceiled on the next resolution time.
                // Therefore, last value may be a forecast if server provides
                // that kind of data.
                endTime : new Date(),
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
            // Do not select this layer as default in layer switcher.
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
    animationResolutionTime : 15 * 60 * 1000,
    // Animation begin delta time in ms from current time.
    // Notice, time is floored to the resolution time.
    // Notice, zero is a special value here. Then, time
    // is ceiled to the resolution time because observed
    // data is not requested.
    animationDeltaToBeginTime : 8 * 60 * 60 * 1000 + 20 * 60 * 1000,
    // Animation end delta time in ms from current time.
    // Notice, time is ceiled to the resolution time.
    // Notice, zero is a special value here. Then, time
    // is floored to the resolution time because future
    // data is not requested.
    animationDeltaToEndTime : 6 * 60 * 60 * 1000 + 20 * 60 * 1000

};
