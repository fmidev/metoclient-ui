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
        bgColor : "#585858",
        /**
         * Slider text color.
         */
        textColor : "#d7b13e"
    },

    /**
     * Controller time scale configuration object.
     */
    scaleConfig : {
        /**
         * Background color.
         */
        bgColor : "#585858",
        /**
         * Cell shows ready color when content data
         * loading has completed.
         */
        cellReadyColor : "#94bf77",
        /**
         * Cell shows error color if an error has occurred
         * during content data loading.
         */
        cellErrorColor : "#9a2500",
        /**
         * Cell shows loading color while data is loading.
         */
        cellLoadingColor : "#94bfbf",
        /**
         * Time scale observation area background color.
         */
        obsBgColor : "#b2d8ea",
        /**
         * Time scale forecast area background color.
         */
        fctBgColor : "#e7a64e"
    }

};
