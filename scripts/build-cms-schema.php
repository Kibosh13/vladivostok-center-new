<?php
declare(strict_types=1);
// Run only by the local build. The generated manifest contains public content, never credentials.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = $argv[1] ?? '';
if (!is_file($root . '/.site-manifest.json')) throw new RuntimeException('Missing page manifest');
$manifest = json_decode(file_get_contents($root . '/.site-manifest.json'), true, 512, JSON_THROW_ON_ERROR);
$schema = ['version' => 1, 'pages' => [], 'global' => ['title' => 'Шапка, меню, подвал и мессенджеры', 'groups' => [], 'fields' => [], 'lists' => [], 'blocks' => []]];
function cms_has(DOMElement $node, string $class): bool { return in_array($class, preg_split('/\s+/', $node->getAttribute('class')), true); }
function cms_short(string $value, int $length = 75): string { return mb_substr(trim(preg_replace('/\s+/u', ' ', $value)), 0, $length); }
function cms_heading(DOMNode $node): string {
    foreach (['h1','h2','h3','figcaption'] as $tag) if ($node instanceof DOMElement && $node->getElementsByTagName($tag)->length) return cms_short($node->getElementsByTagName($tag)->item(0)->textContent);
    return cms_short($node->textContent, 65);
}
foreach ($manifest['pages'] as $slug => $page) {
    $globalOnly=isset($manifest['documents'][$slug]) || $slug === 'dokumenty';
    $dom = new DOMDocument('1.0','UTF-8'); libxml_use_internal_errors(true);
    $dom->loadHTML(file_get_contents($root . '/' . $page['file']), LIBXML_NOERROR | LIBXML_NOWARNING); libxml_clear_errors();
    $dom->encoding='UTF-8';
    $xp = new DOMXPath($dom);
    $schema['pages'][$slug] = ['title' => cms_heading($dom->getElementsByTagName('body')->item(0)), 'groups' => [], 'fields' => [], 'lists' => [], 'blocks' => []];
    $entries = [];
    // Identify repeatable card/photo/video lists before wrapping individual fields.
    foreach ($xp->query('//*[@class] | //body//ul | //body//ol') as $node) {
        $listTag=in_array($node->tagName,['ul','ol'],true);
        if($listTag){$parent=$node->parentNode;while($parent instanceof DOMElement){if(in_array($parent->tagName,['ul','ol','form','nav','header','footer'],true)){$listTag=false;break;}$parent=$parent->parentNode;}}
        if (!$listTag&&!array_intersect(preg_split('/\s+/', $node->getAttribute('class')), ['program-grid','specialist-grid','interior-grid','event-archive-grid','album-photo-grid','album-video-grid','credentials-grid','science-grid','review-stack','results-grid'])) continue;
        $id = 'l' . substr(hash('sha256', $slug . '|' . $node->getNodePath()), 0, 14);
        $list = ['label' => cms_heading($node->parentNode), 'blocks' => []];
        foreach (iterator_to_array($node->childNodes) as $child) {
            if (!$child instanceof DOMElement) continue;
            $bid = 'b' . substr(hash('sha256', $slug . '|' . $child->getNodePath()), 0, 14);
            $child->setAttribute('data-cms-block', $bid);
            $list['blocks'][] = $bid;
            $schema['pages'][$slug]['blocks'][$bid] = ['label' => cms_heading($child) ?: 'Фотография / карточка', 'list' => $id, 'fields' => []];
        }
        $node->setAttribute('data-cms-list', $id);
        $schema['pages'][$slug]['lists'][$id] = $list;
    }
    $nodes = iterator_to_array($xp->query('//body//text()[normalize-space()] | //body//img | //body//a[@href] | //body//video | //body//source[@src]'));
    foreach ($nodes as $node) {
        $el = $node instanceof DOMElement ? $node : $node->parentNode;
        $ancestor = $el; $skip = false; $scope = $slug; $group = null; $block = null; $globalRoot = null;
        while ($ancestor instanceof DOMElement) {
            if (in_array(strtolower($ancestor->tagName), ['script','style','svg','noscript','form','button','option'], true)) $skip = true;
            if ($ancestor->hasAttribute('data-cms-block') && $block === null) $block = $ancestor->getAttribute('data-cms-block');
            if ($ancestor->tagName === 'section' && $group === null) $group = $ancestor;
            if (cms_has($ancestor, 'site-header') || cms_has($ancestor, 'site-footer') || cms_has($ancestor, 'floating-messengers')) $globalRoot = $ancestor;
            $ancestor = $ancestor->parentNode;
        }
        if ($skip) continue;
        $sharedText=$node instanceof DOMText&&in_array(trim($node->nodeValue),['Владивосток','+7 914 665-86-53','Владивосток, ул. Бестужева, 21Б, этаж 2'],true);
        $sharedLink=$node instanceof DOMElement&&$node->tagName==='a'&&preg_match('#^(?:tel:|mailto:|tg://|https://(?:wa\.me/|t\.me/centre_pathtoyourself|vk\.ru/putkseberu|www\.instagram\.com/itc\.put_k_sebe))#',$node->getAttribute('href'));
        $shared=$sharedText||$sharedLink;
        $isGlobal = $globalRoot !== null || $shared;
        if($globalOnly&&!$isGlobal)continue;
        if ($isGlobal) {
            $scope = '@global'; $group = $globalRoot; $block = null;
            $rootClass = $shared ? 'contacts' : (cms_has($globalRoot,'site-header') ? 'header' : (cms_has($globalRoot,'site-footer') ? 'footer' : 'messengers'));
            $groupKey = $rootClass;
            $groupLabel = ['header'=>'Шапка и навигация','footer'=>'Подвал и социальные сети','messengers'=>'Плавающие кнопки связи','contacts'=>'Единые контакты, город и адрес'][$rootClass];
            $path = $shared ? 'shared:'.trim($sharedText?$node->nodeValue:$node->getAttribute('href')) : substr($node->getNodePath(), strlen($globalRoot->getNodePath()));
        } else {
            $groupKey = 'g' . substr(hash('sha256', $group?->getNodePath() ?? 'body'),0,12);
            $groupLabel = $group ? cms_heading($group) : 'Другие элементы страницы';
            if($group instanceof DOMElement){$labels=['hero'=>'Главный экран','path-strip'=>'Наш путь','pain-section'=>'Запросы клиентов','results-section'=>'Результаты работы','programs-section'=>'Популярные направления работы','resource-test-teaser'=>'Тест на ресурсность','income-section'=>'Доход и устойчивость','specialists-section'=>'Специалисты центра','founder-spotlight'=>'Об основателе','reviews-section'=>'Отзывы на главной','consultation-section'=>'Заключительный призыв к действию'];foreach($labels as $class=>$label)if(cms_has($group,$class)){$groupLabel=$label;break;}}
            $path = $node->getNodePath();
            if($group instanceof DOMElement)$group->setAttribute('data-cms-group',$groupKey);
        }
        if ($isGlobal) $section =& $schema['global']; else $section =& $schema['pages'][$slug];
        $section['groups'][$groupKey] ??= ['label' => $groupLabel ?: 'Содержание', 'fields' => []];
        // Do not reset the collected field list when adding another field in this group.
        if (!isset($entries[$scope . $groupKey])) $entries[$scope . $groupKey] = [];
        $definitions = [];
        if ($node instanceof DOMText) {
            $text = trim($node->nodeValue);
            if ($text === '' || preg_match('/^[\s→↙“”·|]+$/u', $text)) continue;
            $label = in_array($el->tagName,['h1','h2','h3','h4'], true) ? 'Заголовок' : ($el->tagName === 'a' ? 'Текст ссылки' : 'Текст');
            $definitions[] = ['type' => 'text', 'label' => $label . ': ' . cms_short($text,45), 'default' => $sharedText?trim($node->nodeValue):$node->nodeValue, 'attr' => 'text'];
        } elseif ($node->tagName === 'img') {
            $definitions[] = ['type'=>'image','label'=>'Фотография: ' . ($node->getAttribute('alt') ?: ($block ? $section['blocks'][$block]['label'] : $groupLabel)), 'default'=>$node->getAttribute('src'),'attr'=>'src'];
            $definitions[] = ['type'=>'text','label'=>'Описание изображения (alt)','default'=>$node->getAttribute('alt'),'attr'=>'alt'];
            $definitions[] = ['type'=>'fit','label'=>'Показ фотографии','default'=>'original','attr'=>'fit'];
        } elseif ($node->tagName === 'a') {
            if ($node->hasAttribute('data-resource-test-link')) continue;
            $definitions[] = ['type'=>'link','label'=>'Адрес ссылки: ' . cms_short($node->textContent ?: $node->getAttribute('aria-label'),45),'default'=>$node->getAttribute('href'),'attr'=>'href'];
        } elseif ($node->tagName === 'video') {
            if ($node->hasAttribute('src')) $definitions[] = ['type'=>'video','label'=>'Видеофайл','default'=>$node->getAttribute('src'),'attr'=>'src'];
            $definitions[] = ['type'=>'image','label'=>'Обложка видео','default'=>$node->getAttribute('poster'),'attr'=>'poster'];
        } elseif ($node->tagName === 'source') $definitions[] = ['type'=>'video','label'=>'Видеофайл','default'=>$node->getAttribute('src'),'attr'=>'src'];
        foreach ($definitions as $def) {
            $id = 'f' . substr(hash('sha256', $scope . '|' . $path . '|' . $def['attr']),0,18);
            $def += ['group'=>$groupKey,'block'=>$block,'tag'=>$el->tagName,'base'=>hash('sha256',$def['default'])];
            $section['fields'][$id] = $def; $entries[$scope . $groupKey][] = $id;
            if ($block) $section['blocks'][$block]['fields'][] = $id;
            if ($def['attr'] === 'text') {
                $node->parentNode->insertBefore($dom->createComment('cms:' . $id),$node);
                if ($node->nextSibling) $node->parentNode->insertBefore($dom->createComment('/cms:' . $id),$node->nextSibling);
                else $node->parentNode->appendChild($dom->createComment('/cms:' . $id));
            } else $node->setAttribute('data-cms-' . $def['attr'], $id);
        }
        unset($section);
    }
    foreach ($schema['pages'][$slug]['groups'] as $id => &$g) $g['fields'] = array_values(array_unique($entries[$slug . $id] ?? [])); unset($g);
    foreach ($schema['global']['groups'] as $id => &$g) $g['fields'] = array_values(array_unique(array_merge($g['fields'],$entries['@global' . $id] ?? []))); unset($g);
    foreach (iterator_to_array($xp->query('//*[@data-cms-block]')) as $node) {
        $id=$node->getAttribute('data-cms-block');
        $node->parentNode->insertBefore($dom->createComment('cms-block:'.$id),$node);
        $node->parentNode->insertBefore($dom->createComment('/cms-block:'.$id),$node->nextSibling);
    }
    foreach (iterator_to_array($xp->query('//*[@data-cms-list]')) as $node) {
        $id=$node->getAttribute('data-cms-list');
        $node->insertBefore($dom->createComment('cms-list:'.$id),$node->firstChild);
        $node->appendChild($dom->createComment('/cms-list:'.$id));
    }
    // Readable stable title for each page, independent from SEO title.
    $titles = [''=>'Главная','specialisty'=>'Специалисты','uslugi'=>'Программы и услуги','meropriyatiya'=>'Мероприятия','arhiv-meropriyatiy'=>'Архив мероприятий','otzyvy'=>'Отзывы','contacts'=>'Контакты и соцсети','osnovatel'=>'О центре и основателе'];
    $schema['pages'][$slug]['title'] = $titles[$slug] ?? $schema['pages'][$slug]['title'];
    file_put_contents($root . '/' . $page['file'], "<!doctype html>\n".$dom->saveHTML($dom->documentElement));
    if($globalOnly)unset($schema['pages'][$slug]);
}
file_put_contents($root . '/.cms-schema.json', json_encode($schema,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR));
echo count($schema['pages']) . " editable pages\n";
