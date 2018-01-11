const path = require('path');
const util = require('util');
const spritesmith = require('spritesmith');
const spritesmithRun = util.promisify(spritesmith.run);
const writeFile = require('./common').writeFile;
const searchFiles = require('./common').searchFiles;

let psdNames = "";
let baseDir = "";
let spriteDirName = "";
let styleDestPath = "";
let imageDestPath = "";
let imageRelativePath = "";

const createSpirtes = async (config)=> {
  psdNames = config.psdNames;
  baseDir = config.baseDir;
  spriteDirName = config.spriteDirName;
  styleDestPath = config.styleDestPath;
  imageDestPath = config.imageDestPath;
  imageRelativePath = config.imageRelativePath;

  for(const psd of psdNames){
    const p = path.join(baseDir, `${psd}-assets`, spriteDirName)
    await createSpirte(p, psd);
  }
}

const createSpirte = async (dir, psdName)=>{
  const files = await searchFiles(dir, /\.(png)$/)
  const filesObject = dividSpriteGroup(files);
  for(const key of Object.keys(filesObject)) {
    await sprite(filesObject[key], dir, psdName);
  }
}

const sprite = async (files, rootdir, psdName)=>{
  const result = await spritesmithRun({src: files});

  const iw = result.properties.width;
  const ih = result.properties.height;
  let styleObjs = [];
  const imageName = spriteImageName(rootdir, files[0], psdName);
  for(const key of Object.keys(result.coordinates)) {
    const coord = result.coordinates[key];
    let obj = {};
    obj.name = spriteVariableName(rootdir, key, psdName);
    obj.x = coord.x;
    obj.y = coord.y;
    obj.width = coord.width;
    obj.height = coord.height;
    obj.totalWidth = iw;
    obj.totalHeight = ih;
    obj.path = path.join(imageRelativePath,imageName) + '.png';
    styleObjs.push(obj);
  }
  const stylus = json2cssSprite(styleObjs);
  await writeFile(`${styleDestPath}/sprite/${imageName}.styl`, stylus);
  await writeFile(`${imageDestPath}/sprite/${imageName}.png`, result.image);
}

const spriteImageName = (rootdir, filepath, psdName)=>{
  const relativePath = path.parse(path.relative(rootdir, filepath));
  let prefix = ""
  for(const d of relativePath.dir.split(path.sep)){
    if(d === '') continue;
    prefix += "_";
    prefix += d;
  }
  return psdName + prefix;
}

const spriteVariableName = (rootdir, filepath, psdName)=>{
  const relativePath = path.parse(path.relative(rootdir, filepath));
  let prefix = ""

  for(const d of relativePath.dir.split(path.sep)){
    if(d === '') continue;
    prefix += d;
    prefix += "_";
  }
  return psdName + "_" + prefix + relativePath.name;
}

const dividSpriteGroup = (files)=>{
  let filesObject = {};
  for(const file of files){
    const parsed = path.parse(file);
    if(filesObject[parsed.dir] == null) filesObject[parsed.dir] = [];
    
    filesObject[parsed.dir].push(file);
  }
  return filesObject;
}



const json2cssSprite = (styleObjs)=> {
  let styl = "";
  styleObjs.forEach((obj)=>{
    styl += createSpriteStyl(obj);
  })
  styl += `
spriteWidth($sprite) {
  width: $sprite[4];
}

spriteHeight($sprite) {
  height: $sprite[5];
}

spritePosition($sprite) {
  background-position: $sprite[2] $sprite[3];
}

spriteImage($sprite) {
  background-image: url($sprite[8]);
}

sprite($sprite) {
  spriteImage($sprite)
  spritePosition($sprite)
  spriteWidth($sprite)
  spriteHeight($sprite)
}

spriteWidthX2($sprite) {
  width: ($sprite[4]/2);
}

spriteHeightX2($sprite) {
  height: ($sprite[5]/2);
}

spritePositionX2($sprite) {
  background-position: ($sprite[2]/2) ($sprite[3]/2);
}

spriteX2($sprite) {
  spriteImage($sprite)
  spritePositionX2($sprite)
  spriteWidthX2($sprite)
  spriteHeightX2($sprite)
  background-size: ($sprite[6]/2) auto
}
  `
  return styl;
}

const createSpriteStyl = (obj) =>{
  return `
\$${obj.name}_name = '${obj.name}'
\$${obj.name}_x = ${obj.x}px
\$${obj.name}_y = ${obj.y}px
\$${obj.name}_offset_x = ${-1*obj.x}px
\$${obj.name}_offset_y = ${-1*obj.y}px
\$${obj.name}_width = ${obj.width}px
\$${obj.name}_height = ${obj.height}px
\$${obj.name}_total_width = ${obj.totalWidth}px
\$${obj.name}_total_height = ${obj.totalHeight}px
\$${obj.name}_image = '${obj.path}'
\$${obj.name} = ${obj.x}px ${obj.y}px ${-1*obj.x}px ${-1*obj.y}px ${obj.width}px ${obj.height}px ${obj.totalWidth}px ${obj.totalHeight}px '${obj.path}' '${obj.name}'
  `
}


module.exports = createSpirtes;