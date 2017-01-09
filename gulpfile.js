var fs = require('fs');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var proxy = require('http-proxy-middleware');
var minimatch = require('minimatch');
var request = require('request');


//Local Manual API
var pathMap = {
    '/posts/2/edit': './mockdata/posts_edit_2.json', //Exact match with first match
    '/posts/[0-9]/edit': './mockdata/posts_edit_1.json',
    '/comments/[0-9]/edit': './mockdata/comments_edit_1.json',
    '/posts/[0-9]': './mockdata/posts_1.json',
    '/comments/2': './mockdata/comments_2.json', //Exact match with first match
    '/comments/[0-9]': './mockdata/comments_1.json',
    '/posts': './mockdata/posts.json',
    '/comments': './mockdata/comments.json',
    '/v1/note/noteid/comments': './mockdata/comments.json',
    '/v1/note/noteid/**/id': './mockdata/comments.json'
};


function getPath(url) {
    for (var path in pathMap) {
        if (minimatch(url, path)) {
            return path;
        }
    }
    return null;
}

var localProxy = {
    route: "/api",
    handle: function(req, res, next) {
        var hasMockFile = getPath(req.url);
        if (hasMockFile) {
            var filePath = pathMap[hasMockFile];
            var body = JSON.stringify(JSON.parse(fs.readFileSync(filePath,
                'utf8')));
            res.setHeader("Content-Type", "application/json");
            res.end(body);
        }
        next();
    }
}

gulp.task('dev', function() {
    browserSync.init({
        server: {
            baseDir: ".",
            notify: true,
            middleware: [
                localProxy,
                require('connect-history-api-fallback')() //SPA refresh 
            ]
        }
    });
});

//API Proxy

var apiProxyMiddleware = proxy('/app', {
    target: 'http://yourlocal.dev',
    changeOrigin: true,
    secure: true,
    logLevel: 'debug',
});


gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: ".",
            proxy: {
                target: "http://yourlocal.dev",
                proxyReq: [
                    function(proxyReq) {
                        proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
                        proxyReq.setHeader('JSESSIONID', '1ui25hps8dro613myk812p87a');
                    }
                ]
            },
            middleware: [
                apiProxyMiddleware,
            ]
        }
    });
});
