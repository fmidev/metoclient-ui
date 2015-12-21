"use strict";

// Requires Raphael JS
if ("undefined" === typeof Raphael || !Raphael) {
    throw "ERROR: Raphael JS is required for fi.fmi.metoclient.ui.animator.Controller!";
}

// Requires jQuery
if ("undefined" === typeof jQuery || !jQuery) {
    throw "ERROR: jQuery is required for fi.fmi.metoclient.ui.animator.Controller!";
}

// "Package" definitions
var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};

if ("undefined" === typeof fi.fmi.metoclient.ui.animator.ControllerConfig || !fi.fmi.metoclient.ui.animator.ControllerConfig) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig is required for fi.fmi.metoclient.ui.animator.Controller!";
}
if (!fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig || !fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig.bgColor || !fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig.textColor) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig and its properties are required for fi.fmi.metoclient.ui.animator.Controller!";
}
if (!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig || !fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.bgColor) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig and its properties are required for fi.fmi.metoclient.ui.animator.Controller!";
}
if (!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellReadyColor || !fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellErrorColor || !fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellLoadingColor) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig and its cell properties are required for fi.fmi.metoclient.ui.animator.Controller!";
}
if (!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.obsBgColor || !fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.fctBgColor) {
    throw "ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig and its background properties are required for fi.fmi.metoclient.ui.animator.Controller!";
}

/**
 * Controller povides time slider to control animations.
 */
