import {validateBoard, connectGitHub, publishBoard, deploymentStatus, repository} from './bento-publish.js?v=20261120-v4';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = ['Top left · wide','Top centre','Top right','Middle left','Middle centre · wide','Middle right','Bottom left','Bottom centre','Bottom right · wide'];
const rectangles = [[40,40,494,356],[546,40,241,356],[799,40,241,356],[40,408,241,264],[293,408,494,264],[799,408,241,264],[40,684,241,356],[293,684,241,356],[546,684,494,356]];
const allowedTypes = new Set(['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm']);
const MAX_FILE = 20 * 1024 * 1024, MAX_PROJECT = 60 * 1024 * 1024;
let board, publishedBoard, baseUpdatedAt, selected = 1, preview = false, motionPaused = matchMedia('(prefers-reduced-motion: reduce)').matches, dirty = false, loading, database;
let githubToken = '', githubUser = '', publishing = false, message = '', messageError = false, connectionOpen = false, resetRequested = false;
let persistChain = Promise.resolve(), pendingDeployment = 0;
let publicationUrl = '';

function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open('19-studio-bentos', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return database;
}
async function storedDraft() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction('drafts').objectStore('drafts').get('amaira');
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
function saveDraft() {
  const snapshot = {board:structuredClone(board),baseUpdatedAt,dirty};
  persistChain = persistChain.catch(()=>{}).then(async () => {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts','readwrite');
      transaction.objectStore('drafts').put(snapshot,'amaira');
      transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error);
    });
  }).catch(() => setMessage('This browser could not save the draft. Download the project to keep your changes.', true));
  return persistChain;
}
function setMessage(text, error = false) {
  message = text; messageError = error;
  const status = document.getElementById('bento-status');
  if (status) { status.textContent = text; status.classList.toggle('is-error',error); if(publicationUrl){const link=document.createElement('a');link.href=publicationUrl;link.target='_blank';link.rel='noopener';link.className='text-link';link.textContent=' Publishing status';status.append(link);} }
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const toDataUrl = blob => new Promise((resolve,reject) => {const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('This file could not be read.'));reader.readAsDataURL(blob);});
const mediaSize = value => value.tiles.reduce((sum,tile)=>sum+(tile.src?.startsWith('data:') ? tile.src.length*0.75 : 0),0);

