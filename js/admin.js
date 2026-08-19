import {seedDestinations,loadOverlay,saveOverlay} from './data.js';
import {$,$$,escapeHTML,toast} from './utils.js';

const OVERLAY_KEY='tb-admin-overlay';
let overlay=loadOverlay()||{removed:[],upserts:{}};
let query='',catFilter='',divFilter='';

(function initTheme(){const t=$('#themeToggle');if(!t)return;const apply=v=>{document.documentElement.dataset.theme=v;localStorage.setItem('theme',v)};t.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark')})();

function persist(){saveOverlay(overlay)}
function slugify(s){return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'destination'}
function currentCatalog(){const removed=new Set(overlay.removed),upserts=overlay.upserts;const base=seedDestinations.filter(d=>!removed.has(d.id)).map(d=>upserts[d.id]||d);const added=Object.entries(upserts).filter(([id])=>!seedDestinations.some(d=>d.id===id)).map(([,v])=>v);return[...base,...added]}
function allDivisions(){return[...new Set(currentCatalog().map(d=>d.division))].sort()}
function allCategories(){return[...new Set(currentCatalog().map(d=>d.category))].sort()}

function rows(){
  const removed=new Set(overlay.removed),upserts=overlay.upserts,out=[];
  seedDestinations.forEach(d=>out.push({data:upserts[d.id]||d,removed:removed.has(d.id),isNew:false}));
  Object.entries(upserts).forEach(([id,v])=>{if(!seedDestinations.some(d=>d.id===id))out.push({data:v,removed:false,isNew:true})});
  return out;
}
function statusOf(r){
  if(r.removed)return{label:'Removed',cls:'removed'};
  if(r.isNew)return{label:'New',cls:'new'};
  if(overlay.upserts[r.data.id])return{label:'Edited',cls:'edited'};
  return{label:'Seed',cls:'seed'};
}
function render(){
  const body=$('#adminBody');if(!body)return;
  const q=query.trim().toLowerCase();
  const list=rows().filter(r=>{
    if(q){const hay=[r.data.name,r.data.district,r.data.division,r.data.upazila,r.data.category,...(r.data.tags||[])].join(' ').toLowerCase();if(!hay.includes(q))return false}
    if(catFilter&&r.data.category!==catFilter)return false;
    if(divFilter&&r.data.division!==divFilter)return false;
    return true;
  });
  const removedCount=overlay.removed.length,newCount=Object.keys(overlay.upserts).filter(id=>!seedDestinations.some(d=>d.id===id)).length;
  $('#adminStats').textContent=`${currentCatalog().length} live destinations • ${newCount} added • ${removedCount} hidden`;
  $('#adminEmpty').hidden=list.length>0;
  body.innerHTML=list.map(r=>{
    const s=statusOf(r),d=r.data;
    const acts=r.removed
      ?`<button data-act="restore" data-id="${escapeHTML(d.id)}">Restore</button><button class="danger" data-act="drop" data-id="${escapeHTML(d.id)}">Delete forever</button>`
      :`<button data-act="edit" data-id="${escapeHTML(d.id)}">Edit</button><button data-act="remove" data-id="${escapeHTML(d.id)}">Remove</button>${r.isNew?`<button class="danger" data-act="drop" data-id="${escapeHTML(d.id)}">Delete forever</button>`:''}`;
    return`<tr class="${r.removed?'row-removed':''}"><td><div class="dest-cell"><img class="thumb" src="${escapeHTML(d.image)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"><div><strong>${escapeHTML(d.name)}</strong><small>${escapeHTML(d.id)}</small></div></div></td><td>${escapeHTML(d.category)}</td><td>${escapeHTML(d.division)}</td><td>${escapeHTML(d.district)}</td><td>${d.rating!=null?d.rating.toFixed(1):'—'}</td><td><span class="badge ${s.cls}">${s.label}</span></td><td><div class="row-actions" data-id="${escapeHTML(d.id)}">${acts}</div></td></tr>`;
  }).join('');
  body.querySelectorAll('.row-actions button').forEach(b=>b.onclick=()=>{const id=b.parentElement.dataset.id;if(b.dataset.act==='edit')openForm(id);else if(b.dataset.act==='remove')removeDest(id);else if(b.dataset.act==='restore')restoreDest(id);else if(b.dataset.act==='drop')dropDest(id)});
}
function removeDest(id){if(overlay.removed.includes(id))return;overlay.removed.push(id);persist();render();toast('Destination hidden. Restore it any time.')}
function restoreDest(id){overlay.removed=overlay.removed.filter(x=>x!==id);persist();render();toast('Destination restored.')}
function dropDest(id){if(!confirm(`Permanently remove “${id}”?`))return;delete overlay.upserts[id];overlay.removed=overlay.removed.filter(x=>x!==id);persist();render();toast('Destination deleted.')}

const $v=id=>$('#'+id);
function openForm(id){
  const overlayEl=$('#formOverlay'),title=$('#formTitle');
  const isEdit=!!id;const d=isEdit?overlay.upserts[id]||seedDestinations.find(x=>x.id===id):null;
  title.textContent=isEdit?`Edit — ${d.name}`:'Add destination';
  $v('af-id').value=d?.id||'';
  $v('af-name').value=d?.name||'';
  $v('af-category').value=d?.category||'';
  $v('af-division').value=d?.division||'';
  $v('af-district').value=d?.district||'';
  $v('af-upazila').value=d?.upazila||'';
  $v('af-bestTime').value=d?.bestTime||'';
  $v('af-description').value=d?.description||'';
  $v('af-image').value=d?.image||'';
  $v('af-lat').value=d?.latitude??'';
  $v('af-lon').value=d?.longitude??'';
  $v('af-rating').value=d?.rating??'';
  $v('af-popularity').value=d?.popularity??'';
  $v('af-duration').value=d?.estimatedVisitDuration||'';
  $v('af-indoor').value=d?.indoorOutdoor||'outdoor';
  $v('af-tags').value=(d?.tags||[]).join(', ');
  $v('af-facilities').value=(d?.facilities||[]).join(', ');
  $$('input[type="checkbox"][name="weather"]').forEach(c=>c.checked=(d?.weatherPreference||[]).includes(c.value));
  $v('af-featured').checked=!!d?.featured;
  overlayEl.hidden=false;
}
function closeForm(){$('#formOverlay').hidden=true}
function formValues(){
  const split=s=>s.split(',').map(x=>x.trim()).filter(Boolean);
  return{
    name:$v('af-name').value.trim(),
    category:$v('af-category').value.trim(),
    division:$v('af-division').value.trim(),
    district:$v('af-district').value.trim(),
    upazila:$v('af-upazila').value.trim(),
    bestTime:$v('af-bestTime').value.trim(),
    description:$v('af-description').value.trim(),
    image:$v('af-image').value.trim(),
    latitude:parseFloat($v('af-lat').value),
    longitude:parseFloat($v('af-lon').value),
    rating:parseFloat($v('af-rating').value)||0,
    popularity:parseInt($v('af-popularity').value,10)||0,
    estimatedVisitDuration:$v('af-duration').value.trim(),
    indoorOutdoor:$v('af-indoor').value,
    tags:split($v('af-tags').value),
    facilities:split($v('af-facilities').value),
    weatherPreference:$$('input[type="checkbox"][name="weather"]:checked').map(c=>c.value),
    featured:$v('af-featured').checked,
    gallery:[]
  };
}
function saveForm(e){
  e.preventDefault();
  const v=formValues();
  if(!v.name||!v.category||!v.division||!v.district||Number.isNaN(v.latitude)||Number.isNaN(v.longitude)){toast('Required fields: name, category, division, district, latitude, longitude.');return}
  const prevId=$v('af-id').value.trim();
  let id=prevId||slugify(v.name);
  if(!prevId){
    const taken=new Set([...seedDestinations.map(d=>d.id),...Object.keys(overlay.upserts)]);
    let n=2;const base=id;while(taken.has(id))id=`${base}-${n++}`;
  }
  overlay.removed=overlay.removed.filter(x=>x!==id);
  overlay.upserts[id]={id,...v};
  persist();closeForm();render();toast('Destination saved. Changes are live in this browser.')
}
function exportJSON(){
  const blob=new Blob([JSON.stringify(currentCatalog(),null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='travel-bangladesh-destinations.json';a.click();URL.revokeObjectURL(a.href);
}
function resetAll(){
  if(!confirm('Reset all admin changes back to the seed catalog?'))return;
  overlay={removed:[],upserts:{}};persist();render();toast('Catalog reset to seed.')
}

function init(){
  $$('#adminCatFilter option, #adminDivFilter option').forEach(o=>o.remove());
  allCategories().forEach(c=>{$('#adminCatFilter').insertAdjacentHTML('beforeend',`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`);$('#catList').insertAdjacentHTML('beforeend',`<option value="${escapeHTML(c)}">`)});
  allDivisions().forEach(c=>{$('#adminDivFilter').insertAdjacentHTML('beforeend',`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`);$('#divList').insertAdjacentHTML('beforeend',`<option value="${escapeHTML(c)}">`)});
  $('#addBtn').onclick=()=>openForm(null);
  $('#formClose').onclick=closeForm;
  $('#formCancel').onclick=closeForm;
  $('#formOverlay').onclick=e=>{if(e.target.id==='formOverlay')closeForm()};
  $('#adminForm').addEventListener('submit',saveForm);
  $('#exportBtn').onclick=exportJSON;
  $('#resetBtn').onclick=resetAll;
  $('#adminSearch').addEventListener('input',e=>{query=e.target.value;render()});
  $('#adminCatFilter').onchange=e=>{catFilter=e.target.value;render()};
  $('#adminDivFilter').onchange=e=>{divFilter=e.target.value;render()};
  render();
}
init();