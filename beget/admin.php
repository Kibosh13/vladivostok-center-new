<?php
declare(strict_types=1);
if (!defined('PS_BOOTSTRAPPED')) { http_response_code(404); exit; }
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: no-store'); header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; frame-src 'self'; form-action 'self'");
ps_session();
$cfg = ps_json_read('config');
$message = '';
$isAdmin = ps_is_admin();
if (trim(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH),'/') === 'admin/instruction') { http_response_code(404); echo 'Страница не найдена.'; exit; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!ps_csrf_ok((string)($_POST['csrf'] ?? ''))) { http_response_code(403); $message = 'Обновите страницу: проверка безопасности не пройдена.'; }
    else {
        $mutationLock = ps_lock('cms-mutations');
        $cfg = ps_json_read('config');
        $action = (string)($_POST['action'] ?? '');
        try {
            if ($action === 'activate' && empty($cfg['admin'])) {
                if (!ps_rate_limit('activate', 8, 900)) throw new RuntimeException('Слишком много попыток. Повторите позже.');
                if (empty($cfg['setup_hash']) || !hash_equals($cfg['setup_hash'], hash('sha256', (string)($_POST['activation'] ?? '')))) throw new RuntimeException('Проверьте код активации.');
                $username = trim((string)($_POST['username'] ?? ''));
                $password = (string)($_POST['password'] ?? '');
                if (!preg_match('/^[a-zA-Z0-9_.@-]{3,60}$/', $username) || strlen($password) < 14) throw new RuntimeException('Логин: от 3 символов латиницей. Пароль: не менее 14 символов.');
                $cfg['admin'] = ['username' => $username, 'password_hash' => password_hash($password, PASSWORD_DEFAULT)];
                unset($cfg['setup_hash']); ps_json_write('config', $cfg); session_regenerate_id(true);
                if (is_file(PS_PRIVATE . '/activation-code.txt')) unlink(PS_PRIVATE . '/activation-code.txt');
                $_SESSION['admin'] = $username; $_SESSION['admin_at'] = time(); $_SESSION['admin_fingerprint']=hash('sha256',$cfg['admin']['password_hash']); $isAdmin = true;
                $message = 'Админ-панель активирована. Одноразовый код больше не действует.';
            } elseif ($action === 'login') {
                if (!ps_rate_limit('login', 10, 900)) throw new RuntimeException('Слишком много попыток. Повторите позже.');
                if (empty($cfg['admin']) || !hash_equals($cfg['admin']['username'], (string)($_POST['username'] ?? '')) || !password_verify((string)($_POST['password'] ?? ''), $cfg['admin']['password_hash'])) throw new RuntimeException('Проверьте логин и пароль.');
                session_regenerate_id(true); $_SESSION['admin'] = $cfg['admin']['username']; $_SESSION['admin_at'] = time(); $_SESSION['admin_fingerprint']=hash('sha256',$cfg['admin']['password_hash']); $isAdmin = true;
            } elseif ($action === 'logout' && $isAdmin) {
                $_SESSION = []; session_regenerate_id(true); $isAdmin = false;
            } elseif (!$isAdmin) { http_response_code(401); throw new RuntimeException('Требуется вход.'); }
            elseif ($action==='account_password') {
                if(!ps_rate_limit('admin-password',5,900))throw new RuntimeException('Слишком много попыток смены пароля. Повторите позже.');
                $password=(string)($_POST['new_password']??'');
                if(!password_verify((string)($_POST['current_password']??''),$cfg['admin']['password_hash']))throw new RuntimeException('Текущий пароль указан неверно.');
                if(strlen($password)<14||strlen($password)>200||!hash_equals($password,(string)($_POST['repeat_password']??'')))throw new RuntimeException('Новый пароль: от 14 до 200 символов. Повтор должен совпадать.');
                $cfg['admin']['password_hash']=password_hash($password,PASSWORD_DEFAULT);ps_json_write('config',$cfg);session_regenerate_id(true);$_SESSION['admin_fingerprint']=hash('sha256',$cfg['admin']['password_hash']);
                $message='Пароль изменён. В остальных браузерах потребуется повторный вход. Подключение amoCRM не изменялось.';
            }
            elseif (str_starts_with($action, 'cms_')) { $message = $action === 'cms_upload' ? ps_cms_upload() : ps_cms_action($action); }
            elseif ($action === 'document') {
                $slug = (string)($_POST['slug'] ?? '');
                if (!isset($manifest['documents'][$slug])) throw new RuntimeException('Неизвестный документ.');
                $content = ps_json_read('content', ['documents' => [], 'seo' => [], 'resourceTestUrl' => '']);
                $revision = ps_document_revision($slug, $content);
                if (!hash_equals((string)$revision, (string)($_POST['revision'] ?? ''))) throw new RuntimeException('Документ уже изменён. Обновите страницу, чтобы не перезаписать чужую правку.');
                $doc = ps_document_data($slug, $content); $published = isset($_POST['published']);
                if ($published && $doc['missing']) throw new RuntimeException('Сначала заполните: ' . implode('; ', $doc['missing']) . '.');
                $content['documents'][$slug] = ['title' => $manifest['documents'][$slug]['title'], 'body' => $doc['body'], 'published' => $published, 'updatedAt' => gmdate('c')];
                if (!$doc['legacy']) $content['documents'][$slug] += ['templateVersion' => $manifest['legal']['version'], 'approvedHash' => $published ? hash('sha256', $doc['body']) : ''];
                ps_json_write('content', $content); $message = $published ? 'Документ опубликован.' : 'Черновик сохранён.';
            } elseif ($action === 'legal_fields') {
                $content = ps_json_read('content', ['documents' => [], 'seo' => [], 'resourceTestUrl' => '']);
                if (!hash_equals(hash('sha256', json_encode($content['legalFields'] ?? [])), (string)($_POST['revision'] ?? ''))) throw new RuntimeException('Реквизиты уже изменены. Обновите страницу.');
                $values = [];
                foreach ($manifest['legal']['fields'] as $key => $field) {
                    $value = trim((string)($_POST['fields'][$key] ?? ''));
                    if (mb_strlen($value) > 8000 || str_contains($value, '{{') || str_contains($value, '[Нужно заполнить:')) throw new RuntimeException('Проверьте поле: ' . $field['label']);
                    if ($value !== '' && $field['type'] === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) throw new RuntimeException('Проверьте email для обращений.');
                    if ($value !== '' && $field['type'] === 'inn' && !preg_match('/^(\d{10}|\d{12})$/', $value)) throw new RuntimeException('ИНН должен содержать 10 или 12 цифр.');
                    $values[$key] = $value;
                }
                $content['legalFields'] = $values;
                ps_json_write('content', $content); $message = 'Реквизиты сохранены и подставлены во все проекты. Изменённые опубликованные шаблоны нужно проверить и утвердить повторно.';
            } elseif ($action === 'seo') {
                $slug = (string)($_POST['slug'] ?? '');
                if (!isset($manifest['pages'][$slug]) || empty($manifest['pages'][$slug]['indexable'])) throw new RuntimeException('Неизвестная страница.');
                $title = trim((string)($_POST['title'] ?? '')); $description = trim((string)($_POST['description'] ?? ''));
                if ($title === '' || $description === '' || mb_strlen($title) > 250 || mb_strlen($description) > 500) throw new RuntimeException('Заполните Title (до 250 символов) и Description (до 500).');
                $content = ps_json_read('content', ['documents' => [], 'seo' => [], 'resourceTestUrl' => '']);
                $content['seo'][$slug] = ['title' => $title, 'description' => $description, 'updatedAt' => gmdate('c')];
                ps_json_write('content', $content); $message = 'SEO-поля сохранены. Canonical управляется автоматически.';
            } elseif ($action === 'settings') {
                $testUrl = trim((string)($_POST['test_url'] ?? ''));
                if ($testUrl !== '' && (!filter_var($testUrl, FILTER_VALIDATE_URL) || parse_url($testUrl, PHP_URL_SCHEME) !== 'https' || !in_array(parse_url($testUrl, PHP_URL_HOST), ['forms.yandex.ru', 'forms.yandex.com'], true))) throw new RuntimeException('Укажите HTTPS-ссылку на forms.yandex.ru или forms.yandex.com.');
                $content = ps_json_read('content', ['documents' => [], 'seo' => [], 'resourceTestUrl' => '']);
                $token = trim((string)($_POST['amo_token'] ?? ''));
                if ($token !== '') {
                    if (strlen($token) < 40 || strlen($token) > 10000 || preg_match('/\s/', $token)) throw new RuntimeException('Проверьте токен amoCRM.');
                    $probe = ps_amo_request('GET', '/api/v4/account', null, $token);
                    if ($probe['status'] !== 200 || (int)($probe['body']['id'] ?? 0) !== 31638334) throw new RuntimeException('Токен не подтверждён для аккаунта savinovaa18. Старые настройки подключения сохранены.');
                    $cfg['amo_token'] = $token; $cfg['amo_verified_at'] = gmdate('c'); ps_json_write('config', $cfg);
                }
                $content['resourceTestUrl'] = $testUrl; ps_json_write('content', $content);
                $message = 'Настройки сохранены. Существующие данные amoCRM не изменялись.';
            } elseif ($action === 'crm_check') {
                $probe = ps_amo_request('GET', '/api/v4/account');
                $message = $probe['status'] === 200 && (int)($probe['body']['id'] ?? 0) === 31638334 ? 'Авторизация в amoCRM подтверждена. Проверка только чтением, без создания сделок.' : 'Подключение требует проверки токена; данные CRM не изменялись.';
            }
        } catch (RuntimeException $e) { $message = $e->getMessage(); }
    }
}
$content = ps_json_read('content', ['documents' => [], 'seo' => [], 'resourceTestUrl' => '']);
$tab = in_array($_GET['tab'] ?? '', ['overview','pages','global','media','history','help','documents','seo','settings','leads'], true) ? $_GET['tab'] : 'overview';
$csrf = ps_escape($_SESSION['csrf']);
$cmsAssetVersion=substr(hash('sha256',hash_file('sha256',__DIR__.'/beget-admin.css').hash_file('sha256',__DIR__.'/beget-admin.js')),0,12);
function ps_admin_csrf(): void { echo '<input type="hidden" name="csrf" value="' . ps_escape($_SESSION['csrf']) . '">'; }
?><!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Управление сайтом — Путь к себе</title><link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/beget-admin.css?v=<?= $cmsAssetVersion ?>"><script defer src="/beget-admin.js?v=<?= $cmsAssetVersion ?>"></script><link rel="icon" href="/favicon.svg"></head><body class="cms-body">
<main class="cms-shell"><header class="cms-header"><a href="/"><img src="/images/brand/logo-put-k-sebe.png" alt="Путь к себе" width="160" height="86"></a><div><span class="section-label">Путь к себе · CMS</span><h1>Управление сайтом</h1></div><a href="/" target="_blank">Открыть сайт →</a></header>
<?php if ($message !== ''): ?><p class="cms-message" role="status"><?= ps_escape($message) ?></p><?php endif; ?>
<?php if (!$isAdmin): ?>
<section class="cms-login"><h2><?= empty($cfg['admin']) ? 'Активация админ-панели' : 'Вход в админ-панель' ?></h2><p>Доступ только для владельца сайта. Пароль хранится на сервере в виде стойкого хеша, не в исходниках.</p>
<form method="post" action="/admin/"><?php ps_admin_csrf(); ?><input type="hidden" name="action" value="<?= empty($cfg['admin']) ? 'activate' : 'login' ?>">
<?php if (empty($cfg['admin'])): ?><label>Одноразовый код активации<input name="activation" autocomplete="off" required></label><?php endif; ?>
<label>Логин<input name="username" autocomplete="username" minlength="3" maxlength="60" required></label><label>Пароль<input type="password" name="password" autocomplete="<?= empty($cfg['admin']) ? 'new-password' : 'current-password' ?>" minlength="<?= empty($cfg['admin']) ? '14' : '1' ?>" required></label>
<button class="button" type="submit"><?= empty($cfg['admin']) ? 'Активировать' : 'Войти' ?></button></form></section>
<?php else: ?>
<nav class="cms-tabs" aria-label="Разделы управления"><?php foreach(['overview'=>'Обзор','pages'=>'Страницы и контент','global'=>'Общие элементы','media'=>'Медиатека','documents'=>'Документы','seo'=>'SEO','leads'=>'Заявки','history'=>'История','settings'=>'Тест и amoCRM','help'=>'Помощь'] as $key=>$label): ?><a href="/admin/?tab=<?= $key ?>" <?= $tab === $key ? 'aria-current="page"' : '' ?>><?= $label ?></a><?php endforeach; ?><form method="post" action="/admin/"><?php ps_admin_csrf(); ?><input type="hidden" name="action" value="logout"><button type="submit">Выйти</button></form></nav>
<?php if (in_array($tab,['overview','pages','global','media','history','help'],true)): require __DIR__.'/beget-editor-ui.php'; ?>
<?php elseif ($tab === 'documents'): ?>
<section class="cms-panel"><h2>Готовые тексты документов</h2><p>Семь документов уже подготовлены. Здесь заполняются только неизвестные реквизиты и условия, а не весь текст. Общие сведения автоматически подставляются во все документы. Приём заявок включён по решению владельца независимо от статуса документов; отдельное согласие посетителя обязательно. Перед полноценным использованием сайта заполните реквизиты и проверьте тексты. Незаполненные сведения в публичных текстах обозначены прочерком; это не утверждённые владельцем документы.</p>
<details class="cms-document" open><summary>Реквизиты и недостающие условия</summary><form method="post" action="/admin/"><?php ps_admin_csrf(); ?><input type="hidden" name="action" value="legal_fields"><input type="hidden" name="revision" value="<?= ps_escape(hash('sha256', json_encode($content['legalFields'] ?? []))) ?>"><div class="cms-legal-fields">
<?php $legalValues = ps_legal_values($content); foreach ($manifest['legal']['fields'] as $key => $field): ?><label><?= ps_escape($field['label']) ?><?php if ($field['type'] === 'textarea'): ?><textarea name="fields[<?= ps_escape($key) ?>]" rows="3" maxlength="8000"><?= ps_escape($legalValues[$key]) ?></textarea><?php else: ?><input name="fields[<?= ps_escape($key) ?>]" type="<?= $field['type'] === 'email' ? 'email' : 'text' ?>" value="<?= ps_escape($legalValues[$key]) ?>" maxlength="8000"><?php endif; ?><small><?= ps_escape($field['hint']) ?></small></label><?php endforeach; ?></div><button class="button" type="submit">Сохранить реквизиты и условия</button></form></details>
<?php foreach ($manifest['documents'] as $slug => $definition): $doc = ps_document_data($slug, $content); ?>
<details class="cms-document"><summary><?= ps_escape($definition['title']) ?><span><?= ps_document_ready($slug, $content) ? 'Действующий документ' : 'Подготовлен · требуется утверждение' ?></span></summary><?php if ($doc['missing']): ?><p class="cms-missing">Осталось заполнить: <?= ps_escape(implode('; ', $doc['missing'])) ?>.</p><?php endif; ?><div class="cms-legal-preview"><?= ps_escape($doc['body']) ?></div><form method="post" action="/admin/"><?php ps_admin_csrf(); ?><input type="hidden" name="action" value="document"><input type="hidden" name="slug" value="<?= ps_escape($slug) ?>"><input type="hidden" name="revision" value="<?= ps_escape(ps_document_revision($slug, $content)) ?>"><label class="cms-check"><input type="checkbox" name="published" <?= ps_document_ready($slug, $content) ? 'checked' : '' ?>> Текст и заполненные сведения проверены владельцем — утвердить</label><p class="cms-note">Адрес: <a href="/<?= ps_escape($slug) ?>/" target="_blank">/<?= ps_escape($slug) ?>/</a>. Утверждение текста не предоставляет согласия за посетителей.</p><button class="button" type="submit">Сохранить статус документа</button></form></details>
<?php endforeach; ?></section>
<?php elseif ($tab === 'seo'): ?>
<section class="cms-panel"><h2>SEO-поля страниц</h2><p>Title и Description редактируются отдельно. Канонические адреса и карта сайта обновляются автоматически.</p>
<?php foreach ($manifest['pages'] as $slug => $page): if (empty($page['indexable']) || isset($manifest['documents'][$slug])) continue; $seo = $content['seo'][$slug] ?? $page; ?>
<details class="cms-document"><summary>/<?= ps_escape($slug) ?><?= $slug !== '' ? '/' : '' ?></summary><form method="post" action="/admin/?tab=seo"><?php ps_admin_csrf(); ?><input type="hidden" name="action" value="seo"><input type="hidden" name="slug" value="<?= ps_escape($slug) ?>"><label>Title<input name="title" value="<?= ps_escape($seo['title'] ?? '') ?>" maxlength="250" required></label><label>Description<textarea name="description" maxlength="500" rows="3" required><?= ps_escape($seo['description'] ?? '') ?></textarea></label><button class="button" type="submit">Сохранить SEO</button></form></details>
<?php endforeach; ?></section>
<?php elseif ($tab === 'settings'): ?>
<section class="cms-panel"><h2>Тест на ресурсность и amoCRM</h2><p>Расшифровку теста делает лично Алёна Савинова. Кнопки сайта сразу открывают Яндекс Форму; ссылку можно заменить ниже.</p><form method="post" action="/admin/?tab=settings"><?php ps_admin_csrf(); ?><input type="hidden" name="action" value="settings"><label>Ссылка на Яндекс Форму<input type="url" name="test_url" placeholder="https://forms.yandex.ru/..." value="<?= ps_escape(($content['resourceTestUrl'] ?? '') ?: ($manifest['resourceTestUrl'] ?? '')) ?>"></label><label>Новый токен отдельной интеграции amoCRM<input type="password" name="amo_token" autocomplete="off" value="" placeholder="Оставьте пустым, чтобы сохранить текущее подключение"></label><p class="cms-note">Аккаунт фиксирован: savinovaa18.amocrm.ru. Токен сохраняется вне public_html; в HTML, JavaScript и Git он не попадает. Адаптер создаёт только новые заявки в «Неразобранном», не изменяет существующие сущности.</p><button class="button" type="submit">Сохранить настройки</button></form><hr><p>amoCRM: <?= empty($cfg['amo_token']) ? 'не подключена' : 'токен установлен' ?>. Форма: приём заявок включён; проверьте реквизиты и утвердите документы.</p><form method="post" action="/admin/?tab=settings"><?php ps_admin_csrf(); ?><input type="hidden" name="action" value="crm_check"><button class="button button-light" type="submit">Проверить подключение без записи в CRM</button></form></section>
<section class="cms-panel cms-account-panel"><h2>Доступ к админ-панели</h2><p>Логин: <strong><?= ps_escape($cfg['admin']['username']) ?></strong>. Новый пароль задаёт владелец. Смена пароля завершает доступ старых сессий в других браузерах и не меняет интеграцию amoCRM.</p><form method="post" action="/admin/?tab=settings"><?php ps_admin_csrf(); ?><input type="hidden" name="action" value="account_password"><label>Текущий пароль<input type="password" name="current_password" autocomplete="current-password" required></label><label>Новый пароль<input type="password" name="new_password" minlength="14" maxlength="200" autocomplete="new-password" required></label><label>Повторите новый пароль<input type="password" name="repeat_password" minlength="14" maxlength="200" autocomplete="new-password" required></label><button class="button button-light" type="submit">Изменить пароль</button></form></section>
<?php else: ?>
<section class="cms-panel"><h2>Заявки сайта</h2><p>Здесь показаны только заявки этого сайта. Существующие сделки и контакты amoCRM не импортируются и не редактируются. Заявки с неопределённым результатом доставки нужно проверить вручную: автоматической повторной отправки нет.</p>
<?php $files = glob(PS_PRIVATE . '/lead-*.json') ?: []; rsort($files); if (!$files): ?><p>Заявок пока нет.</p><?php endif; foreach (array_slice($files, 0, 100) as $file): $lead = json_decode((string)file_get_contents($file), true) ?: []; ?>
<article class="cms-lead"><h3><?= ps_escape($lead['name'] ?? '') ?></h3><p><?= ps_escape($lead['phone'] ?? '') ?> · <?= ps_escape($lead['email'] ?? '') ?></p><p>Специалист: <?= ps_escape($lead['specialist'] ?? '') ?> · <?= ps_escape($lead['createdAt'] ?? '') ?></p><p><?= ps_escape($lead['message'] ?? '') ?></p><p>CRM: <?= ps_escape($lead['crmStatus'] ?? '') ?> · Рекламное согласие: <?= !empty($lead['marketingConsent']) ? 'да' : 'нет' ?></p></article>
<?php endforeach; ?></section>
<?php endif; endif; ?></main></body></html>
