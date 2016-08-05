# Normdatendienst-UI

Dieses Repository enthält das Webinterface des Normdatendienst. Die Anwendung
stellt eine einheitliche Oberfläche zum Browsing in verschiedenen Normdateien
(Knowledge Organization Systems, KOS) bereit. 

Die Umsetzung basiert auf JavaScript mit dem AngularJS-Framework. Wesentliche
Teile der Implementierung sind als eigenständiges AngularJS-Module
[ng-skos](http://gbv.github.io/ng-skos/) verfügbar.

## Hintergrund

Grundlagen für den Zugriff auf die Normdateien sind das 
[JSKOS Datenformat](https://gbv.github.io/jskos/) und die
[ELMA API](http://gbv.github.io/elma/).

## Testinstallation

Unter <https://normdatendienst.herokuapp.com/> läuft eine Testinstallation, die
beim Update des Code-Repository auf GitHub automatisch aktualisiert wird. Der
Dienst kann zeitweise nicht erreichbar sein.

## Installation und Konfiguration

Zur Installation von Abhängigkeiten muss zunächst folgendes Kommando aufgerufen
werden. Die benötigten Dateien befinden sich anschließend unter `node_modules`:

    npm install

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

## Feedback

Bug-Reports und Feature-Request können direkt bei GitHub unter
<https://github.com/gbv/normdatendienst-ui/issues> eintragen werden.

