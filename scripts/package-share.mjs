import {createHash} from 'node:crypto';
import {cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stamp=process.argv[2]??'2026-10-02';
if(!/^\d{4}-\d{2}-\d{2}$/.test(stamp))throw new Error('Date must be YYYY-MM-DD');
const work=mkdtempSync(path.join(os.tmpdir(),'claude-video-share-'));
const stage=path.join(work,'claude-video-lab');
const release=path.join(project,'releases');
mkdirSync(stage);mkdirSync(release,{recursive:true});

const allowed=[
  'AGENTS.md','PROJECT_GUIDE.md','README.md','package.json','package-lock.json',
  'skills-lock.json','tsconfig.json','remotion.config.ts','eslint.config.mjs',
  '.gitignore','.prettierrc','src','scripts','docs','prompts','.agents','public',
];
const excluded=new Set(['.DS_Store','.git','node_modules','.env']);
const filter=(file)=>{
  const name=path.basename(file);
  if(excluded.has(name)||name.startsWith('.env.')||name.endsWith('.aiff')||name==='sound-design-raw.wav')return false;
  if(lstatSync(file).isSymbolicLink())throw new Error(`Unexpected symlink: ${path.relative(project,file)}`);
  return true;
};
for(const item of allowed){
  const from=path.join(project,item);
  if(!existsSync(from))throw new Error(`Missing required project item: ${item}`);
  cpSync(from,path.join(stage,item),{recursive:true,filter});
}
const copy=(from,to)=>{
  if(!existsSync(path.join(project,from)))return false;
  const dest=path.join(stage,to);
  mkdirSync(path.dirname(dest),{recursive:true});
  cpSync(path.join(project,from),dest);return true;
};
copy('references/BV1b9ad6xEnD/analysis/视觉拆解.md','references/BV1b9ad6xEnD/analysis/视觉拆解.md');
copy('out/styleframes/contact-sheet.png','docs/previews/styleframes.png');
copy('out/film-check/contact-sheet-v2.png','docs/previews/v1-captions.png');
copy('out/v2-check/final-grid.jpg','docs/previews/v2-contact-sheet.jpg');
copy('out/becoming-v2.motion-check.json','docs/verification/v2-original.motion-check.json');

function files(dir){return readdirSync(dir).sort().flatMap(name=>{const full=path.join(dir,name);return statSync(full).isDirectory()?files(full):[full];});}
// Remove machine-specific output paths from the historical verification report.
const report=path.join(stage,'docs/verification/v2-original.motion-check.json');
if(existsSync(report)){
  const data=JSON.parse(readFileSync(report,'utf8'));
  data.file='out/becoming-v2.mp4';
  writeFileSync(report,JSON.stringify(data,null,2)+'\n');
}
const secretPatterns=[
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{25,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{35,}\b/,
  /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{30,}\b/,
];
for(const file of files(stage)){
  if(/\.(?:png|jpe?g|gif|mp4|wav|woff2?|ttf|ico)$/i.test(file))continue;
  const body=readFileSync(file,'utf8');
  if(secretPatterns.some(pattern=>pattern.test(body)))throw new Error(`Credential-like content: ${path.relative(stage,file)}`);
  if(/\/Users\/[^/\s]+\/|\/home\/[^/\s]+\//.test(body))throw new Error(`Personal absolute path: ${path.relative(stage,file)}`);
}

function manifest(kind){
  const entries=files(stage).filter(file=>path.basename(file)!=='PACKAGE_MANIFEST.json').map(file=>{
    const bytes=readFileSync(file);
    return {path:path.relative(stage,file).split(path.sep).join('/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
  });
  writeFileSync(path.join(stage,'PACKAGE_MANIFEST.json'),JSON.stringify({snapshotDate:stamp,kind,excluded:['node_modules','.git','.env','personal account configuration','third-party reference video and screenshots','raw audio intermediates','large video master'],files:entries},null,2)+'\n');
  return entries.length;
}
function archive(suffix){
  let dest=path.join(release,`claude-video-lab-${stamp}-${suffix}.zip`);
  if(existsSync(dest))dest=path.join(release,`claude-video-lab-${stamp}-${suffix}-${Date.now()}.zip`);
  const zip=spawnSync('zip',['-q','-r',dest,'claude-video-lab'],{cwd:work,env:{...process.env,COPYFILE_DISABLE:'1'}});
  if(zip.status!==0)throw new Error('ZIP creation failed');
  const check=spawnSync('unzip',['-tq',dest],{encoding:'utf8'});
  if(check.status!==0)throw new Error('ZIP integrity check failed');
  const sha256=createHash('sha256').update(readFileSync(dest)).digest('hex');
  writeFileSync(`${dest}.sha256`,`${sha256}  ${path.basename(dest)}\n`);
  return {path:dest,bytes:statSync(dest).size,sha256};
}
const sourceFiles=manifest('source');
const source=archive('source');
const sourceStage=path.join(work,'source-repository');
cpSync(stage,sourceStage,{recursive:true});
const videos=['out/claude-video-demo.mp4','out/signal-form-film.mp4','out/becoming-v2-telegram.mp4'];
let full=null;
if(videos.every(file=>existsSync(path.join(project,file)))){
  for(const file of videos)copy(file,file);
  copy('out/styleframes/contact-sheet.png','out/styleframes/contact-sheet.png');
  manifest('complete-with-samples');full=archive('complete');
}
console.log(JSON.stringify({sourceStage,sourceFiles,source,full},null,2));
