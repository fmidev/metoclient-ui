"use strict";

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