function tileHtml(tile) {
  const media = tile.src && tile.type==='image/gif' && motionPaused ? `<canvas data-gif-src="${esc(tile.src)}" role="img" aria-label="${esc(tile.name)} (paused)"></canvas>` : !tile.src ? '<span class="bento-empty">Upload media</span>' : tile.type.startsWith('video/') ? `<video src="${esc(tile.src)}" ${motionPaused?'':'autoplay'} muted loop playsinline aria-label="${esc(tile.name)}"></video>` : `<img src="${esc(tile.src)}" alt="${esc(tile.name)}" decoding="async">`;
  return `<button id="bento-tile-${tile.id}" class="bento-tile bento-tile-${tile.id} ${selected===tile.id?'is-selected':''}" data-bento-upload="${tile.id}" style="--tile-bg:${tile.background};--tile-fit:${tile.fit};--tile-x:${tile.positionX}%;--tile-y:${tile.positionY}%" aria-label="Upload or replace tile ${tile.id}: ${labels[tile.id-1]}" ${preview||publishing?'disabled':''}>${media}<span class="bento-tile-label"><span>${tile.id}</span><span>${tile.src?'Replace':'Upload'}</span></span></button>`;
}
function inspector() {
  const tile = board.tiles.find(tile=>tile.id===selected);
  return `<aside class="bento-inspector" aria-label="Bento editor">
    <div class="bento-board-heading"><label for="bento-title">Board name</label><input id="bento-title" value="${esc(board.title)}" maxlength="120" data-bento-field="title"></div>
    <label for="bento-selected">Tile</label><select id="bento-selected" ${publishing?'disabled':''}>${board.tiles.map(tile=>`<option value="${tile.id}" ${tile.id===selected?'selected':''}>${tile.id}. ${labels[tile.id-1]}</option>`).join('')}</select>
    <div class="bento-upload-target" data-bento-drop="${tile.id}"><p>${esc(tile.name || 'Empty tile')}</p><button class="text-link" data-bento-upload="${tile.id}" ${publishing?'disabled':''}>${tile.src?'Replace media':'Upload media'}</button><span>Drop an image, GIF or video here.</span></div>
    <label for="bento-fit">Image fit</label><select id="bento-fit" data-bento-field="fit"><option value="contain" ${tile.fit==='contain'?'selected':''}>Show complete image</option><option value="cover" ${tile.fit==='cover'?'selected':''}>Fill tile</option></select>
    <label for="bento-background">Tile background</label><div class="bento-background-control"><input id="bento-background" type="color" value="${tile.background}" data-bento-field="background"><span>${tile.background.toUpperCase()}</span></div>
    <label for="bento-x">Horizontal crop</label><input id="bento-x" type="range" min="0" max="100" value="${tile.positionX}" data-bento-field="positionX" ${tile.fit==='contain'?'disabled':''}>
    <label for="bento-y">Vertical crop</label><input id="bento-y" type="range" min="0" max="100" value="${tile.positionY}" data-bento-field="positionY" ${tile.fit==='contain'?'disabled':''}>
    <button class="bento-remove text-link" data-bento-action="remove" ${!tile.src||publishing?'disabled':''}>Remove media from tile</button>
    <div class="bento-publish-info"><p>${dirty?'Your changes are a draft. Publish to update the board for everyone.':'This is the published board. Upload a tile to start a draft.'}</p><button class="bento-publish-button" data-bento-action="publish" ${publishing||!dirty?'disabled':''}>${publishing?'Publishing…':'Publish to everyone'}</button>
    <button class="text-link bento-connect-link" data-bento-action="connection">${githubUser?`Connected as ${esc(githubUser)}`:'Connect GitHub'}</button></div>
  </aside>`;
}
function connection() {
  return `<details class="bento-connection" ${connectionOpen?'open':''}><summary>GitHub publishing connection</summary>${githubUser?`<p>Connected as ${esc(githubUser)}. The connection is kept only until this page closes.</p><button class="text-link" data-bento-action="disconnect">Disconnect</button>`:`<form id="bento-connect-form"><p>Use a fine-grained GitHub token for <strong>${repository}</strong> with <strong>Contents: Read and write</strong> and <strong>Pages: Read and write</strong>. The token stays in memory and is sent only to GitHub.</p><label for="bento-github-token">GitHub access token</label><input type="password" id="bento-github-token" autocomplete="off" spellcheck="false" required><button class="bento-publish-button" type="submit">Connect GitHub</button><a class="text-link" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Create a repository token</a></form>`}</details>`;
}
function content() {
  return `<div class="bento-toolbar"><div class="bento-tool-group"><button class="text-link" data-bento-action="preview">${preview?'Edit tiles':'Preview'}</button>${board.tiles.some(tile=>tile.type.startsWith('video/')||tile.type==='image/gif')?`<button class="text-link" data-bento-action="motion">${motionPaused?'Play motion':'Pause motion'}</button>`:''}<button class="text-link" data-bento-action="png">Download image</button></div><div class="bento-tool-group"><button class="text-link" data-bento-action="export">Download project</button><button class="text-link" data-bento-action="import" ${publishing?'disabled':''}>Import project</button><button class="text-link" data-bento-action="load-published" ${publishing?'disabled':''}>Load published board</button></div></div>
    ${resetRequested?'<div class="bento-reset-prompt"><p>Replace your local draft with the published board? Download your project first to keep a copy.</p><button class="text-link" data-bento-action="cancel-reset">Keep editing</button><button class="text-link" data-bento-action="confirm-reset">Replace draft</button></div>':''}<p id="bento-status" tabindex="-1" class="bento-status ${messageError?'is-error':''}" role="status" aria-live="polite">${esc(message)}${publicationUrl?` <a class="text-link" href="${publicationUrl}" target="_blank" rel="noopener">Publishing status</a>`:''}</p>
    <div class="bento-workspace ${preview?'is-preview':''} ${publishing?'is-publishing':''}"><div class="bento-canvas-container"><div class="bento-board" aria-label="Nine-tile Bento board">${board.tiles.map(tileHtml).join('')}</div></div>${inspector()}</div>
    ${connection()}<input id="bento-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm" hidden><input id="bento-project-file" type="file" accept="application/json,.json" hidden>
    <div class="section-end"><p class="note-line">Theaterbaren layout: nine individually editable tiles, with the reference spacing, proportions and rounded corners. Images and motion clips are supported.</p><a class="text-link" href="https://www.rebrand.gallery/bento/theaterbaren" target="_blank" rel="noopener">View layout reference</a></div>`;
}
function paint(focusId) {
  const root = document.getElementById('bento-editor');
  if (!root || !board) return;
  const active=document.activeElement, hadFocus=root.contains(document.activeElement);
  const action=active?.dataset?.bentoAction, uploadId=active?.dataset?.bentoUpload;
  const previousId=focusId||active?.id;
  root.innerHTML = content();
  if(publishing)root.querySelectorAll('input,select,button').forEach(control=>control.disabled=true);
  root.querySelectorAll('video').forEach(video=>{video.muted=true;if(motionPaused)video.pause();else video.play().catch(()=>{});});
  root.querySelectorAll('canvas[data-gif-src]').forEach(async canvas=>{try{const image=await loadImage(canvas.dataset.gifSrc);canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);}catch{setMessage('A GIF preview could not be loaded.',true);}});
  const next=(previousId&&document.getElementById(previousId))||(action&&root.querySelector(`[data-bento-action="${action}"]`))||(uploadId&&document.getElementById(`bento-tile-${uploadId}`));
  if(next&&!next.disabled)next.focus({preventScroll:true});else if(hadFocus)document.getElementById(`bento-tile-${selected}`)?.focus({preventScroll:true});
}
export function renderBentos() {
  return `<div class="intro"><h1>Bentos.</h1><p>Build one board, one tile at a time.<br>Publish it for everyone to see.</p></div><section id="bento-editor" aria-label="Bento board builder">${board?content():'<p class="bento-status" role="status">Loading the published board…</p>'}</section>`;
}
async function fetchPublished() {
  const response = await fetch('bentos/board.json?v='+Date.now(),{cache:'no-store'});
  if (!response.ok) throw new Error('The published board could not be loaded. Reload this page to try again.');
  return validateBoard(await response.json());
}
export async function initBentos() {
  if (!loading) loading = (async () => {
    publishedBoard = await fetchPublished();
    baseUpdatedAt = publishedBoard.updatedAt;
    let draft;
    try { draft = await storedDraft(); } catch { /* Editing still works with downloads when storage is unavailable. */ }
    if (draft?.dirty) {
      try { board=validateBoard(draft.board);dirty=true;baseUpdatedAt=draft.baseUpdatedAt;message='Your saved draft is restored. Publish it when ready.'; }
      catch { board=structuredClone(publishedBoard); }
    } else board=structuredClone(publishedBoard);
  })().catch(error=>{loading=null;throw error;});
  try { await loading; paint(); }
  catch (error) { const root=document.getElementById('bento-editor');if(root)root.innerHTML=`<p role="alert">${esc(error.message)}</p><button class="text-link" data-bento-action="retry">Try again</button>`; }
}

