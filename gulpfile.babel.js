'use strict';
import gulp from 'gulp';                        //获取gulp
import browsersync from 'browser-sync';   //获取browsersync
import babel from 'gulp-babel';         //gulp-babel插件
import uglify from 'gulp-uglify';               //js压缩插件
import concat from 'gulp-concat';               //js合并插件
import del from 'del';                     //删除插件
import cssnano from 'gulp-cssnano';    //css压缩插件
import less from 'gulp-less';             //less文件编译
import imagemin from 'gulp-imagemin';  //图片压缩插件
import cache from 'gulp-cache';
import pngquant from 'imagemin-pngquant';
import htmlmin from 'gulp-htmlmin';    //html压缩插件
import rev from 'gulp-rev'; // - 对文件名加MD5后缀
import revCollector from 'gulp-rev-collector'; // - 对文件名加MD5后缀
import gulpSequence from 'gulp-sequence';
import autoprefixer from 'gulp-autoprefixer'; //给css3属性添加浏览器前缀，增加兼容性，稳定性
//移动端
import px2rem from 'gulp-px2rem-plugin2';

const autoprefixerOption = {
    browsers: ['last 5 versions', "iOS >= 7", 'Android >= 4.0'],
    cascade: true, //是否美化属性值 默认：true 像这样：
    remove: true //是否去掉不必要的前缀 默认：true 
}

//移动端
const px2remOption = {
    width_design: 750,//设计稿宽度。默认值640
    valid_num: 2,//生成rem后的小数位数。默认值4
    pieces: 10,//将整屏切份。默认为10，相当于10rem = width_design(设计稿宽度)
    ignore_px: [1, 2],//让部分px不在转换成rem。默认为空数组
    ignore_selector: [],//让部分选择器不在转换为rem。默认为空数组
    if_use_flexible: true,//是都使用flexible
}

const imageOption = {
    optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
    progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
    interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
    multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],//不要移除svg的viewbox属性
    use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
}

//less
const targetLessArrPath = "./src/less/**/*.{css,less}";
const desLessPath = "./dist/css";
const desRevLessPath = "./rev/less";
const desRevCssImagesPath = "./rev/cssMd5Images";

//packageCss
const targetPackageCssArrPath = "./src/packages/**/*.{css,min.css}";
const desPackageCssPath = "./dist/packages";
const desRevPackageCssPath = "./rev/packageCss";

//es6Js
const targetEs6ArrPath = "./src/js/**/*.js";
const desJsPath = "./dist/js";
const desRevJsPath = "./rev/Es6Js";
const desRevJsImagesPath = "./rev/JsMd5Images";

//packageJs
const targetPackageJsArrPath = "./src/packages/**/*.{js,min.js}";
const desPackageJsPath = "./dist/packages";
const desRevPackageJsPath = "./rev/packageJs";

//图片
const targetImagesPath = "./src/images/**/*.{png,jpg,jpeg,gif,ico}";
const desImagesPath = "./dist/images";
const desRevImagesPath = "./rev/images";

//页面
const targetHtmlPath = "./src/**/*.html";
const desHtmlPath = "./dist";
const delHtmlPath = "./dist/**/*.html";

const revPath = "./rev/**";
const distPath = "./dist/**";

// md5
const targetMd5ImagesLess = "./rev/cssMd5Images/less/**/*.{css,less}";
const targetMd5PackageCss = "./rev/cssMd5Images/packages/**/*.{css,min.css}";
const targetMd5ImagesEs6Js = "./rev/JsMd5Images/js/**/*.js";
const targetMd5ImagesPackageJs = "./rev/JsMd5Images/packages/**/*.{js,min.js}";

gulp.task('clean-dist', (cb) => {
    return del([distPath], cb);
});

gulp.task('clean-rev', (cb) => {
    return del([revPath], cb);
});

//操作packageJs文件
gulp.task('packageJs-rel', (cb) => {
    gulp.src(targetMd5ImagesPackageJs)            //需要操作的源文件
        .pipe(uglify()) //压缩js文件  不能放前面
        .pipe(rev())
        .pipe(gulp.dest(desPackageJsPath))   //把操作好的文件放到dist/js目录下
        .pipe(rev.manifest())
        .pipe(gulp.dest(desRevPackageJsPath))
        .on('end', cb);

});

gulp.task('packageJs-dev', () => {
    gulp.src(targetPackageJsArrPath)            //需要操作的源文件
        .pipe(gulp.dest(desPackageJsPath))   //把操作好的文件放到dist/js目录下
        .pipe(browsersync.stream())  //文件有更新自动执行
});


//操作Es6Js文件
gulp.task('Es6Js-rel', (cb) => {
    gulp.src(targetMd5ImagesEs6Js)            //需要操作的源文件
        .pipe(babel({ //靠这个插件编译
            presets: ['env']
        }))
        .pipe(uglify()) //压缩js文件  不能放前面
        .pipe(rev()) //给文件设置hash
        .pipe(gulp.dest(desJsPath))   //把操作好的文件放到dist/js目录下
        .pipe(rev.manifest()) //生成原始文件和新的hash文件对应关系的json文件
        .pipe(gulp.dest(desRevJsPath)) //放到rev文件下
        .on('end', cb);
});

gulp.task('Es6Js-dev', () => {
    gulp.src(targetEs6ArrPath)            //需要操作的源文件
        .pipe(babel({ //靠这个插件编译
            presets: ['env']
        }))
        .pipe(gulp.dest(desJsPath))   //把操作好的文件放到dist/js目录下
        .pipe(browsersync.stream())  //文件有更新自动执行
});

