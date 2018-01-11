const path = require('path');
const util = require('util');
const sizeOf = require('image-size');
const cpx = require('cpx');
const writeFile = require('./common').writeFile;
const searchFiles = require('./common').searchFiles;
const cpxCopy = util.promisify(cpx.copy);


let psdNames = "";
let baseDir = "";
let imageDirName = "";
let styleDestPath = "";
let imageDestPath = "";


const createStyluses = async (config)=> {
  psdNames = config.psdNames;
  baseDir = config.baseDir;
  styleDestPath = config.styleDestPath;
  imageDirName = config.imageDirName;
  imageDestPath = config.imageDestPath;

  for(const psd of psdNames){
    const p = path.join(baseDir, `${psd}-assets`, imageDirName)
    await createStylus(p, psd);
  }
}

const createStylus = async (dir, filename)=>{
  const files = await searchFiles(dir, /\.(png|jpeg|jpg|ico|gif)$/);
  const stylObjects = await createStyleObjects(files);
  const stylus = json2cssImg(stylObjects);
  await writeFile(`${styleDestPath}/${filename}.styl`, stylus);
  await cpxCopy(dir+'/**/*', imageDestPath);
  return 0;
}

const createStyleObjects = async (files)=>{
  let objects = [];
  for(const src of files){
    const object = await sizeOf(src);
    object.name = path.parse(src).name;
    objects.push(object);
  }

  return objects;
}

const json2cssImg = (styleObjs)=>{
  let styl = "";
  styleObjs.forEach((obj)=>{
    styl += createImageStyl(obj.name, obj.width, obj.height);
  });

  styl += `
imageSize($image)
  width: $image[0]
  height: $image[1]

imageSizeX2($image)
  width: $image[2]
  height: $image[3]
  `
  return styl;
}

const createImageStyl = (name, width, height)=>{
  return `
\$${name}_width = ${width}px
\$${name}_height = ${height}px
\$${name}_width_x2 = ${width/2}px
\$${name}_height_x2 = ${height/2}px
\$${name} = ${width}px ${height}px ${width/2}px ${height/2}px
  `
}

module.exports = createStyluses;