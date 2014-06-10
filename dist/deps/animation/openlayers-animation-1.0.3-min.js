"use strict";OpenLayers.Layer.Animation=OpenLayers.Class(OpenLayers.Layer,{registerController:void 0,unregisterController:void 0,doSetConfig:void 0,getConfig:void 0,getLegendInfo:void 0,setVisibility:void 0,setOpacity:void 0,initialize:function(a,b){OpenLayers.Layer.prototype.initialize.call(this,a,b);var c=this,d={loadAnimationStartedCallback:void 0,loadFrameStartedCallback:void 0,loadFrameCompleteCallback:void 0,loadGroupProgressCallback:void 0,loadCompleteCallback:void 0,frameContentReleasedCallback:void 0,frameChangedCallback:void 0},e=new OpenLayers.Layer.Animation.LayerContainer(d),f={scope:c,periodchanged:void 0,reload:void 0,timechanged:void 0,start:void 0,pause:void 0,stop:void 0,previous:void 0,next:void 0,frameratechanged:void 0},g={scope:c,added:void 0,removed:void 0},h=function(a,b){var d={layer:c,events:[]};if(b)for(var e=0;e<b.length;++e){var f={time:new Date(OpenLayers.Layer.Animation.ConfigUtils.getTimeFromConfig(b[e].getConfig())),error:b[e].getError()};d.events.push(f)}setTimeout(function(){c.events&&c.events.triggerEvent(a,d)},0)};d.loadAnimationStartedCallback=function(a){h("animationloadstarted",a)},d.loadFrameStartedCallback=function(a){h("frameloadstarted",a)},d.loadFrameCompleteCallback=function(a){h("frameloadcomplete",a)},d.loadGroupProgressCallback=function(a){h("animationloadgroupprogress",a)},d.loadCompleteCallback=function(a){h("animationloadcomplete",a)},d.frameContentReleasedCallback=function(a){h("animationframecontentreleased",a)},d.frameChangedCallback=function(a){h("framechanged",a)},f.periodchanged=function(a){a&&setTimeout(function(){e.setBeginTime(a.begin),e.setEndTime(a.end),e.setResolutionTime(a.resolution),c.map&&e.loadAnimation()},0)},f.reload=function(){setTimeout(function(){c.map&&e.loadAnimation()},0)},f.timechanged=function(a){a&&setTimeout(function(){e.showFrame(a.time)},0)},f.start=function(){setTimeout(function(){e.startAnimation()},0)},f.pause=function(){setTimeout(function(){e.pauseAnimation()},0)},f.stop=function(){setTimeout(function(){e.stopAnimation()},0)},f.previous=function(){setTimeout(function(){e.showPreviousFrame()},0)},f.next=function(){setTimeout(function(){e.showNextFrame()},0)},f.frameratechanged=function(a){a&&setTimeout(function(){e.setFrameRate(a.value)},0)},g.added=function(a){a&&a.layer===c&&setTimeout(function(){e.setMap(a.map)},0)},g.removed=function(a){a&&a.layer===c&&setTimeout(function(){e.reset(),e.setMap(void 0)},0)};var i=function(a){if(a){if(!(a instanceof OpenLayers.Events))throw"ERROR: Controller should be OpenLayers.Events object!";a.on(f)}return c},j=function(a){if(a){if(!(a instanceof OpenLayers.Events))throw"ERROR: Controller should be OpenLayers.Events object!";a.un(f)}return c},k=function(a){return e.setVisibility(c.getVisibility()),e.setOpacity(c.opacity),e.setConfig(a),c},l=function(){return e.getConfig()},m=function(){return e.getLegendInfo()},n=function(a){OpenLayers.Layer.prototype.setVisibility.call(this,a),e.setVisibility(a)},o=function(a){OpenLayers.Layer.prototype.setOpacity.call(this,a),e.setOpacity(a)};c.events.on(g),this._getContainer=function(){return e},this.registerController=i,this.unregisterController=j,this.doSetConfig=k,this.getConfig=l,this.getLegendInfo=m,this.setVisibility=n,this.setOpacity=o},CLASS_NAME:"OpenLayers.Layer.Animation"}),OpenLayers.Layer.Animation.Utils=function(){function a(a){a&&a instanceof Date&&(a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0))}return function(){document.getElementsByClassName||(document.getElementsByClassName=function(a){return this.querySelectorAll("."+a)},Element.prototype.getElementsByClassName=document.getElementsByClassName)}(),function(){Date.prototype.toISOString||(Date.prototype.toJSON||(Date.prototype.toJSON=function(){var a=function(a){return 10>a?"0"+a:a};return this.getUTCFullYear()+"-"+a(this.getUTCMonth()+1)+"-"+a(this.getUTCDate())+"T"+a(this.getUTCHours())+":"+a(this.getUTCMinutes())+":"+a(this.getUTCSeconds())+"Z"}),Date.prototype.toISOString=Date.prototype.toJSON)}(),function(){Array.prototype.indexOf||(Array.prototype.indexOf=function(a){var b=this.length>>>0,c=Number(arguments[1])||0;for(c=0>c?Math.ceil(c):Math.floor(c),0>c&&(c+=b);b>c;c++)if(c in this&&this[c]===a)return c;return-1})}(),function(){window.requestAnimationFrame||(window.requestAnimationFrame=function(){return window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1e3/60)}}())}(),{floorDateToHour:a}}(),OpenLayers.Layer.Animation.Wms=OpenLayers.Class(OpenLayers.Layer.Animation,{setConfig:void 0,initialize:function(a,b,c,d,e){OpenLayers.Layer.Animation.prototype.initialize.call(this,a,e||d);var f=this,g=function(a,b,c){if(!a||!b||!b.layers)throw"ERROR: Configuration error!";var d={url:a,wms:{params:b,options:c||{}}};return(void 0===d.wms.params.transparent||null===d.wms.params.transparent)&&(d.wms.params.transparent=!0),(void 0===d.wms.params.format||null===d.wms.params.format)&&(d.wms.params.format="image/png"),(void 0===d.wms.options.singleTile||null===d.wms.options.singleTile)&&(d.wms.options.singleTile=!1),(void 0===d.wms.options.displayInLayerSwitcher||null===d.wms.options.displayInLayerSwitcher)&&(d.wms.options.displayInLayerSwitcher=!1),(void 0===d.wms.options.isBaseLayer||null===d.wms.options.isBaseLayer)&&(d.wms.options.isBaseLayer=!1),f.doSetConfig(d)};(b||c||d)&&g(b,c,d),this.setConfig=g},CLASS_NAME:"OpenLayers.Layer.Animation.Wms"}),OpenLayers.Layer.Animation.Wmts=OpenLayers.Class(OpenLayers.Layer.Animation,{setConfig:void 0,initialize:function(a,b,c){OpenLayers.Layer.Animation.prototype.initialize.call(this,a&&a.name?a.name:b,c||a);var d=this,e=function(a){if(!(a&&a.url&&a.layer&&a.matrixSet&&void 0!==a.style&&null!==a.style))throw"ERROR: Configuration error!";var b={wmts:a};return(void 0===b.wmts.format||null===b.wmts.format)&&(b.wmts.format="image/png"),(void 0===b.wmts.displayInLayerSwitcher||null===b.wmts.displayInLayerSwitcher)&&(b.wmts.displayInLayerSwitcher=!1),(void 0===b.wmts.isBaseLayer||null===b.wmts.isBaseLayer)&&(b.wmts.isBaseLayer=!1),d.doSetConfig(b)};a&&e(a),this.setConfig=e},CLASS_NAME:"OpenLayers.Layer.Animation.Wmts"}),OpenLayers.Layer.Animation.ConfigUtils=function(){function a(a,d){var e;return a&&(a.wmts?e=c(a,d):a.wms&&(e=b(a,d))),e}function b(a,b){var c;return a&&a.wms&&(c={},OpenLayers.Util.extend(c,a),c.wms={},OpenLayers.Util.extend(c.wms,a.wms),(a.wms.params||void 0!==b&&null!==b)&&(c.wms.params={},OpenLayers.Util.extend(c.wms.params,a.wms.params),c.wms.params.time=b),a.wms.options&&(c.wms.options={},OpenLayers.Util.extend(c.wms.options,a.wms.options),a.wms.options.animation&&(c.wms.options.animation={},OpenLayers.Util.extend(c.wms.options.animation,a.wms.options.animation)))),c}function c(a,b){var c;return a&&a.wmts&&(c={},OpenLayers.Util.extend(c,a),c.wmts={},OpenLayers.Util.extend(c.wmts,a.wmts),(a.wmts.params||void 0!==b&&null!==b)&&(c.wmts.params={},OpenLayers.Util.extend(c.wmts.params,a.wmts.params),c.wmts.params.time=b),a.wmts.animation&&(c.wmts.animation={},OpenLayers.Util.extend(c.wmts.animation,a.wmts.animation))),c}function d(a){var b;return a&&(a.wmts&&a.wmts.params?void 0!==a.wmts.params.time&&null!==a.wmts.params.time?b=a.wmts.params.time:void 0!==a.wmts.params.TIME&&null!==a.wmts.params.TIME&&(b=a.wmts.params.TIME):a.wms&&a.wms.params&&(void 0!==a.wms.params.time&&null!==a.wms.params.time?b=a.wms.params.time:void 0!==a.wms.params.TIME&&null!==a.wms.params.TIME&&(b=a.wms.params.TIME))),b}function e(a){var b;return a&&(a.wmts&&a.wmts.animation?b=a.wmts.animation:a.wms&&a.wms.options&&a.wms.options.animation&&(b=a.wms.options.animation)),b}function f(a){var b,c=e(a);return c&&(b=c.name),b}function g(a){var b,c=e(a);return c&&(b=c.hasLegend),b}function h(a,b){a&&(a.wmts?(a.wmts.animation||(a.wmts.animation={}),a.wmts.animation.hasLegend=b):a.wms&&(a.wms.options||(a.wms.options={},a.wms.options.animation||(a.wms.options.animation={})),a.wms.options.animation.hasLegend=b))}function i(a){var b;return a&&(a.wmts&&a.wmts.layer?b=a.wmts.layer:a.wms&&a.wms.params&&a.wms.params.layers&&(b=a.wms.params.layers)),b}function j(a,b){a&&b&&(a.wmts&&(a.wmts.layer=b),a.wms&&(a.wms.params||(a.wms.params={}),a.wms.params.layers=b))}function k(a){var b;return a&&(a.wmts&&a.wmts.name?b=a.wmts.name:a.wms&&a.name&&(b=a.name)),b}function l(a,b){a&&b&&(a.wmts?a.wmts.name=b:a.wms&&(a.name=b))}function m(a,b){a&&b&&(a.wmts&&(a.wmts.className||(a.wmts.className=b)),a.wms&&(a.wms.options||(a.wms.options={}),a.wms.options.className||(a.wms.options.className=b)))}function n(a,b){a&&void 0!==b&&null!==b&&!isNaN(b)&&b>=0&&(a.wmts&&(void 0===a.wmts.buffer||null===a.wmts.buffer)&&(a.wmts.buffer=b),a.wms&&(a.wms.options||(a.wms.options={}),(void 0===a.wms.options.buffer||null===a.wms.options.buffer)&&(a.wms.options.buffer=b)))}return{cloneAnimationConfig:a,cloneWmsAnimationConfig:b,cloneWmtsAnimationConfig:c,getTimeFromConfig:d,getAnimation:e,getAnimationName:f,getAnimationHasLegend:g,setAnimationHasLegend:h,getLayer:i,setLayer:j,getLayerName:k,setLayerName:l,setFrameStyleClass:m,setGridBuffer:n}}(),OpenLayers.Layer.Animation.LayerContainer=OpenLayers.Class({setMap:void 0,setConfig:void 0,getConfig:void 0,getLegendInfo:void 0,setBeginTime:void 0,getBeginTime:void 0,setEndTime:void 0,getEndTime:void 0,setResolutionTime:void 0,getResolutionTime:void 0,setFrameRate:void 0,setFadeOutOpacities:void 0,setMaxAsyncLoadCount:void 0,setVisibility:void 0,setOpacity:void 0,reset:void 0,loadAnimation:void 0,startAnimation:void 0,pauseAnimation:void 0,stopAnimation:void 0,showFrame:void 0,showNextFrame:void 0,showPreviousFrame:void 0,initialize:function(a){var b,c,d,e,f,g,h,i=this,j=!0,k=1,l=500,m=-1,n=1,o=0,p="ease-out",q=0,r="ease-out",s=[],t={scope:i,movestart:void 0},u=[],v=1,w=v,x={layerLoadStartCallback:void 0,layerLoadEndCallback:void 0};t.movestart=function(b){if(b){for(var c=0;c<u.length;++c){var d=u[c];d!==I()&&d.setVisibility(!1),a&&a.frameContentReleasedCallback([d])}B()}},x.layerLoadStartCallback=function(b){b&&(I()!==b&&b.setOpacity(0),a&&a.loadFrameStartedCallback([b]))},x.layerLoadEndCallback=function(c){if(c){var d=[],e=!0;y();for(var f=0;f<u.length;f+=w||1){if(!u[f].isLoaded()){e=!1;break}d.push(u[f])}a&&a.loadFrameCompleteCallback([c]),e&&(w=Math.floor(w/2),a&&a.loadGroupProgressCallback(d),w||a&&a.loadCompleteCallback(d)),I()===c&&C(c,!0),z();var g=OpenLayers.Layer.Animation.ConfigUtils.getAnimation(b);!w&&g&&g.autoStart&&gb()}};var y=function(){if(w>1){for(var a=w;a;){for(var b=!0,c=0;c<u.length;c+=a)if(!u[c].isLoaded()){b=!1;break}if(!b)break;a=Math.floor(a/2)}w>2*a&&(w=2*a||1)}},z=function(){if(v>0){for(var a=m>0?m:u.length,b=0;b<u.length;++b)u[b].isLoading()&&--a;for(;a>0&&v>0;){for(var c=0;c<u.length&&(!u[c].isDefaultState()||(u[c].loadLayer(),--a,0!==a));c+=v);a>0&&(v=Math.floor(v/2))}}},A=function(){for(v=1;2*v<u.length;)v*=2;w=v},B=function(){j&&(a&&a.loadAnimationStartedCallback(),A(),z())},C=function(b,c){var d=I(),e=J(),g=b!==d,h=u.indexOf(b);if(b&&(c||D(h))){if(g){var i=s.indexOf(b);-1!==i&&s.splice(i,1);var j=s.length>1?u.indexOf(s[s.length-2]):-1,k=-1!==j&&!(e>j&&h>e||j>e&&e>h),l=f&&f.length?f.length:1,m=k?s.length:s.length-l+1;0>m&&(m=0);for(var o=0;o<s.length;++o){var p=s[o],q=0;if(f&&f.length)if(k)q=f[0];else{var r=o;f.length>s.length&&(r+=f.length-s.length),r>=f.length&&(r=f.length-1),q=n*f[r]}L(p,q)}s.splice(0,m),H(b)}K(b,n),a&&g&&a.frameChangedCallback([b])}},D=function(a){return a>=0&&a<u.length&&(!w||a%(2*w)===0)&&u[a].isLoaded()},E=function(){void 0===g&&(g=new Date,G())},F=function(){g=void 0},G=function(){if(void 0!==g){requestAnimationFrame(G);var a=new Date;g.getTime()+l<a.getTime()&&(g=a,lb())}},H=function(a){a&&s.push(a)},I=function(){return s.length?s[s.length-1]:void 0},J=function(){return u.indexOf(I())},K=function(a,c,d){var e=OpenLayers.Layer.Animation.ConfigUtils.getAnimation(b);e&&e.fadeIn&&void 0!==e.fadeIn.time&&null!==e.fadeIn.time&&!isNaN(e.fadeIn.time)&&e.fadeIn.time>=0?d=e.fadeIn.time:void 0===d&&(d=q);var f=r;e&&e.fadeIn&&!e.fadeIn.timingFunction&&"string"==typeof e.fadeIn.timingFunction&&(f=e.fadeIn.timingFunction),OpenLayers.Layer.Animation.TransitionUtils.opacityTransition(a,c,f,d)},L=function(a,c,d){var e=OpenLayers.Layer.Animation.ConfigUtils.getAnimation(b);e&&e.fadeOut&&void 0!==e.fadeOut.time&&null!==e.fadeOut.time&&!isNaN(e.fadeOut.time)&&e.fadeOut.time>=0?d=e.fadeOut.time:void 0===d&&(d=o);var f=p;e&&e.fadeOut&&!e.fadeOut.timingFunction&&"string"==typeof e.fadeOut.timingFunction&&(f=e.fadeOut.timingFunction),OpenLayers.Layer.Animation.TransitionUtils.opacityTransition(a,c,f,d)},M=function(a){var c;if(void 0!==a&&a instanceof Date){var d=OpenLayers.Layer.Animation.ConfigUtils.getAnimation(b);if(d&&d.layers)for(var e=0;e<d.layers.length;++e){var f=d.layers[e];if(f){var g=f.beginTime,h=f.endTime;if(void 0!==g&&null!==g&&(g instanceof Date||!isNaN(g))&&(void 0===h||null===h||h instanceof Date||!isNaN(h))&&(g=g instanceof Date?g:new Date(g),h=void 0===h||null===h||h instanceof Date?h:new Date(h),g.getTime()<=a.getTime()&&(void 0===h||null===h||h.getTime()>=a.getTime()))){c={layer:f.layer,name:f.name,hasLegend:f.hasLegend};break}}}}return c},N=function(a,b){var c=b,d=M(a);return d&&d.layer&&(c=d.layer),c},O=function(a,b){var c=b,d=M(a);return d&&void 0!==d.name&&(c=d.name),c},P=function(a,b){var c=b,d=M(a);return d&&void 0!==d.hasLegend&&(c=d.hasLegend),c},Q=function(a){if(h!==a&&(h&&h.events&&h.events.un(t),h=a)){h.events.on(t);var c=OpenLayers.Layer.Animation.ConfigUtils.getAnimation(b);c&&c.autoLoad&&fb()}},R=function(a){b=a;var c=OpenLayers.Layer.Animation.ConfigUtils.getAnimation(b);c&&(V(c.beginTime),X(c.endTime),Z(c.resolutionTime),bb(c.maxAsyncLoadCount),_(c.frameRate),c.fadeOut&&ab(c.fadeOut.opacities),c.autoLoad&&h&&fb())},S=function(){return b},T=function(a,b){for(var c=!1,d=0;d<a.length;++d){var e=a[d];if(e===b||e.name===b.name&&e.url===b.url&&e.hasLegend===b.hasLegend){c=!0;break}}return c},U=function(){var a=[];if(u)for(var b=0;b<u.length;++b)for(var c=u[b].getLegendInfo(),d=0;d<c.length;++d){var e=c[d];T(a,e)||a.push(e)}return a},V=function(a){void 0!==a&&null!==a&&(c=a instanceof Date?new Date(a.getTime()):isNaN(a)?void 0:new Date(a))},W=function(){return c},X=function(a){void 0!==a&&null!==a&&(d=a instanceof Date?new Date(a.getTime()):isNaN(a)?void 0:new Date(a))},Y=function(){return d},Z=function(a){void 0!==a&&null!==a&&!isNaN(a)&&a>=1&&(e=Math.floor(a))},$=function(){return e?e:0},_=function(a){void 0===a||null===a||isNaN(a)||(l=0>a?0:a)},ab=function(a){if(a&&a.length){for(var b=[],c=!0,d=0;d<a.length;++d){var e=a[d];if(void 0===e||null===e||isNaN(e)||0>e||e>1){c=!1;break}b.splice(0,0,e)}c&&(f=b)}else f=void 0},bb=function(a){a?isNaN(a)||(m=a):m=-1},cb=function(b){if((b===!0||b===!1)&&j!==b)if(j=b,b)B();else{jb();for(var c=0;c<u.length;++c)u[c].setVisibility(b),a&&a.frameContentReleasedCallback([u[c]])}},db=function(a){if(n!==a){n=a;for(var b=0;b<u.length;++b){var c=u[b];c.getOpacity()>0&&c.setOpacity(n)}}},eb=function(){for(jb(),s.splice(0,s.length);u.length;){var b=u.splice(0,1)[0];b.releaseContent(),a&&a.frameContentReleasedCallback([b])}A()},fb=function(){var a=$();if(h&&b&&void 0!==c&&void 0!==d&&a&&d>=c){eb();for(var e=new Date(c.getTime()),f=c.getTime();f<=d.getTime();f+=a){e.setTime(f);var g=OpenLayers.Layer.Animation.ConfigUtils.cloneAnimationConfig(b,e.toISOString());OpenLayers.Layer.Animation.ConfigUtils.setGridBuffer(g,k);var i=N(e,OpenLayers.Layer.Animation.ConfigUtils.getLayer(g));OpenLayers.Layer.Animation.ConfigUtils.setLayer(g,i);var j=O(e,OpenLayers.Layer.Animation.ConfigUtils.getAnimationName(g));OpenLayers.Layer.Animation.ConfigUtils.setLayerName(g,j);var l=P(e,OpenLayers.Layer.Animation.ConfigUtils.getAnimationHasLegend(g));OpenLayers.Layer.Animation.ConfigUtils.setAnimationHasLegend(g,l),u.push(new OpenLayers.Layer.Animation.LayerObject(g,h,x))}B()}},gb=function(){E()},hb=function(){F()},ib=function(){for(;s.length;){var a=s.splice(0,1)[0];L(a,0)}},jb=function(){hb(),ib()},kb=function(a){if(void 0!==a&&null!==a&&(a instanceof Date||!isNaN(a))){a instanceof Date&&(a=a.getTime());for(var b=J(),c=$(),d=0;d<u.length;++d){var e=u[d],f=OpenLayers.Layer.Animation.ConfigUtils.getTimeFromConfig(e.getConfig());if(f instanceof Date?f=f.getTime():"string"==typeof f&&(f=new Date(f).getTime()),0===d&&f-c>=a||d===u.length-1&&a>=f+c||d===u.length-1&&0===b&&a>f||0===d&&b===u.length-1&&f>a){ib();break}if(a===f){C(e);break}}}},lb=function(){var a=w?2*w:1;if(u.length>0&&(a<u.length||1===a)){var b=J();0>b||b+a>=u.length?b=0:b+=a-b%a,C(u[b])}},mb=function(){var a=w?2*w:1;if(u.length>0&&(a<u.length||1===a)){var b=J()-a;0>b&&(b=u.length-(u.length%a||1)),C(u[b])}};this.setMap=Q,this.setConfig=R,this.getConfig=S,this.getLegendInfo=U,this.setBeginTime=V,this.getBeginTime=W,this.setEndTime=X,this.getEndTime=Y,this.setResolutionTime=Z,this.getResolutionTime=$,this.setFrameRate=_,this.setFadeOutOpacities=ab,this.setMaxAsyncLoadCount=bb,this.setVisibility=cb,this.setOpacity=db,this.reset=eb,this.loadAnimation=fb,this.startAnimation=gb,this.pauseAnimation=hb,this.stopAnimation=jb,this.showFrame=kb,this.showNextFrame=lb,this.showPreviousFrame=mb},CLASS_NAME:"OpenLayers.Layer.Animation.LayerContainer"}),OpenLayers.Layer.Animation.LayerObject=OpenLayers.Class({loadLayer:void 0,releaseContent:void 0,getLayer:void 0,getConfig:void 0,getLegendInfo:void 0,getVisibility:void 0,setVisibility:void 0,getZIndex:void 0,setZIndex:void 0,getOpacity:void 0,setOpacity:void 0,setCssTransition:void 0,isDefaultState:void 0,isLoading:void 0,isLoaded:void 0,getError:void 0,initialize:function(a,b,c){if(!a)throw"ERROR: Configuration error!";if(!b)throw"ERROR: Map is required!";var d,e=this,f=1,g=2,h=3,i={id:void 0,error:void 0},j={scope:e,loadstart:void 0,loadend:void 0,tileerror:void 0};j.loadstart=function(){k(),i.id=g,c&&c.layerLoadStartCallback(e)},j.loadend=function(){i.id&&(i.id=h,x("opacity 0"),c&&c.layerLoadEndCallback(e))},j.tileerror=function(a){i.error=a.type};var k=function(){i.id=void 0,i.error=void 0},l=function(){var b;return a&&(a.wmts?b=new OpenLayers.Layer.WMTS(a.wmts):a.wms&&(b=new OpenLayers.Layer.WMS(a.name,a.url,a.wms.params,a.wms.options))),b},m=function(){var a=d?d.map:void 0;a&&a.events&&a.removeLayer(d),d=void 0,k()},n=function(){b.events&&(d||(d=l(),d&&d.events.on(j)),d&&d.div&&(d.map||(i.id=f,b.addLayer(d)),d.visibility||(i.id=f,s(!0))))},o=function(){return d},p=function(){return a},q=function(){var a=[];if(d){var b=d.params;if(b){var c=b.layers||b.LAYERS||b.layer||b.LAYER;if(c&&(c=c.split(",")),d.options&&d.options.animation&&c&&c.length){var e=d.url;if("string"!=typeof e&&(e=e&&e.length?e[0]:void 0),e){var f=e.charAt(e.length-1);-1===e.indexOf("?")?e+="?":"?"!==f&&"&"!==f&&(e+="&");var g=b.format||b.FORMAT||"image/png";e+="REQUEST=GetLegendGraphic&FORMAT="+encodeURIComponent(g)+"&LAYER=";for(var h=0;h<c.length;++h){var i=c[h];if(i){var j=d.options.animation.hasLegend?!0:!1;a.push({name:d.name,url:e+encodeURIComponent(i),hasLegend:j})}}}}}}return a},r=function(){return d?d.getVisibility():void 0},s=function(a){d&&(a||k(),d.map&&d.setVisibility(a))},t=function(){return d?d.getZIndex():void 0},u=function(a){void 0!==a&&null!==a&&!isNaN(a)&&d&&d.map&&d.setZIndex(a)},v=function(){return d?d.opacity:void 0},w=function(a){d&&d.map&&d.setOpacity(a)},x=function(a){if(d){(void 0===a||null===a)&&(a="");var b=d.div;if(b)for(var c=b.getElementsByClassName("olTileImage"),e=0;e<c.length;++e){var f=c[e];f.style.WebkitTransition=a,f.style.MozTransition=a,f.style.OTransition=a,f.style.transition=a}}},y=function(){return void 0===i.id&&void 0===i.error},z=function(){return i.id===g||i.id===f?!0:!1},A=function(){return i.id===h?!0:!1},B=function(){return i.error};this.loadLayer=n,this.releaseContent=m,this.getLayer=o,this.getConfig=p,this.getLegendInfo=q,this.getVisibility=r,this.setVisibility=s,this.getZIndex=t,this.setZIndex=u,this.getOpacity=v,this.setOpacity=w,this.setCssTransition=x,this.isDefaultState=y,this.isLoading=z,this.isLoaded=A,this.getError=B},CLASS_NAME:"OpenLayers.Layer.Animation.LayerObject"}),OpenLayers.Layer.Animation.TransitionUtils=function(){function a(a){return h.hasOwnProperty(a)}function b(a){return void 0!==a&&null!==a&&!isNaN(a)}function c(a){for(var b=!1,c=0;c<g.length;++c){var d=g[c];if(a===d.object){b=!0,d.removed=!0,g.splice(c,1);break}}return b}function d(a){if(a){var b=g.indexOf(a);-1!==b&&g.splice(b,1)}}function e(c){if(c&&!c.removed&&void 0!==c.callback&&null!==c.callback&&b(c.beginValue)&&b(c.targetValue)&&a(c.transitionStyle)&&b(c.transitionTime)&&c.transitionTime>=0){void 0===c.beginTime&&(c.beginTime=new Date);var f=c.beginTime.getTime(),g=f+c.transitionTime,i=(new Date).getTime();if(i>=g||!c.transitionTime)c.callback(c.targetValue),d(c);else{var j=c.beginValue+(c.targetValue-c.beginValue)*h[c.transitionStyle]((i-f)/c.transitionTime);c.callback(j),requestAnimationFrame(function(){e(c)})}}else d(c)}function f(a,b,d,f){if(a){c(a);var h={object:a,callback:a.setOpacity,beginValue:a.getOpacity(),targetValue:b,transitionStyle:d,transitionTime:f};g.push(h),e(h)}}var g=[],h={linear:function(a){return a},"ease-in":function(a){return Math.pow(a,1.7)},"ease-out":function(a){return Math.pow(a,.48)},"ease-in-out":function(a){var b=.48-a/1.04,c=Math.sqrt(.1734+b*b),d=c-b,e=Math.pow(Math.abs(d),1/3)*(0>d?-1:1),f=-c-b,g=Math.pow(Math.abs(f),1/3)*(0>f?-1:1),h=e+g+.5;return 3*(1-h)*h*h+h*h*h},"back-in":function(a){var b=1.70158;return a*a*((b+1)*a-b)},"back-out":function(a){a-=1;var b=1.70158;return a*a*((b+1)*a+b)+1},elastic:function(a){return 0===a||1===a?a:Math.pow(2,-10*a)*Math.sin(2*(a-.075)*Math.PI/.3)+1},bounce:function(a){var b,c=7.5625,d=2.75;return 1/d>a?b=c*a*a:2/d>a?(a-=1.5/d,b=c*a*a+.75):2.5/d>a?(a-=2.25/d,b=c*a*a+.9375):(a-=2.625/d,b=c*a*a+.984375),b}};return{opacityTransition:f}}();