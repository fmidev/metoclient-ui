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

// Requires lo-dash
if ("undefined" === typeof _ || !_) {
    throw "ERROR: Lo-Dash is required for fi.fmi.metoclient.ui.animator.Capabilities!";
}

// Requires OpenLayers
if ("undefined" === typeof OpenLayers || !OpenLayers) {
    throw "ERROR: OpenLayers is required for fi.fmi.metoclient.ui.animator.Capabilities!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

/**
 * Capabilities object acts as an interface that provides functions
 * to asynchronously request WMS capabilities XML data from the server
 * and to get the requested data in a parsed structure.
 *
 * Capabilities itself is stateless. It only provides API functions
 * to start asynchronous flows that can be followed by callback functions.
 *
 * Example:
 * fi.fmi.metoclient.ui.animator.Capabilities.getData(
 *     {
 *         conifg : animatorConfig,
 *         callback: function(data, errors) {
 *             var layer = fi.fmi.metoclient.ui.animator.Capabilities.getLayer(data, "Weather:temperature");
 *             var begin = fi.fmi.metoclient.ui.animator.Capabilities.getBeginTime(layer);
 *             var end = fi.fmi.metoclient.ui.animator.Capabilities.getEndTime(layer);
 *             var allLayerTimes = fi.fmi.metoclient.ui.animator.Capabilities.getLayerTimes(layer);
 *         }
 *     });
 *
 * See API description in the end of the function.
 */
fi.fmi.metoclient.ui.animator.Capabilities = (function() {

    // Error object keys.
    var KEY_ERROR_TEXT = "errorText";

    /**
     * Select service based on the options object properties.
     *
     * @param {Object} options Object provides properties that define capabilities
     *                         information that is used to select proper service.
     *                         Capabilities info is checked from {options.capabilities} object
     *                         whose structure is same as used in the animator initialization
     *                         config object for layers.
     *                         Defaults to {fi.fmi.metoclient.ui.animator.WmsCapabilities}.
     */
    function selectService(options) {
        return fi.fmi.metoclient.ui.animator.WfsCapabilities.isService(options.capabilities) ? fi.fmi.metoclient.ui.animator.WfsCapabilities : fi.fmi.metoclient.ui.animator.WmsCapabilities;
    }

    /**
     * Capabilities config objects provide information that is used to load capabilities content.
     *
     * This function makes service specific checks when creating capabilities config objects.
     *
     * @param {Object} config Animator main configuration object.
     *                        May be {undefined} or {null}.
     * @param {Array} target Target array for capabilities config objects from animator main configuration object.
     *                       May not be {undefined} or {null}.
     */
    function getCapabilitiesConfigs(config, target) {
        // Get unique WFS capabilities from config.
        fi.fmi.metoclient.ui.animator.WfsCapabilities.getCapabilitiesConfigs(config, target);
        // Get unique WMS capabilities from config.
        fi.fmi.metoclient.ui.animator.WmsCapabilities.getCapabilitiesConfigs(config, target);
    }

    /**
     * This function provides unique capabilities config objects.
     *
     * Possible duplicate objects are not included into the array. Service specific checking for duplicates.
     *
     * @param {Object} Main config objects for animator. This is used to find capabilities config objects.
     *                 May not be {undefined} or {null}.
     * @return {Array} Array of capabilities objects that should be loaded before initializing the configuration
     *                 Array is always provided even if it may be empty.
     */
    function getUniqueCapabilities(config) {
        var uniques = [];
        var capabilitiesConfigs = [];
        getCapabilitiesConfigs(config, capabilitiesConfigs);
        // Get unique WFS capabilities from configs
        fi.fmi.metoclient.ui.animator.WfsCapabilities.getUniqueConfigs(capabilitiesConfigs, uniques);
        // Get unique WMS capabilities from configs
        fi.fmi.metoclient.ui.animator.WmsCapabilities.getUniqueConfigs(capabilitiesConfigs, uniques);
        return uniques;
    }

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
                callback(data, errors);
            }, 0);
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
    function getData(options) {
        if (options && options.callback && options.config) {
            var onComplete = _.once(handleCallback);
            var results = {
                nComplete : 0,
                capabilities : [],
                errors : []
            };

            var uniqueCapabilities = getUniqueCapabilities(options.config);
            var nRequests = uniqueCapabilities.length;
            if (nRequests > 0) {
                _.each(uniqueCapabilities, function(serviceCapability) {
                    var itemOptions = {
                        capabilities : serviceCapability,
                        callback : function(capabilities, errors) {
                            try {
                                // One request in a flow has completed.
                                ++results.nComplete;

                                if (capabilities) {
                                    results.capabilities.push({
                                        url : serviceCapability.url,
                                        capabilities : capabilities
                                    });
                                }
                                results.errors.push.apply(results.errors, errors);

                                if (results.nComplete === nRequests) {
                                    // All the requests in the flow have finished.
                                    onComplete(options.callback, results.capabilities, results.errors);
                                }

                            } catch(e) {
                                // An error occurred in one request of an asynchronous flow.
                                var error = {};
                                error[KEY_ERROR_TEXT] = "ERROR: Error in GetCapabilities flow: " + e.toString();
                                if ("undefined" !== typeof console && console) {
                                    console.error(error[KEY_ERROR_TEXT]);
                                }
                                results.errors.push(error);
                                // Flow is completed only after all the requests have finished.
                                // So, let the flow continue even if some of the requests fail.
                                if (results.nComplete === nRequests) {
                                    // Whole flow has finished. Inform about completion.
                                    onComplete(options.callback, results.capabilities, results.errors);
                                }
                            }
                        },
                        params : options.params
                    };

                    // Start asynchronous operation.
                    selectService(itemOptions).getData(itemOptions);

                });

            } else {
                onComplete(options.callback, results.capabilities, results.errors);
            }

        } else {
            // Callback is required. There is no reason to request data if it is not used somewhere.
            var errorStr = "ERROR: Options object and config object and callback function in it are mandatory!";
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
         *      - data: Array provides capabilities data as objects of form:
         *                {
         *                    url: {String},
         *                    capabilities: See {OpenLayers.Format.WMSCapabilities.read} function
         *                                  for the capabilities object structure.
         *                }.
         *              At least an empty array is always given.
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
         *         config : {Object}
         *                   Mandatory property. May not be {undefined}, {null} or empty.
         *                   Configuration content is used for the capability requests.
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
