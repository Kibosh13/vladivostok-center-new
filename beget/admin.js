'use strict';
// Admin-only enhancement: no analytics, credentials, or remote requests.
const dirtyForms = new Set();
document.querySelectorAll('[data-editor-form]').forEach(form => {
  form.addEventListener('input', () => { dirtyForms.add(form); form.querySelector('[data-dirty-label]').textContent = 'Есть несохранённые изменения'; form.classList.add('is-dirty'); });
});
document.addEventListener('submit', event => {
  const trigger = event.submitter;
  if (trigger?.dataset.confirm && !window.confirm(trigger.dataset.confirm)) { event.preventDefault(); return; }
  const otherDirty = [...dirtyForms].filter(form => form !== event.target);
  if (otherDirty.length && !window.confirm('В другом разделе остались несохранённые правки. Продолжить без их сохранения?')) { event.preventDefault(); return; }
  dirtyForms.clear();
});
window.addEventListener('beforeunload', event => { if (dirtyForms.size) { event.preventDefault(); event.returnValue = ''; } });
const normalize = value => value.toLocaleLowerCase('ru').trim();
document.querySelector('[data-page-search]')?.addEventListener('input', event => {
  const query=normalize(event.target.value);document.querySelectorAll('[data-page-option]').forEach(item=>{item.hidden=!normalize(item.textContent).includes(query);});
});
document.querySelector('[data-field-search]')?.addEventListener('input',event=>{
  const query=normalize(event.target.value);
  document.querySelectorAll('.cms-edit-group').forEach(group=>{
    const rows=[...group.querySelectorAll('[data-field-row]')];
    const groupMatch=normalize(group.querySelector('summary').textContent).includes(query);
    let matches=0;rows.forEach(row=>{const input=row.querySelector('textarea,input,select');const match=groupMatch||normalize(row.textContent+' '+(input?.value||'')).includes(query);row.hidden=!match;matches+=Number(match);});
    group.querySelectorAll('.cms-card-editor').forEach(card=>{const match=[...card.querySelectorAll('[data-field-row]')].some(row=>!row.hidden);card.hidden=!match;if(query&&match)card.open=true;});
    group.hidden=matches===0;if(query&&matches)group.open=true;
  });
});
document.querySelector('[data-library-search]')?.addEventListener('input',event=>{
  const query=normalize(event.target.value);document.querySelectorAll('[data-library-item]').forEach(item=>{item.hidden=!normalize(item.textContent+' '+item.querySelector('input').value).includes(query);});
});
const picker=document.querySelector('#cms-media-dialog');let targetInput=null,pickerKind='image';
const filterPicker=()=>{const query=normalize(document.querySelector('[data-picker-search]')?.value||'');picker?.querySelectorAll('[data-pick-file]').forEach(item=>{item.hidden=(pickerKind!=='link'&&item.dataset.kind!==pickerKind)||!normalize(item.textContent+' '+item.dataset.pickFile).includes(query);});};
document.querySelectorAll('[data-media-target]').forEach(button=>button.addEventListener('click',()=>{targetInput=document.getElementById(button.dataset.mediaTarget);pickerKind=button.dataset.mediaKind;filterPicker();picker.showModal();}));
document.querySelector('[data-close-media]')?.addEventListener('click',()=>picker.close());
document.querySelector('[data-picker-search]')?.addEventListener('input',filterPicker);
picker?.querySelectorAll('[data-pick-file]').forEach(button=>button.addEventListener('click',()=>{
  if(!targetInput)return;targetInput.value=button.dataset.pickFile;targetInput.dispatchEvent(new Event('input',{bubbles:true}));
  const preview=targetInput.closest('[data-field-row]')?.querySelector('.cms-image-preview');if(preview&&pickerKind==='image')preview.src=targetInput.value;
  picker.close();targetInput.focus();
}));
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(button.dataset.copy);button.textContent='Адрес скопирован';}catch{const input=button.closest('article').querySelector('input');input.focus();input.select();button.textContent='Выделено — скопируйте адрес';}
}));
if(location.hash){const group=document.getElementById(location.hash.slice(1));if(group?.matches('details'))group.open=true;}
