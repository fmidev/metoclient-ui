"use strict";

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

        // Use debounce to limit frequency of component redraw operations.
        jQuery(window).resize(_.debounce(function(e) {
            if (_legendResize) {
                _legendResize();
            }
            if (_animationControllerResize) {
                _animationControllerResize();
            }
        }, DEBOUNCE_TIME, {
            maxWait : DEBOUNCE_MAX_TIME
        }));

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
            _legendResize = function() {
                // Do not try to resize if legend elements do not exist.
                if (!jQuery("#" + _options.legendDivId).hasClass("animatorLegendNoLegend")) {
                    // Change handle position on window resize.
                    resetValue();
                    reflowContent();
                    sizeScrollbar();
                }
            };

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
         * @param {[]} Array of layers for legends.
         */
        function setLegend(layers) {
            if (_options.legendDivId) {
                var i;
                var j;
                var layer;
                var legendInfo;
                var infoObject;
                var legendView;

                var legend = jQuery("#" + _options.legendDivId);
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

            // Also make sure that slider controller is updated properly.
            // This is required to update controller when legend is hidden or shown.
            if (_animationControllerResize) {
                _animationControllerResize();
            }
        }

        /**
         * Set animation legend event listener for animation layers.
         *
         * @param {[]} Array of layers for legends. May be {undefined} or {null}.
         */
        function setAnimationLegendEventListener(layers) {
            // Notice, legends are available only after animation layer load is started.
            // Depending on the configuration, loading may be started when animation layer
            // is added to the map. Then, loading is started asynchronously.
            if (layers && _options.legendDivId) {
                var legendEventHandler = function(event) {
                    // Notice, setLegend function also updates slider controller if
                    // width is changed. This needs to be done synchronously when layer
                    // visibility changes to be sure that proper controller exists and
                    // can provide target elements for triggered events.
                    setLegend(layers);
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
         */
        function createController() {
            if (!_options || !_options.controllerDivId || !_options.playAndPauseDivId) {
                throw "ERROR: Options or properties missing for controller!";

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

                        _animationController = createCtrl(ctrls, timeModel, timeController);

                        // Bind to listen for width changes in element to update
                        // controller if necessary. Width is defined as relative
                        // in CSS but height is static.
                        var width = ctrls.width();
                        // Notice, the window resize listener has already been set during animator construction.
                        _animationControllerResize = function() {
                            var currentWidth = jQuery(ctrlSelector).width();
                            if (currentWidth !== width) {
                                width = currentWidth;
                                // Simply replace old with a new controller.
                                _animationController.remove();
                                _animationController = createCtrl(ctrls, timeModel, timeController);
                            }
                        };
                    }
                }
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
         * Set layers into the map and create slider controller and legend.
         */
        function setComponents() {
            if (_options.mapDivId) {
                var map = _config.getMap();
                if (map) {
                    // Render map to its position.
                    map.render(_options.mapDivId);
                    var layers = _config.getLayers();
                    if (layers) {
                        // Set listeners to update legend according to animation layer events.
                        setAnimationLegendEventListener(layers);
                        setLayers(map, layers);
                        // Create legend and controller asynchronously to make sure
                        // proper information is used immediately after layers are
                        // included into map above.
                        setTimeout(function() {
                            // Set legend synchronously before creating controller below.
                            // Then, controller can be created with proper width.
                            setLegend(layers);
                            // Notice, slider controller needs to be created before
                            // animation layers trigger events. Then, layer event callbacks
                            // have always target elements in controller. Controller is
                            // created asynchronously here with zero timeout. Layers are
                            // included into the map below synchronously but animation
                            // triggers events asynchronously. Therefore, asynchronously
                            // started synchronous operations for legend and controller
                            // are finished before layer events are triggered.
                            createController();
                        }, 0);
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
                    // Use options and configuration object to set map, layers,
                    // legend and slider controller.
                    setComponents();

                } catch(e) {
                    var errorStr = "ERROR: ConfigInitCallback: " + e.toString();
                    errors.push(errorStr);
                    if ("undefined" !== typeof console && console) {
                        console.error(errorStr);
                    }

                } finally {
                    handleCallback(options.callback, errors);
                }
            }
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
