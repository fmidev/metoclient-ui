"use strict";

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.graph = fi.fmi.metoclient.ui.graph || {};

/**
 * This configuration JavaScript file provides an example configuration object
 * to initialize graph component.
 */
fi.fmi.metoclient.ui.graph.Config = {

    /**
     * Base URL for data queries.
     */
    baseUrl : "http://data.fmi.fi/fmi-apikey/insert-your-apikey-here/wfs",

    /**
     * Stored query ID for data queries.
     */
    storedQueryId : "fmi::observations::weather::multipointcoverage",

    /**
     * Default begin time for graph.
     */
    begin : (new Date()).getTime() - 30 * 24 * 60 * 60 * 1000,

    /**
     * Default end time for graph.
     */
    end : (new Date()).getTime() - 28 * 24 * 60 * 60 * 1000,

    /**
     * Default sites for graph data.
     * Notice, if multiple sites are given in an array,
     * data is requested for all sites but data of only
     * one site is shown in the graph.
     */
    sites : "Helsinki",

    /**
     * Parameter information contains array of objects that provide hard coded parameter code and
     * label information before queries are done. These hard coded parameter codes and corresponding
     * human readable parameter labels are used before they are available from the server after data query.
     */
    parameterInfo : [{
        code : "t2m",
        label : "Temperature"
    }, {
        code : "rh",
        label : "Humidity"
    }, {
        code : "td",
        label : "Dew-point"
    }, {
        code : "ws_10min",
        label : "Wind speed"
    }, {
        code : "wg_10min",
        label : "Gust speed"
    }, {
        code : "wd_10min",
        label : "Wind direction"
    }, {
        code : "r_1h",
        label : "Precipitation"
    }, {
        code : "ri_10min",
        label : "Precipitation intensity"
    }, {
        code : "snow_aws",
        label : "Snow depth"
    }, {
        code : "vis",
        label : "Visibility"
    }],

    /**
     * Cache may be used for data queries.
     * Optional property. May be {undefined} or {null}. Default is {false}.
     */
    useCache : true

};