async function upload(file, id) {
  if (!file) return;
  if (!allowedTypes.has(file.type)) throw new Error('Use a PNG, JPEG, WebP, GIF, MP4 or WebM file.');
  if (file.size > MAX_FILE) throw new Error('Choose a file smaller than 20 MB.');
  const src = await toDataUrl(file);
  if(file.type.startsWith('image/'))await loadImage(src);
  else await new Promise((resolve,reject)=>{const video=document.createElement('video');const timeout=setTimeout(()=>{video.removeAttribute('src');reject(new Error('This video could not be opened. Try an MP4 or WebM file.'));},15000);video.onloadedmetadata=()=>{clearTimeout(timeout);video.removeAttribute('src');resolve();};video.onerror=()=>{clearTimeout(timeout);reject(new Error('This video format could not be opened.'));};video.preload='metadata';video.src=src;});
  const candidate=structuredClone(board), tile=candidate.tiles.find(tile=>tile.id===id);
  Object.assign(tile,{src,type:file.type,name:file.name.slice(0,200)});
  if (mediaSize(candidate)>MAX_PROJECT) throw new Error('Keep the uploaded media under 60 MB for this board.');
  board=candidate;selected=id;dirty=true;setMessage(`Tile ${id} added to your draft. Publish to share the change.`);paint(`bento-tile-${id}`);await saveDraft();
}
async function exportProject() {
  const portable=structuredClone(board);
  setMessage('Preparing the project download…');
  for (const tile of portable.tiles) if (tile.src && !tile.src.startsWith('data:')) {
    const response=await fetch(tile.src);if(!response.ok)throw new Error(`Tile ${tile.id} could not be included in the download.`);
    const blob=await response.blob();tile.src=await toDataUrl(blob);tile.type=blob.type.split(';')[0];
  }
  download(new Blob([JSON.stringify({kind:'19-studio-bento',schemaVersion:1,board:portable},null,2)],{type:'application/json'}),'19-studio-bento.json');
  setMessage('Project downloaded, including all tile media.');
}
function loadImage(src) {return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('An image could not be rendered.'));image.src=src;});}
async function exportImage() {
  setMessage('Rendering the Bento image…');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=2160;
  const context=canvas.getContext('2d');context.scale(2,2);context.fillStyle='#fff';context.fillRect(0,0,1080,1080);
  for (const tile of board.tiles) {
    const [x,y,width,height]=rectangles[tile.id-1];context.save();context.beginPath();context.roundRect(x,y,width,height,12);context.clip();context.fillStyle=tile.background;context.fillRect(x,y,width,height);
    if (tile.src) {
      const media=tile.type.startsWith('video/')?document.querySelector(`.bento-tile-${tile.id} video`):await loadImage(tile.src);
      const iw=media?.videoWidth||media?.naturalWidth, ih=media?.videoHeight||media?.naturalHeight;
      if(!iw||!ih)throw new Error(`Tile ${tile.id} is still loading. Try the image download again.`);
      const scale=tile.fit==='cover'?Math.max(width/iw,height/ih):Math.min(width/iw,height/ih);
      const dw=iw*scale,dh=ih*scale;
      context.drawImage(media,x+(width-dw)*tile.positionX/100,y+(height-dh)*tile.positionY/100,dw,dh);
    }
    context.restore();
  }
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw new Error('The image could not be exported. Try downloading the project.');
  download(blob,'19-studio-bento.png');setMessage('Bento image downloaded. Motion tiles use the current frame.');
}
async function importProject(file) {
  if (!file) return;
  if (file.size>MAX_PROJECT*1.5) throw new Error('This project is too large. Keep the uploaded media under 60 MB.');
  let value;try{value=JSON.parse(await file.text());}catch{throw new Error('Choose a valid Bento project JSON file.');}
  if(value.kind!=='19-studio-bento'||value.schemaVersion!==1)throw new Error('Choose a project downloaded from this Bento editor.');
  const imported=validateBoard(value.board);
  if(mediaSize(imported)>MAX_PROJECT)throw new Error('This project contains more than 60 MB of uploaded media.');
  board=imported;dirty=true;selected=1;setMessage('Project imported as a draft. Publish to share it.');paint('bento-title');await saveDraft();
}
async function waitForDeployment(sha, generation) {
  for (let i=0;i<24;i++) {
    await new Promise(resolve=>setTimeout(resolve,10000));
    if(generation!==pendingDeployment)return;
    let result;try{result=await deploymentStatus(githubToken,sha);}catch{setMessage('Saved to GitHub. Open publishing status to check the website update.');return;}
    if(result.status==='completed') {
      setMessage(result.conclusion==='success'?(dirty?'The published version is live. You have unpublished draft changes.':'Published. Everyone can now see this board.'):'The board was saved to GitHub, but website publishing did not finish. Check the publishing run.',result.conclusion!=='success');
      return;
    }
  }
  setMessage('The board is saved to GitHub. Website publishing is still running.');
}
async function publish() {
  if (!githubToken) {connectionOpen=true;setMessage('Connect GitHub below to publish this board.');paint();document.getElementById('bento-github-token')?.focus();return;}
  if(publishing||!dirty)return;
  publishing=true;paint();
  try {
    const result=await publishBoard({token:githubToken,board,baseUpdatedAt,onProgress:setMessage});
    board=result.board;publishedBoard=structuredClone(board);baseUpdatedAt=board.updatedAt;dirty=false;
    publicationUrl=`https://github.com/${repository}/actions`;setMessage('Saved to GitHub. Publishing the website…');await saveDraft();void waitForDeployment(result.pagesSha,++pendingDeployment);
  } catch(error) {
    if(error.savedBoard){board=error.savedBoard;baseUpdatedAt=board.updatedAt;dirty=true;await saveDraft();}
    throw error;
  } finally {publishing=false;paint('bento-status');}
}
document.addEventListener('submit',async event=>{
  if(event.target.id!=='bento-connect-form')return;event.preventDefault();
  const field=document.getElementById('bento-github-token'),candidate=field.value.trim();field.value='';
  if(!candidate)return;
  try{setMessage('Checking the GitHub connection…');githubUser=await connectGitHub(candidate);githubToken=candidate;connectionOpen=false;setMessage(`Connected as ${githubUser}. You can publish your draft.`);paint();}
  catch(error){githubToken='';githubUser='';setMessage(error.message,true);}
});
document.addEventListener('click',async event=>{
  if(!event.target.closest('#bento-editor'))return;
  const uploadButton=event.target.closest('[data-bento-upload]');
  if(uploadButton){if(publishing||preview)return;selected=Number(uploadButton.dataset.bentoUpload);paint();document.getElementById('bento-file').click();return;}
  const action=event.target.closest('[data-bento-action]')?.dataset.bentoAction;if(!action)return;
  try {
    if(action==='retry'){await initBentos();return;}
    if(action==='preview'){preview=!preview;paint();}
    if(action==='motion'){motionPaused=!motionPaused;paint();}
    if(action==='connection'){connectionOpen=!connectionOpen;paint();if(connectionOpen)document.querySelector('.bento-connection')?.scrollIntoView({block:'nearest'});}
    if(action==='disconnect'){githubToken='';githubUser='';connectionOpen=false;setMessage('Disconnected from GitHub.');paint();}
    if(action==='import')document.getElementById('bento-project-file').click();
    if(action==='export')await exportProject();
    if(action==='png')await exportImage();
    if(action==='remove'){board.tiles.find(tile=>tile.id===selected).src=null;dirty=true;setMessage(`Tile ${selected} is empty in your draft.`);paint();await saveDraft();}
    if(action==='cancel-reset'){resetRequested=false;paint();}
    if(action==='load-published'||action==='confirm-reset'){
      if(dirty&&action!=='confirm-reset'){resetRequested=true;paint();return;}
      resetRequested=false;
      const latest=await fetchPublished();publishedBoard=latest;board=structuredClone(latest);baseUpdatedAt=latest.updatedAt;dirty=false;setMessage('Loaded the latest published board.');paint();await saveDraft();
    }
    if(action==='publish')await publish();
  }catch(error){setMessage(error.message||'This action could not be completed. Your draft is safe.',true);}
});
document.addEventListener('change',async event=>{
  if(!event.target.closest('#bento-editor'))return;
  try{
    if(event.target.id==='bento-file'){await upload(event.target.files[0],selected);return;}
    if(event.target.id==='bento-project-file'){await importProject(event.target.files[0]);return;}
    if(event.target.id==='bento-selected'){selected=Number(event.target.value);paint('bento-selected');return;}
    const key=event.target.dataset.bentoField;if(!key||publishing)return;
    const value=event.target.type==='range'?Number(event.target.value):event.target.value;
    if(key==='title')board.title=String(value).slice(0,120);else board.tiles.find(tile=>tile.id===selected)[key]=value;
    dirty=true;const id=event.target.id;paint(id);await saveDraft();
  }catch(error){setMessage(error.message,true);}
});
document.addEventListener('dragover',event=>{if(event.target.closest('[data-bento-drop],.bento-tile'))event.preventDefault();});
document.addEventListener('drop',async event=>{
  const target=event.target.closest('[data-bento-drop],[data-bento-upload]');if(!target||!event.target.closest('#bento-editor'))return;event.preventDefault();if(publishing||preview)return;
  const id=Number(target.dataset.bentoDrop||target.dataset.bentoUpload);
  try{await upload(event.dataTransfer.files[0],id);}catch(error){setMessage(error.message,true);}
});
