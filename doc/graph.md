MetOClient UI: Graph
====================

MetOClient UI implements *graph* component to present and control FMI Web Feature Service (WFS) 
content in a web page.

Graph component uses [https://github.com/fmidev/metolib](metolib) library to query WFS data from FMI WFS service. 
Also, graph presents received data as [http://www.flotcharts.org/](flot) graph and provides controllers to control 
graph content.

You may also want to see these MetOClient related projects:
* [https://github.com/fmidev/metolib](MetOLib)

Usage
-----

MetOClient UI *examples/graph.html* shows how *graph* component may be configured and included into HTML.

Notice, FMI WFS service requires that proper FMI API-key is set into query URLs.

FMI WFS information
-------------------

You may register for FMI API-key in [http://en.ilmatieteenlaitos.fi/open-data-manual](FMI Open data manual).
