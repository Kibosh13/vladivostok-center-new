<?php
declare(strict_types=1);
if (!defined('PS_BOOTSTRAPPED')) { http_response_code(404); exit; }

function ps_cms_schema(): array {
    static $schema;
    return $schema ??= json_decode((string)file_get_contents(__DIR__ . '/.cms-schema.json'), true, 512, JSON_THROW_ON_ERROR);
}
function ps_cms_key(string $scope): string { return 'editor-' . hash('sha256', $scope); }
function ps_cms_state(string $scope): array { return ps_json_read(ps_cms_key($scope), ['draft'=>[], 'published'=>[], 'history'=>[]]); }
function ps_cms_revision(array $state): string { return hash('sha256', json_encode($state,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)); }
function ps_cms_extra_pages(): array { return ps_json_read('editor-pages'); }
function ps_cms_manifest(array $manifest, bool $preview=false): array {
    $original=$manifest['pages'];
    foreach(ps_cms_extra_pages() as $slug=>$page) {
        if((!$preview&&empty($page['published'])) || !isset($original[$page['source']]))continue;
        $manifest['pages'][$slug]=array_replace($original[$page['source']],['title'=>$page['title'].' — Путь к себе','source'=>$page['source']]);
        if(str_starts_with($slug,'specialisty/'))$manifest['specialists'][]=['slug'=>substr($slug,12),'name'=>$page['title'],'format'=>'Уточняется при записи'];
    }
    foreach($manifest['specialists'] as &$profile) {
        $scope='specialisty/'.$profile['slug']; $data=ps_cms_state($scope)['published']??[];
        if(!$data)continue;
        $def=ps_cms_definition($scope,$data);$values=ps_cms_effective($data,$def);
        foreach($def['fields'] as $id=>$field)if(($field['tag']??'')==='h1'&&isset($values[$id])){$profile['name']=trim($values[$id]);break;}
    } unset($profile);
    return $manifest;
}
function ps_cms_source(string $scope): string { return (string)(ps_cms_extra_pages()[$scope]['source'] ?? $scope); }
function ps_cms_definition(string $scope, array $data = []): array {
    $schema = ps_cms_schema(); $source = ps_cms_source($scope);
    $def = $scope === '@global' ? $schema['global'] : ($schema['pages'][$source] ?? []);
    if (!$def) throw new RuntimeException('Страница не найдена.');
    foreach (($data['clones'] ?? []) as $id=>$base) {
        if (!preg_match('/^copy[a-f0-9]{12}$/',$id) || !isset($def['blocks'][$base])) continue;
        $block = $def['blocks'][$base]; $block['label'] .= ' · новая карточка'; $block['fields'] = [];
        foreach ($def['blocks'][$base]['fields'] as $fieldId) {
            $newId = $id . '_' . $fieldId; $field = $def['fields'][$fieldId]; $field['block'] = $id;
            $def['fields'][$newId] = $field; $def['groups'][$field['group']]['fields'][] = $newId; $block['fields'][] = $newId;
        }
        $def['blocks'][$id] = $block; $def['lists'][$block['list']]['blocks'][] = $id;
    }
    return $def;
}
function ps_cms_url(string $value, string $type): bool {
    if ($value === '' && $type !== 'video') return true;
    if (preg_match('/[\x00-\x20\x7f<>"\\\\]/',$value) || str_contains(rawurldecode($value),'..')) return false;
    if ($type === 'fit') return in_array($value,['original','contain','cover'],true);
    if ($type === 'image') return (bool)preg_match('#^/images/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|avif|gif|svg)$#i',$value) && is_file(__DIR__ . $value);
    if ($type === 'video') return (bool)preg_match('#^/(?:videos/events|images/uploads)/[a-zA-Z0-9_./-]+\.mp4$#',$value) && is_file(__DIR__ . $value);
    if (str_starts_with($value,'/') && !str_starts_with($value,'//')) return !preg_match('#^/(?:admin|api|\.)#',$value);
    if (preg_match('/^#[a-zA-Z0-9_-]+$/',$value)) return true;
    if (preg_match('/^(?:tel:\+?[0-9()-]+|mailto:[a-zA-Z0-9_.+@-]+|tg:\/\/resolve\?phone=\+?[0-9]+)$/',$value)) return true;
    return filter_var($value,FILTER_VALIDATE_URL) && parse_url($value,PHP_URL_SCHEME)==='https' && !parse_url($value,PHP_URL_USER) && !parse_url($value,PHP_URL_PASS);
}
function ps_cms_value(array $data, string $id, array $field): string { return (string)($data['values'][$id] ?? $field['default']); }
function ps_cms_default_order(array $def,string $id): int { return (int)array_search($id,$def['lists'][$def['blocks'][$id]['list']]['blocks'],true)*10; }
function ps_cms_effective(array $data, array $def): array {
    $values=[];
    foreach ($data['values'] ?? [] as $id=>$value) if (isset($def['fields'][$id]) && ($data['bases'][$id] ?? '') === $def['fields'][$id]['base']) $values[$id]=(string)$value;
    return $values;
}
function ps_cms_set_attr(string $tag, string $attr, string $value): string {
    $attribute=' ' . $attr . '="' . ps_escape($value) . '"';
    return preg_match('/\s'.preg_quote($attr,'/').'="[^"]*"/',$tag) ? preg_replace_callback('/\s'.preg_quote($attr,'/').'="[^"]*"/',fn()=>$attribute,$tag,1) : preg_replace('/\s*\/?>$/',$attribute.'>',$tag,1);
}
function ps_cms_render(string $html, string $scope, bool $preview=false): string {
    $schema=ps_cms_schema(); $pageState=ps_cms_state($scope); $globalState=ps_cms_state('@global');
    $page=$pageState[$preview?'draft':'published'] ?? []; $global=$globalState[$preview?'draft':'published'] ?? [];
    if(isset($schema['pages'][ps_cms_source($scope)]))$def=ps_cms_definition($scope,$page);
    else{$page=[];$def=['fields'=>[],'blocks'=>[],'lists'=>[]];}
    // Repeated blocks are cloned from an allowlisted server template, never from submitted HTML.
    foreach ($page['clones'] ?? [] as $clone=>$base) {
        if (!isset($def['blocks'][$clone]) || !preg_match('/^copy[a-f0-9]{12}$/',$clone)) continue;
        if (!preg_match('/<([a-z0-9]+)\b[^>]*data-cms-block="'.preg_quote($base,'/').'"[^>]*>/i',$html,$start,PREG_OFFSET_CAPTURE)) continue;
        // Markers are inserted during the build, so balanced nested cards remain intact.
        if (!preg_match('/<!--cms-block:'.preg_quote($base,'/').'-->(.*?)<!--\/cms-block:'.preg_quote($base,'/').'-->/s',$html,$m)) continue;
        $copy=$m[1];
        foreach ($def['blocks'][$base]['fields'] as $fieldId) $copy=str_replace($fieldId,$clone.'_'.$fieldId,$copy);
        $copy=str_replace('data-cms-block="'.$base.'"','data-cms-block="'.$clone.'"',$copy);
        $copy=preg_replace_callback('/\sid="([^"]*)"/',fn($a)=>' id="'.ps_escape($a[1].'-'.$clone).'"',$copy);
        $list=$def['blocks'][$base]['list'];
        $html=str_replace('<!--/cms-list:'.$list.'-->','<!--cms-block:'.$clone.'-->'.$copy.'<!--/cms-block:'.$clone.'--><!--/cms-list:'.$list.'-->',$html);
    }
    // Apply visibility and ordering to lists without allowing changes to form internals.
    $html=preg_replace_callback('/<!--cms-list:([a-z0-9]+)-->(.*?)<!--\/cms-list:\1-->/s',function($m)use($page){
        preg_match_all('/<!--cms-block:([a-z0-9]+)-->(.*?)<!--\/cms-block:\1-->/s',$m[2],$items,PREG_SET_ORDER);
        $order=[]; foreach($items as $item) $order[$item[1]]=$item[2];
        $keys=array_keys($order); usort($keys,fn($a,$b)=>(int)($page['order'][$a]??array_search($a,$keys)*10)<=>(int)($page['order'][$b]??array_search($b,$keys)*10));
        $out=''; foreach($keys as $id) if(empty($page['hidden'][$id])) $out.=$order[$id]; return $out;
    },$html);
    $values=ps_cms_effective($page,$def)+ps_cms_effective($global,$schema['global']);
    $html=preg_replace_callback('/<!--cms:([a-z0-9_]+)-->(.*?)<!--\/cms:\1-->/s',fn($m)=>array_key_exists($m[1],$values)?nl2br(ps_escape($values[$m[1]]),false):$m[2],$html);
    $html=preg_replace_callback('/<[a-z][^>]*data-cms-group="([a-z0-9]+)"[^>]*>/i',fn($m)=>!empty($page['hiddenGroups'][$m[1]])?ps_cms_set_attr($m[0],'style','display:none !important'):$m[0],$html);
    $allFields=$def['fields']+$schema['global']['fields'];
    $html=preg_replace_callback('/<[a-z][^>]*\sdata-cms-(?:src|alt|href|poster|fit)="[^>]*>/i',function($m)use($values,$allFields){
        $tag=$m[0]; preg_match_all('/data-cms-(src|alt|href|poster|fit)="([a-z0-9_]+)"/',$tag,$attrs,PREG_SET_ORDER);
        foreach($attrs as [, $attr,$id]) {
            if(!array_key_exists($id,$values))continue; $value=$values[$id];
            if($attr==='fit') { if($value!=='original') $tag=ps_cms_set_attr($tag,'style','object-fit:'.$value.' !important;object-position:center;'); continue; }
            $tag=ps_cms_set_attr($tag,$attr,$value);
            if($attr==='src' && ($allFields[$id]['type']??'')==='image') {
                $tag=preg_replace('/\s(?:srcset|sizes|width|height)="[^"]*"/','',$tag);
                $size=@getimagesize(__DIR__.$value); if($size){$tag=ps_cms_set_attr($tag,'width',(string)$size[0]);$tag=ps_cms_set_attr($tag,'height',(string)$size[1]);}
            }
        }
        return $tag;
    },$html);
    return preg_replace('/\sdata-cms-(?:src|alt|href|poster|fit|block|list|group)="[a-z0-9_]+"/','',$html);
}
function ps_cms_metadata(string $html,string $route,array $manifest,bool $preview): string {
    $globalDef=ps_cms_schema()['global'];$data=ps_cms_state('@global')[$preview?'draft':'published']??[];$values=ps_cms_effective($data,$globalDef);$replace=[];
    foreach($values as $id=>$value){$field=$globalDef['fields'][$id];if(in_array($field['type'],['text','link'],true)){$replace[$field['default']]=$value;if(str_starts_with($field['default'],'tel:'))$replace[substr($field['default'],4)]=substr($value,4);}}
    $profile=null;foreach($manifest['specialists'] as $item)if($route==='specialisty/'.$item['slug']){$profile=$item;break;}
    $walk=function($value)use(&$walk,$replace){if(is_array($value)){foreach($value as &$item)$item=$walk($item);unset($item);return $value;}return is_string($value)?($replace[$value]??$value):$value;};
    $custom=ps_cms_state($route)[$preview?'draft':'published']??[];
    $newPage=isset(ps_cms_extra_pages()[$route]);
    return preg_replace_callback('/<script type="application\/ld\+json">(.*?)<\/script>/s',function($m)use($walk,$profile,$route,$custom,$newPage){
        $value=json_decode($m[1],true);if(!is_array($value))return $m[0];$value=$walk($value);
        // Never inherit stale event dates/prices or service graphs after editing visible content.
        if(($custom||$newPage)&&(($value['@type']??'')==='Event'||array_filter($value['@graph']??[],fn($n)=>($n['@type']??'')==='Service')))return '';
        if($profile&&($value['@type']??'')==='Person'){$value['name']=$profile['name'];$value['url']='https://putksebevladivostok.ru/'.$route.'/';}
        return '<script type="application/ld+json">'.json_encode($value,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_HEX_TAG|JSON_HEX_AMP).'</script>';
    },$html);
}
function ps_cms_publish(string $scope, array &$state, string $actor): void {
    $id=gmdate('YmdHis').'-'.bin2hex(random_bytes(4));
    ps_json_write('editor-history-'.$id,['scope'=>$scope,'published'=>$state['published']??[],'at'=>gmdate('c'),'actor'=>$actor]);
    array_unshift($state['history'],$id); $state['published']=$state['draft']; $state['publishedAt']=gmdate('c');
    $state['actor']=$actor;
}
function ps_cms_action(string $action): string {
    $scope=(string)($_POST['scope']??''); $state=ps_cms_state($scope); $data=$state['draft']??[];
    if($action==='cms_new_page') {
        global $manifest;
        $source=(string)($_POST['source']??''); $slug=trim((string)($_POST['new_slug']??''),'/'); $title=trim((string)($_POST['new_title']??''));
        $pages=ps_cms_extra_pages();
        if(!isset(ps_cms_schema()['pages'][$source]) || !preg_match('#^(?:specialisty/|arhiv-meropriyatiy/)?[a-z][a-z0-9-]{2,90}$#',$slug) || isset($manifest['pages'][$slug]) || isset($pages[$slug]) || in_array($slug,['admin','api','images','videos','index','cookies'],true)) throw new RuntimeException('Проверьте шаблон и уникальный адрес страницы латиницей.');
        if($title===''||mb_strlen($title)>180)throw new RuntimeException('Укажите название до 180 символов.');
        if(str_starts_with($slug,'specialisty/')!==str_starts_with($source,'specialisty/'))throw new RuntimeException('Для специалиста выберите шаблон страницы специалиста и адрес specialisty/имя-латиницей.');
        $pages[$slug]=['source'=>$source,'title'=>$title,'published'=>false,'createdAt'=>gmdate('c')]; ps_json_write('editor-pages',$pages);
        $newState=ps_cms_state($slug);$newDef=ps_cms_definition($slug);
        $oldName=null;foreach($manifest['specialists'] as $profile)if($source==='specialisty/'.$profile['slug']){$oldName=$profile['name'];break;}
        foreach($newDef['fields'] as $id=>$field)if(($field['tag']??'')==='h1'||($oldName&&in_array($field['attr'],['text','alt'],true)&&str_contains($field['default'],$oldName))){$newState['draft']['values'][$id]=($field['tag']??'')==='h1'?$title:str_replace($oldName,$title,$field['default']);$newState['draft']['bases'][$id]=$field['base'];}
        ps_json_write(ps_cms_key($slug),$newState);
        return 'Новая страница создана как черновик: /'.$slug.'/. Откройте её в списке страниц, замените содержание и проверьте предпросмотр. Карточку-ссылку можно добавить копированием в нужном разделе.';
    }
    $def=ps_cms_definition($scope,$data);
    if(!hash_equals(ps_cms_revision($state),(string)($_POST['revision']??'')))throw new RuntimeException('Эта страница уже изменена в другой вкладке. Обновите её перед сохранением.');
    if($action==='cms_save') {
        $group=(string)($_POST['group']??''); if(!isset($def['groups'][$group]))throw new RuntimeException('Раздел не найден.');
        if(isset($_POST['hide_group'])&&$scope!=='@global')$data['hiddenGroups'][$group]=true;else unset($data['hiddenGroups'][$group]);
        foreach($def['groups'][$group]['fields'] as $id) {
            if(!array_key_exists($id,$_POST['values']??[]))continue;
            $field=$def['fields'][$id]; $value=(string)$_POST['values'][$id];
            if(mb_strlen($value)>15000 || ($field['type']!=='text'&&!ps_cms_url($value,$field['type'])))throw new RuntimeException('Проверьте поле «'.$field['label'].'». Допускаются безопасные ссылки и файлы из медиатеки.');
            if($value===$field['default']&&!str_starts_with($id,'copy')){unset($data['values'][$id],$data['bases'][$id]);}
            else{$data['values'][$id]=$value; $data['bases'][$id]=$field['base'];}
        }
        foreach($def['blocks'] as $id=>$block) if(isset($_POST['order'][$id])) {
            $order=max(-10000,min(10000,(int)$_POST['order'][$id]));
            if($order===ps_cms_default_order($def,$id))unset($data['order'][$id]);else $data['order'][$id]=$order;
            if(isset($_POST['hidden'][$id]))$data['hidden'][$id]=true;else unset($data['hidden'][$id]);
        }
        foreach(['values','bases','order','hidden','hiddenGroups','clones'] as $key)if(empty($data[$key]))unset($data[$key]);
        $state['draft']=$data; $state['savedAt']=gmdate('c');
    } elseif($action==='cms_clone') {
        $base=(string)($_POST['block']??''); if(!isset($def['blocks'][$base])||str_starts_with($base,'copy'))throw new RuntimeException('Выберите исходную карточку.');
        if(count($data['clones']??[])>=60)throw new RuntimeException('Достигнут предел 60 новых карточек на странице.');
        $clone='copy'.bin2hex(random_bytes(6)); $data['clones'][$clone]=$base;
        foreach($def['blocks'][$base]['fields'] as $id){$data['values'][$clone.'_'.$id]=ps_cms_value($data,$id,$def['fields'][$id]);$data['bases'][$clone.'_'.$id]=$def['fields'][$id]['base'];}
        $state['draft']=$data; $state['savedAt']=gmdate('c');
    } elseif($action==='cms_publish') {
        ps_cms_publish($scope,$state,(string)$_SESSION['admin']);
        $pages=ps_cms_extra_pages(); if(isset($pages[$scope])){$pages[$scope]['published']=true;ps_json_write('editor-pages',$pages);}
    } elseif($action==='cms_unpublish') {
        $pages=ps_cms_extra_pages(); if(!isset($pages[$scope]))throw new RuntimeException('Основные страницы не снимаются с публикации. Для карточек используйте «Скрыть».');
        $pages[$scope]['published']=false;ps_json_write('editor-pages',$pages);
    } elseif($action==='cms_restore') {
        $id=(string)($_POST['history_id']??'');
        if(!in_array($id,$state['history']??[],true))throw new RuntimeException('Версия не найдена.');
        $old=ps_json_read('editor-history-'.$id); if(($old['scope']??null)!==$scope)throw new RuntimeException('Версия другой страницы.');
        $state['draft']=$old['published']??[]; $state['savedAt']=gmdate('c');
    } elseif($action==='cms_reset_draft') {$state['draft']=$state['published']??[]; $state['savedAt']=gmdate('c');}
    else throw new RuntimeException('Неизвестное действие.');
    ps_json_write(ps_cms_key($scope),$state);
    return ['cms_publish'=>'Изменения опубликованы на сайте.','cms_clone'=>'Копия карточки добавлена в черновик. Замените её текст, фото и ссылку перед публикацией.','cms_restore'=>'Версия восстановлена в черновик. Проверьте предпросмотр и опубликуйте.','cms_reset_draft'=>'Черновик возвращён к опубликованной версии.','cms_unpublish'=>'Дополнительная страница снята с публикации.'][$action]??'Черновик сохранён. Публичный сайт пока не изменился.';
}
function ps_cms_upload(): string {
    $file=$_FILES['media']??[];
    if(($file['error']??UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK)throw new RuntimeException('Не удалось принять файл. Проверьте размер и повторите загрузку.');
    $size=(int)$file['size'];$tmp=$file['tmp_name'];$mime=(new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    $types=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','application/pdf'=>'pdf','video/mp4'=>'mp4'];
    if(!isset($types[$mime]) || $size>($mime==='video/mp4'?100:20)*1024*1024 || $size<10)throw new RuntimeException('Разрешены JPG, PNG, WebP, PDF до 20 МБ и MP4 до 100 МБ (с учётом лимита хостинга).');
    if(str_starts_with($mime,'image/')&&!@getimagesize($tmp))throw new RuntimeException('Изображение повреждено.');
    $path='/images/uploads/'.hash_file('sha256',$tmp).'.'.$types[$mime];$dir=__DIR__.'/images/uploads';
    if(!is_dir($dir)){mkdir($dir,0755,true);chmod($dir,0755);}
    if(!is_file(__DIR__.$path)){if(!move_uploaded_file($tmp,__DIR__.$path))throw new RuntimeException('Не удалось сохранить файл.');chmod(__DIR__.$path,0644);}
    $media=ps_json_read('editor-media');$media[$path]=['name'=>mb_substr(basename((string)$file['name']),0,150),'mime'=>$mime,'bytes'=>$size,'at'=>gmdate('c')];ps_json_write('editor-media',$media);
    return 'Файл добавлен в медиатеку. Выберите его в поле изображения или скопируйте его адрес.';
}
