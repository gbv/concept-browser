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

### Voraussetzungen

* Webserver
* nodejs
* JSKOS-API Webservice(s) (siehe Beispiele unter [jskos-php-examples](https://github.com/gbv/jskos-php-examples))
* PHP (empfohlen)

### Einrichtung

Nach dem Kopieren der Anwendungsdateien in ein Webserver-Verzeichnis werden
mit `npm install` alle benötigten JavaScript-Module in das Unterverzeichnis
`node_modules` installiert:

    $ git clone https://github.com/gbv/normdatendienst-ui.git directory
    $ cd directory
    $ npm install

Die Anwendung ist in der Standardkonfiguration als statische Webseite
(`index.html`) nutzbar. Die Verwendung von PHP ermöglicht darüber hinaus
eigene Einstellungen per Konfigurationsdatei und/oder Umgebungsvariablen.

### Installation mit PHP

Zur Installation als dynamisches PHP-Script (`index.php`) ist darauf zu achten,
dass `index.php` statt `index.html` geladen wird.  Für die Installation unter
Apache-Webserver kann beispielsweise folgender folgender Eintrag in der Datei
`.htaccess` notwendig sein:

    DirectoryIndex index.php index.html 

Falls eine Datei mit dem Namen `config.php` existiert wird diese geladen, um
die PHP-Variable `$config` zu setzen. Im einfachsten Fall definiert die Datei
einfach ein entsprechendes Array:

~~~php
<?php
$config = [
  'SCHEMES_BASE_URL' => 'http://example.org/',
  ...
];
~~~

Einträge in der Konfigurationsdatei können per Umgebungsvariable überschrieben
werden. Beispielsweise verwendet setzt die Testinstallation unter 
<https://normdatendienst.herokuapp.com/> die Variable SCHEMES_BASE_URL
auf <https://jskos-php-examples.herokuapp.com/>.

## Konfiguration

* **SCHEMES_BASE_URL**: 
  Basis-URL für Webservices die in `schemes.json` beschrieben sind.
  Standardmäßig wird der Wert <http://localhost:8080/> verwendet.

## Feedback

Bug-Reports und Feature-Request können direkt bei GitHub unter
<https://github.com/gbv/normdatendienst-ui/issues> eintragen werden.

