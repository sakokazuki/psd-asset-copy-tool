
const createSpirtes = require('./lib/create-sprites');
const createImagesStyle = require('./lib/create-images-style');

const config = {
  baseDir: "/Users/***/InVision/***@****.com/your_project_name/Assets/Source Files", //psdが入っているルートディレクトリ(google driveの)
  psdNames: ["01_Home", "01_Home_sp"], //対象psdリスト
  imageDirName: "img", //psd書き出すときの対象フォルダ名(画像)
  spriteDirName: "sprite", //psd書き出すときの対象フォルダ名(sprite)
  imageDestPath: "source/assets/img", //画像吐き出し先
  styleDestPath: "source/style/mixins", //stylus吐き出し先
  imageRelativePath: "../img/sprite/", //css spriteが参照する画像のパス(background-image: url(../hoge.png)のprefix)
}


const main = ()=>{
  createImagesStyle(config);
  createSpirtes(config);
}

main();
