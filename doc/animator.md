MetOClient UI: Animator
=======================

MetOClient UI implements *animator* component to present and control Web Map Service (WMS) 
content in a web page.

Animator component uses [https://github.com/fmidev/openlayers-animation](OpenLayers animation add-in) 
library to manage animations as [http://openlayers.org/](OpenLayers) layers. Also, animator includes 
animation controller UI components to control animation content.

You may also want to see these MetOClient related projects:
* [https://github.com/fmidev/openlayers-animation](openlayers-animation)

Usage
-----

Animator uses configuration object to initialize animation. An example configuration file is provided as 
*components/animator/js/config.js* file. Its source code is well commented to give information on how animator 
can be configured. Also, *examples/animator.html* shows an example on how to use animator component in HTML.

Notice, examples require that proper FMI API-key is set into URLs in configurations.

FMI WMS information
-------------------

FMI WMS service provides visualized observations, radar images and model forecasts that are presented 
in an animation component in MetOClient UI. Notice, FMI WMS services are not intended as primary means 
of accessing open data, and direct use of the FMI's WMS service for other than evalutation purposes is 
not allowed because of the high network bandwidth and processing requirements.

You may register for FMI API-key in [http://en.ilmatieteenlaitos.fi/open-data-manual](FMI Open data manual).
