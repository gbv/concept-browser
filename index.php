<?php
/**
 * Liefert index.html aus und ersetzt dabei ggf. einige Werte.
 */
$html = file_get_contents('index.html');
$baseURL = getenv('SCHEMES_BASE_URL');
if ($baseURL) {
  $html = preg_replace("/ng-init=\"baseURL=[^\"]+\"/",
                       "ng-init=\"baseURL='$baseURL'\"", $html);
}
echo $html;
echo "<!-- via PHP -->";
