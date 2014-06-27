"use strict";if("undefined"==typeof _||!_)throw"ERROR: Lo-Dash is required for fi.fmi.metoclient.ui.animator.Utils!";var fi=fi||{};if(fi.fmi=fi.fmi||{},fi.fmi.metoclient=fi.fmi.metoclient||{},fi.fmi.metoclient.ui=fi.fmi.metoclient.ui||{},fi.fmi.metoclient.ui.animator=fi.fmi.metoclient.ui.animator||{},fi.fmi.metoclient.ui.animator.Utils=function(){function a(a,b){var c;if(a){var d=[a];b&&(d=d.concat(b)),c=a.bind.apply(a,d)}return c}!function(){Function.prototype.bind||(Function.prototype.bind=function(a){if("function"!=typeof this)throw"Function.prototype.bind - what is trying to be bound is not callable";var b=Array.prototype.slice.call(arguments,1),c=this,d=function(){},e=function(){return c.apply(this instanceof d&&a?this:a,b.concat(Array.prototype.slice.call(arguments)))};d.prototype=this.prototype;var f=d;return e.prototype=new f,e})}(),function(){for(var a,b=function(){},c=["assert","clear","count","debug","dir","dirxml","error","exception","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","table","time","timeEnd","timeStamp","trace","warn"],d=c.length,e=window.console=window.console||{};d--;)a=c[d],e[a]||(e[a]=b)}(),function(){if(!jQuery.browser){var a,b;jQuery.uaMatch=function(a){a=a.toLowerCase();var b=/(chrome)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},a=jQuery.uaMatch(navigator.userAgent),b={},a.browser&&(b[a.browser]=!0,b.version=a.version),b.chrome?b.webkit=!0:b.webkit&&(b.safari=!0),jQuery.browser=b}}(),function(){window.XDomainRequest&&jQuery.ajaxTransport(function(a){if(a.crossDomain&&a.async){a.timeout&&(a.xdrTimeout=a.timeout,delete a.timeout);var b;return{send:function(c,d){function e(a,c,e,f){b.onload=b.onerror=b.ontimeout=jQuery.noop,b=void 0,d(a,c,e,f)}b=new XDomainRequest,b.onload=function(){e(200,"OK",{text:b.responseText},"Content-Type: "+b.contentType)},b.onerror=function(){e(404,"Not Found")},b.onprogress=jQuery.noop,b.ontimeout=function(){e(0,"timeout")},b.timeout=a.xdrTimeout||Number.MAX_VALUE,b.open(a.type,a.url),b.send(a.hasContent&&a.data||null)},abort:function(){b&&(b.onerror=jQuery.noop,b.abort())}}}})}(),function(){Date.prototype.toISOString||(Date.prototype.toJSON||(Date.prototype.toJSON=function(){var a=function(a){return 10>a?"0"+a:a};return this.getUTCFullYear()+"-"+a(this.getUTCMonth()+1)+"-"+a(this.getUTCDate())+"T"+a(this.getUTCHours())+":"+a(this.getUTCMinutes())+":"+a(this.getUTCSeconds())+"Z"}),Date.prototype.toISOString=Date.prototype.toJSON)}();var b=function(b,c){var d;if(b){var e=b.split("."),f=window||this;if(f){for(var g=0,h=e.length;h>g;g++)f=f[e[g]];"function"==typeof f&&(d=new(a(f,c)))}}return d};return{createInstance:b}}(),"undefined"==typeof _||!_)throw"ERROR: Lo-Dash is required for fi.fmi.metoclient.ui.animator.WmsCapabilities!";if("undefined"==typeof OpenLayers||!OpenLayers)throw"ERROR: OpenLayers is required for fi.fmi.metoclient.ui.animator.WmsCapabilities!";var fi=fi||{};if(fi.fmi=fi.fmi||{},fi.fmi.metoclient=fi.fmi.metoclient||{},fi.fmi.metoclient.ui=fi.fmi.metoclient.ui||{},fi.fmi.metoclient.ui.animator=fi.fmi.metoclient.ui.animator||{},fi.fmi.metoclient.ui.animator.WmsCapabilities=function(){function a(a,b,c){a&&setTimeout(function(){a(b,c)},0)}function b(a){return a&&a.url&&!fi.fmi.metoclient.ui.animator.WfsCapabilities.isService(a)}function c(a,c){c.push.apply(c,_.uniq(_.filter(a,function(a){return a&&b(a)}),"url"))}function d(b){var c,d=[];if(!b.capabilities||!b.capabilities.url)throw"ERROR: WMS capabilities configuration is missing URL!";var e=new OpenLayers.Format.WMSCapabilities,k={SERVICE:f,VERSION:g,REQUEST:h};_.merge(k,b.params),OpenLayers.Request.GET({url:b.capabilities.url,params:k,success:function(f){var g=f.responseXML;g&&g.documentElement||(g=f.responseText),c=e.read(g),a(b.callback,c,d)},failure:function(e){var f={};if(f[i]=e.status,f[j]=e.statusText,d.push(f),"undefined"!=typeof console&&console){var g="ERROR: Response error: ";g+="Status: "+f[i],g+=", Text: "+f[j],console.error(g)}a(b.callback,c,d)}})}function e(a,c){c.push.apply(c,_.map(_.filter(a.layers,function(a){return a&&b(a.capabilities)}),"capabilities"))}var f="WMS",g="1.3.0",h="GetCapabilities",i="errorCode",j="errorText";return{isService:b,getUniqueConfigs:c,getData:d,getCapabilitiesConfigs:e}}(),"undefined"==typeof _||!_)throw"ERROR: Lo-Dash is required for fi.fmi.metoclient.ui.animator.WfsCapabilities!";var fi=fi||{};if(fi.fmi=fi.fmi||{},fi.fmi.metoclient=fi.fmi.metoclient||{},fi.fmi.metoclient.ui=fi.fmi.metoclient.ui||{},fi.fmi.metoclient.ui.animator=fi.fmi.metoclient.ui.animator||{},fi.fmi.metoclient.ui.animator.WfsCapabilities=function(){function a(a,b,c){a&&setTimeout(function(){a(b,c)},0)}function b(a){var b;return _.forEach(a,function(a){return a&&a.animation?(b=a.animation,!1):void 0}),b}function c(a){return a&&a.storedQueryId}function d(a,b){_.forEach(a,function(d){c(d)&&_.forEach(a,function(a){return d===a?(b.push(d),!1):d.url===a.url&&d.storedQueryId===a.storedQueryId?!1:void 0})})}function e(b){if(!(b.capabilities&&b.capabilities.url&&b.capabilities.layer&&b.capabilities.storedQueryId))throw"ERROR: WFS capabilities configuration is missing URL, layer or storedQueryId information!";var c=[],d=(new Date).getTime(),e={capability:{layers:[],request:{getcapabilities:{href:jQuery.trim(b.capabilities.url)}}}},f={request:"GetPropertyValue",valuereference:"wfs:FeatureCollection/wfs:member/omso:GridSeriesObservation/om:phenomenonTime/gml:TimeInstant/gml:timePosition",storedquery_id:b.capabilities.storedQueryId,starttime:new Date(d-g).toISOString().replace(/\.\d\d\dZ$/,"Z"),endtime:new Date(d+h).toISOString().replace(/\.\d\d\dZ$/,"Z")};_.merge(f,b.params),setTimeout(function(){jQuery.ajax({type:i,url:jQuery.trim(b.capabilities.url),dataType:j,data:f,success:function(d){var f={name:b.capabilities.layer,dimensions:{time:{values:[]}}};e.capability.layers.push(f),jQuery(d).find(k).each(function(){f.dimensions.time.values.push(new Date(jQuery.trim(jQuery(this).text())).getTime())}),a(b.callback,e,c)},error:function(d,e,f){var g={};if(g[l]=d.status,g[m]=f||e,c.push(g),"undefined"!=typeof console&&console){var h="ERROR: WFS XML response error: ";h+="Status: "+g[l],h+=", Text: "+g[m],console.error(h)}a(b.callback,void 0,c)}})},0)}function f(a,d){_.forEach(a.layers,function(a){if(c(a.capabilities)){d.push(a.capabilities);var e=b(a.args);e&&_.forEach(e.layers,function(b){d.push({url:a.capabilities.url,layer:b.layer,storedQueryId:b.storedQueryId})})}})}var g=864e5,h=864e5,i="GET",j="XML",k="gml\\:timePosition, timePosition",l="errorCode",m="errorText";return{isService:c,getUniqueConfigs:d,getData:e,getCapabilitiesConfigs:f}}(),"undefined"==typeof _||!_)throw"ERROR: Lo-Dash is required for fi.fmi.metoclient.ui.animator.Capabilities!";if("undefined"==typeof OpenLayers||!OpenLayers)throw"ERROR: OpenLayers is required for fi.fmi.metoclient.ui.animator.Capabilities!";var fi=fi||{};if(fi.fmi=fi.fmi||{},fi.fmi.metoclient=fi.fmi.metoclient||{},fi.fmi.metoclient.ui=fi.fmi.metoclient.ui||{},fi.fmi.metoclient.ui.animator=fi.fmi.metoclient.ui.animator||{},fi.fmi.metoclient.ui.animator.Capabilities=function(){function a(a){return fi.fmi.metoclient.ui.animator.WfsCapabilities.isService(a.capabilities)?fi.fmi.metoclient.ui.animator.WfsCapabilities:fi.fmi.metoclient.ui.animator.WmsCapabilities}function b(a,b){fi.fmi.metoclient.ui.animator.WfsCapabilities.getCapabilitiesConfigs(a,b),fi.fmi.metoclient.ui.animator.WmsCapabilities.getCapabilitiesConfigs(a,b)}function c(a){var c=[],d=[];return b(a,d),fi.fmi.metoclient.ui.animator.WfsCapabilities.getUniqueConfigs(d,c),fi.fmi.metoclient.ui.animator.WmsCapabilities.getUniqueConfigs(d,c),c}function d(a,b,c){a&&setTimeout(function(){a(b,c)},0)}function e(a,b){var c;if(b&&a&&a.capability&&a.capability.layers)for(var d=a.capability.layers,e=0;e<d.length;++e){var f=d[e];if(f&&f.name===b){c=f;break}}return c}function f(a){var b;if(a){var c=a.dimensions;if(c){var d=c.time;d&&(b=d.values)}}return b}function g(a){var b,c=f(a);if(c&&c.length){if(b=c[0],1===c.length&&void 0!==b&&null!==b){b+="";var d=b.split("/");d.length&&(b=d[0])}b=new Date(isNaN(b)?b:parseInt(b,j))}return b}function h(a){var b,c=f(a);if(c&&c.length){if(b=c[c.length-1],void 0!==b&&null!==b&&1===c.length){b+="";var d=b.split("/");d.length>1&&(b=d[1])}b=new Date(isNaN(b)?b:parseInt(b,j))}return b}function i(b){if(!(b&&b.callback&&b.config)){var e="ERROR: Options object and config object and callback function in it are mandatory!";throw"undefined"!=typeof console&&console&&console.error(e),e}var f=_.once(d),g={nComplete:0,capabilities:[],errors:[]},h=c(b.config),i=h.length;i>0?_.each(h,function(c){var d={capabilities:c,callback:function(a,d){try{++g.nComplete,a&&g.capabilities.push({url:c.url,capabilities:a}),g.errors.push.apply(g.errors,d),g.nComplete===i&&f(b.callback,g.capabilities,g.errors)}catch(e){var h={};h[k]="ERROR: Error in GetCapabilities flow: "+e.toString(),"undefined"!=typeof console&&console&&console.error(h[k]),g.errors.push(h),g.nComplete===i&&f(b.callback,g.capabilities,g.errors)}},params:b.params};a(d).getData(d)}):f(b.callback,g.capabilities,g.errors)}var j=10,k="errorText";return{getData:i,getLayer:e,getLayerTimes:f,getBeginTime:g,getEndTime:h}}(),"undefined"==typeof OpenLayers||!OpenLayers)throw"ERROR: OpenLayers is required for fi.fmi.metoclient.ui.animator.Factory!";var fi=fi||{};if(fi.fmi=fi.fmi||{},fi.fmi.metoclient=fi.fmi.metoclient||{},fi.fmi.metoclient.ui=fi.fmi.metoclient.ui||{},fi.fmi.metoclient.ui.animator=fi.fmi.metoclient.ui.animator||{},"undefined"==typeof fi.fmi.metoclient.ui.animator.Utils||!fi.fmi.metoclient.ui.animator.Utils)throw"ERROR: fi.fmi.metoclient.ui.animator.Utils is required for fi.fmi.metoclient.ui.animator.Factory!";if("undefined"==typeof fi.fmi.metoclient.ui.animator.Capabilities||!fi.fmi.metoclient.ui.animator.Capabilities)throw"ERROR: fi.fmi.metoclient.ui.animator.Capabilities is required for fi.fmi.metoclient.ui.animator.Factory!";if(fi.fmi.metoclient.ui.animator.Factory=function(){function a(a,b){if(a&&b&&b>0){var c=a.getTime();if(c!==b){var d=c%b;d&&(c-=d,a.setTime(c))}}}function b(a,b){if(a&&b&&b>0){var c=a.getTime();if(c!==b){var d=c%b;d&&(c+=b-d,a.setTime(c))}}}var c="auto",d="join",e=function(e){function f(a,b){var c;if(a&&b)for(var d=0;d<L.length;++d){var e=L[d];if(e){var f=e.capabilities;if(f&&b===e.url){var g=fi.fmi.metoclient.ui.animator.Capabilities.getLayer(f,a);if(g){c=g;break}}}}return c}function g(){if(J&&J.layers&&J.layers.length){b(N,y());for(var c=0;c<J.layers.length;++c){var d=J.layers[c];if(d)for(var e=0;e<d.args.length;++e){var f=d.args[e];if(f){var g,h=f.animation;if(h){var i=h.resolutionTime;if(void 0===i&&(i=y(),void 0===i))throw"ERROR: Animation resolution time missing!";if(h.isForecast&&(g=void 0!==h.beginTime?new Date(h.beginTime instanceof Date?h.beginTime.getTime():h.beginTime):z(),a(g,i),void 0!==g&&(void 0===N||N.getTime()>g.getTime())&&(N=g)),h.layers)for(var j=0;j<h.layers.length;++j){var k=h.layers[j];k&&(k.isForecast||h.isForecast)&&(g=void 0!==k.beginTime?new Date(k.beginTime instanceof Date?k.beginTime.getTime():k.beginTime):z(),a(g,i),void 0!==g&&(void 0===N||N.getTime()>g.getTime())&&(N=g))}break}}}}}}function h(d,e,f){d&&e&&(d.beginTime===c&&(d.beginTime=fi.fmi.metoclient.ui.animator.Capabilities.getBeginTime(e),b(d.beginTime,f)),d.endTime===c&&(d.endTime=fi.fmi.metoclient.ui.animator.Capabilities.getEndTime(e),a(d.endTime,f)))}function i(a,c){if(a&&c&&c.url&&c.layer){var e=f(c.layer,c.url);if(e){var g=a.resolutionTime;if(void 0===g&&(g=y(),void 0===g))throw"ERROR: Animation resolution time missing!";if(h(a,e,g),a.layers)for(var i=0;i<a.layers.length;++i){var j=a.layers[i];if(j&&j.layer&&(h(j,f(j.layer,c.url),g),j.beginTime===d)){if(j.beginTime=fi.fmi.metoclient.ui.animator.Capabilities.getEndTime(e),void 0===j.beginTime)throw"ERROR: Animation sub-layer missing capability begin time!";j.beginTime=new Date(j.beginTime.getTime()+1),b(j.beginTime,g)}}}}}function j(){try{if(L.length&&J&&J.layers)for(var a=0;a<J.layers.length;++a){var b=J.layers[a];if(b&&b.args)for(var c=0;c<b.args.length;++c){var d=b.args[c];if(d){var e=d.animation;if(e){i(e,b.capabilities);break}}}}g()}catch(f){var h="ERROR: Configuration check failed: "+f.toString();"undefined"!=typeof console&&console&&console.error(h),K.push(h)}}function k(a,b,c){b&&L.push.apply(L,b),c&&K.push.apply(K,c),j(),O(a)}function l(a){var b=function(b,c){k(a,b,c)},c={config:J,callback:b};fi.fmi.metoclient.ui.animator.Capabilities.getData(c)}function m(){var a;if(J){var b=J.layers;if(b)for(var c=0;c<b.length;++c){var d=b[c];if(d&&d.args)for(var e=0;e<d.args.length;++e){var f=d.args[e];if(f){var g=f.animation;if(g){(!a||void 0!==g.resolutionTime&&null!==g.resolutionTime&&a<g.resolutionTime)&&(a=g.resolutionTime);break}}}}}return a}function n(){var a;if(J){var b=J.layers;if(b)for(var c=0;c<b.length;++c){var d=b[c];if(d&&d.args)for(var e=0;e<d.args.length;++e){var f=d.args[e];if(f){var g=f.animation;if(g){if(void 0!==g.beginTime&&null!==g.beginTime){var h=g.beginTime;h instanceof Date||(h=new Date(h)),(void 0===a||h.getTime()<a.getTime())&&(a=new Date(h.getTime()))}break}}}}}return a}function o(){var a;if(J){var b=J.layers;if(b)for(var c=0;c<b.length;++c){var d=b[c];if(d&&d.args)for(var e=0;e<d.args.length;++e){var f=d.args[e];if(f){var g=f.animation;if(g){if(void 0!==g.endTime&&null!==g.endTime){var h=g.endTime;h instanceof Date||(h=new Date(h)),(void 0===a||h.getTime()>a.getTime())&&(a=new Date(h.getTime()))}break}}}}}return a}function p(){return J?J.browserNotSupportedInfo:void 0}function q(){if(!E&&J&&J.map&&J.map.className){var a;if(J.map.args&&J.map.args.length>0){a=J.map.args;var b=a[0];b.theme||(b.theme=null)}E=fi.fmi.metoclient.ui.animator.Utils.createInstance(J.map.className,a)}return E}function r(){if(q()&&J&&J.layers&&0===M.length)for(var c,d=J.layers,e=0;e<d.length;++e){var f=d[e];if(c=void 0,f&&f.className&&f.args){for(var g=0;g<f.args.length;++g){var h=f.args[g];if(h){var i=h.animation;if(i){void 0===i.resolutionTime&&(i.resolutionTime=y()),void 0===i.beginTime&&(i.beginTime=z()),void 0===i.endTime&&(i.endTime=A()),i.resolutionTime&&(i.beginTime instanceof Date||(i.beginTime=new Date(i.beginTime)),a(i.beginTime,i.resolutionTime),i.endTime instanceof Date||(i.endTime=new Date(i.endTime)),b(i.endTime,i.resolutionTime));break}}}c=fi.fmi.metoclient.ui.animator.Utils.createInstance(f.className,f.args)}c&&M.push(c)}return M}function s(){return J?J.defaultZoomLevel:void 0}function t(){return J?J.animationFrameRate:void 0}function u(){return J?J.animationRefreshInterval:void 0}function v(){return J&&J.animationAutoStart?!0:!1}function w(){return J&&J.showAnimationInitProgress?!0:!1}function x(){return J&&J.showAnimationLoadProgress?!0:!1}function y(){if(void 0===F&&(F=J?J.animationResolutionTime:void 0,!F&&(F=m(),!F)))throw"ERROR: Animation configuration missing resolution time!";return F}function z(){if(void 0===G&&J&&(void 0!==J.animationDeltaToBeginTime?(G=new Date,J.animationDeltaToBeginTime?(G.setTime(G.getTime()-J.animationDeltaToBeginTime),a(G,y())):b(G,y())):(G=n(),void 0!==G&&a(G,y())),void 0===G))throw"ERROR: Animation configuration missing proper begin time!";return void 0===G?void 0:new Date(G.getTime())}function A(){if(void 0===H&&J&&(void 0!==J.animationDeltaToEndTime?(H=new Date,J.animationDeltaToEndTime?(H.setTime(H.getTime()+J.animationDeltaToEndTime),b(H,y())):a(H,y())):(H=o(),void 0!==H&&b(H,y())),void 0===H))throw"ERROR: Animation configuration missing proper end time!";return void 0===H?void 0:new Date(H.getTime())}function B(){return N}function C(){for(var a=[],b=0;b<L.length;++b)a.push(L[b].capabilities);return a}function D(a){if(!a){var b="ERROR: Factory init callback is mandatory!";throw"undefined"!=typeof console&&console&&console.error(b),b}try{K=[],L=[],l(a)}catch(c){var d=c.toString();"undefined"!=typeof console&&console&&console.error("ERROR: Factory init error: "+d),K.push(d),O(a)}}var E,F,G,H,I=this,J=e,K=[],L=[],M=[],N=new Date,O=function(a){a&&setTimeout(function(){try{a(I,K)}catch(b){"undefined"!=typeof console&&console&&console.error("ERROR: Callback function error: "+b.toString())}},0)};this.init=D,this.getCapabilities=C,this.getMap=q,this.getLayers=r,this.getDefaultZoomLevel=s,this.getAnimationFrameRate=t,this.getAnimationRefreshInterval=u,this.getAnimationAutoStart=v,this.showAnimationInitProgress=w,this.showAnimationLoadProgress=x,this.getAnimationResolution=y,this.getAnimationBeginDate=z,this.getAnimationEndDate=A,this.getForecastBeginDate=B,this.getBrowserNotSupportedInfo=p};return e}(),"undefined"==typeof Raphael||!Raphael)throw"ERROR: Raphael JS is required for fi.fmi.metoclient.ui.animator.Controller!";if("undefined"==typeof jQuery||!jQuery)throw"ERROR: jQuery is required for fi.fmi.metoclient.ui.animator.Controller!";var fi=fi||{};if(fi.fmi=fi.fmi||{},fi.fmi.metoclient=fi.fmi.metoclient||{},fi.fmi.metoclient.ui=fi.fmi.metoclient.ui||{},fi.fmi.metoclient.ui.animator=fi.fmi.metoclient.ui.animator||{},"undefined"==typeof fi.fmi.metoclient.ui.animator.ControllerConfig||!fi.fmi.metoclient.ui.animator.ControllerConfig)throw"ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig is required for fi.fmi.metoclient.ui.animator.Controller!";if(!fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig||!fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig.bgColor||!fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig.textColor)throw"ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig and its properties are required for fi.fmi.metoclient.ui.animator.Controller!";if(!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig||!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.bgColor)throw"ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig and its properties are required for fi.fmi.metoclient.ui.animator.Controller!";if(!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellReadyColor||!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellErrorColor||!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellLoadingColor)throw"ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig and its cell properties are required for fi.fmi.metoclient.ui.animator.Controller!";if(!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.obsBgColor||!fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.fctBgColor)throw"ERROR: fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig and its background properties are required for fi.fmi.metoclient.ui.animator.Controller!";if(fi.fmi.metoclient.ui.animator.Controller=function(){function a(a){var b=a.getHours(),c=a.getMinutes(),d=b>9?b:"0"+b;return d+=":",d+=c>9?c:"0"+c}var b=Raphael,c="Arial",d=14,e=function(e,f,g,h){function i(){return 82}function j(){return 27}function k(){return Math.floor(jQuery(jb.node).offset().left)}function l(){return k()+i()}function m(){qb.attr("stroke-width",0);var a=Math.floor(jQuery(qb.node).offset().left);return qb.attr("stroke-width",gb.strokeWidth),a}function n(){return m()+gb.sliderTipDx}function o(){return l()+t()/y()}function p(){var a=n()-k();0>a&&(a=0),nb.attr("width",a);var b=jb.attr("width")-a;0>b&&(b=0),ob.attr("x",nb.attr("x")+a).attr("width",b)}function q(){return db?db.getForecastStartTime():0}function r(){return db?db.getStartTime()-t():0}function s(){return db?db.getEndTime():0}function t(){return db?db.getResolution():0}function u(){return jb.getBBox().x+i()}function v(){return jb.getBBox().y}function w(){return Math.floor(fb.width-i()-j())}function x(){return Math.floor(jb.getBBox().height)}function y(){return db&&w()?(s()-r())/w():1}function z(a){var b=t();return void 0!==a&&null!==a&&b&&(a+=Math.floor(b/4),a-=a%b),a}function A(a){var b=Math.floor(r()+(a-l())*y());return b<r()?b=r():b>s()&&(b=s()),b}function B(a){var b=l(),c=a-r(),d=y(),e=Math.floor(b+(d?c/d:0));return e}function C(){var b=new Date(z(A(n())));rb.attr("text",a(b))}function D(a){var b=/T-*\d+,0/;pb.forEach(function(c){var d=c.transform().toString(),e=d.match(b);if(e&&e.length){var f=parseInt(e[0].substring(1),10);c.transform(d.replace(b,"T"+(f+a)+",0"))}else c.transform("...T"+a+",0")})}function E(a){var b=Math.round(a-n()),c=l();b&&a>=c&&a<=c+w()&&(D(b),C(),p())}function F(){pb.toFront(),C()}function G(){eb.proposePause(),sb=m()}function H(a){var b=A(sb+a);eb.proposeTimeSelectionChange(b)}function I(){sb=void 0}function J(){eb.proposeNextFrame()}function K(){eb.proposePreviousFrame()}function L(a,b){return b>0?J():0>b&&K(),!1}function M(){var a=db?w()-N():0;return 0>a&&(a=0),a}function N(){var a=0,b=q(),c=r(),d=s();if(void 0!==b&&db&&d-c){var e=t()||0;a=Math.floor(w()*(d-(b-e))/(d-c))}return 0>a&&(a=0),a}function O(){var a=M(),b=N(),c=a+b;kb.attr("x",fb.x+i()).attr("width",c),lb.attr("x",fb.x+i()).attr("width",a),mb.attr("x",fb.x+i()+a).attr("width",b)}function P(){for(;ib.length;)ib.splice(0,1)[0].remove();var a=t();if(a)for(var b=r(),c=s(),d=u(),e=v()+x()-fb.progressCellHeight,f=Math.floor((c-b)/a),g=w()/f,h=0;f>h;++h){var i=cb.rect(d+h*g,e,g,fb.progressCellHeight);i.attr("fill",fb.bgColor).attr("stroke-width","0"),i.node.id="animationProgressCell_"+(b+(h+1)*a),ib.push(i),jQuery(i.node).mousewheel(L)}}function Q(a){for(var b,c=0;c<ib.length;++c)if(ib[c].node.id==="animationProgressCell_"+a){b=ib[c],b.attr("fill",fb.cellReadyColor);break}return b}function R(){for(;hb.length;)hb.splice(0,1)[0].remove();var b=t();if(b)for(var e,f=r(),g=s(),h=u(),i=Math.floor((g-f)/b),j=w()/i,k=0;i>=k;++k){var m=h+k*j,n=new Date(f+k*b),o=x()-(fb.height-fb.bgHeight),p=0===n.getMinutes()&&0===n.getSeconds()&&0===n.getMilliseconds();if((p||0===k||k===i)&&(o-=fb.progressCellHeight),o){var q=v()+x(),y=cb.path("M"+m+","+q+"V"+o);if(y.attr("stroke",Raphael.getRGB("white")).attr("opacity",.5),hb.push(y),jQuery(y.node).mousewheel(L),p&&i>k){var z=cb.text(m,v()+x()/3,a(n)).attr({"font-family":c,"font-size":d,fill:Raphael.getRGB("black")}),A=jQuery(z.node);A.offset().left>=l()&&A.offset().left+A.width()<=l()+w()?(hb.push(z),jQuery(z.node).mousewheel(L)):z.remove()}}e=n.getHours()}}function S(a){for(var b=a.events,c=0;c<b.length;++c){var d=b[c].time.getTime(),e=Q(d);e&&e.attr("fill",fb.bgColor)}}function T(){O(),P(),R(),F(),p(),nb.toFront(),ob.toFront()}function U(a){S(a)}function V(a){for(var b=a.events,c=0;c<b.length;++c){var d=b[c].time.getTime(),e=Q(d);e&&e.attr("fill",b[c].error?fb.cellErrorColor:fb.cellLoadingColor)}}function W(a){for(var b=a.events,c=0;c<b.length;++c){var d=b[c].time.getTime(),e=Q(d);e&&e.attr("fill",b[c].error?fb.cellErrorColor:fb.cellReadyColor)}}function X(){}function Y(){}function Z(a){S(a)}function $(a){for(var b=a.events,c=0;c<b.length;++c){var d=b[c].time.getTime();E(B(d))}}function _(a){db=a,a.addTimePeriodChangeListener({timePeriodChanged:function(){T()}}),a.addTimeSelectionChangeListener({selectedTimeChanged:function(a){E(B(a))}}),a.addForecastStartTimeChangeListener({forecastStartTimeChanged:function(){O()}}),a.addAnimationEventsListener({loadAnimationStartedCb:U,loadFrameStartedCb:V,loadFrameCompleteCb:W,loadGroupProgressCb:X,loadCompleteCb:Y,animationFrameContentReleasedCb:Z,frameChangedCb:$}),T()}function ab(a){eb=a}function bb(){cb.remove()}var cb,db,eb,fb,gb,hb,ib,jb,kb,lb,mb,nb,ob,pb,qb,rb,sb,tb=this;!function(){cb=b(e,f,g),gb={height:27,width:54,bgColor:fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig.bgColor,strokeBgColor:fi.fmi.metoclient.ui.animator.ControllerConfig.sliderConfig.textColor,strokeWidth:0},fb={radius:0,x:0,y:0,width:f,height:g-gb.height,bgHeight:g-gb.height-12,progressCellHeight:12,bgColor:fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.bgColor,cellReadyColor:fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellReadyColor,cellErrorColor:fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellErrorColor,cellLoadingColor:fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.cellLoadingColor,obsBgColor:fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.obsBgColor,fctBgColor:fi.fmi.metoclient.ui.animator.ControllerConfig.scaleConfig.fctBgColor},gb.sliderTipHeight=gb.height*(3/7),gb.scaleX=gb.width/14,gb.scaleY=(gb.height+gb.sliderTipHeight)/7,gb.sliderTipDx=Math.floor(7*gb.scaleX),gb.y=fb.y+fb.height-Math.floor(gb.sliderTipHeight),hb=cb.set(),ib=cb.set(),jb=cb.rect(fb.x,fb.y,fb.width,fb.height,fb.radius),jb.attr("stroke-width",0),jb.attr("opacity",0),kb=cb.rect(fb.x+i(),fb.y,M()+N(),fb.height),kb.attr("fill",fb.bgColor),kb.attr("stroke-width",0),lb=cb.rect(fb.x+i(),fb.y,M(),fb.bgHeight),lb.attr("fill",fb.obsBgColor),lb.attr("stroke-width",0),mb=cb.rect(fb.x+i()+M(),fb.y,N(),fb.bgHeight),mb.attr("fill",fb.fctBgColor),mb.attr("stroke-width",0),nb=cb.rect(fb.x,fb.y,i(),fb.height),nb.attr("fill",Raphael.rgb(0,0,0)).attr("opacity",0),nb.attr("stroke-width",0),nb.click(K),ob=cb.rect(fb.x+f,fb.y,j(),fb.height),ob.attr("fill",Raphael.rgb(0,0,0)).attr("opacity",0),ob.attr("stroke-width",0),ob.click(J),jQuery([jb.node,kb.node,lb.node,mb.node,nb.node,ob.node]).mousewheel(L),pb=cb.set(),qb=cb.path("M0,2L0,7L14,7L14,2L9,2L7,0L5,2Z"),qb.attr("fill",gb.bgColor),qb.attr("stroke",gb.strokeBgColor),qb.attr("stroke-width",gb.strokeWidth),qb.transform("S"+gb.scaleX+","+gb.scaleY+",0,0T0,"+gb.y),rb=cb.text(27,gb.y+26,"00:00"),rb.attr({"font-family":c,"font-size":d,"font-weight":"bold"}),rb.attr("fill",gb.strokeBgColor).attr("stroke-width",0),pb.push(qb),pb.push(rb),pb.drag(H,G,I,tb,tb,tb),jQuery([qb.node,rb.node]).mousewheel(L),pb.hide(),setTimeout(function(){E(void 0!==h&&null!==h?B(h):o()),pb.show(),C()},0)}(),this.setTimeModel=_,this.setTimeController=ab,this.remove=bb};return e}(),"undefined"==typeof _||!_)throw"ERROR: Lodash is required for fi.fmi.metoclient.ui.animator.Animator!";if("undefined"==typeof jQuery||!jQuery)throw"ERROR: jQuery is required for fi.fmi.metoclient.ui.animator.Animator!";if("undefined"==typeof OpenLayers||!OpenLayers)throw"ERROR: OpenLayers is required for fi.fmi.metoclient.ui.animator.Animator!";if("undefined"==typeof OpenLayers.Layer||"undefined"==typeof OpenLayers.Layer.Animation||"undefined"==typeof OpenLayers.Layer.Animation.Utils||!OpenLayers.Layer.Animation.Utils)throw"ERROR: OpenLayers.Layer.Animation.Utils is required for fi.fmi.metoclient.ui.animator.Animator!";var fi=fi||{};if(fi.fmi=fi.fmi||{},fi.fmi.metoclient=fi.fmi.metoclient||{},fi.fmi.metoclient.ui=fi.fmi.metoclient.ui||{},fi.fmi.metoclient.ui.animator=fi.fmi.metoclient.ui.animator||{},"undefined"==typeof fi.fmi.metoclient.ui.animator.Factory||!fi.fmi.metoclient.ui.animator.Factory)throw"ERROR: fi.fmi.metoclient.ui.animator.Factory is required for fi.fmi.metoclient.ui.animator.Animator!";if("undefined"==typeof fi.fmi.metoclient.ui.animator.Controller||!fi.fmi.metoclient.ui.animator.Controller)throw"ERROR: fi.fmi.metoclient.ui.animator.Controller is required for fi.fmi.metoclient.ui.animator.Animator!";fi.fmi.metoclient.ui.animator.Animator=function(){function a(){return document.addEventListener}function b(a){var b;return _.isObject(a)&&_.isFunction(a.clone)&&(b=a.clone()),b}var c="Browser not supported. Update browser.",d=10,e=100,f={events:new OpenLayers.Events(this)},g=function(){function g(a){a&&-1===jQuery.inArray(a,fb)&&(!fb.length&&T.showAnimationLoadProgress()&&jQuery(".animatorLoadProgressbar").show(),fb.push(a))}function h(a){if(a&&fb.length){var b=jQuery.inArray(a,fb);-1!==b&&(fb.splice(b,1),fb.length||jQuery(".animatorLoadProgressbar").hide())}}function i(){return T.getAnimationBeginDate()}function j(){return T.getAnimationEndDate()}function k(){return T.getAnimationResolution()}function l(){return T.getForecastBeginDate()}function m(){for(var a,b=i().getTime(),c=l().getTime();c>b;)a=b,b+=k();return void 0===a?void 0:new Date(a)}function n(){if(S){var a=jQuery("#"+S.playAndPauseDivId);a.length&&a.click(function(){void 0!==U?u():t()}),o()}}function o(){if(S){var a=jQuery("#"+S.playAndPauseDivId);a.length&&(a.removeClass("animatorPlay"),a.removeClass("animatorPause"),a.addClass(void 0!==U?"animatorPause":"animatorPlay"))}}function p(){if(void 0===V||V<i()||V>j()){var a=m();V=void 0!==a?a.getTime():i().getTime()}f.events.triggerEvent("timechanged",{time:V})}function q(){if(void 0===V)V=i().getTime();else{var a=k();V=V+a>j().getTime()?i().getTime():V+a}f.events.triggerEvent("timechanged",{time:V})}function r(){if(void 0===V)V=i().getTime();else{var a=k();V=V-a<i().getTime()?j().getTime():V-a}f.events.triggerEvent("timechanged",{time:V})}function s(a,b){V=a instanceof Date?a.getTime():a,f.events.triggerEvent("timechanged",{time:a}),jQuery.each(b,function(b,c){c.selectedTimeChanged(a)})}function t(){void 0===U&&(U=new Date,o(),v())}function u(){void 0!==U&&(U=void 0,o())}function v(){if(void 0!==U&&T){requestAnimationFrame(v);var a=new Date;U.getTime()+T.getAnimationFrameRate()<a.getTime()&&(U=a,q())}}function w(){u(),q()}function x(){u(),r()}function y(a,b,c,d){var e=jQuery('<div class="scroll-content-item ui-widget-header"></div>');e.css("background-image","url('"+c.url+"')"),d&&(e.addClass("selectedLegend"),b.css("background-image",e.css("background-image")));var f=a.width()||2;a.append(e);var g=f+e.outerWidth(!0);a.width()<g&&a.width(g),e.click(function(){e.hasClass("selectedLegend")||(jQuery(".scroll-content-item").removeClass("selectedLegend"),e.addClass("selectedLegend"),b.css("background-image",e.css("background-image")))})}function z(){var a=jQuery(".scroll-pane"),b=jQuery(".scroll-content");b.width()<a.outerWidth(!0)&&b.width(a.outerWidth(!0));var c=jQuery(".scroll-bar").slider({slide:function(c,d){b.width()>a.width()?b.css("margin-left",Math.round(d.value/100*(a.width()-b.width()))+"px"):b.css("margin-left",0)}}),d=c.find(".ui-slider-handle").mousedown(function(){c.width(d.width())}).mouseup(function(){c.width("100%")}).append("<span class='ui-icon ui-icon-grip-dotted-vertical'></span>").wrap("<div class='ui-handle-helper-parent'></div>").parent();a.css("overflow","hidden");var e=function(){var d=a.width()-b.width();d>0&&(d=0);var e="auto"===b.css("margin-left")?0:parseInt(b.css("margin-left"),10),f=d?Math.round(e/d*100):0;c.slider("value",f)},f=function(){if(b.width()>a.width()){var c=b.width()+parseInt(b.css("margin-left"),10),d=a.width()-c;d>0&&b.css("margin-left",parseInt(b.css("margin-left"),10)+d+"px")}else b.css("margin-left",0)},g=function(){var e=b.width()-a.width();0>e&&(e=0);var f=e/b.width(),g=a.width()-f*a.width();c.find(".ui-slider-handle").css({width:Math.floor(g),"margin-left":-Math.floor(g/2)}),d.width(Math.floor(c.width()-g))};Z=function(){jQuery("#"+S.legendDivId).hasClass("animatorLegendNoLegend")||(e(),f(),g())};var h=setTimeout(function(){g(),gb.splice(gb.indexOf(h),1),h=void 0},10);gb.push(h)}function A(){z()}function B(){if(S.legendDivId){var a,b,c,d,e,f,g=T.getLayers(),h=jQuery("#"+S.legendDivId);h.empty();var i=0;for(a=0;a<g.length;++a)if(c=g[a],c.getVisibility()&&c.getLegendInfo)for(d=c.getLegendInfo(),b=0;b<d.length;++b)e=d[b],e.hasLegend&&++i;if(i)if(1===i){for(h.removeClass("animatorLegendNoLegend"),S.animationDivId&&jQuery("#"+S.animationDivId).removeClass("animatorAnimationNoLegend"),f=jQuery('<div class="animatorLegendView animatorLegendViewOne"></div>'),h.append(f),a=0;a<g.length;++a)if(c=g[a],c.getVisibility()&&c.getLegendInfo)for(d=c.getLegendInfo(),b=0;b<d.length;++b)if(e=d[b],e.hasLegend){f.css("background-image","url('"+e.url+"')");break}}else{h.removeClass("animatorLegendNoLegend"),S.animationDivId&&jQuery("#"+S.animationDivId).removeClass("animatorAnimationNoLegend");var j=jQuery('<div class="animatorLegendThumbnails"></div>');j.append('<div class="scroll-pane ui-widget ui-widget-header ui-corner-all"><div class="scroll-content"></div><div class="scroll-bar-wrap ui-widget-content ui-corner-bottom"><div class="scroll-bar"></div></div></div>'),h.append(j),f=jQuery('<div class="animatorLegendView"></div>'),h.append(f);
var k=jQuery(".scroll-content"),l=!1;for(a=0;a<g.length;++a)if(c=g[a],c.getVisibility()&&c.getLegendInfo)for(d=c.getLegendInfo(),b=0;b<d.length;++b)e=d[b],e.hasLegend&&(y(k,f,e,!l),l=!0);A()}else h.addClass("animatorLegendNoLegend"),S.animationDivId&&jQuery("#"+S.animationDivId).addClass("animatorAnimationNoLegend")}else S.animationDivId&&jQuery("#"+S.animationDivId).addClass("animatorAnimationNoLegend");ab&&ab()}function C(a){if(a&&S.legendDivId)for(var b=function(a){a&&a.object&&a.object.getLegendInfo&&!a.object.getLegendInfo().length&&a.object.getVisibility&&a.object.getVisibility()&&!_.contains(eb,a.object)?eb.push(a.object):B()},c={visibilitychanged:b,added:B,removed:B},d=0;d<a.length;++d){var e=a[d];e.events&&e.getLegendInfo&&e.events.on(c)}}function D(a,b,c){if(a){var d;b&&(d={div:OpenLayers.Util.getElement(b)});var e=new OpenLayers.Control.LayerSwitcher(d);a.addControl(e),c||e.minimizeControl()}}function E(){$&&($.remove(),$=void 0,ab=void 0)}function F(a,b,c){var d=new fi.fmi.metoclient.ui.animator.Controller(a[0],a.width(),a.height(),V);return d.setTimeModel(b),d.setTimeController(c),d}function G(){if(!(S&&S.controllerDivId&&S.playAndPauseDivId))throw"ERROR: Options or properties missing for controller!";if(void 0!==i()&&void 0!==j()){var a="#"+S.controllerDivId,b=jQuery(a);if(b.length){var c=((new Date).getTime(),i().getTime()),d=j().getTime(),e=l().getTime();e>d&&(e=void 0);var f=[],g=[],h=[],m=[],o={getStartTime:function(){return c},getEndTime:function(){return d},getResolution:function(){return k()},getForecastStartTime:function(){return e},addTimePeriodChangeListener:function(a){f.push(a)},addTimeSelectionChangeListener:function(a){g.push(a)},addAnimationEventsListener:function(a){db.push(a)},addForecastStartTimeChangeListener:function(a){h.push(a)},addTickIntervalChangeListener:function(a){m.push(a)}},p={proposeTimePeriodChange:function(){},proposeTimeSelectionChange:function(a){a>=c&&d>=a&&(a-=a%k(),s(a,g))},proposeNextFrame:function(){w()},proposePreviousFrame:function(){x()},proposePause:function(){u()}};n(),$=F(b,o,p);var q=b.width();ab=function(){var c=jQuery(a).width();c!==q&&(q=c,$.remove(),$=F(b,o,p))}}}}function H(a,b){for(var c=0;c<b.length;++c){var d=b[c];if(Y&&Y.length===b.length){var e=Y[c];e!==d.getVisibility()&&d.setVisibility(e)}d.registerController&&d.registerController(f.events),d.events&&d.events.on(hb),a.addLayer(d)}}function I(){var a=T.getMap(),b=a.getZoom(),c=a.getMinZoom(),d=c+a.getNumZoomLevels()-1;jQuery(".olControlZoomOut").removeClass("animatorControlZoomDisable"),jQuery(".olControlZoomIn").removeClass("animatorControlZoomDisable"),c>=b&&jQuery(".olControlZoomOut").addClass("animatorControlZoomDisable"),b>=d&&jQuery(".olControlZoomIn").addClass("animatorControlZoomDisable")}function J(){if(S.mapDivId){var a=T.getMap();if(a){a.events.on({zoomend:I}),a.render(S.mapDivId);var b=T.getLayers();b&&(H(a,b),setTimeout(function(){B(),G(),C(b),D(a,S.layerSwitcherDivId,S.maximizeSwitcher)},0));var c=X||a.getCenter();c||(c=a.getMaxExtent().getCenterLonLat()),a.setCenter(c,void 0===W?T.getDefaultZoomLevel():W)}}}function K(a,b){if(b&&b.length)"undefined"!=typeof console&&console&&console.error("ERROR: Animator config init errors. Animation is not created!"),Y=void 0,ib(a.callback,b);else try{J()}catch(c){var d="ERROR: ConfigInitCallback: "+c.toString();b.push(d),"undefined"!=typeof console&&console&&console.error(d)}finally{Y=void 0,ib(a.callback,b)}}function L(){S&&(S.animatorContainerDivId?jQuery("#"+S.animatorContainerDivId+" > .animator").remove():(S.animationDivId&&jQuery("#"+S.animationDivId).remove(),S.mapDivId&&jQuery("#"+S.mapDivId).remove(),S.layerSwitcherDivId&&jQuery("#"+S.layerSwitcherDivId).remove(),S.controllerDivId&&jQuery("#"+S.controllerDivId).remove(),S.playAndPauseDivId&&jQuery("#"+S.playAndPauseDivId).remove(),S.logoDivId&&jQuery("#"+S.logoDivId).remove(),S.legendDivId&&jQuery("#"+S.legendDivId).remove()))}function M(b){if(!a()){var d=T.getBrowserNotSupportedInfo()||c;if(b){var e=b.animatorContainerDivId||b.animationDivId;e&&jQuery("#"+e).append('<div class="errorInfo">'+d+"</div>")}throw d}if(b){if(b.animatorContainerDivId){var f=jQuery('<div class="animator"><div class="animatorAnimation" id="animatorAnimationId"><div class="animatorMap" id="animatorMapId"></div><div class="animatorLogo" id="animatorLogoId"></div><div class="animatorController" id="animatorControllerId"></div><div class="animatorPlayAndPause" id="animatorPlayAndPauseId"></div><div class="animatorLayerSwitcher" id="animatorLayerSwitcherId"></div></div><div class="animatorLegend" id="animatorLegendId"></div></div>');jQuery("#"+b.animatorContainerDivId).append(f),b.animationDivId="animatorAnimationId",b.mapDivId="animatorMapId",b.layerSwitcherDivId="animatorLayerSwitcherId",b.controllerDivId="animatorControllerId",b.playAndPauseDivId="animatorPlayAndPauseId",b.logoDivId="animatorLogoId",b.legendDivId="animatorLegendId"}if(b.animationDivId&&(T.showAnimationInitProgress()||T.showAnimationLoadProgress())){var g=jQuery('<div class="animatorLoadProgressbar"></div>');jQuery("#"+b.animationDivId).append(g),g.progressbar({value:!1}),g.hide()}}}function N(){var a=T.getAnimationRefreshInterval();if(a&&a>0){var b=setTimeout(function(){var a=S,b=V,c=void 0!==U,d=T.getMap().getCenter(),e=T.getMap().getZoom(),f=[];_.each(T.getLayers(),function(a){f.push(a.getVisibility())}),Q(),cb=c,X=d,W=e,Y=f,V=b,R(a)},a);gb.push(b)}}function O(){if(S&&!S.callback){var a="ERROR: Animator init options.callback is mandatory if getConfig is used!";throw"undefined"!=typeof console&&console&&console.error(a),a}return T}function P(){if(jQuery(window).resize(),T){var a=T.getMap();a&&a.updateSize()}}function Q(){if(T){var a=T.getMap();a&&a.destroy()}for(;gb.length;)clearTimeout(gb.pop());db=[],fb=[],cb=!1,X=void 0,W=void 0,Y=void 0,U=void 0,V=void 0,Z=void 0,eb=[],L(),E(),T=void 0,S=void 0}function R(a){if(!S&&a)try{S=a,T=new fi.fmi.metoclient.ui.animator.Factory(_.cloneDeep(a.config||fi.fmi.metoclient.ui.animator.Config,b)),M(a),N(),T.showAnimationInitProgress()&&jQuery(".animatorLoadProgressbar").show(),T.init(function(b,c){jQuery(".animatorLoadProgressbar").hide(),K(a,c)})}catch(c){var d=c.toString();"undefined"!=typeof console&&console&&console.error("ERROR: Animator init error: "+d),jQuery(".animatorLoadProgressbar").hide(),ib(a.callback,[d])}}var S,T,U,V,W,X,Y,Z,$,ab,bb=this,cb=!1,db=[],eb=[],fb=[],gb=[],hb={scope:bb,animationloadstarted:void 0,frameloadstarted:void 0,frameloadcomplete:void 0,animationloadgroupprogress:void 0,animationloadcomplete:void 0,animationframecontentreleased:void 0,framechanged:void 0};hb.animationloadstarted=function(a){if(a&&a.object){var b=eb.indexOf(a.object);-1!==b&&(eb.splice(b,1),a&&a.object&&a.object.getLegendInfo&&a.object.getLegendInfo().length&&a.object.getVisibility&&a.object.getVisibility()&&B())}void 0!==U&&(cb=!0),g(a.layer),u(),jQuery.each(db,function(b,c){c.loadAnimationStartedCb(a)})},hb.frameloadstarted=function(a){jQuery.each(db,function(b,c){c.loadFrameStartedCb(a)})},hb.frameloadcomplete=function(a){jQuery.each(db,function(b,c){c.loadFrameCompleteCb(a)})},hb.animationloadgroupprogress=function(a){jQuery.each(db,function(b,c){c.loadGroupProgressCb(a)})},hb.animationloadcomplete=function(a){h(a.layer),T.getAnimationAutoStart()||cb?(cb=!1,t()):p(),jQuery.each(db,function(b,c){c.loadCompleteCb(a)})},hb.animationframecontentreleased=function(a){h(a.layer),jQuery.each(db,function(b,c){c.animationFrameContentReleasedCb(a)})},hb.framechanged=function(a){jQuery.each(db,function(b,c){c.frameChangedCb(a)})},jQuery(window).resize(_.debounce(function(){Z&&Z(),ab&&ab()},d,{maxWait:e}));var ib=function(a,b){a&&setTimeout(function(){try{a(bb,b)}catch(c){"undefined"!=typeof console&&console&&console.error("ERROR: Callback function error: "+c.toString())}},0)};this.init=R,this.reset=Q,this.refresh=P,this.getConfig=O};return g}();