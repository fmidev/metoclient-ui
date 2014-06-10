// Strict mode for whole file.
"use strict";

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
// "use strict";

// Requires lodash
if ("undefined" === typeof _ || !_) {
    throw "ERROR: Lo-Dash is required for fi.fmi.metoclient.ui.animator.Utils!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

/**
 * Utils object initializes commonly needed functionality and provides API for general utility functions.
 *
 * There is no need to use {new} to create an instance of Utils.
 * Internal functions are called during the construction of this sigleton instance.
 * API functions provided by this object can be directly used.
 */
fi.fmi.metoclient.ui.animator.Utils = (function() {

    /**
     * Function to provide {bind} if an older browser does not support it natively.
     *
     * This will provide IE8+ support.
     * See, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
     *
     * This function is called during the construction of this singleton instance to make sure
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
     * Avoid console errors in browsers that lack a console.
     *
     * See: https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js
     */
    (function() {
        var method;
        var noop = function() {
        };
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = (window.console = window.console || {});

        while (length--) {
            method = methods[length];

            // Only stub undefined methods.
            if (!console[method]) {
                console[method] = noop;
            }
        }
    })();

    /**
     * Function to set jQuery.browser information.
     * See, http://stackoverflow.com/questions/14545023/jquery-1-9-browser-detection
     */
    (function() {
        if (!jQuery.browser) {
            var matched, browser;

            // Use of jQuery.browser is frowned upon.
            // More details: http://api.jquery.com/jQuery.browser
            // jQuery.uaMatch maintained for back-compat
            jQuery.uaMatch = function(ua) {
                ua = ua.toLowerCase();

                var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

                return {
                    browser : match[1] || "",
                    version : match[2] || "0"
                };
            };

            matched = jQuery.uaMatch(navigator.userAgent);
            browser = {};

            if (matched.browser) {
                browser[matched.browser] = true;
                browser.version = matched.version;
            }

            // Chrome is Webkit, but Webkit is also Safari.
            if (browser.chrome) {
                browser.webkit = true;

            } else if (browser.webkit) {
                browser.safari = true;
            }

            jQuery.browser = browser;
        }
    })();

    /**
     * This function is called during the construction of this sigleton
     * instance to provide at least a limited support for cross-domain request (XDR)
     * when jQuery.ajax is used for IE 8 and 9.
     *
     * IE 6, 7, 8, and 9 do not support XHR2 CORS.
     * It is not possible to make generalized cross-domain requests in these browsers.
     * IE 8, 9 support an ActiveX control called XDomainRequest that only allows limited
     * cross-domain requests compared to XHR2 CORS. IE 10 supports XHR2 CORS.
     *
     * For more information about this, see following links:
     *    https://github.com/jaubourg/ajaxHooks/blob/master/src/xdr.js
     *    http://stackoverflow.com/questions/14309037/ajax-no-transport-error-in-ie-8-9
     *    http://bugs.jquery.com/ticket/8283#comment:43
     *    http://bugs.jquery.com/ticket/8283#comment:44
     *    http://bugs.jquery.com/ticket/8283#comment:45
     *
     * jQuery does not include XDomainRequest support because there are numerous
     * and serious limitations to XDR. Many reasonable $.ajax requests would fail,
     * including any cross-domain request made on IE6 and IE7 which are otherwise
     * supported by jQuery. Developers would be confused that their content types
     * and headers were ignored, or that IE8 users could not use XDR if the user was
     * using InPrivate browsing for example.
     *
     * Even the crippled XDR can be useful if it is used by a knowledgeable developer.
     * A jQuery team member has made an XDR ajax transport available. You must be aware
     * of XDR limitations by reading this blog post or ask someone who has dealt with
     * XDR problems and can mentor you through its successful use.
     *
     * For further help and other solutions, ask on the jQuery Forum, StackOverflow,
     * or search "jQuery xdr transport".
     */
    (function() {
        if (window.XDomainRequest) {
            jQuery.ajaxTransport(function(s) {
                if (s.crossDomain && s.async) {
                    if (s.timeout) {
                        s.xdrTimeout = s.timeout;
                        delete s.timeout;
                    }
                    var xdr;
                    return {
                        send : function(_, complete) {
                            function callback(status, statusText, responses, responseHeaders) {
                                xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
                                xdr = undefined;
                                complete(status, statusText, responses, responseHeaders);
                            }

                            xdr = new XDomainRequest();
                            xdr.onload = function() {
                                callback(200, "OK", {
                                    text : xdr.responseText
                                }, "Content-Type: " + xdr.contentType);
                            };
                            xdr.onerror = function() {
                                callback(404, "Not Found");
                            };
                            xdr.onprogress = jQuery.noop;
                            xdr.ontimeout = function() {
                                callback(0, "timeout");
                            };
                            xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
                            xdr.open(s.type, s.url);
                            xdr.send((s.hasContent && s.data ) || null);
                        },
                        abort : function() {
                            if (xdr) {
                                xdr.onerror = jQuery.noop;
                                xdr.abort();
                            }
                        }
                    };
                }
            });
        }
    })();

    /**
     * Function to set {toISOString} for {Date} objects if an older browser does not support it natively.
     *
     * See, http://stackoverflow.com/questions/11440569/converting-a-normal-date-to-iso-8601-format
     *
     * This function is called during the construction of this sigleton instance to make sure
     * function is available.
     */
    (function() {
        // Override only if native toISOString is not defined.
        if (!Date.prototype.toISOString) {
            // Rely on JSON serialization for dates because it matches
            // the ISO standard. However, check if JSON serializer is present
            // on a page and define own .toJSON method only if necessary.
            if (!Date.prototype.toJSON) {
                Date.prototype.toJSON = function(key) {
                    var pad = function(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    };

                    return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) + 'T' + pad(this.getUTCHours()) + ':' + pad(this.getUTCMinutes()) + ':' + pad(this.getUTCSeconds()) + 'Z';
                };
            }

            Date.prototype.toISOString = Date.prototype.toJSON;
        }
    })();

    /**
     * @private
     *
     * Creates a constructor wrapper function that may be instantiated with {new}.
     *
     * @param {Function} constructor Constructor function.
     *                               Operation ignored if {undefined} or {null}.
     * @param {Array} args Arguments array that contains arguments that are given for the constructor.
     *                     May be {undefined} or {null}.
     * @return {Function} Wrapper function for constructor with given arguments.
     *                    This can be used with {new} to instantiate.
     *                    Notice, returned function needs to be surrounded with parentheses when {new} is used.
     *                    For example, new (constructorWrapper(constructor, args));
     */
    function constructorWrapper(constructor, args) {
        var wrapper;
        if (constructor) {
            var params = [constructor];
            if (args) {
                params = params.concat(args);
            }
            wrapper = constructor.bind.apply(constructor, params);
        }
        return wrapper;
    }

    /**
     * See API for function description.
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
     * Return Utils API as an object.
     */
    return {

        /**
         * Create instance of the class with the given class name and arguments
         *
         * @param {String} className Name of the class to be instantiated.
         *                           Operation ignored if {undefined}, {null} or empty.
         * @param {Array} args Arguments array that contains arguments that are given for the constructor.
         *                     May be {undefined} or {null}.
         * @return {Object} New Instance of the class with given arguments.
         */
        createInstance : createInstance

    };

})();

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
// "use strict";

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
// "use strict";

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
// "use strict";

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

    // Constants.
    var TIME_RADIX = 10;
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
            // Time is expected to be time format string if it is not a number.
            // Convert time value into Date object.
            time = new Date(isNaN(time) ? time : parseInt(time, TIME_RADIX));
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
            // Time is expected to be time format string if it is not a number.
            // Convert time value into Date object.
            time = new Date(isNaN(time) ? time : parseInt(time, TIME_RADIX));
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