//操作less文件
gulp.task('less-rel', (cb) => {
    gulp.src(targetMd5ImagesLess)
        .pipe(less())//编译less文件
        .pipe(autoprefixer(autoprefixerOption))
        .pipe(cssnano({ safe: true }))
        .pipe(rev())
        .pipe(px2rem(px2remOption))  //这步操作不能放 rev()前面，会出问题
        .pipe(gulp.dest(desLessPath))
        .pipe(rev.manifest())
        .pipe(gulp.dest(desRevLessPath))
        .on('end', cb);
});

gulp.task('less-dev', () => {
    gulp.src(targetLessArrPath)
        .pipe(less())//编译less文件
        .pipe(autoprefixer(autoprefixerOption))
        .pipe(px2rem(px2remOption))
        .pipe(gulp.dest(desLessPath))
        .pipe(browsersync.stream())
});

//操作css文件
gulp.task('packageCss-rel', (cb) => {
    gulp.src(targetMd5PackageCss)
        .pipe(autoprefixer(autoprefixerOption))
        .pipe(cssnano({ safe: true }))
        .pipe(rev())
        .pipe(px2rem(px2remOption))                    //css压缩
        .pipe(gulp.dest(desPackageCssPath))
        .pipe(rev.manifest())
        .pipe(gulp.dest(desRevPackageCssPath))
        .on('end', cb);
});

gulp.task('packageCss-dev', () => {
    gulp.src(targetPackageCssArrPath)
        .pipe(autoprefixer(autoprefixerOption))
        .pipe(px2rem(px2remOption))
        .pipe(gulp.dest(desPackageCssPath))
        .pipe(browsersync.stream())
});

//操作图片文件
gulp.task('image-rel', (cb) => {
    gulp.src(targetImagesPath)
        .pipe(imagemin(imageOption))
        .pipe(rev())
        .pipe(gulp.dest(desImagesPath))
        .pipe(rev.manifest())
        .pipe(gulp.dest(desRevImagesPath))
        .on('end', cb);
});

gulp.task('image-dev', () => {
    gulp.src(targetImagesPath)
        .pipe(gulp.dest(desImagesPath))
        .pipe(browsersync.stream())
});


gulp.task('html-rel', (cb) => {
    const option = {
        removeComments: true,                //清除html注释
        collapseWhitespace: true,            //压缩html
        collapseBooleanAttributes: true,     //省略布尔属性的值
        removeEmptyAttributes: true,         //删除所有空格作为属性值
        removeScriptTypeAttributes: false,    //删除type=text/javascript
        removelessLinkTypeAttributes: false, //删除type=text/css
        minifyJS: false,                       //压缩页面js
        minifyCSS: false                       //压缩页面css
    };
    gulp.src(targetHtmlPath)
        .pipe(gulp.dest(desHtmlPath))
        .on('end', cb);
});

gulp.task('html-dev', () => {
    gulp.src(targetHtmlPath)
        .pipe(gulp.dest(desHtmlPath))
        .pipe(browsersync.stream())
});

// 根据文件名对应关系，遍历所有html，替换文件命名
gulp.task('rev', (cb) => {
    gulp.src(['./rev/**/*.json', targetHtmlPath])
        .pipe(revCollector())
        .pipe(gulp.dest(desHtmlPath))
        .on('end', cb);
});

gulp.task('rev-image-css', (cb) => {
    gulp.src(['./rev/images/*.json', './src/**/*.{less,css,min.css}'])
        .pipe(revCollector())
        .pipe(gulp.dest(desRevCssImagesPath))
        .on('end', cb);
})

gulp.task('rev-image-js', (cb) => {
    gulp.src(['./rev/images/*.json', './src/**/*.{js,min.js}'])
        .pipe(revCollector())
        .pipe(gulp.dest(desRevJsImagesPath))
        .on('end', cb);
})


//监控文件变化，自动更新
gulp.task('watch', () => {
    gulp.watch(targetLessArrPath, ['less-dev']);
    gulp.watch(targetPackageCssArrPath, ['packageCss-dev']);
    gulp.watch(targetEs6ArrPath, ['Es6Js-dev']);
    gulp.watch(targetPackageJsArrPath, ['packageJs-dev']);
    gulp.watch(targetImagesPath, ['image-dev']);
    gulp.watch(targetHtmlPath, ['html-dev']);
})

gulp.task('serve', () => {
    browsersync.init({
        port: 8000,
        server: {
            baseDir: ['dist'],
            routes: { //匹配路由
                '/node_modules': 'node_modules'
            }
        }
    });
});



gulp.task('dev', gulpSequence('clean-dist', ['less-dev', 'packageCss-dev', 'Es6Js-dev', 'packageJs-dev', 'image-dev', 'html-dev'], 'watch', 'serve'));

gulp.task('build-rel', gulpSequence('clean-dist', 'image-rel', 'rev-image-css', 'rev-image-js', ['less-rel', 'packageCss-rel', 'Es6Js-rel', 'packageJs-rel', 'html-rel'], 'rev', 'clean-rev'));

gulp.task('rel-preview', gulpSequence('clean-dist', 'image-rel', 'rev-image-css', 'rev-image-js', ['less-rel', 'packageCss-rel', 'Es6Js-rel', 'packageJs-rel', 'html-rel'], 'rev', 'clean-rev', 'serve'));

//开发
gulp.task('default', ['dev']);
//生产预览
gulp.task('rel', ['rel-preview']);
//生产
gulp.task('build', ['build-rel']);

gulp.task('web', ['serve']);