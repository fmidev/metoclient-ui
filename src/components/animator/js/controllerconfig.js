"use strict";

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

/**
 * Controller configuration for slider and time scale UI components.
 *
 * Notice, controller does not contain default values for these
 * configuration objects and their properties. Therefore, all
 * of the objects and their properties defined here are mandatory
 * and controller gives an error if they are missing, {undefined},
 * {null} or empty.
 */
fi.fmi.metoclient.ui.animator.ControllerConfig = {

    /**
     * Controller slider configuration object.
     */
    sliderConfig : {
        /**
         * Slider background color.
         */
        bgColor : "#2486ce",
        /**
         * Slider text color.
         */
        textColor : "white"
    },

    /**
     * Controller time scale configuration object.
     */
    scaleConfig : {
        /**
         * Background color.
         */
        bgColor : "#384a52",
        /**
         * Cell shows ready color when content data
         * loading has completed.
         */
        cellReadyColor : "#71be3c",
        /**
         * Cell shows error color if an error has occurred
         * during content data loading.
         */
        cellErrorColor : "#ff0000",
        /**
         * Cell shows loading color while data is loading.
         */
        cellLoadingColor : "#658694",
        /**
         * Time scale observation area background color.
         */
        obsBgColor : "#b3d9e9",
        /**
         * Time scale forecast area background color.
         */
        fctBgColor : "#98cbe0"
    }

};