fi.fmi.metoclient.ui.animator.Controller = (function() {

    var createCanvas = Raphael;
    var _labelFontFamily = "Arial";
    var _labelFontSize = 14;

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
        var _dragTime;

        // Private element position information functions.
        //------------------------------------------------

        /**
         * Make sure controller slider is not out of bounds when it is in the left side of the controller.
         * Therefore, use padding that takes this into account.
         *
         * @return {Integer} Scale padding.
         */
        function getScalePaddingLeft() {
            // Notice, exact value can be calculated by _sliderConfig.width - _sliderConfig.sliderTipDx.
            // But it may be better to use constant. Then, for example UI CSS design may be easier to do if
            // values are constants.
            // Notice, this is greater than the right padding because CSS defines that Play button is
            // located directly to the left side of the visible controller. Therefore, continue the padding
            // under the button and until the left side of the controller.
            return 82;
        }

        /**
         * Make sure controller slider is not out of bounds when it is in the right side of the controller.
         * Therefore, use padding that takes this into account.
         *
         * @return {Integer} Scale padding.
         */
        function getScalePaddingRight() {
            // Notice, exact value can be calculated by _sliderConfig.width - _sliderConfig.sliderTipDx.
            // But it may be better to use constant. Then, for example UI CSS design may be easier to do if
            // values are constants.
            return 27;
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
            return getScaleContainerOffsetX() + getScalePaddingLeft();
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

        // Private utils functions.
        //------------------------------

        function getTimeStr(date) {
            var useUtc = getAnimationShowUtc();
            var hours = useUtc ? date.getUTCHours() : date.getHours();
            var minutes = useUtc ? date.getUTCMinutes() : date.getMinutes();
            var timeStr = hours > 9 ? hours : "0" + hours;
            timeStr += ":";
            timeStr += minutes > 9 ? minutes : "0" + minutes;
            return timeStr;
        }

        function getZoneStr() {
            return getAnimationShowUtc() ? "UTC" : "";
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

        function getAnimationShowUtc() {
            return _model.getAnimationShowUtc();
        }

        /**
         * @return X relative to the parent, not necessary a window.
         */
        function getScaleAreaX() {
            return _scaleContainer.getBBox().x + getScalePaddingLeft();
        }

        /**
         * @return Y relative to the parent, not necessary a window.
         */
        function getScaleAreaY() {
            return _scaleContainer.getBBox().y;
        }

        function getScaleAreaWidth() {
            var width = Math.floor(_scaleConfig.width - getScalePaddingLeft() - getScalePaddingRight());
            if (width < 0) {
                width = 0;
            }
            return width;
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
         */
        function timeToResolution(time) {
            var resolution = getResolution();
            if (time !== undefined && time !== null && resolution) {
                // Make sure steps are in given resolutions.
                var reminder = time % resolution;
                if (reminder) {
                    // Time is ceiled on the resolution.
                    time = time - reminder + resolution;
                }
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
            if (undefined !== _dragTime) {
                // Dragging is still going on.
                // Therefore, ignore the given value and use the dragging value instead.
                x = timeToPos(_dragTime);
            }
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
            // Notice, position is for the left side of the slider.
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
            // Drag time is taken from the position of the slider tip.
            _dragTime = posToTime(_dragStartX + _sliderConfig.sliderTipDx + dx);
            _timeController.proposeTimeSelectionChange(_dragTime);
        }

        /**
         * @param event DOM event object.
         */
        function finalizeDragMove(event) {
            var dragEndTime = _dragTime;
            _dragStartX = undefined;
            _dragTime = undefined;
            _timeController.proposeTimeSelectionChange(dragEndTime);
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
            var width = _model ? getScaleAreaWidth() - getFctWidth() : 0;
            if (width < 0) {
                width = 0;
            }
            return width;
        }

        function getFctWidth() {
            var width = 0;
            var forecastStartTime = getForecastStartTime();
            var startTime = getStartTime();
            var endTime = getEndTime();
            if (undefined !== forecastStartTime) {
                if (_model && (endTime - startTime)) {
                    // Forecast start time is given and width can be calculated.
                    // Notice, progress cell on the left side of the time describes the time content.
                    // Therefore, use resolution to get the proper width for the whole forecast area.
                    var resolution = getResolution() || 0;
                    width = Math.floor(getScaleAreaWidth() * (endTime - (forecastStartTime - resolution)) / (endTime - startTime));
                }
            }
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
            _background.attr("x", _scaleConfig.x + getScalePaddingLeft()).attr("width", bgWidth);
            _obsBackground.attr("x", _scaleConfig.x + getScalePaddingLeft()).attr("width", obsWidth);
            _fctBackground.attr("x", _scaleConfig.x + getScalePaddingLeft() + obsWidth).attr("width", fctWidth);
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
            var scaleAreaWidth = getScaleAreaWidth();
            if (resolution && scaleAreaWidth) {
                var begin = getStartTime();
                var end = getEndTime();
                var cellCount = Math.floor((end - begin) / resolution);
                if (cellCount > 0) {
                    var cellWidth = scaleAreaWidth / cellCount;
                    var beginX = getScaleAreaX();
                    var beginY = getScaleAreaY() + getScaleAreaHeight() - _scaleConfig.progressCellHeight;
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
                        tickEndY = tickEndY - _scaleConfig.progressCellHeight;
                    }

                    if (tickEndY) {
                        var beginY = getScaleAreaY() + getScaleAreaHeight();
                        var tick = _paper.path("M" + positionX + "," + beginY + "V" + tickEndY);
                        tick.attr("stroke", Raphael.getRGB("white")).attr("opacity", 0.5);
                        _tickSet.push(tick);
                        jQuery(tick.node).mousewheel(handleMouseScroll);
                        if (newHour && i < cellCount) {
                            var hourLabel = _paper.text(positionX, getScaleAreaY() + getScaleAreaHeight() / 3, getTimeStr(date)).attr({
                                "font-family" : _labelFontFamily,
                                "font-size" : _labelFontSize,
                                "fill" : Raphael.getRGB("black")
                            });
                            // Check if the hourlabel fits into the scale area.
                            var hourLabelNode = jQuery(hourLabel.node);
                            if (hourLabelNode.offset().left >= getScaleAreaOffsetX() && hourLabelNode.offset().left + hourLabelNode.width() <= getScaleAreaOffsetX() + getScaleAreaWidth()) {
                                // Label fits. So, let it be in the UI.
                                _tickSet.push(hourLabel);
                                jQuery(hourLabel.node).mousewheel(handleMouseScroll);

                            } else {
                                // Remove hour label because it overlaps the border.
                                hourLabel.remove();
                            }
                        }
                        if (i === cellCount) {
                            var zoneLabel = _paper.text(positionX, getScaleAreaY() + getScaleAreaHeight() * 2 / 3, getZoneStr()).attr({
                                "font-family" : _labelFontFamily,
                                "font-size" : _labelFontSize,
                                "fill" : Raphael.getRGB("black"),
                                "text-anchor" : "end"
                            });
                            // Check if the label fits into the scale area.
                            var zoneLabelNode = jQuery(zoneLabel.node);
                            _tickSet.push(zoneLabel);
                            jQuery(zoneLabel.node).mousewheel(handleMouseScroll);
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
            _sliderConfig = {
                height : 27,
                width : 54,
                bgColor : fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig.bgColor,
                strokeBgColor : fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig.textColor,
                strokeWidth : 0
            };

            _scaleConfig = {
                // Corner radius.
                radius : 0,
                x : 0,
                y : 0,
                width : width,
                height : height - _sliderConfig.height,
                bgHeight : height - _sliderConfig.height - 12,
                progressCellHeight : 12,
                bgColor : fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.bgColor,
                cellReadyColor : fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellReadyColor,
                cellErrorColor : fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellErrorColor,
                cellLoadingColor : fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellLoadingColor,
                obsBgColor : fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.obsBgColor,
                fctBgColor : fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.fctBgColor
            };

            // Notice, that polygon is drawn by using path. See, _sliderBg variable.
            // Notice, the polygon path height is 7 and tip height is 3. Therefore, use corresponding ration here.
            _sliderConfig.sliderTipHeight = _sliderConfig.height * (3 / 7);
            // Polygon path width is 14. Scale to the width given here.
            _sliderConfig.scaleX = _sliderConfig.width / 14;
            _sliderConfig.scaleY = (_sliderConfig.height + _sliderConfig.sliderTipHeight) / 7;
            // The tip x position is 7 in the polygon path. So, use that with the scale.
            _sliderConfig.sliderTipDx = Math.floor(7 * _sliderConfig.scaleX);
            // Make slider tip overlap the scale.
            _sliderConfig.y = _scaleConfig.y + _scaleConfig.height - Math.floor(_sliderConfig.sliderTipHeight);

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
            _background = _paper.rect(_scaleConfig.x + getScalePaddingLeft(), _scaleConfig.y, getObsWidth() + getFctWidth(), _scaleConfig.height);
            _background.attr('fill', _scaleConfig.bgColor);
            _background.attr('stroke-width', 0);

            _obsBackground = _paper.rect(_scaleConfig.x + getScalePaddingLeft(), _scaleConfig.y, getObsWidth(), _scaleConfig.bgHeight);
            _obsBackground.attr('fill', _scaleConfig.obsBgColor);
            _obsBackground.attr('stroke-width', 0);

            _fctBackground = _paper.rect(_scaleConfig.x + getScalePaddingLeft() + getObsWidth(), _scaleConfig.y, getFctWidth(), _scaleConfig.bgHeight);
            _fctBackground.attr('fill', _scaleConfig.fctBgColor);
            _fctBackground.attr('stroke-width', 0);

            _leftHotSpot = _paper.rect(_scaleConfig.x, _scaleConfig.y, getScalePaddingLeft(), _scaleConfig.height);
            // Fill is required. Otherwise, click does not work.
            _leftHotSpot.attr('fill', Raphael.rgb(0, 0, 0)).attr('opacity', 0);
            _leftHotSpot.attr('stroke-width', 0);
            _leftHotSpot.click(previousFrame);

            _rightHotSpot = _paper.rect(_scaleConfig.x + width, _scaleConfig.y, getScalePaddingRight(), _scaleConfig.height);
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

            _sliderBg = _paper.path("M0,2L0,7L14,7L14,2L9,2L7,0L5,2Z");
            _sliderBg.attr('fill', _sliderConfig.bgColor);
            _sliderBg.attr('stroke', _sliderConfig.strokeBgColor);
            _sliderBg.attr('stroke-width', _sliderConfig.strokeWidth);
            _sliderBg.transform("S" + _sliderConfig.scaleX + "," + _sliderConfig.scaleY + ",0,0T0," + _sliderConfig.y);

            _sliderLabel = _paper.text(27, _sliderConfig.y + 26, "00:00");
            _sliderLabel.attr({
                "font-family" : _labelFontFamily,
                "font-size" : _labelFontSize,
                "font-weight" : "bold"
            });
            _sliderLabel.attr("fill", _sliderConfig.strokeBgColor).attr('stroke-width', 0);

            _slider.push(_sliderBg);
            _slider.push(_sliderLabel);

            // Set drag handlers.
            _slider.drag(dragMove, startDragMove, finalizeDragMove, _me, _me, _me);

            // Handle mouse wheel over the slider.
            jQuery([_sliderBg.node, _sliderLabel.node]).mousewheel(handleMouseScroll);

            // Move slider to the initial position.
            // Movement needs to be done asynchronously to make sure time position can be calculated properly.
            // Hide slider during asynchronous process. Then, slider will be visible only in the proper position.
            _slider.hide();
            setTimeout(function() {
                // Show slider before changing its properties to make sure they are updated properly.
                _slider.show();
                if (undefined !== defaultTimePosition && null !== defaultTimePosition) {
                    // Default time has been given. So, move slider to the given position.
                    moveSliderTo(timeToPos(defaultTimePosition));

                } else {
                    // Scale beginning is used for the slider initial position.
                    moveSliderTo(getDefaultSliderOffsetX());
                }
                // Reset initial time for label.
                resetSliderLabelText();
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
