import {randomBytes} from 'node:crypto';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const file='.env.integration.local';
let secret;
if(fs.existsSync(file))secret=fs.readFileSync(file,'utf8').match(/^CALENDLY_WEBHOOK_SIGNING_KEY=(.+)$/m)?.[1];
if(!secret){secret=randomBytes(32).toString('hex');fs.writeFileSync(file,`CALENDLY_WEBHOOK_SIGNING_KEY=${secret}\n`,{mode:0o600});}
const r=spawnSync(process.execPath,['/Users/christianbarry/.npm/_npx/09c35f05f7dedb59/node_modules/vercel/dist/index.js','env','add','CALENDLY_WEBHOOK_SIGNING_KEY','preview','--sensitive'],{input:secret,encoding:'utf8'});
console.log(r.status===0?'Preview webhook signing secret configured.':'Preview secret setup returned status '+r.status);if(r.status!==0)process.exitCode=1;
