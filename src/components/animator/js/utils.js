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
                    // Closest thing possible to the ECMAScript 5 internal IsCallable function.
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
