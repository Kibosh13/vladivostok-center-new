<?php
declare(strict_types=1);
// Beget adapter: public HTML remains pre-rendered; credentials and client data stay outside public_html.
ini_set('display_errors', '0');
umask(0077);
define('PS_BOOTSTRAPPED', true);
define('PS_DEV', getenv('PS_DEV') === '1');
define('PS_ORIGIN', PS_DEV ? 'http://127.0.0.1:3002' : 'https://putksebevladivostok.ru');
define('PS_PRIVATE', getenv('PS_PRIVATE_DIR') ?: dirname(__DIR__) . '/.put-k-sebe-private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: SAMEORIGIN');

function ps_json_read(string $name, array $fallback = []): array {
    $file = PS_PRIVATE . '/' . $name . '.json';
    if (!is_file($file)) return $fallback;
    $value = json_decode((string)file_get_contents($file), true);
    return is_array($value) ? $value : $fallback;
}
function ps_json_write(string $name, array $value): void {
    if (!is_dir(PS_PRIVATE) || !is_writable(PS_PRIVATE)) throw new RuntimeException('Private storage unavailable');
    $file = PS_PRIVATE . '/' . $name . '.json';
    $temp = $file . '.' . bin2hex(random_bytes(6)) . '.tmp';
    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    if (file_put_contents($temp, $json, LOCK_EX) === false) throw new RuntimeException('Storage write failed');
    chmod($temp, 0600);
    if (!rename($temp, $file)) throw new RuntimeException('Storage replacement failed');
}
function ps_escape($value): string { return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function ps_lock(string $name) {
    $handle = fopen(PS_PRIVATE . '/lock-' . hash('sha256', $name), 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) throw new RuntimeException('Storage lock unavailable');
    return $handle;
}
function ps_response(array $value, int $status = 200): never {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
    echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit;
}
function ps_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1');
    session_name('ps_cms');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => !PS_DEV, 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
function ps_same_origin(): bool {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    return $origin !== '' && hash_equals(PS_ORIGIN, $origin);
}
function ps_csrf_ok(string $token): bool {
    ps_session(); return $token !== '' && hash_equals($_SESSION['csrf'], $token) && ps_same_origin();
}
function ps_is_admin(): bool {
    ps_session();
    if (empty($_SESSION['admin']) || (int)($_SESSION['admin_at'] ?? 0) < time() - 1800) return false;
    $_SESSION['admin_at'] = time(); return true;
}
function ps_rate_limit(string $kind, int $max, int $window): bool {
    $cfg = ps_json_read('config');
    $key = hash_hmac('sha256', $kind . '|' . ($_SERVER['REMOTE_ADDR'] ?? ''), $cfg['session_secret'] ?? 'not-configured');
    $file = PS_PRIVATE . '/rate-' . $key . '.json';
    $handle = fopen($file, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) return false;
    $entries = json_decode((string)stream_get_contents($handle), true) ?: [];
    $entries = array_values(array_filter($entries, fn($t) => (int)$t > time() - $window));
    $allowed = count($entries) < $max;
    if ($allowed) $entries[] = time();
    ftruncate($handle, 0); rewind($handle); fwrite($handle, json_encode($entries)); fflush($handle);
    flock($handle, LOCK_UN); fclose($handle); return $allowed;
}
function ps_legal_values(array $content): array {
    global $manifest;
    $values = [];
    foreach ($manifest['legal']['fields'] as $key => $field) $values[$key] = (string)($content['legalFields'][$key] ?? $field['default'] ?? '');
    return $values;
}
function ps_document_data(string $slug, array $content): array {
    global $manifest;
    $saved = $content['documents'][$slug] ?? [];
    // Preserve any owner-supplied legacy text; never replace it silently.
    if (trim((string)($saved['body'] ?? '')) !== '' && empty($saved['templateVersion'])) return $saved + ['missing' => [], 'legacy' => true];
    $template = $manifest['legal']['documents'][$slug];
    $values = ps_legal_values($content); $missing = [];
    foreach ($template['required'] as $key) if (trim($values[$key]) === '') $missing[$key] = $manifest['legal']['fields'][$key]['label'];
    $body = preg_replace_callback('/\{\{([a-z_]+)\}\}/', function ($m) use ($values, $manifest) {
        return trim($values[$m[1]] ?? '') !== '' ? $values[$m[1]] : '[Нужно заполнить: ' . $manifest['legal']['fields'][$m[1]]['label'] . ']';
    }, $template['body']);
    $defaultPublished = !empty($template['defaultPublished']) && empty($saved['templateVersion']);
    $approved = $defaultPublished || (!empty($saved['published']) && hash_equals((string)($saved['approvedHash'] ?? ''), hash('sha256', $body)));
    return ['title' => $manifest['documents'][$slug]['title'], 'body' => $body, 'published' => $approved && !$missing,
        'missing' => $missing, 'legacy' => false, 'templateVersion' => $manifest['legal']['version'], 'updatedAt' => $saved['updatedAt'] ?? $manifest['legal']['version']];
}
function ps_document_ready(string $slug, array $content): bool {
    $doc = ps_document_data($slug, $content);
    return ($doc['published'] ?? false) === true && trim((string)($doc['body'] ?? '')) !== '';
}
function ps_document_revision(string $slug, array $content): string {
    return hash('sha256', json_encode([$content['documents'][$slug] ?? [], $content['legalFields'] ?? []]));
}
function ps_forms_ready(array $content): bool {
    // Document review remains in the CMS; every submission still requires explicit visitor consent.
    return true;
}
function ps_public_document_body(array $doc): string {
    // Unset legal particulars stay unset; do not invent an operator or mark the text approved.
    return preg_replace('/\[Нужно заполнить: [^\]]+\]/u', '—', (string)$doc['body']);
}
function ps_amo_request(string $method, string $path, ?array $payload = null, ?string $tokenOverride = null): array {
    // Fixed allowlist: no update/delete/accept/merge endpoints can be called by this adapter.
    if (!(($method === 'GET' && $path === '/api/v4/account') || ($method === 'POST' && $path === '/api/v4/leads/unsorted/forms'))) {
        throw new RuntimeException('CRM operation not permitted');
    }
    $cfg = ps_json_read('config');
    $token = $tokenOverride ?? ($cfg['amo_token'] ?? '');
    if ($token === '') return ['status' => 503, 'body' => []];
    $ch = curl_init('https://savinovaa18.amocrm.ru' . $path);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 20, CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token, 'Content-Type: application/json', 'Accept: application/json']]);
    if ($payload !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $raw = curl_exec($ch); $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE); curl_close($ch);
    return ['status' => $status, 'body' => is_string($raw) ? (json_decode($raw, true) ?: []) : []];
}
function ps_submit_lead(array $manifest, array $content): never {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') ps_response(['error' => 'Метод не поддерживается'], 405);
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000 || !str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) ps_response(['error' => 'Некорректный запрос'], 400);
    $p = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($p)) ps_response(['error' => 'Некорректные данные'], 400);
    if (!ps_csrf_ok((string)($p['csrf'] ?? ''))) ps_response(['error' => 'Обновите страницу перед отправкой заявки'], 403);
    if (($p['consent'] ?? false) !== true) ps_response(['error' => 'Подтвердите отдельное согласие на обработку персональных данных'], 400);
    if (!empty($p['marketingConsent']) && !ps_document_ready('reklamnye-rassylki', $content)) ps_response(['error' => 'Рекламное согласие пока недоступно'], 400);
    if (trim((string)($p['website'] ?? '')) !== '') ps_response(['error' => 'Не удалось отправить заявку'], 400);
    ps_session();
    if ((int)($_SESSION['form_issued'] ?? 0) > time() - 2) ps_response(['error' => 'Пожалуйста, проверьте поля перед отправкой'], 429);
    $name = mb_substr(trim((string)($p['name'] ?? '')), 0, 120);
    $phone = preg_replace('/[^+0-9]/', '', (string)($p['phone'] ?? ''));
    $email = mb_substr(trim((string)($p['email'] ?? '')), 0, 180);
    if (mb_strlen($name) < 2 || strlen((string)$phone) < 10 || strlen((string)$phone) > 16 || ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL))) ps_response(['error' => 'Проверьте имя, телефон и email'], 400);
    $specialist = (string)($p['specialist'] ?? '');
    $profiles = array_column($manifest['specialists'], null, 'slug');
    if (!isset($profiles[$specialist])) ps_response(['error' => 'Выберите специалиста из списка центра'], 400);
    $requestKey = (string)($p['requestKey'] ?? '');
    if (!preg_match('/^[a-f0-9-]{32,36}$/', $requestKey)) ps_response(['error' => 'Обновите страницу'], 400);
    $id = hash_hmac('sha256', $requestKey, ps_json_read('config')['session_secret']);
    $leadFile = 'lead-' . $id;
    $lock = ps_lock($leadFile);
    if (ps_json_read($leadFile)) ps_response(['lead' => ['id' => $id], 'message' => 'Заявка уже сохранена'], 200);
    if (!ps_rate_limit('lead', 5, 900)) ps_response(['error' => 'Слишком много заявок. Попробуйте позже или позвоните нам'], 429);
    $consentVersions = [];
    foreach (['privacy', 'soglasie-na-obrabotku-dannyh'] as $slug) {
        $doc = ps_document_data($slug, $content);
        $consentVersions[$slug] = ['version' => $doc['updatedAt'] ?? '', 'sha256' => hash('sha256', ps_public_document_body($doc)), 'approved' => ps_document_ready($slug, $content)];
    }
    $lead = ['id' => $id, 'createdAt' => gmdate('c'), 'name' => $name, 'phone' => $phone, 'email' => $email,
        'message' => mb_substr(trim((string)($p['message'] ?? '')), 0, 500), 'specialist' => $specialist,
        'consent' => true, 'consentVersions' => $consentVersions, 'marketingConsent' => !empty($p['marketingConsent']),
        'ipHash' => hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', ps_json_read('config')['session_secret']), 'crmStatus' => 'pending'];
    if ($lead['marketingConsent']) $lead['marketingVersion'] = hash('sha256', ps_document_data('reklamnye-rassylki', $content)['body']);
    ps_json_write($leadFile, $lead);
    $profile = $profiles[$specialist];
    $contact = ['name' => $name, 'custom_fields_values' => [['field_code' => 'PHONE', 'values' => [['value' => $phone]]]]];
    if ($email !== '') $contact['custom_fields_values'][] = ['field_code' => 'EMAIL', 'values' => [['value' => $email]]];
    $payload = [['source_uid' => 'putksebe-' . $id, 'source_name' => 'Сайт Путь к себе · Владивосток', 'created_at' => time(),
        '_embedded' => ['leads' => [['name' => 'Запись · ' . $profile['name'] . ' · ' . $name]], 'contacts' => [$contact]],
        'metadata' => ['form_id' => 'specialist-' . $specialist, 'form_sent_at' => time(),
            'form_name' => 'Запись к ' . $profile['name'] . ($lead['message'] !== '' ? '. Пожелания: ' . $lead['message'] : ''),
            'form_page' => PS_ORIGIN . '/specialisty/' . $specialist . '/', 'referer' => PS_ORIGIN . '/']]];
    $result = ps_amo_request('POST', '/api/v4/leads/unsorted/forms', $payload);
    $new = $result['body']['_embedded']['unsorted'][0] ?? [];
    $lead['crmStatus'] = ($result['status'] === 200 && !empty($new['uid'])) ? 'delivered' : 'needs_check';
    $lead['crmHttpStatus'] = $result['status'];
    if ($lead['crmStatus'] === 'delivered') { $lead['crmUid'] = $new['uid']; $lead['crmLeadId'] = $new['_embedded']['leads'][0]['id'] ?? null; }
    ps_json_write($leadFile, $lead);
    ps_response(['lead' => ['id' => $id], 'message' => 'Заявка сохранена. Администратор согласует с вами время встречи.'], 201);
}

