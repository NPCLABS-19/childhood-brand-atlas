import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publishBoard, validateBoard, connectGitHub, deploymentStatus} from '../dist/bento-publish.js';

const original = JSON.parse(await readFile(new URL('../dist/bentos/board.json',import.meta.url),'utf8'));
function github({stale=false,writeFailure=false,writeAccepted=false,pagesFailure=false}={}) {
  const calls=[];let blobs=0,head='old-head',pagesHead='old-pages';
  const fetchImpl=async (url,options)=>{
    assert.ok(url.startsWith('https://api.github.com/'));
    assert.equal(options.headers.Authorization,'Bearer test-credential');
    const path=new URL(url).pathname,body=options.body?JSON.parse(options.body):null;
    calls.push({path,method:options.method,body});
    let value;
    if(path==='/user')value={login:'NPCLABS-19'};
    else if(path.endsWith('/childhood-brand-atlas'))value={permissions:{push:true}};
    else if(path.endsWith('/git/ref/heads/main'))value={object:{sha:head}};
    else if(path.endsWith('/git/ref/heads/gh-pages'))value={object:{sha:pagesHead}};
    else if(path.endsWith('/git/commits/old-head'))value={tree:{sha:'base-tree'}};
    else if(path.endsWith('/git/trees/next-tree'))value={tree:[{path:'dist',type:'tree',sha:'dist-tree'}]};
    else if(path.endsWith('/contents/dist/bentos/board.json'))value={content:Buffer.from(JSON.stringify({...original,updatedAt:stale?'newer-version':original.updatedAt})).toString('base64')};
    else if(path.endsWith('/git/blobs'))value={sha:`blob-${++blobs}`};
    else if(path.endsWith('/git/trees'))value={sha:'next-tree'};
    else if(path.endsWith('/git/commits'))value={sha:body.tree==='dist-tree'?'pages-commit':'published-commit'};
    else if(path.endsWith('/git/refs/heads/main')){
      if(writeAccepted)head='published-commit';
      if(writeFailure)throw new TypeError('Network response lost');
      head='published-commit';value={object:{sha:head}};
    } else if(path.endsWith('/git/refs/heads/gh-pages')){
      if(pagesFailure)throw new Error('Pages branch update failed');
      pagesHead='pages-commit';value={object:{sha:pagesHead}};
    } else if(path.endsWith('/pages/builds'))value={status:'queued'};
    else if(path.endsWith('/pages'))value={status:'built'};
    else throw new Error(`Unexpected request ${url}`);
    return new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}});
  };
  return {calls,fetchImpl};
}
test('all uploaded assets and manifest are committed together, preserving the rest of main',async()=>{
  const board=structuredClone(original),server=github();
  board.tiles[0].src='data:image/png;base64,aGVsbG8=';board.tiles[0].type='image/png';
  const result=await publishBoard({token:'test-credential',board,baseUpdatedAt:original.updatedAt,fetchImpl:server.fetchImpl});
  const tree=server.calls.find(call=>call.path.endsWith('/git/trees')).body;
  assert.equal(tree.base_tree,'base-tree');assert.equal(tree.tree.length,2);
  assert.match(result.board.tiles[0].src,/^bentos\/media\/[a-f0-9]{64}\.png$/);
  assert.ok(!JSON.stringify(result.board).includes('data:image/'));
  assert.deepEqual(server.calls.find(call=>call.method==='PATCH').body,{sha:'published-commit',force:false});
  assert.deepEqual(server.calls.filter(call=>call.method==='PATCH')[1].body,{sha:'pages-commit',force:false});
  assert.equal(result.pagesSha,'pages-commit');
  assert.ok(server.calls.some(call=>call.path.endsWith('/pages/builds')&&call.method==='POST'));
  assert.ok(!JSON.stringify(server.calls.map(call=>call.body)).includes('test-credential'));
  assert.equal(board.tiles[0].src,'data:image/png;base64,aGVsbG8=');
});
test('publishing refuses to overwrite a newer public board before writing assets',async()=>{
  const server=github({stale:true});
  await assert.rejects(publishBoard({token:'test-credential',board:original,baseUpdatedAt:original.updatedAt,fetchImpl:server.fetchImpl}),/newer board/);
  assert.equal(server.calls.filter(call=>call.method!=='GET').length,0);
});
test('duplicate uploaded media creates one content-addressed asset',async()=>{
  const board=structuredClone(original),server=github();
  for(const tile of board.tiles.slice(0,2)){tile.src='data:image/png;base64,aGVsbG8=';tile.type='image/png';}
  const result=await publishBoard({token:'test-credential',board,baseUpdatedAt:original.updatedAt,fetchImpl:server.fetchImpl});
  assert.equal(server.calls.filter(call=>call.path.endsWith('/git/blobs')).length,2);
  assert.equal(result.board.tiles[0].src,result.board.tiles[1].src);
});
test('a successful write with a lost response is recovered by branch readback',async()=>{
  const server=github({writeFailure:true,writeAccepted:true});
  const result=await publishBoard({token:'test-credential',board:original,baseUpdatedAt:original.updatedAt,fetchImpl:server.fetchImpl});
  assert.equal(result.sha,'published-commit');
});
test('a failed branch write keeps the draft unchanged and reports the failure',async()=>{
  const board=structuredClone(original),server=github({writeFailure:true});
  await assert.rejects(publishBoard({token:'test-credential',board,baseUpdatedAt:original.updatedAt,fetchImpl:server.fetchImpl}),/Network response lost/);
  assert.deepEqual(board,original);
});
test('import rejects external media addresses, duplicate tiles and injected styles',()=>{
  const external=structuredClone(original);external.tiles[0].src='https://example.com/tracker.png';assert.throws(()=>validateBoard(external),/address/);
  const duplicate=structuredClone(original);duplicate.tiles[1].id=1;assert.throws(()=>validateBoard(duplicate),/one of each/);
  const style=structuredClone(original);style.tiles[0].background='red;position:fixed';assert.throws(()=>validateBoard(style),/unsupported/);
});
test('the GitHub connection checks identity and repository write access',async()=>{
  const server=github();assert.equal(await connectGitHub('test-credential',server.fetchImpl),'NPCLABS-19');
});
test('a Pages failure returns the saved source board so the editor can retry without a false conflict',async()=>{
  const server=github({pagesFailure:true});
  await assert.rejects(publishBoard({token:'test-credential',board:original,baseUpdatedAt:original.updatedAt,fetchImpl:server.fetchImpl}),error=>{
    assert.equal(error.savedSha,'published-commit');assert.ok(error.savedBoard.updatedAt!==original.updatedAt);assert.match(error.message,/saved to GitHub/);return true;
  });
});
test('deployment completion belongs to the exact Pages commit and uses the owner connection only at GitHub',async()=>{
  const fetchImpl=async(url,options)=>{
    assert.ok(url.endsWith('/pages/builds?per_page=10'));assert.equal(options.headers.Authorization,'Bearer test-credential');
    return new Response(JSON.stringify([{commit:'different-commit',status:'built'},{commit:'my-pages',status:'building'}]));
  };
  assert.equal((await deploymentStatus('test-credential','my-pages',fetchImpl)).status,'building');
  assert.equal((await deploymentStatus('test-credential','missing',fetchImpl)).status,'queued');
});