// "use strict";

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
    };

    // Constructor function for new instantiation.
    return _constructor;
})();

// "use strict";

// Requires Raphael JS
if ( typeof Raphael === "undefined" || !Raphael) {
    throw "ERROR: Raphael JS is required for fi.fmi.metoclient.ui.animator.Controller!";
}

// Requires jQuery
if ("undefined" === typeof jQuery || !jQuery) {
    throw "ERROR: jQuery is required for fi.fmi.metoclient.ui.animator.Controller!";
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

    var createCanvas = Raphael;
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
     * @param {Integer} defaultTimePosition Default time in milliseconds for the animator slider position.
     *                                      Time must be on proper resolution and inside scale area.
     *                                      May be {undefined} or {null}. Then, beginning time is used.
     */
    var _constructor = function(element, width, height, defaultTimePosition) {
        var _me = this;

        // See init function for member variable initializations and descriptions.

        // Controller member variables.
        //-----------------------------
        var _paper;
        var _model;
        var _timeController;
        var _scaleConfig;
        var _sliderConfig;

        // Scale member variables.
        //------------------------

        var _tickSet;
        var _progressCellSet;
        var _scaleContainer;
        var _background;
        var _obsBackground;
        var _fctBackground;
        var _leftHotSpot;
        var _rightHotSpot;

        // Slider member variables.
        //-------------------------

        var _slider;
        var _sliderBg;
        var _sliderLabel;
        // This is updated when slider is dragged.
        var _dragStartX;

        // Private element position information functions.
        //------------------------------------------------

        /**
         * This is required to make sure slider is not hidden when it is in the side.
         * This happends if it is outside of the paper. Therefore, use padding that
         * takes this into account.
         *
         * @return {Integer} Scale padding.
         */
        function getScalePadding() {
            // Notice, exact value can be calculated by _sliderConfig.width - _sliderConfig.sliderTipDx.
            // But it may be better to use constant. Then, for example UI CSS design may be easier to do if
            // values are constants.
            return 50;
        }

        /**
         * @return {Integer} Scale container offset relative to the window.
         */
        function getScaleContainerOffsetX() {
            return Math.floor(jQuery(_scaleContainer.node).offset().left);
        }

        /**
         * @return {Integer} Scale area offset relative to the window.
         */
        function getScaleAreaOffsetX() {
            return getScaleContainerOffsetX() + getScalePadding();
        }

        /**
         * @return {Integer} Slider background offset relative to the window.
         */
        function getSliderBackgroundOffsetX() {
            // Firefox seems to show the slider a little bit off the place.
            // Problem seems to be related to the stroke width of the slider.
            // Therefore, set 0 for the width before getting the offset value
            // and change the width value back after offset value is gotten.
            _sliderBg.attr('stroke-width', 0);
            var x = Math.floor(jQuery(_sliderBg.node).offset().left);
            _sliderBg.attr('stroke-width', _sliderConfig.strokeWidth);
            return x;
        }

        /**
         * @return {Integer} Slider tip offset relative to the window.
         */
        function getSliderTipOffsetX() {
            return getSliderBackgroundOffsetX() + _sliderConfig.sliderTipDx;
        }

        /**
         * @return {Integer} Slider default offset relative to the window.
         */
        function getDefaultSliderOffsetX() {
            return getScaleAreaOffsetX() + getResolution() / getTimeScale();
        }

        // Private controller functions.
        //------------------------------

        function resetHotSpots() {
            // Left hot spot always starts from the same place. Only length changes.
            // Left hot spot width is to the position of the slider tip.
            var leftWidth = getSliderTipOffsetX() - getScaleContainerOffsetX();
            if (leftWidth < 0) {
                leftWidth = 0;
            }
            _leftHotSpot.attr("width", leftWidth);

            // Right hot spot position and width change when slider moves.
            var rightWidth = _scaleContainer.attr("width") - leftWidth;
            if (rightWidth < 0) {
                rightWidth = 0;
            }
            _rightHotSpot.attr("x", _leftHotSpot.attr("x") + leftWidth).attr("width", rightWidth);
        }

        // Private model functions.
        //-------------------------

        function getForecastStartTime() {
            return _model ? _model.getForecastStartTime() : 0;
        }

        function getStartTime() {
            return _model ? _model.getStartTime() - getResolution() : 0;
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
            return _model && getScaleAreaWidth() ? (getEndTime() - getStartTime()) / getScaleAreaWidth() : 1;
        }

        // Private slider functions.
        //--------------------------

        // Position and time converter functions for slider.
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
         * @param {Integer} x X position of the tip of the slider relative to window origin.
         * @return {Integer} Time corresponding to given x position.
         */
        function posToTime(x) {
            // Container may not be located to the origin of the window.
            // Therefore, take the correct position into account.
            // Also notice, correct time should be identified by the tip position.
            var time = Math.floor(getStartTime() + ((x - getScaleAreaOffsetX()) * getTimeScale()));
            if (time < getStartTime()) {
                time = getStartTime();

            } else if (time > getEndTime()) {
                time = getEndTime();
            }
            return time;
        }

        /**
         * @param {Integer} time Time in milliseconds.
         * @return {Integer} X position of the given time.
         */
        function timeToPos(time) {
            // Container may not be located to the origin of the window.
            var sliderOffset = getScaleAreaOffsetX();
            var deltaT = time - getStartTime();
            var timeScale = getTimeScale();
            var position = Math.floor(sliderOffset + ( timeScale ? deltaT / timeScale : 0 ));
            return position;
        }

        // Slider functions that are required for slider initializations.
        //---------------------------------------------------------------

        /**
         * Set label text according to the position of the slider.
         */
        function resetSliderLabelText() {
            var date = new Date(timeToResolution(posToTime(getSliderTipOffsetX())));
            _sliderLabel.attr('text', getTimeStr(date));
        }

        /**
         * Transform slider set elements by given delta.
         *
         * @param {Integer} deltaX Delta value for transform movement
         *                         in x-axis direction for slider set elements.
         *                         May not be {undefined} or {null}.
         */
        function transformSliderElements(deltaX) {
            // RegExp corresponding movement transform string.
            var transformRegExp = /T-*\d+,0/;
            // Handle transform of each element in slider set separately.
            _slider.forEach(function(e) {
                // Get the current transform string of the element.
                var previousTransform = e.transform().toString();
                // Check if the movement transform has been defined before.
                var previousTransformMatch = previousTransform.match(transformRegExp);
                if (previousTransformMatch && previousTransformMatch.length) {
                    // Element has been moved before because movement transform string was found.
                    // There should be only one match. Get the previous movement deltaX value from
                    // the first match string. Notice, skip T-character from the string before parsing
                    // the integer value from the string.
                    var previousValue = parseInt(previousTransformMatch[0].substring(1), 10);
                    // Set new transform deltaX into the elment transform string.
                    e.transform(previousTransform.replace(transformRegExp, "T" + (previousValue + deltaX) + ",0"));

                } else {
                    // Element has not been moved before.
                    // But, transform may still contain data.
                    // Append movement transform string for element.
                    e.transform("...T" + deltaX + ",0");
                }
            });
        }

        /**
         * @param {Integer} x X position relative to the window origin.
         *                    Notice, x should refer to new x position of the
         *                    tip of slider.
         */
        function moveSliderTo(x) {
            var delta = Math.round(x - getSliderTipOffsetX());
            var scaleX = getScaleAreaOffsetX();
            if (delta && x >= scaleX && x <= scaleX + getScaleAreaWidth()) {
                transformSliderElements(delta);
                resetSliderLabelText();
                resetHotSpots();
            }
        }

        function redrawSlider() {
            _slider.toFront();
            resetSliderLabelText();
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
            _dragStartX = getSliderBackgroundOffsetX();
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
            // not the exact position of the slider. Also, dx is
            // relative to the drag start position, not to the
            // previous movement.
            var newTime = posToTime(_dragStartX + dx);
            _timeController.proposeTimeSelectionChange(newTime);
        }

        /**
         * @param event DOM event object.
         */
        function finalizeDragMove(event) {
            _dragStartX = undefined;
        }

        // Private scale functions.
        //-------------------------

        // Scale functions that are required for scale initializations.
        //-------------------------------------------------------------

        function nextFrame() {
            _timeController.proposeNextFrame();
        }

        function previousFrame() {
            _timeController.proposePreviousFrame();
        }

        // Handle mouse scroll event.
        function handleMouseScroll(event, delta, deltaX, deltaY) {
            if (delta > 0) {
                // Scrolling up.
                nextFrame();

            } else if (delta < 0) {
                // Scrolling down.
                previousFrame();
            }
            // Prevent scrolling of the page.
            return false;
        }

        function getObsWidth() {
            var width = 0;
            var forecastStartTime = getForecastStartTime();
            var startTime = getStartTime();
            var endTime = getEndTime();
            if (undefined !== forecastStartTime) {
                if (_model && (endTime - startTime)) {
                    // Forecast start time is given and width can be calculated.
                    width = Math.floor(getScaleAreaWidth() * (forecastStartTime - startTime) / (endTime - startTime));
                }

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

        // Scale functions for animation.
        //-------------------------------

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
                    jQuery(cell.node).mousewheel(handleMouseScroll);
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
                        jQuery(tick.node).mousewheel(handleMouseScroll);
                        if (newHour && i < cellCount) {
                            var hourLabel = _paper.text(positionX + 2, getScaleAreaY() + 8, getTimeStr(date)).attr("text-anchor", "start").attr("font-family", _labelFontFamily).attr("font-size", _labelFontSize).attr("fill", Raphael.getRGB("black"));
                            // Check if the hourlabel fits into the scale area.
                            var hourLabelNode = jQuery(hourLabel.node);
                            if (hourLabelNode.offset().left + hourLabelNode.width() <= getScaleAreaOffsetX() + getScaleAreaWidth()) {
                                // Label fits. So, let it be in the UI.
                                _tickSet.push(hourLabel);
                                jQuery(hourLabel.node).mousewheel(handleMouseScroll);

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

        // Private controller functions.
        //------------------------------

        /**
         * Redraw scale and slider elements.
         */
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

        // Private initialization functions.
        //----------------------------------

        /**
         * Init function to initialize controller member variables.
         *
         * Notice, this function is automatically called when constructor is called.
         */
        (function init() {
            _paper = createCanvas(element, width, height);

            // Initialization configurations.
            _scaleConfig = {
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
                obsBgColor : Raphael.rgb(178, 216, 234),
                fctBgColor : Raphael.rgb(231, 166, 78)
            };
            _scaleConfig.bgHeight = Math.floor(2 * _scaleConfig.height / 3);
            // Make progress cell height a little bit smaller than remaining area.
            // Then, background color is shown a little bit in behind.
            _scaleConfig.progressCellHeight = _scaleConfig.height - _scaleConfig.bgHeight - 2;

            _sliderConfig = {
                height : 30,
                width : 65,
                bgColor : Raphael.rgb(88, 88, 88),
                strokeBgColor : Raphael.rgb(191, 191, 191),
                strokeWidth : 1
            };
            // Notice, that polygon is drawn by using path. See, _sliderBg variable.
            // Notice, the polygon path height is 7 and tip height is 3. Therefore, use corresponding ration here.
            _sliderConfig.sliderTipHeight = _sliderConfig.height * (3 / 7);
            // Polygon path width is 14. Scale to the width given here.
            _sliderConfig.scaleX = _sliderConfig.width / 14;
            _sliderConfig.scaleY = (_sliderConfig.height + _sliderConfig.sliderTipHeight) / 7;
            // The tip x position is 4 in the polygon path. So, use that with the scale.
            _sliderConfig.sliderTipDx = Math.floor(4 * _sliderConfig.scaleX);
            // Make slider overlap the scale a little bit.
            _sliderConfig.y = _scaleConfig.y + _scaleConfig.height - Math.floor(_sliderConfig.sliderTipHeight / 3);

            // Scale initializations.
            //-----------------------

            // Scale variables.
            // Collection of scale tick elements.
            _tickSet = _paper.set();
            // Collection of progress cell elements.
            _progressCellSet = _paper.set();

            // Create scale UI components.
            // Scale container is used in the background of the scale elements.
            // Its purpose is just to provide information about the area and its position.
            _scaleContainer = _paper.rect(_scaleConfig.x, _scaleConfig.y, _scaleConfig.width, _scaleConfig.height, _scaleConfig.radius);
            _scaleContainer.attr('stroke-width', 0);
            // Keep it hidden in the background.
            _scaleContainer.attr('opacity', 0);

            // Background behind obs and fct.
            _background = _paper.rect(_scaleConfig.x + getScalePadding(), _scaleConfig.y, getObsWidth() + getFctWidth(), _scaleConfig.height);
            _background.attr('fill', _scaleConfig.bgColor);
            _background.attr('stroke-width', 0);

            _obsBackground = _paper.rect(_scaleConfig.x + getScalePadding(), _scaleConfig.y, getObsWidth(), _scaleConfig.bgHeight);
            _obsBackground.attr('fill', _scaleConfig.obsBgColor);
            _obsBackground.attr('stroke-width', 0);

            _fctBackground = _paper.rect(_scaleConfig.x + getScalePadding() + getObsWidth(), _scaleConfig.y, getFctWidth(), _scaleConfig.bgHeight);
            _fctBackground.attr('fill', _scaleConfig.fctBgColor);
            _fctBackground.attr('stroke-width', 0);

            _leftHotSpot = _paper.rect(_scaleConfig.x, _scaleConfig.y, getScalePadding(), _scaleConfig.height);
            // Fill is required. Otherwise, click does not work.
            _leftHotSpot.attr('fill', Raphael.rgb(0, 0, 0)).attr('opacity', 0);
            _leftHotSpot.attr('stroke-width', 0);
            _leftHotSpot.click(previousFrame);

            _rightHotSpot = _paper.rect(_scaleConfig.x + width, _scaleConfig.y, getScalePadding(), _scaleConfig.height);
            // Fill is required. Otherwise, click does not work.
            _rightHotSpot.attr('fill', Raphael.rgb(0, 0, 0)).attr('opacity', 0);
            _rightHotSpot.attr('stroke-width', 0);
            _rightHotSpot.click(nextFrame);

            // Handle mouse wheel over the scale.
            jQuery([_scaleContainer.node, _background.node, _obsBackground.node, _fctBackground.node, _leftHotSpot.node, _rightHotSpot.node]).mousewheel(handleMouseScroll);

            // Slider initializations.
            //------------------------

            // Collects all the slider elements.
            _slider = _paper.set();

            _sliderBg = _paper.path("M0,2L0,7L14,7L14,2L6,2L4,0L2,2Z");
            _sliderBg.attr('fill', _sliderConfig.bgColor);
            _sliderBg.attr('stroke', _sliderConfig.strokeBgColor);
            _sliderBg.attr('stroke-width', _sliderConfig.strokeWidth);
            _sliderBg.transform("S" + _sliderConfig.scaleX + "," + _sliderConfig.scaleY + ",0,0T0," + _sliderConfig.y);

            _sliderLabel = _paper.text(32, _sliderConfig.y + 26, "00:00");
            _sliderLabel.attr("text-anchor", "start").attr("font-family", _labelFontFamily).attr("font-size", _labelFontSize);
            _sliderLabel.attr("fill", _sliderConfig.strokeBgColor).attr('stroke-width', 0);

            _slider.push(_sliderBg);
            _slider.push(_sliderLabel);

            // Set drag handlers.
            _slider.drag(dragMove, startDragMove, finalizeDragMove, _me, _me, _me);

            // Reset initial time for label.
            resetSliderLabelText();

            // Handle mouse wheel over the slider.
            jQuery([_sliderBg.node, _sliderLabel.node]).mousewheel(handleMouseScroll);

            // Move slider to the initial position.
            // Movement needs to be done asynchronously to make sure time position can be calculated properly.
            // Hide slider during asynchronous process. Then, slider will be visible only in the proper position.
            _slider.hide();
            setTimeout(function() {
                if (undefined !== defaultTimePosition && null !== defaultTimePosition) {
                    // Default time has been given. So, move slider to the given position.
                    moveSliderTo(timeToPos(defaultTimePosition));

                } else {
                    // Scale beginning is used for the slider initial position.
                    moveSliderTo(getDefaultSliderOffsetX());
                }
                _slider.show();
            }, 0);
        })();

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

if ("undefined" === typeof fi.fmi.metoclient.ui.animator.Factory || !fi.fmi.metoclient.ui.animator.Factory) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.Factory is required for fi.fmi.metoclient.ui.animator.Animator!";
}

if ("undefined" === typeof fi.fmi.metoclient.ui.animator.Controller || !fi.fmi.metoclient.ui.animator.Controller) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.Controller is required for fi.fmi.metoclient.ui.animator.Animator!";
}

/**
 * API functions are defined in the end of the constructor as priviledged functions.
 * See API description there.
 *
 * Example:
 * (new fi.fmi.metoclient.ui.animator.Animator()).init({
 *     // Animator content is inserted into container.
 *     // Default animator element structures are used here.
 *     animatorContainerDivId : "animatorContainerId",
 *     // Configuration defines map and layers for animator.
 *     // Notice, fi.fmi.metoclient.ui.animator.Config object is also used
 *     // as a default if config is not provided. But, this is shown here
 *     // as an example. Another config object may also be provided here.
 *     // See comments in fi.fmi.metoclient.ui.animator.Config for more detailed
 *     // description of the config object.
 *     config : fi.fmi.metoclient.ui.animator.Config,
 *     // Callback is mandatory if getConfig function needs to be used.
 *     callback : function(animator, errors) {
 *         // For example, animator map object may be used after initialization.
 *         var map = animator.getConfig().getMap();
 *     }
 * });
 */
fi.fmi.metoclient.ui.animator.Animator = (function() {

    // Constant variables.

    // Time for debounce function.
    var DEBOUNCE_TIME = 10;
    // Maximum time for debounce function.
    var DEBOUNCE_MAX_TIME = 100;

    // Instance independent functions.

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
        // Private variables.
        //-------------------

        // Reference to this instance object.
        var _me = this;

        // Options that contain for example div IDS.
        var _options;
        var _config;

        // Set when operation is going on.
        var _requestAnimationTime;

        // Keeps track of the current time.
        var _currentTime;

        // Flag value to inform if animation should be automatically started
        // after animation content has been refreshed.
        var _continueAnimationWhenLoadComplete = false;

        // Default zoom level and center information is set here for
        // animator reinitialization when animator is refreshing its content.
        var _refreshDefaultZoomLevel;
        var _refreshDefaultCenter;

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
            scope : _me,
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
            // If _requestAnimationTime has any value, it means that animation is going on.
            if (undefined !== _requestAnimationTime) {
                // Continue animation when tiles have been loaded because animation
                // is paused during tile loading. Therefore, update continuation flag here.
                // This check is required for window resize case.
                _continueAnimationWhenLoadComplete = true;
            }
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
            if (_config.getAnimationAutoStart() || _continueAnimationWhenLoadComplete) {
                // Reset continuation flag.
                _continueAnimationWhenLoadComplete = false;
                // Animation is started when loading has completed.
                firePlay();

            } else {
                // Animation is not started, but show default frame.
                showDefaultFrame();
            }
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

        /**
         * Asynchronously handles the callback and possible error situations there.
         *
         * @param {function(data, errors)} callback Callback function that is called.
         *                                          Operation is ignored if {undefined} or {null}.
         * @param [] errors Array that contains possible errors that occurred during the asynchronous flow.
         *                  May be {undefined} or {null}.
         */
        var handleCallback = function(callback, errors) {
            if (callback) {
                setTimeout(function() {
                    try {
                        callback(_me, errors);

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
         * Callback for configuration {init} function call.
         *
         * Uses asynchronous function before handling callback.
         *
         * See more details from {init} function for {options} and {errors} parameters.
         *
         * @param {Object} options Options for animator initialization.
         * @param {Array} errors Array that contains possible errors that occurred during the flow.
         */
        function configInitCallback(options, errors) {
            // Create structure only if initialization was a total success.
            if (errors && errors.length) {
                // Inform that animation structure is not created at all.
                // Just highlight this by showing text in a console.
                // Callback itself passes the errors.
                if ("undefined" !== typeof console && console) {
                    console.error("ERROR: Animator config init errors. Animation is not created!");
                }
                // Handle callback after asynchronous initialization.
                handleCallback(options.callback, errors);

            } else {
                try {
                    // Use options and configuration object to set map and layers.
                    setMapAndLayers();

                    // Create slider. Notice, this will set itself according to the options.
                    createController(errors, function() {
                        // Handle callback after asynchronous initialization.
                        handleCallback(options.callback, errors);
                    });

                } catch(e) {
                    var errorStr = "ERROR: ConfigInitCallback: " + e.toString();
                    errors.push(errorStr);
                    if ("undefined" !== typeof console && console) {
                        console.error(errorStr);
                    }
                    handleCallback(options.callback, errors);
                }
            }
        }

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
                debounce = _.debounce(f, DEBOUNCE_TIME, {
                    maxWait : DEBOUNCE_MAX_TIME
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
                if (!_loadingLayers.length && _config.showAnimationLoadProgress()) {
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

        /**
         * @return {Date} The forecast begin date for the whole animation.
         *                May not be {undefined}.
         */
        function getForecastBeginDate() {
            return _config.getForecastBeginDate();
        }

        /**
         * @return {Date} The last observation date of the whole animation.
         *                {undefined} if animation does not have observations.
         */
        function getLastObservationDate() {
            var time;
            var tmp = getBeginDate().getTime();
            var forecastBeginTime = getForecastBeginDate().getTime();
            while (forecastBeginTime > tmp) {
                time = tmp;
                tmp += getResolution();
            }
            return undefined === time ? undefined : new Date(time);
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

        function showDefaultFrame() {
            // Calculate new default frame position if it has not been set before or if current position is out of bounds.
            if (_currentTime === undefined || _currentTime < getBeginDate() || _currentTime > getEndDate()) {
                var lastObservationDate = getLastObservationDate();
                if (undefined !== lastObservationDate) {
                    // Use last observation position as default if it is available.
                    _currentTime = lastObservationDate.getTime();

                } else {
                    // Use the first frame as current frame.
                    _currentTime = getBeginDate().getTime();
                }
            }
            MyController.events.triggerEvent("timechanged", {
                time : _currentTime
            });
        }

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
                    // Map center refresh value is used if it is available.
                    var mapCenter = _refreshDefaultCenter || map.getCenter();
                    if (!mapCenter) {
                        // Map may not have center available even if it has been defined in config.
                        // Then, calculate center from the maximum extent to make sure map can be shown.
                        mapCenter = map.getMaxExtent().getCenterLonLat();
                    }
                    map.setCenter(mapCenter, undefined === _refreshDefaultZoomLevel ? _config.getDefaultZoomLevel() : _refreshDefaultZoomLevel);
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
            var ac = new fi.fmi.metoclient.ui.animator.Controller(ctrls[0], ctrls.width(), ctrls.height(), _currentTime);
            ac.setTimeModel(timeModel);
            ac.setTimeController(timeController);
            return ac;
        }

        /**
         * Create time controller and set it into the UI according to the options that have been set during init.
         *
         * Asynchronous function calls {cb} when whole creation operation is complete.
         *
         * @param {Array} errors Array that contains possible error objects.
         *                       May not be {undefined} or {null}.
         * @param {Function} cb Callback function that is called when creation is complete.
         *                      May not be {undefined} or {null}.
         */
        function createController(errors, cb) {
            // Because parts of the function need to be asynchronous,
            // make the whole function to be asynchronous.
            // Then, error and success cases can be handled consistently.
            setTimeout(function() {
                try {
                    if (!_options || !_options.controllerDivId || !_options.playAndPauseDivId) {
                        errors.push("ERROR: Options or properties missing for controller!");

                    } else {
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
                                var fctStart = getForecastBeginDate().getTime();
                                // If end time is less than forecast time, then forecast is not used and value is left undefined.
                                if (endTime < fctStart) {
                                    fctStart = undefined;
                                }
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

                                setPlayAndPause();

                                // Controller needs to be created asynchronously.
                                // Otherwise, its width may not be properly set.
                                setTimeout(function() {
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
                                }, 0);
                            }
                        }
                    }

                } catch(e) {
                    var errorStr = "ERROR: ConfigInitCallback: " + e.toString();
                    errors.push(errorStr);
                    if ("undefined" !== typeof console && console) {
                        console.error(errorStr);
                    }

                } finally {
                    // Inform that operation is complete.
                    cb();
                }
            }, 0);
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
            if (options) {
                // Default animator element structure is used and appended into container
                // if options object provides animatorContainerDivId.
                if (options.animatorContainerDivId) {
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
                // Progress bar is included into structure here.
                // Then, it is available during asynchronous initializations.
                if (options.animationDivId && (_config.showAnimationInitProgress() || _config.showAnimationLoadProgress())) {
                    // Add progressbar element if configuration defines it should be shown.
                    var loadProgressbar = jQuery('<div class="animatorLoadProgressbar"></div>');
                    jQuery("#" + options.animationDivId).append(loadProgressbar);
                    loadProgressbar.progressbar({
                        value : false
                    });
                    // Make sure progress bar element is hidden as default.
                    loadProgressbar.hide();
                }
            }
        }

        /**
         * Start animation content refresh interval if defined in configuration.
         */
        function setRefreshInterval() {
            var interval = _config.getAnimationRefreshInterval();
            if (interval && interval > 0) {
                // Proper interval value is provided in configuration.
                var refreshTimeout = setTimeout(function() {
                    // Temporarily hold original options here because
                    // reset will clear the member variables.
                    var options = _options;
                    // Temporarily hold current time. Keep that state after refresh.
                    var currentTime = _currentTime;
                    // Temporarily hold information about animation continuation for refresh.
                    // If _requestAnimationTime has any value, it means that animation is going on.
                    var continueAnimationWhenLoadComplete = (undefined !== _requestAnimationTime);
                    // Temporarily hold information about animation center and zoom state for refresh.
                    var refreshDefaultCenter = _config.getMap().getCenter();
                    var refreshDefaultZoomLevel = _config.getMap().getZoom();
                    // Reset whole animator.
                    reset();
                    // Set the previous animation continuation state.
                    _continueAnimationWhenLoadComplete = continueAnimationWhenLoadComplete;
                    // Set the previous animation center and zoom state.
                    _refreshDefaultCenter = refreshDefaultCenter;
                    _refreshDefaultZoomLevel = refreshDefaultZoomLevel;
                    // Set the previous current time state.
                    _currentTime = currentTime;
                    // Initialize animation again with original options.
                    // This will load new animator content.
                    init(options);
                }, interval);
                // Include timeout value into clear array to be sure that
                // timer is cleared if animator is resetted by another parts
                // of the flow.
                _resetClearTimeouts.push(refreshTimeout);
            }
        }

        // Public functions for API.
        //--------------------------

        /**
         * See API for function description.
         */
        function getConfig() {
            if (_options && !_options.callback) {
                var errorStr = "ERROR: Animator init options.callback is mandatory if getConfig is used!";
                if ("undefined" !== typeof console && console) {
                    console.error(errorStr);
                }
                throw errorStr;
            }
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

            // Also, make sure map is updated properly.
            if (_config) {
                var map = _config.getMap();
                if (map) {
                    map.updateSize();
                }
            }
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
            _continueAnimationWhenLoadComplete = false;
            _refreshDefaultCenter = undefined;
            _refreshDefaultZoomLevel = undefined;
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
                try {
                    // Set options and create config only once.
                    _options = options;
                    // Configuration object is deep cloned here.
                    // Then, if properties are changed during the flow, the content of the original object is not changed.
                    _config = new fi.fmi.metoclient.ui.animator.Factory(_.cloneDeep(options.config || fi.fmi.metoclient.ui.animator.Config, cloneDeepCallback));
                    // Create animation structure for the content.
                    // Then, progressbar may be shown during asyncronous initializations.
                    createStructure(options);
                    setRefreshInterval();
                    // Start asynchronous initialization.
                    if (_config.showAnimationInitProgress()) {
                        // Also, show progressbar during asynchronous operation.
                        jQuery(".animatorLoadProgressbar").show();
                    }
                    _config.init(function(factory, errors) {
                        // Asynchronous initialization is over.
                        // Hide the progressbar.
                        jQuery(".animatorLoadProgressbar").hide();
                        configInitCallback(options, errors);
                    });

                } catch(e) {
                    // An error occurred in synchronous flow.
                    // But, inform observer about the error asynchronously.
                    // Then, flow progresses similarly through API in both
                    // error and success cases.
                    var error = e.toString();
                    if ("undefined" !== typeof console && console) {
                        console.error("ERROR: Animator init error: " + error);
                    }
                    // Make sure progressbar is not left showing.
                    jQuery(".animatorLoadProgressbar").hide();
                    // Notice, options and config are not resetted before calling callback.
                    // Then, error state remains. So, reset should be called before init
                    // is requested again.
                    handleCallback(options.callback, [error]);
                }
            }
        }

        //=================================================================
        // Public Connection API is defined here as priviledged functions.
        //=================================================================

        /**
         * Initialize animator with given options.
         *
         * Asynchronous function.
         * Therefore, {options.callback} should always be provided to follow
         * the progress of the operation even if it is not always mandatory.
         * But, {options.callback} is mandatory if {options} is given and
         * when {getConfig} function is used to highlight that asynchronous
         * configuration operations should finish before {getConfig} is
         * used.
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
         * Notice, callback is {function(animator, errors)}.
         *      - animator: Reference to {this} animator. Always provided.
         *      - errors: Array that contains possible errors that occurred during the flow.
         *                Array is always provided even if it may be empty.
         *
         * @param {Object} options { animatorContainerDivId: {String},
         *                           animationDivId: {String},
         *                           mapDivId: {String}, layerSwitcherDivId: {String},
         *                           controllerDivId : {String}, playAndPauseDivId : {String},
         *                           logoDivId : {String}, maximizeSwitcher: {Boolean},
         *                           legendDivId : {String},
         *                           config : {Object},
         *                           callback : {Function(animator, errors)} }
         *                         May be {undefined} or {null}. But, then initialization is ignored.
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
         * {OpenLayers.Map.updateSize} function is also automatically called to refresh the map.
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
         * Notice, {options.callback} is mandatory if {options} is given for {init} function
         * and if {getConfig} function is used. This is to highlight that asynchronous
         * configuration operations should finish before {getConfig} is used.
         *
         * @return {Object} Configuration API object.
         *                  May be {undefined} if animator has not been initialized
         *                  by calling {init} with {options} object.
         */
        this.getConfig = getConfig;

    };

    // Constructor function is returned for later instantiation.
    return _constructor;

})();
