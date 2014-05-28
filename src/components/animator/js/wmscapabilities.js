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
    throw "ERROR: Lo-Dash is required for fi.fmi.metoclient.ui.animator.WmsCapabilities!";
}

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
 * WmsCapabilities object provides functions to asynchronously request
 * WMS capabilities XML data from the server and to get the requested
 * data in a parsed structure.
 *
 * WmsCapabilities itself is stateless. It only provides API functions
 * to start asynchronous flows that can be followed by callback functions.
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
                callback(data, errors);
            }, 0);
        }
    }

    /**
     * See API for function description.
     */
    function isService(capabilitiesConfig) {
        // Accept anything else if service is not WFS.
        return capabilitiesConfig && capabilitiesConfig.url && !fi.fmi.metoclient.ui.animator.WfsCapabilities.isService(capabilitiesConfig);
    }

    /**
     * See API for function description.
     */
    function getUniqueConfigs(capabilitiesConfigs, target) {
        // WMS capabilities are URL specific.
        // Notice, single WMS capabilities response may contain capabilities information
        // for all the layers or for single workspace.
        // Before adding configs to target, make sure only WMS service specific configurations are added here.
        target.push.apply(target, _.uniq(_.filter(capabilitiesConfigs, function(config) {
            return config && isService(config);
        }), "url"));
    }

    /**
     * See API for function description.
     */
    function getData(options) {
        var capabilities;
        var errors = [];
        if (options.capabilities && options.capabilities.url) {
            var format = new OpenLayers.Format.WMSCapabilities();
            var params = {
                SERVICE : DEFAULT_SERVICE,
                VERSION : DEFAULT_VERSION,
                REQUEST : DEFAULT_REQUEST
            };
            // Merge params into the default object.
            // Notice, options.params will replace default values if they overlap.
            _.merge(params, options.params);

            OpenLayers.Request.GET({
                url : options.capabilities.url,
                params : params,
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
            throw "ERROR: WMS capabilities configuration is missing URL!";
        }
    }

    /**
     * See API for function description.
     */
    function getCapabilitiesConfigs(config, target) {
        // Insert capabilities objects from config layers into the target array.
        target.push.apply(target, _.map(_.filter(config.layers, function(layer) {
            return layer && isService(layer.capabilities);
        }), "capabilities"));
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
         * This function makes WMS service specific checks when creating capabilities config objects.
         *
         * @param {Object} config Animator main configuration object.
         *                        May be {undefined} or {null}.
         * @param {Array} target Target array for capabilities config objects that provide URLs that should be loaded
         *                       before initializing the configuration. May not be {undefined} or {null}.
         */
        getCapabilitiesConfigs : getCapabilitiesConfigs

    };

})();
