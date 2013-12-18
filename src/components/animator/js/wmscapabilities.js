/**
 * This software may be freely distributed and used under the following MIT license:
 *
 * Copyright (c) 2013 Finnish Meteorological Institute
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the
 * Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Strict mode for whole file.
"use strict";

// Requires OpenLayers
if ("undefined" === typeof OpenLayers || !OpenLayers) {
    throw "ERROR: OpenLayers is required for fi.fmi.metoclient.ui.animator.WmsCapabilities!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

/**
 * WmsCapabilities object acts as an interface that provides functions
 * to asynchronously request WMS capabilities XML data from the server
 * and to get the requested data in a parsed structure.
 *
 * WmsCapabilities itself is stateless. It only provides API functions
 * to start asynchronous flows that can be followed by callback functions.
 *
 * Example:
 * fi.fmi.metoclient.ui.animator.WmsCapabilities.getData(
 *     {
 *         url : "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/wms",
 *         callback: function(data, errors) {
 *             var layer = fi.fmi.metoclient.ui.animator.WmsCapabilities.getLayer(data, "Weather:temperature");
 *             var begin = fi.fmi.metoclient.ui.animator.WmsCapabilities.getBeginTime(layer);
 *             var end = fi.fmi.metoclient.ui.animator.WmsCapabilities.getEndTime(layer);
 *             var allLayerTimes = fi.fmi.metoclient.ui.animator.WmsCapabilities.getLayerTimes(layer);
 *         }
 *     });
 *
 * See API description in the end of the function.
 */
