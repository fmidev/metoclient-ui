// Strict mode for whole file.
"use strict";

// "use strict";

// Requires jQuery
if ("undefined" === typeof jQuery || !jQuery) {
    throw "ERROR: jQuery is required for fi.fmi.metoclient.ui.graph.Timer!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.graph = fi.fmi.metoclient.ui.graph || {};

/**
 *  Timer is a virtual clock singleton for controlling component synchronization
 *  and animations. Time runs continuously in proportion to the real world time.
 *  This ensures smooth experience in different environments and prevents
 *  garbage collection delays.
 *
 * @type {Timer} Time controller. Singleton.
 */
fi.fmi.metoclient.ui.graph.Timer = (function() {

    // Topics of the time change observer pattern.
    var topics = {};

    // Identifier index for the tokens.
    var subUid = -1;

    // Current time.
    var selectedTime = null;

    // Start of the time range.
    var startTime = null;

    // End of the time range.
    var endTime = null;

    // Animation start time.
    var referenceTime = null;

    // Real world time for animation start.
    var referenceRealTime = null;

    // Latest time update.
    var lastUpdateTime = null;

    // Animation speed: time range / real world time [s].
    var animationSpeed = 1.0 / 30000.0;

    // Animation update time step.
    var animationTimeStep = 1.0;

    // Time running.
    var playing = false;

    /**
     * Set current time.
     *
     * @param newTime Current time.
     */
    function setSelectedTime(newTime) {
        selectedTime = newTime;
        if (isPlaying()) {
            var dTime = newTime - lastUpdateTime;
            var timePeriod = endTime - startTime;
            if ((dTime < 0) || (dTime > animationTimeStep)) {
                lastUpdateTime = selectedTime;
                publish("time_changed", selectedTime);
            }
        } else {
            publish("time_changed", selectedTime);
        }
    }

    /**
     *  Get current time.
     *
     * @return {*} Current time.
     */
    function getSelectedTime() {
        return selectedTime;
    }

    /**
     * Set animation start time.
     *
     * @param newTime Animation start time.
     */
    function setReferenceTime(newTime) {
        referenceTime = newTime;
    }

    /**
     * Get animation start time.
     *
     * @return {*} Animation start time.
     */
    function getReferenceTime() {
        return referenceTime;
    }

    /**
     * Set real world time for animation start.
     *
     * @param newTime Real world time for animation start
     */
    function setReferenceRealTime(newTime) {
        referenceRealTime = newTime;
    }

    /**
     * Get real world time for animation start.
     *
     * @return {*} Real world time for animation start
     */
    function getReferenceRealTime() {
        return referenceRealTime;
    }

    /**
     * Set start of the time range.
     *
     * @param newStartTime Start of the time range.
     */
    function setStartTime(newStartTime) {
        startTime = newStartTime;
    }

    /**
     * Get start of the time range.
     *
     * @return {*} Start of the time range.
     */
    function getStartTime() {
        return startTime;
    }

    /**
     * Set end of the time range.
     *
     * @param newEndTime End of the time range.
     */
    function setEndTime(newEndTime) {
        endTime = newEndTime;
    }

    /**
     * Get end of the time range.
     *
     * @return {*} End of the time range.
     */
    function getEndTime() {
        return endTime;
    }

    /**
     * Set state of the time control.
     *
     * @param newPlaying State of the time controller.
     */
    function setPlaying(newPlaying) {
        playing = newPlaying;
        lastUpdateTime = selectedTime;
    }

    /**
     * Get state of the time control.
     *
     * @return {Boolean} State of the time controller.
     */
    function isPlaying() {
        return playing;
    }

    /**
     * Start and update the time controller.
     *
     * @param newTime New current time.
     */
    function play(newTime) {
        var d = new Date();
        if (newTime !== undefined) {
            // Time initialization
            setPlaying(true);
            setReferenceTime(newTime);
            setReferenceRealTime(d.getTime());
            setSelectedTime(newTime);
        } else {
            // Time incrementation
            if (!isPlaying()) {
                return;
            }
            var timePeriod = endTime - startTime;
            // Time runs continuously in proportion to the real world time.
            var time = (timePeriod * animationSpeed * (d.getTime() - referenceRealTime) + referenceTime - startTime) % timePeriod + startTime;
            setSelectedTime(time);
        }
        // Main loop of the time model
        setTimeout(function() {
            play();
        }, 10);
    }

    /**
     *  Pause the animation.
     */
    function pause() {
        playing = false;
    }

    /**
     * Set animation speed.
     *
     * @param newAnimationSpeed Animation speed.
     */
    function setAnimationSpeed(newAnimationSpeed) {
        animationSpeed = newAnimationSpeed;
    }

    /**
     * Get animation speed.
     *
     * @return {Number} Animation speed.
     */
    function getAnimationSpeed() {
        return animationSpeed;
    }

    /**
     * Set animation update time step.
     *
     * @param newAnimationTimeStep Animation update time step.
     */
    function setAnimationTimeStep(newAnimationTimeStep) {
        animationTimeStep = newAnimationTimeStep;
    }

    /**
     * Get animation update time step.
     *
     * @return {Number} Animation update time step.
     */
    function getAnimationTimeStep() {
        return animationTimeStep;
    }

    /**
     * Publish the time change events.
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
     * Subscribe to the time change events.
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

    return {
        // Public methods
        /**
         * Set current time.
         *
         * @param newTime Current time.
         */
        setSelectedTime : setSelectedTime,
        /**
         *  Get current time.
         *
         * @return {*} Current time.
         */
        getSelectedTime : getSelectedTime,
        /**
         * Set start of the time range.
         *
         * @param newStartTime Start of the time range.
         */
        setStartTime : setStartTime,
        /**
         * Get start of the time range.
         *
         * @return {*} Start of the time range.
         */
        getStartTime : getStartTime,
        /**
         * Set end of the time range.
         *
         * @param newEndTime End of the time range.
         */
        setEndTime : setEndTime,
        /**
         * Get end of the time range.
         *
         * @return {*} End of the time range.
         */
        getEndTime : getEndTime,
        /**
         * Set state of the time control.
         *
         * @param newPlaying State of the time controller.
         */
        setPlaying : setPlaying,
        /**
         * Get state of the time control.
         *
         * @return {Boolean} State of the time controller.
         */
        isPlaying : isPlaying,
        /**
         * Start and update the time controller.
         *
         * @param newTime New current time.
         */
        play : play,
        /**
         *  Pause the animation.
         */
        pause : pause,
        /**
         * Set animation speed.
         *
         * @param newAnimationSpeed Animation speed.
         */
        setAnimationSpeed : setAnimationSpeed,
        /**
         * Get animation speed.
         *
         * @return {Number} Animation speed.
         */
        getAnimationSpeed : getAnimationSpeed,
        /**
         * Set animation update time step.
         *
         * @param newAnimationTimeStep Animation update time step.
         */
        setAnimationTimeStep : setAnimationTimeStep,
        /**
         * Get animation update time step.
         *
         * @return {Number} Animation update time step.
         */
        getAnimationTimeStep : getAnimationTimeStep,
        /**
         * Publish the time change events.
         *
         * @param topic Topic name.
         * @param args Data to be published.
         * @return {Boolean} Success of the operation.
         */
        publish : publish,
        /**
         * Subscribe to the time change events.
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
        unsubscribe : unsubscribe
    };

})();

// "use strict";

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

// "use strict";

// Requires jQuery
if ("undefined" === typeof jQuery || !jQuery) {
    throw "ERROR: jQuery is required for fi.fmi.metoclient.ui.graph.Graph!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.graph = fi.fmi.metoclient.ui.graph || {};

if ("undefined" === typeof fi.fmi.metoclient.ui.graph.Timer || !fi.fmi.metoclient.ui.graph.Timer) {
    throw "ERROR: fi.fmi.metoclient.ui.graph.Timer is required for fi.fmi.metoclient.ui.graph.Graph!";
}

if ("undefined" === typeof fi.fmi.metoclient.ui.graph.Controller || !fi.fmi.metoclient.ui.graph.Controller) {
    throw "ERROR: fi.fmi.metoclient.ui.graph.Controller is required for fi.fmi.metoclient.ui.graph.Graph!";
}

/**
 * Module Graph
 *
 * This module provides interface to draw the graph component
 * into the HTML element defined by the given ID string.
 * The API is returned when this module object is called.
 * See the return API in the end of the module.
 *
 * Example:
 * <code>
 *   fi.fmi.metoclient.ui.graph.Graph.insertGraph({
 *     graphContainerId : "graphContainerId",
 *     config : fi.fmi.metoclient.ui.graph.Config
 *   });
 * </code>
 */
fi.fmi.metoclient.ui.graph.Graph = (function() {

    // Common private variables for graph components.

    // Div element identifier.
    var placeholder = "flotGraph";

    // Play button identifier.
    var playButton = "graphPlay";

    // Pause button identifier.
    var pauseButton = "graphPause";

    // Zoom in button identifier.
    var zoomInButton = "graphZoomIn";

    // Zoom out button identifier.
    var zoomOutButton = "graphZoomOut";

    // Time label checkbox identifier.
    var timeLabelCheckbox = "showTimeLabel";

    // Y-axis label checkbox identifier.
    var yLabelCheckbox = "showYLabels";

    // Value label checkbox identifier.
    var valueCheckbox = "showValues";

    // Parameter selector identifier.
    var selectableContainer = "selectable";

    // Common private functions for graph components.

    /**
     * Color codes based on the parameter index.
     *
     * @param index Parameter index.
     * @return {*} Color.
     */
    function getParameterColor(index) {
        // Currently these colors correspond to London Underground lines.
        var colorValues = ["#9B4F19", // Bakerloo
        "#D81E05", // Central
        "#FCD116", // Circle
        "#007A3D", // District
        "#F6A5BE", // Hammersmith and City
        "#919693", // Jubilee
        "#8E0554", // Metropolitan
        "#000000", // Northern
        "#1C3F94", // Piccadilly
        "#00A3DD", // Victoria
        "#7AD1B5" // Waterloo and City
        ];
        return colorValues[index % colorValues.length];
    }

    /**
     * Construct and manage the graph component.
     */
    var LineGraph = function() {

        // Private functions
        // that need to be defined before private variables.

        /**
         * Draw dashed lines around missing values.
         *
         * @param plot The Flot plot.
         * @param ctx Drawing context of canvas.
         * @constructor Constructor.
         */
        var NaNLines = function(plot, ctx) {
            var data = plot.getData();
            var xaxis = plot.getAxes().xaxis;
            var yaxis;
            var offset = plot.getPlotOffset();
            var x, y, x1, y1, x2, y2;
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(100,100,100,1.0)";

            for (var i = 0; i < data.length; i++) {
                yaxis = data[i].yaxis;
                var tmpSeries = data[i];
                for (var j = 0; j < tmpSeries.data.length; j++) {
                    if (jQuery.inArray(j, tmpSeries.NaNs) < 0) {
                        continue;
                    }

                    var d = (tmpSeries.data[j]);
                    x = offset.left + xaxis.p2c(d[0]);
                    y = offset.top + yaxis.p2c(d[1]);
                    var window = [[offset.left, offset.top], [offset.left + xaxis.p2c(xaxis.max), offset.top + yaxis.p2c(yaxis.min)]];
                    var d_prev = (tmpSeries.data[j - 1]);
                    if (undefined !== d_prev) {
                        if (jQuery.inArray(j - 1, tmpSeries.NaNs)) {
                            x1 = offset.left + xaxis.p2c(d_prev[0]);
                            y1 = offset.top + yaxis.p2c(d_prev[1]);
                            ctx.dashedLine(x1, y1, x, y, window, 2);
                        }
                    }

                    var d_next = (tmpSeries.data[j + 1]);
                    if ( typeof d_next !== "undefined") {
                        x2 = offset.left + xaxis.p2c(d_next[0]);
                        y2 = offset.top + yaxis.p2c(d_next[1]);
                        ctx.dashedLine(x, y, x2, y2, window, 2);
                    }
                }
            }
        };

        // Private variables

        // Instance of the data interface object.
        var controller;

        // Time controller.
        var timer;

        // The Flot graph.
        var plot = null;

        // Graph offsets.
        var graphOffsets;

        // Data request structure.
        var view = {};

        // Current graph canvas.
        var currentCanvas = {
            x : null,
            y : null
        };

        // Flag for mouse pointer location.
        var insideGraph;

        // Latest mouse position.
        var latestPosition = null;

        // Label for current time (crosshair or animation).
        var $xLabel;

        // Y-axis labels for crosshair.
        var $yLabels = [];

        // Parameter values at current time (crosshair or animation).
        var $valueLabels = [];

        // Needed to prevent overlapping animations for Y-axis.
        var yAxesAnimationSemaphore;

        // Month names.
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Day names.
        var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Date index for the time tick formatter.
        var dateIndex;

        // Previous time value for the time tick formatter.
        var prevTime = null;

        // Currently plotted parameters.
        var graphParameters = [];

        // Maximum number of simultaneously selectable parameters.
        var maxNumSelectedParameters = 4;

        // Parameter data arrays for Flot.
        var seriesArray = [];

        // Object that contains series colors as parameter-color key-value-pairs.
        var seriesColors = {};

        // Flot options for the graph.
        var options = {
            xaxis : {
                mode : "time"
            },
            yaxes : [],
            zoom : {
                interactive : true
            },
            pan : {
                interactive : true,
                cursor : "move"
                // Notice, if framerate is set to null,
                // panning has effect only after operation ends
                // and not during panning.
                // frameRate : null
            },
            crosshair : {
                mode : "xy",
                color : "rgba(120, 120, 120, 0.50)",
                lineWidth : 1
            },
            grid : {
                hoverable : true,
                clickable : true,
                autoHighlight : false,
                backgroundColor : {
                    colors : ["#ffffff", "#f4f4f4"]
                },
                labelMargin : 8,
                margin : 30
            },
            legend : {
                show : true,
                position : "ne",
                backgroundColor : "rgba(255, 255, 255, 0.90)"
            },
            hooks : {
                draw : [NaNLines]
            }
        };

        // Timeout variable for label updating.
        var updateLabelsTimeout;

        // Timeout variable for plot pan and data refreshing.
        var plotPanTimeout;

        // Timeout variable for select and data refreshing.
        var selectRefreshTimeout;

        // Private methods

        /**
         * Create new data series for Flot.
         *
         * @param {[]} newData Time series data array.
         * @param {string} newLabel Label of the parameter.
         * @param {string} newMeasureUnit Measure unit of the parameter.
         * @param {int} newNumDecimals Number of decimals shown in labels for this parameter.
         * @constructor Constructor.
         */
        var Series = function(newData, newLabel, newMeasureUnit, newNumDecimals) {
            // Notice, this data array is provided for flot.
            // It needs to be of the format[[x,y], ...] where array items are xy-pair-arrays.
            // So, in this graph they are [time,value] pairs in an array.
            this.data = newData || [];
            this.label = newLabel || "";
            this.measureUnit = newMeasureUnit || "";
            this.numDecimals = newNumDecimals || 0;
            // Y-axis index (starting from one), used by flot.
            this.yaxis = 1;
            this.highlighted = -1;
            this.NaNs = [];
            this.maxValue = Number.NEGATIVE_INFINITY;
            this.minValue = Number.POSITIVE_INFINITY;
        };

        /**
         * Create new Y-axis for Flot.
         *
         * @constructor Constructor.
         */
        var YAxis = function() {
            this.show = true;
            this.position = "left";
            this.ticks = 10;
            this.zoomRange = false;
            this.min = null;
            this.max = null;
            this.autoscaleMargin = 0.02;
        };

        /**
         * Initialize the line graph.
         *
         * @param newController Data engine instance.
         * @param newTimeControl Time control reference.
         * @param {Object} lineColors as parameter-color-pairs.
         */
        var init = function(newController, newTimeControl, lineColors) {
            controller = newController;

            timer = newTimeControl;
            view = controller.getView();
            seriesColors = lineColors || {};

            graphOffsets = jQuery("#" + placeholder).offset();

            // X value of the crosshair
            $xLabel = jQuery('<div />').attr('id', 'xlabel');
            $xLabel.appendTo('body').hide().css({
                'position' : 'absolute',
                'display' : 'none',
                'border' : '1px solid #000000',
                'background-color' : '#ffffcc',
                'opacity' : 0.0,
                'z-index' : '30000',
                'padding' : '0.0em 0.3em',
                'border-radius' : '0.5em',
                'font-size' : '0.8em',
                'pointer-events' : 'none'
            });
            $xLabel.html("").css({
                left : 0,
                top : 0
            }).show();

            // Subscriptions
            controller.subscribe("data_refreshed", this.dataRefreshed);
            timer.subscribe("time_changed", this.timeChanged);

            // Hard coded initialization
            setSelectedParameters([0]);

            // Timer initialization
            timer.setPlaying(false);
            jQuery("#" + playButton).attr("disabled", false);
            jQuery("#" + pauseButton).attr("disabled", true);

            // Mouse bindings
            jQuery("#" + placeholder).bind("plothover", function(event, position, item) {
                insideGraph = true;
                if (plot === null) {
                    return;
                }
                latestPosition = position;
                var axes = plot.getAxes();
                currentCanvas.x = axes.xaxis.p2c(latestPosition.x);
                currentCanvas.y = axes.yaxis.p2c(latestPosition.y);
                if (!timer.isPlaying()) {
                    if (insidePlot(latestPosition)) {
                        timer.setSelectedTime(position.x);
                    } else {
                        timer.setSelectedTime(plot.getAxes().xaxis.min);
                    }
                }
                if (!updateLabelsTimeout) {
                    updateLabelsTimeout = setTimeout(updateLabels, 10);
                }
            });

            jQuery("#" + placeholder).bind("mouseleave", function(event, position, item) {
                insideGraph = false;
                if (plot === null) {
                    return;
                }
                if (!timer.isPlaying()) {
                    timer.setSelectedTime(plot.getAxes().xaxis.min);
                }
                hideLabels();
            });

            jQuery("#" + placeholder).bind("plotpan", function(event, position, item) {
                if (plotPanTimeout) {
                    // Because new plot event occurred before wait time passed,
                    // stop previous wait and start new one. Then, heavy
                    // refresh operations are not started too fequently.
                    clearTimeout(plotPanTimeout);
                }
                // Wait before refreshing data.
                // Notice, panning still works with old data in UI.
                plotPanTimeout = setTimeout(function() {
                    plotPanTimeout = null;
                    if (view.start !== plot.getAxes().xaxis.min || view.end !== plot.getAxes().xaxis.max) {
                        view.start = plot.getAxes().xaxis.min;
                        view.end = plot.getAxes().xaxis.max;
                        controller.refreshData(view);
                    }
                }, 200);
                if (!updateLabelsTimeout) {
                    updateLabelsTimeout = setTimeout(updateLabels, 0);
                }
            });

            jQuery("#" + placeholder).bind("plotzoom", function(event, position, item) {
                insideGraph = true;
                var axes = plot.getAxes();
                latestPosition.x = axes.xaxis.c2p(currentCanvas.x);
                latestPosition.y = axes.yaxis.c2p(currentCanvas.y);
                var selectedTime = timer.getSelectedTime();
                if (timer.isPlaying()) {
                    timer.pause();
                    if (insidePlotX(selectedTime)) {
                        timer.play(selectedTime);
                    } else {
                        timer.play(axes.xaxis.min);
                    }
                }
                if (!updateLabelsTimeout) {
                    updateLabelsTimeout = setTimeout(updateLabels, 10);
                }
                view.start = axes.xaxis.min;
                view.end = axes.xaxis.max;
                controller.refreshData(view);
            });

            jQuery("#" + placeholder).bind("plotclick", function(event, position, item) {
                if (timer.isPlaying()) {
                    pauseGraphPlay();
                    latestPosition = position;
                    timer.setSelectedTime(position.x);
                    updateCrosshair(position.x, position.y);
                    if (!updateLabelsTimeout) {
                        updateLabelsTimeout = setTimeout(updateLabels, 10);
                    }
                }
            });

            jQuery("#" + playButton).click(function() {
                jQuery("#" + playButton).attr("disabled", true);
                jQuery("#" + pauseButton).attr("disabled", false);
                timer.setPlaying(true);
                timer.play(timer.getSelectedTime());
            });

            jQuery("#" + pauseButton).click(function() {
                pauseGraphPlay();
            });

            jQuery("#" + zoomInButton).click(function() {
                plot.zoom();
            });

            jQuery("#" + zoomOutButton).click(function() {
                plot.zoomOut();
            });

            jQuery(document).on('change', "#" + timeLabelCheckbox, function() {
                updateLabels();
            });

            jQuery(document).on('change', "#" + yLabelCheckbox, function() {
                updateLabels();
            });

            jQuery(document).on('change', "#" + valueCheckbox, function() {
                updateLabels();
            });
        };

        /**
         * Get selected components from the selectable component.
         *
         * @return {Array} Selected parameters.
         */
        function getSelectedParameters() {
            var result = [];
            var selectable_li = "#selectable li";
            jQuery(".ui-selected", "#selectable").each(function() {
                var index = jQuery(selectable_li).index(this);
                result.push(index);
            });
            return result;
        }

        /**
         * Set selected components for the selectable component.
         *
         * @param newSelectedParameters New parameter selection.
         */
        function setSelectedParameters(newSelectedParameters) {
            var selectedIds = [];
            var selectedHashIds = [];
            var parameterInfo = controller.getParameterInfo();
            for (var i = 0; i < newSelectedParameters.length; i++) {
                selectedIds[i] = parameterInfo[newSelectedParameters[i]].code;
                selectedHashIds[i] = '#' + selectedIds[i];
            }
            var newSelection = selectedHashIds.join(",");
            // Add unselecting class to all elements except the ones to select
            jQuery(".ui-selected", "#" + selectableContainer).not(newSelection).removeClass("ui-selected").addClass("ui-unselected");
            // Add ui-selecting class to the elements to select
            jQuery(newSelection).not(".ui-selected").addClass("ui-selected");
            var selectedParameters = getSelectedParameters();

            if (graphParameters.toString() === selectedParameters.toString()) {
                return;
            }
            graphParameters = selectedParameters;

            // Notice, min and max are checked to know if current plot does not have any data.
            // In that special case or if plot is not available, view period is not updated with empty period.
            // Instead, old view values are used for proper period.
            if (plot !== null && (plot.getAxes().xaxis.min !== -1 || plot.getAxes().xaxis.max !== 1)) {
                view.start = plot.getAxes().xaxis.min;
                view.end = plot.getAxes().xaxis.max;
            }
            view.request = selectedIds.join(",");
            if (undefined === selectRefreshTimeout) {
                // Start refreshing only if it has not been already started.
                // Then, if flow starts refreshing twice, refresh is requested only onc here.
                // This may be required if multiple items have been selected and after that
                // one item that is not included in the group is selected. Then, select and
                // unselect operations will both come here. Notice, there is no need to clear
                // or restart timeout operation because latest data will be requested in any case.
                selectRefreshTimeout = setTimeout(function() {
                    // Reset flag.
                    selectRefreshTimeout = undefined;
                    // Asynchronously fetch data.
                    // Then, if unselection and selection occur simultaneously,
                    // they do not interfere with each others. This can happen
                    // if multiple items have been selected before and then one
                    // of them is selected as single item.
                    controller.refreshData(view);
                    plot = null;
                }, 0);
            }
        }

        /**
         * Update selected parameters into the graph.
         */
        function updateGraphParameters() {
            setSelectedParameters(getSelectedParameters());
        }

        /**
         * Get the parameters currently plotted in the graph.
         *
         * @return {Array} Currently plotted parameters.
         */
        function getGraphParameters() {
            return graphParameters;
        }

        /**
         * Get the maximum number of simultaneously selectable parameters.
         *
         * @return {Number} Mmaximum number of simultaneously selectable parameters.
         */
        function getMaxNumSelectedParameters() {
            return maxNumSelectedParameters;
        }

        /**
         * Create div labels for the previous data points in the graph
         */
        function createValueLabels() {
            var i;
            for ( i = 0; i < $valueLabels.length; i++) {
                $valueLabels[i].remove();
            }
            $valueLabels = [];

            for ( i = 0; i < seriesArray.length; i++) {
                $valueLabels[i] = jQuery('<div />').attr('id', 'valuelabel' + i);
                $valueLabels[i].appendTo('body').hide().css({
                    'position' : 'absolute',
                    'display' : 'none',
                    'border' : '1px solid #000000',
                    'background-color' : '#ffffcc',
                    'opacity' : 0.0,
                    'z-index' : '40000',
                    'padding' : '0.0em 0.3em',
                    'border-radius' : '0.5em',
                    'font-size' : '0.8em',
                    'pointer-events' : 'none'
                });
                $valueLabels[i].html("0.00").css({
                    left : 0,
                    top : 0
                }).show();
            }
        }

        /**
         * Create div labels for Y-axes corresponding to mouse crosshair location
         */
        function createYLabels() {
            var i;
            for ( i = 0; i < $yLabels.length; i++) {
                $yLabels[i].remove();
            }
            $yLabels = [];

            for ( i = 0; i < seriesArray.length; i++) {
                $yLabels[i] = jQuery('<div />').attr('id', 'ylabel' + i);
                $yLabels[i].appendTo('body').hide().css({
                    'position' : 'absolute',
                    'display' : 'none',
                    'border' : '1px solid #000000',
                    'background-color' : '#ffffcc',
                    'opacity' : 0.0,
                    'z-index' : '20000',
                    'padding' : '0.0em 0.3em',
                    'border-radius' : '0.5em',
                    'font-size' : '0.8em',
                    'pointer-events' : 'none'
                });
                $yLabels[i].html("0.00").css({
                    left : 0,
                    top : 0
                }).show();
            }
        }

        /**
         * Create and set new Y-axis for flot if duplicate does not exists.
         *
         * @param {[]} Series array contains series objects.
         * @param {Object} series Object that contains data for flot.
         * @param {[]} yAxes Flot options yaxes array.
         */
        function setSeriesYAxis(seriesArray, series, yAxes) {
            var axisIndex;
            var seriesDuplicate = _.find(seriesArray, function(element) {
                return element !== series && element && series && element.measureUnit === series.measureUnit;
            });
            if (seriesDuplicate) {
                axisIndex = seriesDuplicate.yaxis;

            } else {
                var axis = new YAxis();
                // Use measureUnit as Y-axis label.
                axis.axisLabel = series.measureUnit;
                axis.position = (yAxes.length % 2 === 0) ? "left" : "right";
                // Notice, options are used by flot.
                yAxes.push(axis);
                // Notice, flot uses axis index starting from one.
                axisIndex = yAxes.length;
            }
            series.yaxis = axisIndex;
        }

        /**
         * Update graph after data refreshment.
         *
         * @param {String} topic Topic from the observer pattern.
         * @param {Object} arg New data.
         *                     Notice, the structure of the object is
         *                     the structure provided by the MetOLib WfsRequestParser.
         */
        function dataRefreshed(topic, arg) {
            // Reset member variables.
            seriesArray = [];
            options.yaxes = [];

            // Function variables.
            var data;
            var seriesIndex = -1;

            // For now, get data of the first location only.
            if (arg && arg.locations && arg.locations.length > 0) {
                data = arg.locations[0].data;

            } else {
                if ("undefined" !== typeof console && console) {
                    console.error("ERROR: No data from controller to show in graph!");
                }
            }

            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var dataObject = data[key];
                    if (dataObject) {
                        // Time-value-pair objects in an array.
                        var pairs = dataObject.timeValuePairs;
                        // Property object describing the data.
                        var property = dataObject.property;
                        if (pairs && property) {
                            // Series objects corresponding the key are created into array.
                            ++seriesIndex;
                            var unit = property.unit;
                            if (unit && unit.indexOf("deg") === 0) {
                                // Replace the deg prefix string by HTML code of degree.
                                unit = unit.replace("deg", "&deg;");
                            }
                            // Create series object from the data.
                            var series = new Series();
                            series.label = property.label;
                            series.measureUnit = unit;
                            // Use the colors given during initialization to be sure
                            // colors of other elements match with legend and graph line.
                            // Indexing is used as a backup to get color if initialization has not provided the value.
                            // Indexing works properly if refresh data has not changed the original order of items.
                            series.color = undefined !== seriesColors[key] ? seriesColors[key] : getParameterColor(graphParameters[seriesIndex]);
                            for (var i = 0; i < pairs.length; i++) {
                                // Time-value pair object.
                                var pair = pairs[i];
                                // Notice, flot requires that data is given as
                                // xy-pair-arrays in the array, [[x,y], ...].
                                // So, in this graph one pair is [time, value] pair in an array.
                                series.data[i] = [pair.time, pair.value];
                                if (pair.value < series.minValue) {
                                    series.minValue = pair.value;
                                }
                                if (pair.value > series.maxValue) {
                                    series.maxValue = pair.value;
                                }
                            }
                            seriesArray[seriesIndex] = series;
                            setSeriesYAxis(seriesArray, series, options.yaxes);
                        }
                    }
                }
            }

            // Check missing values (NaN)
            repairData();
            // Plot data
            plotTimeSeries();
            var axes = plot.getAxes();
            // Update timer
            timer.setSelectedTime(axes.xaxis.min);
            timer.setStartTime(axes.xaxis.min);
            timer.setEndTime(axes.xaxis.max);
            createValueLabels();
            createYLabels();
            if (latestPosition === null) {
                latestPosition = {
                    x : axes.xaxis.min,
                    y : axes.yaxis.min
                };
            }
            // Animate Y-axes
            setTimeout(updateYAxes, 100);

            // Update div labels
            if (!updateLabelsTimeout) {
                updateLabelsTimeout = setTimeout(updateLabels, 10);
            }
        }

        /**
         * Update graph after time change.
         *
         * @param topic Topic from the observer pattern.
         * @param arg New time.
         */
        function timeChanged(topic, arg) {
            if (timer.isPlaying()) {
                updateCrosshair(arg);
            }
        }

        /**
         * Pause timer and animation.
         */
        function pauseGraphPlay() {
            timer.pause();
            jQuery("#" + pauseButton).attr("disabled", true);
            jQuery("#" + playButton).attr("disabled", false);
        }

        /**
         * Hide div labels of the parameter values in the graph.
         */
        function hideValueLabels() {
            if (!plot) {
                return;
            }
            if (!$valueLabels) {
                return;
            }
            var dataset = plot.getData();
            for (var i = 0; i < seriesArray.length; i++) {
                if ($valueLabels[i]) {
                    $valueLabels[i].hide().html('');
                }
                var tmpSeries = dataset[i];
                if (tmpSeries.highlighted >= 0) {
                    plot.unhighlight(i, tmpSeries.highlighted);
                    tmpSeries.highlighted = -1;
                }
            }
        }

        /**
         * Hide all parameter div labels in the graph.
         */
        function hideLabels() {
            if ($xLabel) {
                $xLabel.hide().html('');
            }
            if ($yLabels) {
                for (var i = 0; i < $yLabels.length; i++) {
                    if ($yLabels[i]) {
                        $yLabels[i].hide().html('');
                    }
                }
            }
            hideValueLabels();
        }

        /**
         * Check if current position is inside the graph time and Y intervals.
         *
         * @param pos Position.
         * @return {*} Truth value of inside test.
         */
        function insidePlot(pos) {
            if ( typeof plot === "undefined") {
                return false;
            }
            var axes = plot.getAxes();
            if (pos.y === null) {
                return insidePlotX(pos.x);
            }
            return (pos.x > axes.xaxis.min && pos.x < axes.xaxis.max && pos.y > axes.yaxis.min && pos.y < axes.yaxis.max);
        }

        /**
         * Check if current time position is inside the graph interval.
         *
         * @param posX Time position.
         * @return {Boolean} Truth value of inside test.
         */
        function insidePlotX(posX) {
            if ( typeof plot === "undefined") {
                return false;
            }
            var axes = plot.getAxes();
            return (posX > axes.xaxis.min && posX < axes.xaxis.max );
        }

        /**
         * Check if given canvas coordinates are inside the window.
         *
         * @param x X coordinate.
         * @param y Y coorditnate.
         * @param window Window.
         * @return {Boolean} Truth value of inside test.
         */
        function insideWindow(x, y, window) {
            return ((x >= window[0][0]) && (x <= window[1][0]) && (y >= window[0][1]) && (y <= window[1][1]));
        }

        /**
         * Create date-like object independent of time zones.
         *
         * @param d Date.
         * @return {Object} Time-zone independent date.
         */
        function makeUtcWrapper(d) {
            function addProxyMethod(sourceObj, sourceMethod, targetObj, targetMethod) {
                sourceObj[sourceMethod] = function() {
                    return targetObj[targetMethod].apply(targetObj, arguments);
                };
            }

            var utc = {
                date : d
            };
            // support strftime, if found
            if (d.strftime !== undefined) {
                addProxyMethod(utc, "strftime", d, "strftime");
            }
            addProxyMethod(utc, "getTime", d, "getTime");
            addProxyMethod(utc, "setTime", d, "setTime");
            var props = ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds"];
            for (var p = 0; p < props.length; p++) {
                addProxyMethod(utc, "get" + props[p], d, "getUTC" + props[p]);
                addProxyMethod(utc, "set" + props[p], d, "setUTC" + props[p]);
            }
            return utc;
        }

        /**
         * Select time zone strategy.
         *
         * @param ts Time.
         * @param opts Timezone options.
         * @return {*} Date-like object tied to the desired timezone.
         */
        function dateGenerator(ts, opts) {
            if (opts.timezone === "browser") {
                return new Date(ts);
            } else if (!opts.timezone || opts.timezone === "utc") {
                return makeUtcWrapper(new Date(ts));
            } else if ( typeof timezoneJS !== "undefined" && typeof timezoneJS.Date !== "undefined") {
                var d = new timezoneJS.Date();
                // timezone-js is fickle, so be sure to set the time zone before
                // setting the time.
                d.setTimezone(opts.timezone);
                d.setTime(ts);
                return d;
            } else {
                return makeUtcWrapper(new Date(ts));
            }
        }

        /**
         * If value should contain prefix,
         * adds given {pad} prefix or zero.
         * Used by the formatDate function below.
         *
         * @param n Original number. May not be {undefined} or {null}.
         * @param pad Prefix.
         *            May be {undefined} or {null}, then zero is used for prefix.
         * @return {string} Number in correct format.
         */
        function leftPad(n, pad) {
            n = "" + n;
            pad = "" + (null === pad || undefined === pad ? "0" : pad);
            return n.length === 1 ? pad + n : n;
        }

        /**
         * Format the date according to the definitions.
         *
         * @param d Date.
         * @param fmt Format definitions.
         * @return {*} Formatted date.
         */
        function formatDate(d, fmt) {
            if ( typeof d.strftime === "function") {
                return d.strftime(fmt);
            }

            var r = [];
            var escape = false;
            var hours = d.getHours();
            var isAM = hours < 12;

            var hours12;
            if (hours > 12) {
                hours12 = hours - 12;
            } else if (hours === 0) {
                hours12 = 12;
            } else {
                hours12 = hours;
            }

            for (var i = 0; i < fmt.length; ++i) {
                var c = fmt.charAt(i);

                if (escape) {
                    switch (c) {
                        case 'a':
                            c = "" + dayNames[d.getDay()];
                            break;
                        case 'b':
                            c = "" + monthNames[d.getMonth()];
                            break;
                        case 'd':
                            c = leftPad(d.getDate());
                            break;
                        case 'e':
                            c = leftPad(d.getDate(), " ");
                            break;
                        case 'H':
                            c = leftPad(hours);
                            break;
                        case 'I':
                            c = leftPad(hours12);
                            break;
                        case 'l':
                            c = leftPad(hours12, " ");
                            break;
                        case 'm':
                            c = leftPad(d.getMonth() + 1);
                            break;
                        case 'M':
                            c = leftPad(d.getMinutes());
                            break;
                        case 'S':
                            c = leftPad(d.getSeconds());
                            break;
                        case 'y':
                            c = leftPad(d.getFullYear() % 100);
                            break;
                        case 'Y':
                            c = "" + d.getFullYear();
                            break;
                        case 'p':
                            c = (isAM) ? ("" + "am") : ("" + "pm");
                            break;
                        case 'P':
                            c = (isAM) ? ("" + "AM") : ("" + "PM");
                            break;
                        case 'w':
                            c = "" + d.getDay();
                            break;
                    }
                    r.push(c);
                    escape = false;
                } else {
                    if (c === "%") {
                        escape = true;
                    } else {
                        r.push(c);
                    }
                }
            }
            return r.join("");
        }

        /**
         * Convert time to formatted date.
         *
         * @param v Time.
         * @param newForceLongFmt Time format.
         * @return {*} Formatted date.
         */
        function numToDate(v, newForceLongFmt) {
            var axis = plot.getAxes().xaxis;
            var opts = axis.options;
            var d = dateGenerator(v, axis.options);
            // Default value.
            var fmt = "%Y";

            if (axis.tickSize !== undefined) {
                var forceLongFmt = ( typeof newForceLongFmt !== "undefined") ? newForceLongFmt : false;

                // size of time units in milliseconds
                var timeUnitSize = {
                    "second" : 1000,
                    "minute" : 60 * 1000,
                    "hour" : 60 * 60 * 1000,
                    "day" : 24 * 60 * 60 * 1000,
                    "month" : 30 * 24 * 60 * 60 * 1000,
                    "year" : 365.2425 * 24 * 60 * 60 * 1000
                };

                var t = axis.tickSize[0] * timeUnitSize[axis.tickSize[1]];
                var span = axis.max - axis.min;
                var suffix = (opts.twelveHourClock) ? " %p" : "";
                var hourCode = (opts.twelveHourClock) ? "%I" : "%H";

                if ((t < timeUnitSize.minute) && (!forceLongFmt)) {
                    fmt = hourCode + ":%M:%S" + suffix;
                } else if ((t < timeUnitSize.day) || (forceLongFmt)) {
                    if ((span < 2 * timeUnitSize.day) && (!forceLongFmt)) {
                        fmt = hourCode + ":%M" + suffix;
                    } else {
                        fmt = "%b %d " + hourCode + ":%M" + suffix;
                    }
                } else if (t < timeUnitSize.month) {
                    fmt = "%b %d";
                } else if (t < timeUnitSize.year) {
                    if (span < timeUnitSize.year) {
                        fmt = "%b";
                    } else {
                        fmt = "%b %Y";
                    }
                }
            }
            return formatDate(d, fmt);
        }

        /**
         * Function to check Y-axis duplicates from the given array.
         *
         * Notice, it may be required to use subset of the original
         * array to check if item is contained in the subset array.
         * Then, use the slice function to get the subset.
         *
         * @param {[Object]} array Array contains plot data set objects.
         *                         May not be {undefined} or {null}.
         * @param {Object} item Item that is searched from the array.
         * @return {boolean} {true} if item duplicate is found from the array.
         */
        function yAxisDuplicate(array, item) {
            return undefined !== _.find(array, function(element) {
                return item !== element && item && element && item.measureUnit === element.measureUnit;
            });
        }

        /**
         * Update div labels for time, Y and parameter values based on current time.
         */
        function updateLabels() {
            if (!plot) {
                return;
            }

            graphOffsets = jQuery("#" + placeholder).offset();
            if (!timer.isPlaying()) {
                plot.unlockCrosshair();
            }

            updateLabelsTimeout = null;
            if ((!insideGraph) && (!timer.isPlaying())) {
                hideLabels();
                return;
            }

            var xaxis = plot.getAxes().xaxis;
            var yaxes = plot.getYAxes();

            var pos = {
                x : null,
                y : null
            };
            if (timer.isPlaying()) {
                pos.x = timer.getSelectedTime();
            } else {
                pos = latestPosition;
            }

            // If we are inside the graph time range:
            if ((pos.x > xaxis.min) && (pos.x < xaxis.max)) {
                var dataset = plot.getData();
                for (var i = 0; i < dataset.length; ++i) {
                    // Notice, flot sets axis information inside dataset axis objects.
                    var tmpSeries = dataset[i];
                    var currentYAxis = tmpSeries.yaxis;
                    // Y-axis unit based duplicates are skipped here because only one axis is needed per unit type.
                    // So, only the first one of duplicates is handled. Therefore, slice is used for dataset subset.
                    if ((!timer.isPlaying()) && (jQuery("#" + yLabelCheckbox).is(':checked')) && (insidePlot(pos)) && !yAxisDuplicate(dataset.slice(0, i), tmpSeries)) {
                        var yAxisValue = currentYAxis.c2p(currentCanvas.y);
                        $yLabels[i].html(yAxisValue.toFixed(1)).css({
                            left : 0,
                            top : 0,
                            opacity : 0.0
                        }).show();
                        var yLabelHeight = $yLabels[i].outerHeight();

                        var yLabelWidth = 40;
                        var yx;
                        // Current axis contains information about its position. Show label box in the same side.
                        if (currentYAxis.position === "left") {
                            yx = plot.getPlotOffset().left + graphOffsets.left - 45 - i * 20;
                        } else {
                            yx = plot.getPlotOffset().left + graphOffsets.left + plot.width() - 15 + i * 20;
                        }

                        var yy = plot.getAxes().yaxis.p2c(pos.y) + plot.getPlotOffset().top + graphOffsets.top - yLabelHeight / 2;
                        $yLabels[i].css({
                            left : yx,
                            top : yy,
                            'text-align' : 'center'
                        }).outerWidth(yLabelWidth).show();
                        if ("#" + yLabelCheckbox) {
                            $yLabels[i].css('opacity', 1.0);
                        }
                    } else {
                        $yLabels[i].hide().html('');
                    }

                    // Notice, even if duplicates have common axis,
                    // highlight is shown for each dataset.

                    // Find the previous points x-wise for highlighting.
                    var j;
                    for ( j = 0; j < tmpSeries.data.length; ++j) {
                        if (tmpSeries.data[j][0] > pos.x) {
                            break;
                        }
                    }
                    var highligtIndex = Math.max(0, j - 1);

                    // Highlight.
                    if (tmpSeries.highlighted >= 0) {
                        plot.unhighlight(i, tmpSeries.highlighted);
                    }
                    plot.highlight(i, highligtIndex);
                    tmpSeries.highlighted = highligtIndex;

                    var $xlabel = jQuery('#xlabel');
                    if ((jQuery("#" + timeLabelCheckbox).is(':checked')) && (insidePlot(pos))) {
                        var dateText = numToDate(new Date(tmpSeries.data[highligtIndex][0]));
                        $xLabel.html(dateText).css({
                            left : 0,
                            top : 0,
                            opacity : 0.0
                        }).show();

                        var xLabelHeight = $xlabel.outerHeight();
                        var xLabelWidth = $xlabel.outerWidth();
                        var xx = plot.getAxes().xaxis.p2c(tmpSeries.data[highligtIndex][0]) + plot.getPlotOffset().left + graphOffsets.left - xLabelWidth / 2;
                        var xy = graphOffsets.top + 5;

                        $xLabel.css({
                            left : xx,
                            top : xy
                        }).show();
                        $xlabel.css('opacity', 1.0);

                    } else {
                        $xLabel.hide().html('');
                    }

                    if (pos.x < tmpSeries.data[0][0] || pos.x > tmpSeries.data[tmpSeries.data.length - 1][0]) {
                        if ($valueLabels[i]) {
                            $valueLabels[i].hide().html('');
                        }
                        continue;
                    }

                    if ($valueLabels[i]) {
                        // Interpolate.
                        var p1 = tmpSeries.data[j - 1];
                        var p2 = tmpSeries.data[j];
                        var y = interpolate(pos.x, p1, p2);
                        if (y > currentYAxis.min && y < currentYAxis.max) {
                            $valueLabels[i].html(y.toFixed(tmpSeries.numDecimals) + " " + tmpSeries.measureUnit).css({
                                left : 0,
                                top : 0,
                                opacity : 0.0
                            }).show();
                            var valueLabelHeight = jQuery('#valuelabel' + i).outerHeight();
                            var xC = xaxis.p2c(pos.x) + plot.getPlotOffset().left + graphOffsets.left;
                            var yC = currentYAxis.p2c(y) + plot.getPlotOffset().top + graphOffsets.top - valueLabelHeight / 2;

                            $valueLabels[i].css({
                                left : xC + 15,
                                top : yC
                            }).show();
                            $valueLabels[i].css('opacity', 0.8);

                        } else {
                            $valueLabels[i].hide().html('');
                        }
                    }
                }

            } else {
                // Outside the time range:
                hideValueLabels();
            }
            // Check if value labels should be shown at all.
            if (!jQuery("#" + valueCheckbox).is(':checked')) {
                hideValueLabels();
            }
        }

        /**
         * Perform linear interpolation.
         *
         * @param x X coordinate.
         * @param p1 First reference point.
         * @param p2 Second reference point.
         * @return {*} Interpolated Y value.
         */
        function interpolate(x, p1, p2) {
            var y;
            if (!isNumber(p1[0])) {
                y = p2[1];
            } else if (!isNumber(p2[0])) {
                y = p1[1];
            } else {
                y = p1[1] + (p2[1] - p1[1]) * (x - p1[0]) / (p2[0] - p1[0]);
            }
            return y;
        }

        /**
         * Update crosshair location on the graph.
         *
         * @param newX X coordinate.
         * @param newY Y coordinate.
         */
        function updateCrosshair(newX, newY) {
            if (plot === null) {
                return;
            }
            var axes = plot.getAxes();
            var x = ( typeof newX !== 'undefined') ? newX : axes.xaxis.min;
            var y = ( typeof newY !== 'undefined') ? newY : null;
            plot.lockCrosshair({
                x : x,
                y : y
            });
            updateLabels();

            var dx = plot.getAxes().xaxis.c2p(1) - plot.getAxes().xaxis.c2p(0);
            if (dx <= 0.0) {
                dx = 1.0;
            }
            timer.setAnimationTimeStep(dx);
            timer.setStartTime(axes.xaxis.min);
            timer.setEndTime(axes.xaxis.max);
        }

        /**
         * Find, log and interpolate missing values in data.
         */
        function repairData() {
            var hangingNaNs;
            var prevValid;
            var k;
            var l;
            for (var i = 0; i < seriesArray.length; i++) {
                hangingNaNs = [];
                prevValid = null;
                for (var j = 0; j < seriesArray[i].data.length; j++) {
                    if (isNumber(seriesArray[i].data[j][1])) {
                        for ( k = 0; k < hangingNaNs.length; k++) {
                            l = hangingNaNs[k];

                            var p2 = seriesArray[i].data[j];
                            if (prevValid === null) {
                                seriesArray[i].data[l][1] = p2[1];
                                continue;
                            }
                            var p1 = seriesArray[i].data[prevValid];
                            var x = seriesArray[i].data[l][0];
                            seriesArray[i].data[l][1] = interpolate(x, p1, p2);
                        }
                        prevValid = j;
                        if (hangingNaNs.length > 0) {
                            hangingNaNs = [];
                        }
                    } else {
                        seriesArray[i].NaNs.push(j);
                        hangingNaNs.push(j);
                    }
                }
                // Missing values at the end
                for ( k = 0; k < hangingNaNs.length; k++) {
                    l = hangingNaNs[k];
                    // Invalid data
                    if (prevValid === null) {
                        seriesArray[i].data[l][1] = 0.0;
                        continue;
                    }
                    seriesArray[i].data[l][1] = seriesArray[i].data[prevValid][1];
                }
            }
        }

        /**
         * Test if input parameter is a valid number.
         *
         * @param n Parameter to be tested.
         * @return {Boolean} Truth value of the validity test.
         */
        function isNumber(n) {
            return (!isNaN(parseFloat(n))) && (isFinite(n));
        }

        /**
         * Draw a dashed line.
         *
         * @param x1 X coordinate of start point.
         * @param y1 Y coordinate of start point.
         * @param x2 X coordinate of end point.
         * @param y2 Y coordinate of end point.
         * @param window Window.
         * @param dashLen Dash length.
         */
        CanvasRenderingContext2D.prototype.dashedLine = function(x1, y1, x2, y2, window, dashLen) {
            if ((dashLen === undefined) || (dashLen <= 0.0)) {
                dashLen = 2.0;
            }

            this.beginPath();
            this.moveTo(x1, y1);
            var dX = x2 - x1;
            var dY = y2 - y1;
            var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
            var dashX = dX / dashes;
            var dashY = dY / dashes;
            var x0, y0;

            var q = 0;
            while (q++ < dashes) {
                x0 = x1;
                y0 = y1;
                x1 += dashX;
                y1 += dashY;
                if ((q % 2 !== 0) && (insideWindow(x0, y0, window)) && ((insideWindow(x1, y1, window)))) {
                    this.lineTo(x1, y1);
                } else {
                    this.moveTo(x1, y1);
                }
            }
            if ((q % 2 !== 0) && (insideWindow(x1, y1, window)) && ((insideWindow(x2, y2, window)))) {
                this.lineTo(x2, y2);
            } else {
                this.moveTo(x2, y2);
            }

            this.stroke();
            this.closePath();
        };

        /**
         * Plot the time series.
         */
        function plotTimeSeries() {
            if (plot === null) {
                // Major update
                jQuery("#" + placeholder).empty();
                plot = jQuery.plot(jQuery("#" + placeholder), seriesArray, options);

            } else {
                // Minor update
                plot.unhighlight();
                plot.setData(seriesArray);
                plot.draw();
            }
            improveTimeTicks();
        }

        /**
         * Improve the format of time ticks by adding first and new dates visible also in hour mode.
         */
        function improveTimeTicks() {
            // Flot could have been modified directly.
            // But, avoide that to enable smooth Flot updates in the future,
            var xaxis = plot.getXAxes()[0];
            if ( typeof xaxis.ticks === "undefined") {
                return;
            }
            var tickLabel = xaxis.ticks[0].label;
            var changeNeeded = true;
            var i;
            if (tickLabel.indexOf(":") >= 0) {
                for ( i = 0; i < monthNames.length; i++) {
                    if (tickLabel.indexOf(monthNames[i]) >= 0) {
                        changeNeeded = false;
                        break;
                    }
                }
            } else {
                changeNeeded = false;
            }

            if (changeNeeded) {
                var dateIndexes = [];
                var firstHandled = false;

                for ( i = 0; i < xaxis.ticks.length; i++) {
                    if ((xaxis.ticks[i].v < xaxis.min) || (xaxis.ticks[i].v > xaxis.max)) {
                        continue;
                    }
                    if (!firstHandled) {
                        dateIndexes.push(i);
                        firstHandled = true;
                        continue;
                    }

                    var i1 = xaxis.ticks[i - 1].label.indexOf(":");
                    var i2 = xaxis.ticks[i].label.indexOf(":");

                    if (parseInt(xaxis.ticks[i - 1].label.substring(i1 - 2, i1), 10) > parseInt(xaxis.ticks[i].label.substring(i2 - 2, i2), 10)) {
                        dateIndexes.push(i);
                    }
                }
                var opts = plot.getOptions();
                dateIndex = 0;

                opts.xaxes[0].tickFormatter = function(v, axis) {
                    if (prevTime !== null) {
                        if (prevTime > v) {
                            dateIndex = 0;
                        }
                    }
                    var editDateIndex = false;
                    for (var i = 0; i < dateIndexes.length; i++) {
                        if (dateIndex === dateIndexes[i]) {
                            editDateIndex = true;
                            break;
                        }
                    }
                    dateIndex++;
                    prevTime = v;
                    return numToDate(v, editDateIndex);
                };
                plot.setupGrid();
                plot.draw();
            }
        }

        /**
         * Creates the default change object for Y-axis animation flow.
         *
         * @param {[]} seriesArray Array of data series objects.
         * @param {int} yAxisIndex Array index for the yaxis.
         * @return {Object} Object containing default properties for change that is used for Y-axis animation.
         */
        function getDefaultChange(yAxisIndex, seriesArray) {
            var change = {
                // Change delta value.
                value : 0.0,
                // Direction of the animation for Y-axis upper part.
                upSign : undefined,
                // Direction of the animation for Y-axis lower part.
                downSign : undefined,
                // Max and min values for axis and actual data.
                yAxisMax : undefined,
                yAxisMin : undefined,
                yMax : undefined,
                yMin : undefined
            };
            for (var i = 0; i < seriesArray.length; ++i) {
                var series = seriesArray[i];
                if (series.yaxis - 1 === yAxisIndex) {
                    if (change.yMax === undefined || change.yMax < series.maxValue) {
                        change.yMax = series.maxValue;
                    }
                    if (change.yMin === undefined || change.yMin > series.minValue) {
                        change.yMin = series.minValue;
                    }
                }
            }
            if (change.yMax !== undefined && change.yMin !== undefined) {
                var margin = 0.05 * (change.yMax - change.yMin);
                change.yAxisMin = change.yMin - margin;
                change.yAxisMax = change.yMax + margin;
                change.value = (change.yMax - change.yMin) / 100.0;
            }
            return change;
        }

        /**
         * Animate Y-axis scales to adapt to optimal value ranges based on the parameter data.
         *
         * @param newYChange
         */
        function updateYAxes(newYChange) {
            // Accept only one update at the time.
            // When new update is started, the newYChange is undefined.
            // Then, semaphore is updated to handle only that new aniamtion and
            // other ones are ignored.
            if (plot && (!newYChange || newYChange === yAxesAnimationSemaphore)) {
                var yChange = [];
                yAxesAnimationSemaphore = yChange;
                var finished = true;
                var opts = plot.getOptions();
                for (var i = 0; i < opts.yaxes.length; i++) {
                    yChange[i] = newYChange !== undefined ? newYChange[i] : getDefaultChange(i, seriesArray);
                    var change = yChange[i];
                    // First upper iteration
                    if (change.upSign === undefined) {
                        opts.yaxes[i].max = plot.getYAxes()[i].max;
                        change.upSign = (plot.getYAxes()[i].max > change.yAxisMax) ? 1.0 : -1.0;
                    }
                    if (change.value && change.upSign * opts.yaxes[i].max > change.upSign * change.yAxisMax) {
                        opts.yaxes[i].max -= change.upSign * change.value;
                        finished = false;

                    } else {
                        // Prevent possible looping by setting sign to zero.
                        change.upSign = 0;
                        // Make sure, final value is exactly correct.
                        opts.yaxes[i].max = change.yAxisMax;
                    }
                    // First lower iteration
                    if (change.downSign === undefined) {
                        opts.yaxes[i].min = plot.getYAxes()[i].min;
                        change.downSign = (plot.getYAxes()[i].min > change.yAxisMin) ? 1.0 : -1.0;
                    }
                    if (change.value && change.downSign * opts.yaxes[i].min > change.downSign * change.yAxisMin) {
                        opts.yaxes[i].min -= change.downSign * change.value;
                        finished = false;

                    } else {
                        // Prevent possible looping by setting sign to zero.
                        change.downSign = 0;
                        // Make sure, final value is exactly correct.
                        opts.yaxes[i].min = change.yAxisMin;
                    }
                }
                plot.setupGrid();
                plot.draw();
                if (!finished) {
                    // Notice, timeout time effect to the speed of the animation.
                    // Also, change value set in getDefaultChange function has effect
                    // to the animation smoothness.
                    setTimeout(function() {
                        updateYAxes(yChange);
                    }, 10);
                }
            }
        }

        return {
            // Public methods

            /**
             * Initialize the line graph.
             *
             * @param newElements Id array of necessary html elements.
             * @param newController Data engine instance.
             * @param newTimeControl Time control reference.
             */
            init : init,
            /**
             * Update graph after data refreshment.
             *
             * @param topic Topic from the observer pattern.
             * @param arg New data.
             */
            dataRefreshed : dataRefreshed,
            /**
             * Update graph after time change.
             *
             * @param topic Topic from the observer pattern.
             * @param arg New time.
             */
            timeChanged : timeChanged,
            /**
             * Get the parameters currently plotted in the graph.
             *
             * @return {Array} Currently plotted parameters.
             */
            getGraphParameters : getGraphParameters,
            /**
             * Get selected components from the selectable component.
             *
             * @return {Array} Selected parameters.
             */
            getSelectedParameters : getSelectedParameters,
            /**
             * Set selected components for the selectable component.
             *
             * @param newSelectedParameters New parameter selection.
             */
            setSelectedParameters : setSelectedParameters,
            /**
             * Get the maximum number of simultaneously selectable parameters.
             *
             * @return {Number} Mmaximum number of simultaneously selectable parameters.
             */
            getMaxNumSelectedParameters : getMaxNumSelectedParameters,
            /**
             * Update selected parameters into the graph.
             */
            updateGraphParameters : updateGraphParameters,
        };
    };

    /**
     * See API for function description.
     */
    function insertGraph(options) {
        if (!options || !options.graphContainerId) {
            var optionsError = "ERROR: Graph options or container ID is not correct!";
            if ("undefined" !== typeof console && console) {
                console.error(optionsError);
            }
            throw optionsError;
        }

        // Data engine and timer
        var controller = fi.fmi.metoclient.ui.graph.Controller();
        controller.init(options.config);
        var timer = fi.fmi.metoclient.ui.graph.Timer;
        var parameterInfo = controller.getParameterInfo();
        // Contains colors for the selection items as parameter-color-pair.
        var selectionColors = {};

        // Construct HTML code
        var $container = jQuery("#" + options.graphContainerId);
        var $graphComponent = jQuery('<div class="graphComponent"></div>');
        $container.append($graphComponent);

        var $divParameterSelectImg = jQuery('<div/>', {
            id : "divParameterSelectImg",
            // Notice, this is defined as class string not as selector.
            // So, space is properly used between class names.
            class : "divParameterSelectImg divMaximize"
        });
        $graphComponent.append($divParameterSelectImg);

        var $selectionContainer = jQuery('<div class="selectionContainer" id="selectionContainer"></div>');
        var $selectable = jQuery('<ol class="selectable" id="selectable"></ol>');
        $selectionContainer.append($selectable);
        $graphComponent.append($selectionContainer);
        for (var i = 0; i < parameterInfo.length; i++) {
            var paramCode = parameterInfo[i].code || "";
            var selectableClass = "ui-widget-content";
            if (paramCode) {
                // Notice, below selectableClass is used as a HTML class string
                // and not a selector. Therefore, space is proper here.
                selectableClass += " " + paramCode;
                // Dynamical style definitions for parameter colors.
                // Notice, adjoining class selector is used here. IE6 and earlier do not support it in CSS.
                // This defines the color when item is selected.
                selectionColors[paramCode] = getParameterColor(i);
                jQuery.rule('.selectable .' + paramCode + '.ui-selected { background-color: ' + selectionColors[paramCode] + ';}').appendTo('style');
            }
            $selectable.append(jQuery('<li/>', {
                // Notice, id is also used for comparison
                // when select/unselect actions are checked.
                id : paramCode,
                class : selectableClass,
                text : parameterInfo[i].label
            }));
        }

        // Container for flot graph and footer.
        var $graphPlaceholder = jQuery('<div/>', {
            id : "graphPlaceholder",
            class : "graphPlaceholder"
        });
        $graphComponent.append($graphPlaceholder);

        var $flotGraph = jQuery('<div/>', {
            id : placeholder,
            class : placeholder
        });
        $graphPlaceholder.append($flotGraph);

        var $graphFooter = jQuery('<div/>', {
            id : "graphFooter",
            class : "graphFooter"
        });
        $graphPlaceholder.append($graphFooter);
        $graphFooter.append("Show: Time labels");
        $graphFooter.append(jQuery('<input/>', {
            id : timeLabelCheckbox,
            class : timeLabelCheckbox,
            type : "checkbox",
            checked : true
        }));
        $graphFooter.append("Y label");
        $graphFooter.append(jQuery('<input/>', {
            id : yLabelCheckbox,
            class : yLabelCheckbox,
            type : "checkbox",
            checked : true
        }));
        $graphFooter.append("Values");
        $graphFooter.append(jQuery('<input/>', {
            id : valueCheckbox,
            class : valueCheckbox,
            type : "checkbox",
            checked : true
        }));
        $graphFooter.append(jQuery('<br/>'));
        $graphFooter.append(jQuery('<button/>', {
            id : zoomInButton,
            class : zoomInButton,
            text : "Zoom in"
        }));
        $graphFooter.append(jQuery('<button/>', {
            id : zoomOutButton,
            class : zoomOutButton,
            text : "Zoom out"
        }));
        $graphFooter.append(jQuery('<button/>', {
            id : playButton,
            class : playButton,
            text : "Play"
        }));
        $graphFooter.append(jQuery('<button/>', {
            id : pauseButton,
            class : pauseButton,
            text : "Pause"
        }));

        // Notice, these dimensions are taken for later use before
        // dimensions are set to zero to hide the element.

        // Selectable list is inside container that can hide it by changing container size.
        // But, always keep the list size constant. Then, text does not start wrapping.
        $selectable.css({
            width : $selectable.width() + "px",
            height : $selectable.height() + "px"
        });

        // This is used when width is set for selectionContainer during animation.
        var maxSelectionContainerWidth = $selectionContainer.width();
        // This is used when graph width is calculated.
        var maxSelectionContainerOuterWidth = $selectionContainer.outerWidth();
        var maxSelectionContainerHeight = $selectionContainer.height();
        // Set width to zero as default.
        // Notice, the total width of the element may still differ from zero.
        $selectionContainer.width(0);
        // Instead of using zero for height, the selection image height is used
        // if selectionContainer element is taller that selection image. Then, animation
        // closes the selection towards the selection image.
        var minimizedSelectionContainerHeight = maxSelectionContainerHeight;
        if (minimizedSelectionContainerHeight > $divParameterSelectImg.height()) {
            minimizedSelectionContainerHeight = $divParameterSelectImg.height();
            $selectionContainer.height(minimizedSelectionContainerHeight);
        }

        var resetGraphDimensions = function() {
            // Graph max width is what is left from graph container when selector is closed.
            // Notice, instead of streatching the graph when selectionContainer changes, the graph
            // size is kept constant and it only slides when selectionContainer opens and closes.
            // Notice, that -1 is used for place holder width and height because otherwise place holder may jump to next row in some cases.
            var maxGraphPlaceholderWidth = $graphComponent.width() - $divParameterSelectImg.outerWidth() - maxSelectionContainerOuterWidth - 1;
            $graphPlaceholder.height($graphComponent.height() - 1);
            $graphPlaceholder.width(maxGraphPlaceholderWidth);
            $flotGraph.width(maxGraphPlaceholderWidth);
            $flotGraph.height($graphPlaceholder.height() - $graphFooter.outerHeight());
        };
        resetGraphDimensions();
        // Also, bind graph dimensions to change when the container size change.
        $graphComponent.resize(function(event) {
            resetGraphDimensions();
        });

        // Create the graph instance
        var lineGraph = new LineGraph();
        lineGraph.init(controller, timer, selectionColors);

        // Bring the parameter selection front and back to hiding.
        $divParameterSelectImg.click(function() {
            if (!$selectionContainer.width()) {
                $selectionContainer.animate({
                    width : maxSelectionContainerWidth + "px",
                    height : maxSelectionContainerHeight + "px"
                }, {
                    queue : false,
                    duration : 400
                });
                $divParameterSelectImg.removeClass("divMaximize").addClass("divMinimize");

            } else {
                $selectionContainer.animate({
                    width : 0,
                    height : minimizedSelectionContainerHeight + "px"
                }, {
                    queue : false,
                    duration : 400
                });
                $divParameterSelectImg.removeClass("divMinimize").addClass("divMaximize");
            }
        });

        /**
         * If clicked outside the selectionContainer component, animate parameter selection back to hiding.
         */
        jQuery("body").click(function(ev) {
            var id = ev.target.id;
            if ((id !== "divParameterSelectImg") && ($selectionContainer.width() === maxSelectionContainerWidth)) {
                $selectionContainer.animate({
                    width : 0,
                    height : minimizedSelectionContainerHeight + "px"
                }, {
                    queue : false,
                    duration : 400
                });
                $divParameterSelectImg.removeClass("divMinimize").addClass("divMaximize");
            }
        });

        /**
         * Parameter selection functionality of the selectionContainer component.
         */
        var selecting = false;
        $selectable.selectable({
            // Item selected.
            selected : function(event, ui) {
                selecting = false;
                var graphParameters = lineGraph.getGraphParameters();
                var selectedParameters = lineGraph.getSelectedParameters();
                var found;
                var i, j;
                if (selectedParameters.length > lineGraph.getMaxNumSelectedParameters()) {
                    for ( i = 0; i < selectedParameters.length; i++) {
                        found = false;
                        for ( j = 0; j < graphParameters.length; j++) {
                            if (selectedParameters[i] === graphParameters[j]) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            selectedParameters.splice(i, 1);
                            lineGraph.setSelectedParameters(selectedParameters);
                            return;
                        }
                    }
                }
                lineGraph.setSelectedParameters(selectedParameters);
            },
            // Item unselected.
            unselected : function(event, ui) {
                if (!selecting) {
                    var graphParameters = lineGraph.getGraphParameters();
                    // At least one parameter needs to be selected.
                    if (graphParameters.length === 1) {
                        if (parameterInfo[graphParameters[0]].code === ui.unselected.id) {
                            lineGraph.setSelectedParameters(graphParameters);
                        }
                    } else {
                        lineGraph.updateGraphParameters();
                    }
                }
                selecting = false;
            },
            // Selecting the item.
            selecting : function(event, ui) {
                selecting = true;
            }
        });
    }

    // Return the Graph API.
    return {
        /**
         * Insert the graph into the HTML element identified by the given ID.
         *
         * @param {Object} options Options contains information to initialize graph.
         *                         Options or its contents may not be {undefined} or {null} or empty.
         *                         Structure:
         *                           {
         *                             graphContainerId : "String identifier of the graph HTML element container.",
         *                             config : {
         *                               baseUrl : "String for the WFS request base URL.",
         *                               storedQueryId : "String for the WFS request stored query ID.",
         *                               begin : "Date or integer to define default begin time for graph.",
         *                               end : "Date or integer to defined default end time for graph."
         *                               // Notice, if multiple sites are given in an array,
         *                               // data is requested for all sites but data of only
         *                               // one site is shown in the graph.
         *                               sites : "String for default sites for graph data.",
         *                               // Default parameter information contains array of objects that provide
         *                               // hard coded parameter code and label information before queries are done.
         *                               parameterInfo : [ {label : "Label string", code : "requestParameter"}, ... ],
         *                               // Cache may be used for data queries.
         *                               // Optional property. May be {undefined} or {null}. Default is {false}.
         *                               useCache : {Boolean}
         *                             }
         *                           }
         */
        insertGraph : insertGraph
    };

})();
