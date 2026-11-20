const API = 'https://api.github.com';
export const repository = 'NPCLABS-19/childhood-brand-atlas';
const root = `/repos/${repository}`;
const accepted = new Set(['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','video/mp4','video/webm']);
const extensions = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/svg+xml':'svg','video/mp4':'mp4','video/webm':'webm'};
const decodeText = content => new TextDecoder().decode(Uint8Array.from(atob(content.replace(/\s/g,'')), c => c.charCodeAt(0)));

export function validateBoard(value) {
  if (!value || value.version !== 1 || typeof value.title !== 'string' || value.title.length > 120 || !Array.isArray(value.tiles) || value.tiles.length !== 9) throw new Error('Choose a valid 19 studio Bento project with nine tiles.');
  const ids = new Set();
  for (const tile of value.tiles) {
    if (!Number.isInteger(tile.id) || tile.id < 1 || tile.id > 9 || ids.has(tile.id)) throw new Error('The project must have one of each of the nine tiles.');
    ids.add(tile.id);
    if (typeof tile.name !== 'string' || tile.name.length > 200 || !accepted.has(tile.type) || !['contain','cover'].includes(tile.fit) || !/^#[\da-f]{6}$/i.test(tile.background)) throw new Error('The project contains an unsupported tile.');
    for (const key of ['positionX','positionY']) if (!Number.isFinite(tile[key]) || tile[key] < 0 || tile[key] > 100) throw new Error('Image positions must be between 0 and 100.');
    if (tile.src !== null && (typeof tile.src !== 'string' || !/^(?:assignment\/amaira\/(?:\d{2}\.webp|extracted\/palette\.svg)|bentos\/media\/[a-f\d]{64}\.(?:png|jpg|webp|gif|svg|mp4|webm)|data:(?:image\/(?:png|jpeg|webp|gif|svg\+xml)|video\/(?:mp4|webm));base64,[A-Za-z\d+/=]+)$/.test(tile.src))) throw new Error('The project contains an unsupported media address.');
  }
  return structuredClone(value);
}

async function api(token, path, method = 'GET', body, fetchImpl = fetch) {
  const response = await fetchImpl(API + path, {
    method,
    headers: {Accept:'application/vnd.github+json', ...(token ? {Authorization:`Bearer ${token}`} : {}), 'X-GitHub-Api-Version':'2022-11-28', ...(body ? {'Content-Type':'application/json'} : {})},
    ...(body ? {body:JSON.stringify(body)} : {})
  });
  if (!response.ok) {
    const error = new Error(response.status === 401 ? 'The GitHub connection has expired. Connect again.' : response.status === 403 ? 'This GitHub token needs Contents and Pages: Read and write for this repository.' : response.status === 409 || response.status === 422 ? 'The repository changed while publishing. Your draft is safe; try publishing again.' : `GitHub could not complete this request (${response.status}). Your draft is safe.`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

export async function connectGitHub(token, fetchImpl = fetch) {
  const [user, repo] = await Promise.all([api(token, '/user', 'GET', null, fetchImpl), api(token, root, 'GET', null, fetchImpl), api(token, `${root}/pages`, 'GET', null, fetchImpl)]);
  if (!repo.permissions?.push) throw new Error('This account does not have permission to publish this repository.');
  return user.login;
}

export async function publishBoard({token, board, baseUpdatedAt, onProgress = () => {}, fetchImpl = fetch}) {
  if (!token) throw new Error('Connect GitHub before publishing.');
  const published = validateBoard(board);
  onProgress('Checking the published board…');
  const ref = await api(token, `${root}/git/ref/heads/main`, 'GET', null, fetchImpl);
  const parent = await api(token, `${root}/git/commits/${ref.object.sha}`, 'GET', null, fetchImpl);
  const remote = await api(token, `${root}/contents/dist/bentos/board.json?ref=${ref.object.sha}`, 'GET', null, fetchImpl);
  const remoteBoard = JSON.parse(decodeText(remote.content));
  if (baseUpdatedAt !== remoteBoard.updatedAt) throw new Error('Someone has published a newer board. Download your draft, then load the published board before making changes.');
  const tree = [];
  const blobs = new Map();
  for (const tile of published.tiles) {
    if (!tile.src?.startsWith('data:')) continue;
    const match = /^data:([^;]+);base64,(.*)$/.exec(tile.src);
    if (!match || !accepted.has(match[1]) || match[1] !== tile.type) throw new Error('An uploaded file has an unsupported format.');
    const bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
    const path = `bentos/media/${hash}.${extensions[tile.type]}`;
    if (!blobs.has(path)) {
      onProgress(`Uploading tile ${tile.id} of 9…`);
      const blob = await api(token, `${root}/git/blobs`, 'POST', {encoding:'base64', content:match[2]}, fetchImpl);
      blobs.set(path, blob.sha);
      tree.push({path:`dist/${path}`,mode:'100644',type:'blob',sha:blob.sha});
    }
    tile.src = path;
  }
  published.updatedAt = new Date().toISOString();
  const manifest = await api(token, `${root}/git/blobs`, 'POST', {encoding:'utf-8',content:JSON.stringify(published,null,2)+'\n'}, fetchImpl);
  tree.push({path:'dist/bentos/board.json',mode:'100644',type:'blob',sha:manifest.sha});
  onProgress('Saving the board to GitHub…');
  const nextTree = await api(token, `${root}/git/trees`, 'POST', {base_tree:parent.tree.sha,tree}, fetchImpl);
  const commit = await api(token, `${root}/git/commits`, 'POST', {message:`Publish bento: ${published.title.replace(/[\r\n]/g,' ')}`,tree:nextTree.sha,parents:[ref.object.sha]}, fetchImpl);
  try {
    await api(token, `${root}/git/refs/heads/main`, 'PATCH', {sha:commit.sha,force:false}, fetchImpl);
  } catch (error) {
    // A disconnected response may follow a successful write. Read the branch
    // before asking the owner to retry; never force a concurrent change away.
    try {
      const current = await api(token, `${root}/git/ref/heads/main`, 'GET', null, fetchImpl);
      if (current.object.sha !== commit.sha) throw error;
    } catch { throw error; }
  }
  try {
    const pagesSha = await publishToPages({token,mainCommit:commit.sha,mainTree:nextTree.sha,onProgress,fetchImpl});
    return {board:published,sha:commit.sha,pagesSha,url:`https://github.com/${repository}/commit/${commit.sha}`};
  } catch (error) {
    error.savedBoard = published;
    error.savedSha = commit.sha;
    error.message = `The board was saved to GitHub, but website publishing needs a retry. ${error.message}`;
    throw error;
  }
}

async function publishToPages({token,mainCommit,mainTree,onProgress,fetchImpl}) {
  onProgress('Updating the public website…');
  // Mirror the current dist tree, preserving any source changes that arrived
  // after our commit. The Pages branch always contains exactly dist's contents.
  const current = await api(token, `${root}/git/ref/heads/main`, 'GET', null, fetchImpl);
  if (current.object.sha !== mainCommit) {
    const latest = await api(token, `${root}/git/commits/${current.object.sha}`, 'GET', null, fetchImpl);
    mainTree = latest.tree.sha;
  }
  const source = await api(token, `${root}/git/trees/${mainTree}`, 'GET', null, fetchImpl);
  const dist = source.tree.find(entry=>entry.path==='dist'&&entry.type==='tree');
  if (!dist) throw new Error('The website source folder could not be found.');
  const pages = await api(token, `${root}/git/ref/heads/gh-pages`, 'GET', null, fetchImpl);
  const commit = await api(token, `${root}/git/commits`, 'POST', {message:'Publish shared Bento board',tree:dist.sha,parents:[pages.object.sha]}, fetchImpl);
  try {
    await api(token, `${root}/git/refs/heads/gh-pages`, 'PATCH', {sha:commit.sha,force:false}, fetchImpl);
  } catch (error) {
    try {
      const current = await api(token, `${root}/git/ref/heads/gh-pages`, 'GET', null, fetchImpl);
      if (current.object.sha !== commit.sha) throw error;
    } catch { throw error; }
  }
  await api(token, `${root}/pages/builds`, 'POST', null, fetchImpl);
  return commit.sha;
}

export async function deploymentStatus(sha, fetchImpl = fetch) {
  const builds = await api('', `${root}/pages/builds?per_page=10`, 'GET', null, fetchImpl);
  const build = builds.find(build=>build.commit===sha);
  return build ? {status:['built','errored'].includes(build.status)?'completed':build.status,conclusion:build.status==='built'?'success':build.status==='errored'?'failure':null,url:`https://github.com/${repository}/actions`} : {status:'queued'};
}