try {
    $manifest = json_decode((string)file_get_contents(__DIR__ . '/.site-manifest.json'), true, 512, JSON_THROW_ON_ERROR);
    $content = ps_json_read('content', ['documents' => [], 'seo' => [], 'resourceTestUrl' => '']);
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    if (str_contains(rawurldecode($uri), '..') || str_contains($uri, '\\')) { http_response_code(404); exit; }
    $path = trim($uri, '/');
    $aliases = ['socialnye-seti' => 'contacts', 'kontakty' => 'contacts', 'o-centre' => 'osnovatel'];
    $route = $aliases[$path] ?? $path;
    if (str_ends_with($route, '/index.html')) $route = substr($route, 0, -11);
    if ($route === 'index.html') $route = '';
    $isPublicPage = isset($manifest['pages'][$route]) || isset($aliases[$path]);
    if (!PS_DEV && (($_SERVER['HTTP_HOST'] ?? '') !== 'putksebevladivostok.ru' || isset($aliases[$path]) || ($isPublicPage && $uri !== '/' . ($route !== '' ? $route . '/' : '')) || $path === 'admin' && $uri !== '/admin/')) {
        if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) ps_response(['error' => 'Используйте основной HTTPS-адрес сайта'], 421);
        $target = $isPublicPage || $path === 'admin' ? '/' . ($route !== '' ? $route . '/' : '') : $uri;
        header('Location: ' . PS_ORIGIN . $target, true, 301); exit;
    }
    if ($path === 'api/leads') ps_submit_lead($manifest, $content);
    if ($path === 'api/form-status') {
        ps_session(); $_SESSION['form_issued'] = time();
        ps_response(['ready' => ps_forms_ready($content), 'csrf' => $_SESSION['csrf'],
            'marketingReady' => ps_document_ready('reklamnye-rassylki', $content), 'resourceTestUrl' => ($content['resourceTestUrl'] ?? '') ?: ($manifest['resourceTestUrl'] ?? '')]);
    }
    if ($path === 'api/amo/callback.php') ps_response(['message' => 'Подключение amoCRM управляется в защищённой админ-панели.'], 400);
    if ($path === 'admin' || str_starts_with($path, 'admin/')) { require __DIR__ . '/beget-admin.php'; exit; }
    if (str_starts_with($path, 'api/')) ps_response(['error' => 'Не найдено'], 404);
    if ($route === 'sitemap.xml') {
        header('Content-Type: application/xml; charset=utf-8');
        echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($manifest['pages'] as $slug => $page) {
            if (empty($page['indexable'])) continue;
            if (isset($manifest['documents'][$slug]) && !ps_document_ready($slug, $content)) continue;
            echo '<url><loc>' . ps_escape(PS_ORIGIN . '/' . ($slug !== '' ? $slug . '/' : '')) . '</loc></url>';
        }
        echo '</urlset>'; exit;
    }
    if ($route === 'robots.txt') { header('Content-Type: text/plain; charset=utf-8'); echo "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /.\nDisallow: /site-runtime.php\n\nSitemap: https://putksebevladivostok.ru/sitemap.xml\n"; exit; }
    if ($route === 'llms.txt') { header('Content-Type: text/plain; charset=utf-8'); echo file_get_contents(__DIR__ . '/.llms-source.txt'); exit; }
    if (!isset($manifest['pages'][$route])) {
        http_response_code(404); header('Content-Type: text/html; charset=utf-8'); header('X-Robots-Tag: noindex');
        echo file_get_contents(__DIR__ . '/404.html'); exit;
    }
    $page = $manifest['pages'][$route];
    $html = (string)file_get_contents(__DIR__ . '/' . $page['file']);
    if (isset($manifest['documents'][$route])) {
        $doc = ps_document_data($route, $content);
        if (!ps_document_ready($route, $content)) {
            header('X-Robots-Tag: noindex, nofollow');
            $html = preg_replace('/<meta name="robots" content="[^"]*">/', '<meta name="robots" content="noindex,nofollow">', $html);
        }
        $html = str_replace('<!--LEGAL_BODY-->', '<div class="legal-document-text">' . ps_escape(ps_public_document_body($doc)) . '</div>', $html);
    }
    if ($route === 'dokumenty') {
        $list = '<section class="legal-documents-list">';
        foreach ($manifest['documents'] as $slug => $doc) {
            $list .= '<a href="/' . ps_escape($slug) . '/"><span>' . ps_escape($doc['title']) . '</span><span>→</span></a>';
        }
        $html = str_replace('<!--DOCUMENT_LIST-->', $list . '</section>', $html);
    }
    $seo = $content['seo'][$route] ?? [];
    if (!empty($seo['title'])) $html = preg_replace_callback('/<title>.*?<\/title>/s', fn() => '<title>' . ps_escape($seo['title']) . '</title>', $html, 1);
    if (!empty($seo['description'])) $html = preg_replace_callback('/<meta name="description" content="[^"]*">/', fn() => '<meta name="description" content="' . ps_escape($seo['description']) . '">', $html, 1);
    $testUrl = (string)(($content['resourceTestUrl'] ?? '') ?: ($manifest['resourceTestUrl'] ?? ''));
    if ($testUrl !== '') {
        $html = preg_replace_callback('/data-resource-test-link href="[^"]*"/', fn() => 'data-resource-test-link href="' . ps_escape($testUrl) . '"', $html);
        $html = str_replace('<!--TEST_ACTION-->', '<a class="button" href="' . ps_escape($testUrl) . '" target="_blank" rel="noreferrer">Пройти тест →</a>', $html);
    } else $html = str_replace('<!--TEST_ACTION-->', '<p class="resource-note">Ссылка на Яндекс Форму скоро появится.</p>', $html);
    header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: public, max-age=60, must-revalidate');
    echo $html;
} catch (Throwable $error) {
    // Never disclose stack traces, credentials, client details or upstream response bodies.
    http_response_code(503); header('Content-Type: text/plain; charset=utf-8'); header('Cache-Control: no-store');
    echo 'Сервис временно недоступен. Свяжитесь с центром по телефону +7 914 665-86-53.';
}
