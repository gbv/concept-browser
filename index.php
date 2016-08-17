<?php
/**
 * Liefert index.html aus und ersetzt dabei ggf. einige Werte.
 */
$html = file_get_contents('index.html');
$config = [ ];
if (file_exists('config.php')) {
  include 'config.php';
}
if (getenv('SCHEMES_BASE_URL') !== FALSE) {
  $config['SCHEMES_BASE_URL'] = getenv('SCHEMES_BASE_URL');
}
if (isset($config['SCHEMES_BASE_URL'])) {
  $url  = $config['SCHEMES_BASE_URL'];
  $html = preg_replace("/ng-init=\"baseURL=[^\"]+\"/",
                       "ng-init=\"baseURL='$url'\"", $html);
}
echo $html;
echo "<!-- via PHP -->";
