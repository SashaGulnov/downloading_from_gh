const git = require('simple-git');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const USER = 'GH_USERNAME';
const PASS = 'GH_TOKEN';
const REPO = 'github.com/MadMaxInsight/pld24_develope.git';

const remoteRepo = `https://${USER}:${PASS}@${REPO}`;

const destination = path.resolve("./pld24_testing")

async function checkDestination (dest) {
  fs.access(dest, notExists => {
    if (notExists) {
        fs.mkdirSync(dest);
    } 
  });
}

async function gitPull(dest) {
  try{
    console.log('PULLING!');
    await git(dest).pull();
  }
  catch (e) {
    console.log(e);
  }
}

async function gitClone( repo, dest ) {
  try {
    console.log('CLONNING!');
    await git().clone(repo, dest)
  }
  catch (e) {
    console.log("Is already clonned");
  }
}

async function gitDiff (dest) {
  try{
    return await git(dest).diff(["--name-only", "dbbfd70aca171c2cc2aa4686569b92717ec0a7f0", "HEAD"])
  }
  catch (e) {
    console.log(e);
  }
}

async function copyFiles (workDir, filesName) {
  try{
  let targetDir = process.cwd() + path.sep + 'export' + path.sep;
  process.chdir(workDir);
  console.log(targetDir, workDir);
  filesName = filesName.replaceAll('/', path.sep)
  filesName = filesName.trim().split('\n')
  for (let name of filesName ) {
    let curTargetDir = path.parse( targetDir+name).dir;
    if (!fs.existsSync(curTargetDir)) {
      fs.mkdirSync(curTargetDir, {
        recursive: true
      });
}
  }

  for (let name of filesName ) {
    let curTargetName = targetDir+name;
    let readableStream = fs.createReadStream(name);
    let writebleStream = fs.createWriteStream(curTargetName);
    pipeline (
      readableStream,
      writebleStream,
      err => {
        if (err) console.log('Error: ', err)
      }
    )
  }
}
  
  catch (e) {
    console.log(e);
  }
}

async function gitMain ( repo, dest ) {
  try {
    await gitClone(repo, dest)
    await gitPull(dest);
    let filesName = await gitDiff(dest);
    await copyFiles(dest, filesName)
  }
  catch (e) { 
    console.log(e);
  }
}

checkDestination (destination);
gitMain(remoteRepo, destination);
