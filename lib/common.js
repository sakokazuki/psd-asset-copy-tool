const util = require('util');
const fs = require('fs');
const path = require('path');
const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);


const searchFiles = async (p, filter="")=>{
  const files = await readdir(p).catch((e)=>{
    // console.log("(ignored) about no file or directory")
    return [];
  });
  let arr = [];
  for (const f of files) {
    const fp = path.join(p, f);
    const isDirectory = fs.statSync(fp).isDirectory();

    if(isDirectory){
      const next = await searchFiles(fp, filter);
      arr = arr.concat(next);
      continue;
    }

    if(f.match(filter) == null) continue;
    arr.push(fp);
  }
  return arr;
}

module.exports = {
  searchFiles: searchFiles,
  writeFile: writeFile
}