fi.fmi.metoclient.ui.animator.WmsCapabilities = (function() {

    // Default parameter values for capabilities request.
    var DEFAULT_SERVICE = "WMS";
    var DEFAULT_VERSION = "1.3.0";
    var DEFAULT_REQUEST = "GetCapabilities";

    // Error object keys.
    var KEY_ERROR_CODE = "errorCode";
    var KEY_ERROR_TEXT = "errorText";

    /**
     * Asynchronously handles the callback and possible error situations there.
     *
     * @param {function(data, errors)} callback Callback function that is called.
     *                                          Operation is ignored if {undefined} or {null}.
     * @param {Object} data Data that is provided for callback.
     *                      May be {undefined}, for example, if an error occurred.
     * @param [] errors Array that contains possible errors that occurred during the asynchronous flow.
     */
    function handleCallback(callback, data, errors) {
        if (callback) {
            setTimeout(function() {
                try {
                    callback(data, errors);

                } catch(e) {
                    // Ignore errors that may occur in the callback.
                    // Callback may be provided from outside of this library.
                    if ("undefined" !== typeof console && console) {
                        console.error("ERROR: Callback function error!");
                    }
                }
            }, 0);
        }
    }

    /**
     * Request capability data from the server.
     *
     * Operation is asynchronous.
     *
     * This function provides the actual implementation for the API functions
     * that request parsed data.
     *
     * @param {Object} options Options for capability request.
     *                         {options} and {options.callback} may not be {undefined} or {null}.
     *                         Exception is thrown if {options.url} is {undefined}, {null} or empty.
     * @throws {String} Exception string is thrown if {options} does not contain proper information.
     */
    function getParsedData(options) {
        var capabilities;
        var errors = [];
        if (options.url) {
            var format = new OpenLayers.Format.WMSCapabilities();
            var defaultParams = {
                SERVICE : DEFAULT_SERVICE,
                VERSION : DEFAULT_VERSION,
                REQUEST : DEFAULT_REQUEST
            };
            OpenLayers.Request.GET({
                url : options.url,
                // If options contains params object it is used.
                // Otherwise, use default values.
                params : options.params || defaultParams,
                success : function(request) {
                    var doc = request.responseXML;
                    if (!doc || !doc.documentElement) {
                        doc = request.responseText;
                    }
                    capabilities = format.read(doc);
                    handleCallback(options.callback, capabilities, errors);
                },
                failure : function(response) {
                    var error = {};
                    error[KEY_ERROR_CODE] = response.status;
                    error[KEY_ERROR_TEXT] = response.statusText;
                    errors.push(error);
                    if ("undefined" !== typeof console && console) {
                        var errorStr = "ERROR: Response error: ";
                        errorStr += "Status: " + error[KEY_ERROR_CODE];
                        errorStr += ", Text: " + error[KEY_ERROR_TEXT];
                        console.error(errorStr);
                    }
                    handleCallback(options.callback, capabilities, errors);
                }
            });

        } else {
            // Throw an exception because of the synchronous error.
            // Then, this exception will be catched and handled properly by
            // the get data flow structure.
            throw "ERROR: Empty URL!";
        }
    }

    /**
     * See API for function description.
     */
    function getLayer(capabilities, layerName) {
        var layer;
        if (layerName && capabilities && capabilities.capability && capabilities.capability.layers) {
            // Find layer from layers.
            var layers = capabilities.capability.layers;
            for (var i = 0; i < layers.length; ++i) {
                var l = layers[i];
                if (l && l.name === layerName) {
                    // Match found.
                    layer = l;
                    break;
                }
            }
        }
        return layer;
    }

    /**
     * See API for function description.
     */
    function getLayerTimes(layer) {
        var times;
        if (layer) {
            var dimensions = layer.dimensions;
            if (dimensions) {
                var time = dimensions.time;
                if (time) {
                    times = time.values;
                }
            }
        }
        return times;
    }

    /**
     * See API for function description.
     */
    function getBeginTime(layer) {
        var time;
        var times = getLayerTimes(layer);
        if (times && times.length) {
            time = times[0];
            // Check if the time value is actually a string that combines
            // begin and end time information into one string instead of
            // providing separate time values for every step.
            if (1 === times.length && undefined !== time && null !== time) {
                // Make sure time is string before checking syntax.
                time = time + "";
                var timeSplits = time.split("/");
                if (timeSplits.length) {
                    // Begin time is the first part of the split.
                    time = timeSplits[0];
                }
            }
            time = new Date(time);
        }
        return time;
    }

    /**
     * See API for function description.
     */
    function getEndTime(layer) {
        var time;
        var times = getLayerTimes(layer);
        if (times && times.length) {
            time = times[times.length - 1];
            // Check if the time value is actually a string that combines
            // begin and end time information into one string instead of
            // providing separate time values for every step.
            if (undefined !== time && null !== time && 1 === times.length) {
                // Make sure time is string before checking syntax.
                time = time + "";
                var timeSplits = time.split("/");
                if (timeSplits.length > 1) {
                    // End time is the second part of the split.
                    time = timeSplits[1];
                }
            }
            time = new Date(time);
        }
        return time;
    }

    /**
     * See API for function description.
     */
    function getRequestUrl(capabilities) {
        var url;
        if (capabilities && capabilities.capability && capabilities.capability.request && capabilities.capability.request.getcapabilities && capabilities.capability.request.getcapabilities.href) {
            url = capabilities.capability.request.getcapabilities.href;
        }
        return url;
    }

    /**
     * See API for function description.
     */
    function getData(options) {
        if (options && options.callback) {
            try {
                getParsedData(options);

            } catch(e) {
                // An error occurred in synchronous flow.
                // But, inform observer about the error asynchronously.
                // Then, flow progresses similarly through API in both
                // error and success cases.
                var error = {};
                error[KEY_ERROR_TEXT] = e.toString();
                if ("undefined" !== typeof console && console) {
                    console.error("ERROR: Get data error: " + error[KEY_ERROR_TEXT]);
                }
                handleCallback(options.callback, undefined, [error]);
            }

        } else {
            // Callback is required. There is no reason to request data if it is not used somewhere.
            var errorStr = "ERROR: Options object and callback function in it are mandatory!";
            if ("undefined" !== typeof console && console) {
                console.error(errorStr);
            }
            throw errorStr;
        }
    }

    /**
     * ============================
     * Public API is returned here.
     * ============================
     */
    return {

        /**
         * Request data.
         *
         * Operation is asynchronous.
         *
         * Notice, callback is {function(data, errors)}.
         *      - data: Data object provides capabilities data.
         *              May be {undefined} if an error has occurred.
         *              See {OpenLayers.Format.WMSCapabilities.read} function for the object structure.
         *      - errors: Array that contains possible errors that occurred during the flow. Array is
         *                always provided even if it may be empty. If an error occurs, an error string
         *                is pushed here. Also, when an HTTP error occurs, error contains the textual
         *                portion of the HTTP status, such as "Not Found" or "Internal Server Error."
         *                Errors parameter is of this structure:
         *          [
         *              {
         *                  // None, one, or more of the following error values may exist.
         *                  // Values may also be {undefined} or {null}.
         *                  errorCode : "errorCodeString",
         *                  errorText : "errorTextString",
         *                  extension : {Object}
         *              },
         *              ...
         *          ]
         *
         * Notice, object properties of the function {options} parameter are URL encoded by this library
         * before they are inserted into the request URL.
         *
         * @param {Object} options Mandatory. May not be {undefined} or {null}. Object structure:
         *     {
         *         url : {String}
         *               Mandatory property. May not be {undefined}, {null} or empty.
         *               URL that is used for the capability request.
         *         params : {Object}
         *                  Params properties may be provided to replace default parameters used for the
         *                  capability request. Optional and may be {undefined} or {null} if default may
         *                  be used. But, should not be empty if the object is given.
         *         callback : {function(capabilities, errors)}
         *                    Mandatory property. May not be {undefined} or {null}.
         *                    Callback is called with the parsed capabilities data
         *                    and errors array when operation finishes.
         *                    If an error occurs, data is set {undefined} for the callback.
         *                    Possible errors are given inside the array that is always provided.
         *     }
         */
        getData : getData,

        /**
         * Get URL that is used for capabilities request.
         *
         * Notice, this may differ from the URL that is originally given for {getData}.
         *
         * @param {Object} capabilities Capabilities data object that is gotten by using {getData}.
         *                              Operation is ignored if {undefined}, {null} or empty.
         * @return {String} URL string that is used for given {capabilities}. May be {undefined}.
         */
        getRequestUrl : getRequestUrl,

        /**
         * Get layer object that matches the given layer name.
         *
         * @param {Object} capabilities Capabilities object whose layers are searched through.
         *                              Operation is ignored if {undefined} or {null}.
         * @param {String} layerName Name of the layer that is searched for.
         *                           For example, "Weather:temperature" if capability request
         *                           URL did not contain service as part of the URL path.
         *                           For example, "temperature" if service name was already
         *                           included in request URL path.
         *                           Operation is ignored if {undefined}, {null} or empty.
         * @return {Object} Layer that matches the layer name. May be {undefined}.
         */
        getLayer : getLayer,

        /**
         * Get layer time values from the given {layer}.
         *
         * @param {Object} layer Layer object whose time values are requested.
         *                       Layer may be gotten by using {getLayer} function.
         *                       Operation is ignored if {undefined} or {null}.
         * @return {Array} Array of time values from the matching layer. May be {undefined}.
         */
        getLayerTimes : getLayerTimes,

        /**
         * Get begin time of the given {layer}.
         *
         * @param {Object} layer Layer object whose begin time is requested.
         *                       Layer may be gotten by using {getLayer} function.
         *                       Operation is ignored if {undefined} or {null}.
         * @return {Date} Date for begin time. May be {undefined}.
         */
        getBeginTime : getBeginTime,

        /**
         * Get end time of the given {layer}.
         *
         * @param {Object} layer Layer object whose end time is requested.
         *                       Layer may be gotten by using {getLayer} function.
         *                       Operation is ignored if {undefined} or {null}.
         * @return {Date} Date for end time. May be {undefined}.
         */
        getEndTime : getEndTime

    };

})();
