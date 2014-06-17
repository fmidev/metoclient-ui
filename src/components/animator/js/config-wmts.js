// See config.js for more detailed comments about configuration files.

"use strict";

// You may set OpenLayers localization if needed.
// Then, make sure proper JavaScript language files are also included
// into your HTML file from OpenLayers Lang-folder.
// For example:
// OpenLayers.Lang.setCode('fi');
// OpenLayers.Lang.setCode('sv');

var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

fi.fmi.metoclient.ui.animator.Config = {

    map : {
        className : "OpenLayers.Map",
        args : [{
            allOverlays : true,
            projection : 'EPSG:3067',
            units : "m",
            resolutions : [1024, 512, 256],
            maxExtent : [-4537345.568, 3840856.936, 2889342.313, 8254755.58],
            restrictedExtent : [-118331.366408356, 6335621.16701424, 875567.731906565, 7907751.53726352],
            center : [395000, 7100000]
        }]
    },

    layers : [{
        className : "OpenLayers.Layer.WMTS",
        args : [{
            name : "Map",
            url : "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/gwc/service/wmts",
            format : "image/png",
            layer : "KAP:Europe_basic_EurefFIN",
            buffer : 1,
            style : "",
            matrixSet : "ETRS-TM35FIN",
            matrixIds : [{
                identifier : "ETRS-TM35FIN:3"
            }, {
                identifier : "ETRS-TM35FIN:4"
            }, {
                identifier : "ETRS-TM35FIN:5"
            }]
        }]
    }, {
        capabilities : {
            url : "http://data.fmi.fi/fmi-apikey/insert-your-apikey-here/wfs",
            storedQueryId : "fmi::radar::composite::rr",
            layer : "Radar:suomi_rr_eureffin"
        },
        className : "OpenLayers.Layer.Animation.Wmts",
        args : [{
            name : "Precipitation",
            url : "http://wms.fmi.fi/fmi-apikey/insert-your-apikey-here/geoserver/gwc/service/wmts",
            layer : "Radar:suomi_rr_eureffin",
            style : "",
            maxExtent : [-118331.366408356, 6335621.16701424, 875567.731906565, 7907751.53726352],
            matrixSet : "ETRS-TM35FIN-FINLAND",
            matrixIds : [{
                identifier : "ETRS-TM35FIN-FINLAND:3"
            }, {
                identifier : "ETRS-TM35FIN-FINLAND:4"
            }, {
                identifier : "ETRS-TM35FIN-FINLAND:5"
            }],
            animation : {
                layers : [{
                    layer : "Radar:suomi_tuliset_rr_eureffin",
                    storedQueryId : "fmi::forecast::tuliset::rr",
                    beginTime : "join",
                    name : "Precipitation forecast",
                    isForecast : true
                }],
                autoLoad : true,
                maxAsyncLoadCount : 8,
                name : "Precipitation"
            }
        }]
    }],

    defaultZoomLevel : 0,
    animationRefreshInterval : 15 * 60 * 1000,
    animationFrameRate : 500,
    animationResolutionTime : 15 * 60 * 1000,
    animationDeltaToBeginTime : 12 * 15 * 60 * 1000,
    animationDeltaToEndTime : 4 * 15 * 60 * 1000

};
