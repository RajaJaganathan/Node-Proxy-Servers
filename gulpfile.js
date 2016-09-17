var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var proxy = require('http-proxy-middleware');

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

var apiProxyMiddleware = proxy('/api', {
    target: 'https://jsonplaceholder.typicode.com',
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
        '/api': ''
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