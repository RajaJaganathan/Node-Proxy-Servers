var fs = require('fs');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var proxy = require('http-proxy-middleware');
var minimatch = require('minimatch');


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
    '/v1/js/talent/privacyPolicy': './mockdata/comments.json',
    '/v1/js/talent/**/roles': './mockdata/comments.json'
};


function getPath(url) {
    for (var path in pathMap) {
        if (minimatch(url, path)) {
            return path;
        }
    }
    return null;
}

gulp.task('dev', function() {
    browserSync.init({
        server: {
            baseDir: ".",
            notify: true,
            middleware: [{
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
                },
                require('connect-history-api-fallback')() //SPA refresh 
            ]
        }
    });
});



//Local API Proxy

var localProxyMiddleware = proxy('/api', {
    target: 'http://localhost:3000',
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: { //NOTE: ORDER IS IMPORTANT HERE
        '/api/posts/[0-9]/edit': '/mockdata/posts_edit_1.json',
        '/api/comments/[0-9]/edit': '/mockdata/comments_edit_1.json',
        '/api/posts/[0-9]': '/mockdata/posts_1.json',
        '/api/comments/[0-9]': '/mockdata/comments_1.json',
        '/api/posts': '/mockdata/posts.json',
        '/api/comments': '/mockdata/comments.json'
    }
    // pathRewrite: { //NOTE: ORDER IS NOT IMPORTANT HERE       
    //     '^/api/posts/?(.*)': '/mockdata/posts.json',
    //     '^/api/comments/?(.*)': '/mockdata/comments.json'
    // }
});

gulp.task('default', function() {
    browserSync.init({
        server: {
            baseDir: ".",
            middleware: [
                localProxyMiddleware
            ]
        }
    });
});


//API Proxy

// https://filemakerjobs-di.rno.apple.com/app/api/v1/js/talent/privacyPolicy
var apiProxyMiddleware = proxy('/app', {
    target: 'https://filemakerjobs-di.rno.apple.com/',
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
        // '/api': ''
    },
    router: { // Some request to other server
        // '/posts': 'http://www.sub.example.com/'
    }
});


gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: ".",
            middleware: [
                apiProxyMiddleware
            ]
        }
    });
});
