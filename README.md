# Normdatendienst-UI

Dieses Repository enthält das Webinterface des Normdatendienst.

Der Normdatendienst ermöglicht Abfrage und Browsing in von verschiedenen
Normdateien (Knowledge Organization Systems, KOS) auf Basis des
[JSKOS Datenformat](https://gbv.github.io/jskos/) und der 
[ELMA API](http://gbv.github.io/elma/).

Die Umsetzung in JavaScript basiert auf AngularJS.

## Installation und Konfiguration

Die Anwendung kann sowohl als statische Webseite (`index.html`) als auch
dynamisch als PHP-Script (`index.php`) verwendet werden. Bei der Installation
mit PHP ist darauf zu achten, dass `index.php` statt `index.html` geladen wird.

Für die Installation unter Apache-Webserver kann beispielsweise folgender
folgender Eintrag in der Datei `.htaccess` notwendig sein:

    DirectoryIndex index.php index.html 

Bei Verwendung als PHP-Script kann mit der Umgebungsvariable `SCHEMES_BASE_URL`
eine Basis-URL für Normdatendienste festgelegt werden.  Standardmäßig und
Verwendung als Webinterface als statische HTML-Seite wird der Wert
<http://localhost:8080/> verwendet. Die Test-Installation auf Heroku
verwendet dagegen <https://jskos-php-examples.herokuapp.com/>.

