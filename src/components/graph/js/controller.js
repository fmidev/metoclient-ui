"use strict";

// Requires jQuery
if ("undefined" === typeof jQuery || !jQuery) {
    throw "ERROR: jQuery is required for fi.fmi.metoclient.ui.graph.Controller!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.graph = fi.fmi.metoclient.ui.graph || {};

if (!fi.fmi.metoclient.metolib) {
    throw "ERROR: fi.fmi.metoclient.metolib is required for fi.fmi.metoclient.ui.graph.Controller!";
}
if (!fi.fmi.metoclient.metolib.WfsConnection) {
    throw "ERROR: fi.fmi.metoclient.metolib.WfsConnection is required for fi.fmi.metoclient.ui.graph.Controller!";
}
if (!fi.fmi.metoclient.metolib.WfsConnection) {
    throw "ERROR: fi.fmi.metoclient.metolib.WfsParser is required for fi.fmi.metoclient.ui.graph.Controller!";
}

/**
 * Controller acts as a structured interface between component and the MetOLib API object.
 *
 * Notice, this interface function creates a new controller with its own state.
 * Therefore, components can have their own controllers.
 *
 * @type {Function} function Interface function.
 */
fi.fmi.metoclient.ui.graph.Controller = function() {

    // Private variables

    // Topics of the data refresh observer pattern.
    var topics = {};

    // Identifier for the tokens.
    var subUid = -1;

    // Base URL for the query.
    var baseUrl;

    // Stored query ID for the query.
    var storedQueryId;

    // Sites for the query.
    var sites;

    // Default hard coded parameter information before queries are done.
    var parameterInfo;

    // Structure that contains the data query information.
    var view = {
        start : undefined,
        end : undefined,
        request : undefined
    };

    // Connection object for data queries.
    var connection;

    // Private methods

    /**
     * Initializes the parameters.
     *
     * @param {Object} options Initialization options.
     */
    function init(options) {
        var initErrors = [];
        if (options) {
            baseUrl = options.baseUrl;
            if (!baseUrl) {
                initErrors.push("ERROR: Controller options baseUrl not correct!");
            }
            storedQueryId = options.storedQueryId;
            if (!storedQueryId) {
                initErrors.push("ERROR: Controller options storedQueryId not correct!");
            }
            sites = options.sites;
            if (!sites) {
                initErrors.push("ERROR: Controller options sites not correct!");
            }
            parameterInfo = options.parameterInfo;
            if (!parameterInfo || !parameterInfo.length) {
                initErrors.push("ERROR: Controller options parameterInfo not correct!");
            }
            view.start = options.begin;
            if (undefined === view.start) {
                initErrors.push("ERROR: Controller options begin not correct!");
            }
            view.end = options.end;
            if (undefined === view.end) {
                initErrors.push("ERROR: Controller options end not correct!");
            }
            view.request = parameterInfo && parameterInfo.length ? parameterInfo[0].code : undefined;
            if (!view.request) {
                initErrors.push("ERROR: Controller options requestParameter not correct!");
            }

        } else {
            initErrors.push("ERROR: Controller options not correct!");
        }
        // Make sure initialization container correct options.
        if (initErrors.length) {
            if ("undefined" !== typeof console && console) {
                for (var i = 0; i < initErrors.length; ++i) {
                    console.error(initErrors[i]);
                }
            }
            throw initErrors;
        }
        // Check if cache should be used for data queries.
        if (options.useCache) {
            // MetOLib connection object provides use of cache.
            // Create connection object for data queries.
            // If cache is not wanted, MetOLib parser can be
            // directly used for data queries.
            connection = new fi.fmi.metoclient.metolib.WfsConnection();
            if (!connection.connect(baseUrl, storedQueryId)) {
                throw "ERROR: Controller could not set up conneciton!";
            }
        }
    }

    /**
     *  Request data from the server.
     *
     * @param newView Data request information.
     */
    function refreshData(newView) {
        if (newView !== undefined) {
            view = newView;
        }

        var timeStep = 60 * 60 * 1000;
        var hour = 60 * 60 * 1000;
        var day = 24 * hour;

        view.start -= view.start % hour;
        var days = (view.end + timeStep - view.start) / day;
        // Valitaan sopiva aika-askeleen vakiopituus
        if (days < 1.0) {
            timeStep = null;
            // get everything

        } else if (days < 7.0) {
            timeStep = hour;

        } else if (days < 30) {
            timeStep = 3 * hour;

        } else if (days < 365) {
            timeStep = day;

        } else {
            timeStep = 7 * day;
        }
        // Update end time now that we know the proper timestep.
        view.end += timeStep;

        if (connection) {
            // Connection has been created.
            // So, use cache for data queries.
            connection.getData({
                requestParameter : view.request,
                begin : view.start,
                end : view.end,
                timestep : timeStep,
                sites : sites,
                callback : function(data) {
                    publish("data_refreshed", data);
                }
            });

        } else {
            // Connection has not been set.
            // So, use parser directly without cache.
            fi.fmi.metoclient.metolib.WfsRequestParser.getData({
                url : baseUrl,
                storedQueryId : storedQueryId,
                requestParameter : view.request,
                begin : view.start,
                end : view.end,
                timestep : timeStep,
                sites : sites,
                callback : function(data) {
                    publish("data_refreshed", data);
                }
            });
        }
    }

    /**
     * Publish the data refresh events.
     *
     * @param topic Topic name.
     * @param args Data to be published.
     * @return {Boolean} Success of the operation.
     */
    function publish(topic, args) {
        if (!topics[topic]) {
            return false;
        }
        setTimeout(function() {
            var subscribers = topics[topic];
            var len = subscribers ? subscribers.length : 0;
            while (len--) {
                subscribers[len].func(topic, args);
            }
        }, 0);
        return true;
    }

    /**
     * Subscribe to the data refresh events.
     *
     * @param topic Topic name.
     * @param func Callback function.
     * @return {String} Tokenized reference to the subscription.
     */
    function subscribe(topic, func) {
        if (!topics[topic]) {
            topics[topic] = [];
        }
        var token = (++subUid).toString();
        topics[topic].push({
            token : token,
            func : func
        });
        return token;
    }

    /**
     * Unsubscribe from the topic.
     *
     *
     * @param token Tokenized reference to the subscription.
     * @return {*} Input token if success, false otherwise.
     */
    function unsubscribe(token) {
        for (var m in topics) {
            if (topics.hasOwnProperty(m) && topics[m]) {
                for (var i = 0, j = topics[m].length; i < j; i++) {
                    if (topics[m][i].token === token) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Return available parameters names and human readable names.
     *
     * @return {[Object]} Information objects of available parameters in an array.
     */
    function getParameterInfo() {
        return parameterInfo;
    }

    /**
     * Return the structure that contains the data request information.
     *
     * @return {Object} Data request information.
     */
    function getView() {
        return view;
    }

    /**
     * Set the data request information.
     *
     * @param newView Data request information
     */
    function setView(newView) {
        view = newView;
    }

    return {
        // Public methods
        /**
         * Initializes the parameters.
         *
         * @param options Options to initialize variables.
         */
        init : init,
        /**
         *  Request data from the server.
         *
         * @param newView Data request information.
         */
        refreshData : refreshData,
        /**
         * Publish the data refresh events.
         *
         * @param topic Topic name.
         * @param args Data to be published.
         * @return {Boolean} Success of the operation.
         */
        publish : publish,
        /**
         * Subscribe to the data refresh events.
         *
         * @param topic Topic name.
         * @param func Callback function.
         * @return {String} Tokenized reference to the subscription.
         */
        subscribe : subscribe,
        /**
         * Unsubscribe from the topic.
         *
         *
         * @param token Tokenized reference to the subscription.
         * @return {*} Input token if success, false otherwise.
         */
        unsubscribe : unsubscribe,
        /**
         * Return available parameters names and human readable names.
         *
         * @return {Array} Information of available parameters.
         */
        getParameterInfo : getParameterInfo,
        /**
         * Return the structure that contains the data request information.
         *
         * @return {Object} Data request information.
         */
        getView : getView,
        /**
         * Set the data request information.
         *
         * @param newView Data request information
         */
        setView : setView
    };

};
