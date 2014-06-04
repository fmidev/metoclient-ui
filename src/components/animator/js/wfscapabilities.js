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
    throw "ERROR: Lo-Dash is required for fi.fmi.metoclient.ui.animator.WfsCapabilities!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

/**
 * WfsCapabilities object provides functions to asynchronously request
 * capabilities XML data from the server as WFS queries and to get the
 * requested data in a parsed structure for WMS capability object.
 *
 * Notice, this class creates WMS capabilities object from the WFS data.
 * WFS data may be gotten faster from the server than WMS capabilites data
 * and therefore this class is provided. Notice, this is a dummy version
 * and the structure of the capability object is greatly simplified from
 * the one provided by {fi.fmi.metoclient.ui.animator.WmsCapabilities} class.
 *
 * Notice, multiple WFS queries may be required for multiple layers. If one or
 * more of the layers use WMS capabilities it may be a better idea use only one WMS
 * URL for all of them and then query all information in single WMS capabilities query.
 *
 * WfsCapabilities itself is stateless. It only provides API functions
 * to start asynchronous flows that can be followed by callback functions.
 *
 * See API description in the end of the function.
 */
fi.fmi.metoclient.ui.animator.WfsCapabilities = (function() {

    // Delta time in ms to past when starttime is calcuated for WFS query.
    var DELTA_TIME_PAST = 1 * 24 * 60 * 60 * 1000;
    // Delta time in ms to future when endtime is calcuated for WFS query.
    var DELTA_TIME_FUTURE = 1 * 24 * 60 * 60 * 1000;

    // Ajax request constants and response XML constants.
    var HTTP_METHOD = "GET";
    var REQUEST_DATA_TYPE = "XML";
    var XML_GML_TIME_POSITION = "gml\\:timePosition, timePosition";

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
                callback(data, errors);
            }, 0);
        }
    }

    /**
     * Find animation object from the given args object.
     *
     * @param {Object} args Object should be args-object of a layer
     *                      from the main configuration object.
     *                      May be {undefined} or {null}.
     */
    function findAnimation(args) {
        var animation;
        _.forEach(args, function(arg) {
            if (arg && arg.animation) {
                animation = arg.animation;
                // No need to search further.
                // Exit forEach loop.
                return false;
            }
        });
        return animation;
    }

    /**
     * See API for function description.
     */
    function isService(capabilitiesConfig) {
        // Use wfs for capabilities information if stored query id is given.
        return capabilitiesConfig && capabilitiesConfig.storedQueryId;
    }

    /**
     * See API for function description.
     */
    function getUniqueConfigs(capabilitiesConfigs, target) {
        _.forEach(capabilitiesConfigs, function(config) {
            // Skip items whose URLs are not for WFS service.
            if (isService(config)) {
                _.forEach(capabilitiesConfigs, function(config2) {
                    if (config === config2) {
                        // Item itself is the first of the kind. Add to uniques target array.
                        target.push(config);
                        // Stop looping for this item.
                        return false;

                    } else if (config.url === config2.url && config.storedQueryId === config2.storedQueryId) {
                        // Duplicate exists in the array before.
                        // Do not add to uniques because corresponding item has already been added before.
                        // Stop searching for this item.
                        return false;
                    }
                });
            }
        });
    }

    /**
     * See API for function description.
     */
    function getData(options) {
        if (options.capabilities && options.capabilities.url && options.capabilities.layer && options.capabilities.storedQueryId) {
            var errors = [];
            var now = (new Date()).getTime();

            // Capabilities object whose structure is reduced version of the one given by
            // {OpenLayers.Format.WMSCapabilities.read} function for the WMS capability object
            // structure.
            var capabilities = {
                capability : {
                    layers : [],
                    request : {
                        getcapabilities : {
                            href : jQuery.trim(options.capabilities.url)
                        }
                    }
                }
            };

            var params = {
                request : "GetPropertyValue",
                valuereference : "wfs:FeatureCollection/wfs:member/omso:GridSeriesObservation/om:phenomenonTime/gml:TimeInstant/gml:timePosition",
                storedquery_id : options.capabilities.storedQueryId,
                // Set starttime and endtime parameters because WFS query requires these unless default should be used
                // which would not give all the times available. Therefore, use deltas that defined large period which should
                // contain all the times available from the server.
                // Notice, server does not understand milliseconds. Therefore, they are removed from time strings.
                starttime : (new Date(now - DELTA_TIME_PAST)).toISOString().replace(/\.\d\d\dZ$/, "Z"),
                endtime : (new Date(now + DELTA_TIME_FUTURE)).toISOString().replace(/\.\d\d\dZ$/, "Z")
            };
            // Merge params into the default object.
            // Notice, options.params will replace default values if they overlap.
            _.merge(params, options.params);

            // Get XML data from the server.
            // Make sure that this function is asynchronous in all cases,
            // also in possible error cases that could otherwise use callback synchronously.
            setTimeout(function() {
                // URL may be logged here for debugging purposes.
                // Then, you may also use the URL directly with a web browser to check the XML.
                // if ("undefined" !== typeof console && console) { console.debug("URL: " + options.capabilities.url); }
                jQuery.ajax({
                    type : HTTP_METHOD,
                    url : jQuery.trim(options.capabilities.url),
                    dataType : REQUEST_DATA_TYPE,
                    data : params,
                    success : function(data) {
                        // Request was success.
                        // Notice, if server gives an exception information
                        // in XML format for some error case, the flow should
                        // come here. But, if testing is done for this javascript
                        // in different domain or sub-domain than URL used for ajax,
                        // the callback may call error-function instead. Then,
                        // the XML body may not be available for parsing.
                        var layer = {
                            name : options.capabilities.layer,
                            dimensions : {
                                time : {
                                    values : []
                                }
                            }
                        };
                        capabilities.capability.layers.push(layer);
                        jQuery(data).find(XML_GML_TIME_POSITION).each(function() {
                            // XML gives times in ascending order.
                            // Also, capabilities layer object should give times in ascending order.
                            layer.dimensions.time.values.push((new Date(jQuery.trim(jQuery(this).text()))).getTime());
                        });
                        handleCallback(options.callback, capabilities, errors);
                    },
                    error : function(jqXHR, textStatus, errorThrown) {
                        // An error occurred.
                        var error = {};
                        error[KEY_ERROR_CODE] = jqXHR.status;
                        // Use errorThrown if it is available and not empty string.
                        // Otherwise, use textStatus for error value. Notice, empty
                        // string is also interpreted as false with logical or operator.
                        error[KEY_ERROR_TEXT] = errorThrown || textStatus;
                        errors.push(error);
                        if ("undefined" !== typeof console && console) {
                            var errorStr = "ERROR: WFS XML response error: ";
                            errorStr += "Status: " + error[KEY_ERROR_CODE];
                            errorStr += ", Text: " + error[KEY_ERROR_TEXT];
                            console.error(errorStr);
                        }
                        handleCallback(options.callback, undefined, errors);
                    }
                });
            }, 0);

        } else {
            // Throw an exception because of the synchronous error.
            // Then, this exception will be catched and handled properly by
            // the get data flow structure.
            throw "ERROR: WFS capabilities configuration is missing URL, layer or storedQueryId information!";
        }
    }

    /**
     * See API for function description.
     */
    function getCapabilitiesConfigs(config, target) {
        _.forEach(config.layers, function(layer) {
            if (isService(layer.capabilities)) {
                // Capabilities has been defined for the main-level layer.
                target.push(layer.capabilities);
                // WFS needs to have own capabilities also for sublayers
                // because capabilities are layer and not only URL specific for WFS.
                var animation = findAnimation(layer.args);
                if (animation) {
                    _.forEach(animation.layers, function(animationLayer) {
                        target.push({
                            url : layer.capabilities.url,
                            layer : animationLayer.layer,
                            storedQueryId : animationLayer.storedQueryId
                        });
                    });
                }
            }
        });
    }

    /**
     * ============================
     * Public API is returned here.
     * ============================
     */
    return {

        /**
         * Check if the given {capabilitiesConfig} describes WFS service.
         *
         * @param {Object} capabilitiesConfig Capabilities config object
         *                                    from animator main configuration object.
         *                                    May be {undefined} or {null}.
         */
        isService : isService,

        /**
         * Get unique capabilities config objects.
         *
         * Only one of the possible duplicates is inclued into {target}.
         *
         * @param {Object} capabilitiesConfigs Array for capabilities config objects
         *                                     from animator main configuration object.
         *                                     May not be {undefined} or {null}.
         * @param {Array} target Unique config objects are included into {target} array.
         */
        getUniqueConfigs : getUniqueConfigs,

        /**
         * Request capability data from the server.
         *
         * Operation is asynchronous.
         *
         * Notice, callback is {function(data, errors)}.
         *      - data: Data object provides capabilities data.
         *              May be {undefined} if an error has occurred.
         *              See {OpenLayers.Format.WMSCapabilities.read} function for the object structure.
         *              But notice, this class provides a greatly simplified version and not all the
         *              properties are available.
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
         * @throws {String} Exception string is thrown if {options} does not contain proper information.
         */
        getData : getData,

        /**
         * Capabilities config objects provide information that is used to load capabilities content.
         *
         * This function makes WFS service specific checks when creating capabilities config objects.
         *
         * @param {Object} config Animator main configuration object.
         *                        May be {undefined} or {null}.
         * @param {Array} target Target array for capabilities config objects that provide URLs that should be loaded
         *                       before initializing the configuration. May not be {undefined} or {null}.
         */
        getCapabilitiesConfigs : getCapabilitiesConfigs

    };

})();
