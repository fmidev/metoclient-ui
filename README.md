MetOClient UI
=============

*MetOClient UI* is a reference implementation for 
[FMI's Open Data Services](http://en.ilmatieteenlaitos.fi/open-data-manual).

MetOClient UI shows an example implementation on how to present and control 
FMI Web Feature Service (WFS) and Web Map Service (WMS) content in a web page. 
FMI WFS service provides weather observation and forecast data that are presented 
in a graph component in MetOClient UI. FMI WMS service provides visualized observations, 
radar images and model forecasts that are presented in an animation component in MetOClient UI. 
Notice, FMI WMS services are not intended as primary means of accessing open data, and direct use 
of the FMI's WMS service for other than evalutation purposes is not allowed because of the high 
network bandwidth and processing requirements.

You may also want to see these MetOClient related projects:
* [MetOLib](https://github.com/fmidev/metolib)
* [openlayers-animation](https://github.com/fmidev/openlayers-animation)

Folder structure
----------------

Root folder contains this README.md and Grunt files that may be used to build different versions of the library.

* *dist* contains pre-build MetOClient UI that is provided as a release versions. 
         As a default, MetOClient UI uses minified library files. But, non-minified library files are 
         also provided for debugging purposes. Notice, dist -folder content is replaced if grunt builds 
         the project. Therefore, modifications should be implemented in src -folder and built by using grunt. 
         Also notice, when grunt builds MetOClient UI, some of the thirdparty content may be replaced in 
         dist -folder with MetOClient UI specific content from src -folder.
* *examples* contains component specific examples to show how a specific component may be used in HTML
* *doc* contains documentation files that describe MetOClient UI components in more detail:
    * [Animator](doc/animator.md)
    * [Graph](doc/graph.md)
    * [Build](doc/build.md)
* *src* contains actual source files that may be used as a reference and are used to create *release* content 
        into *dist* -folder when Grunt is used. Notice, source components may not work properly if used directly in 
        *src* -folder. Therefore, if you modify sources, use grunt to build MetOClient UI. Then, dist -folder content 
        can be used for testing. Also notice, existing dist -folder content is replaced by new if you use grunt to build.
* *deps* contains thirdparty libraries that are used by animation library

Browsers
--------

MetOClient UI works well with the major browsers.

But notice, Internet Explorer version 9 or greater is required.
