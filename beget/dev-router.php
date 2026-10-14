<?php
declare(strict_types=1);
if (getenv('PS_DEV') !== '1') { http_response_code(404); exit; }
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
if (preg_match('#^/(?:images/[^.][^\\\\]*|site\.css|demo\.js|site-ui\.js|beget-admin\.css|favicon\.svg|googlef2660784658c6c2f\.html|llms\.txt)$#', $path) && !str_contains($path, '..') && is_file(__DIR__ . $path)) return false;
require __DIR__ . '/site-runtime.php';
