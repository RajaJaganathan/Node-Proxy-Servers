# Node-Proxy-Server
Simple node proxy server by using express and http-proxy node moudles

###BrowserSync Proxy Server:

```

var apiProxyMiddleware = proxy('/api', {
    target: 'https://jsonplaceholder.typicode.com',
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
        '/api': '' //optional but current server no clue about URL pattern 
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

```

### BrowserSync Local Server

```
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

```
###Express Proxy Server:

```

var spawn = require('child_process').spawn;
var express = require('express');
var app = express();

var proxy = require('http-proxy-middleware');

var backend = 'http://www.example.com:8080',
    frontend = 'http://localhost:3000';

// https://www.npmjs.com/package/http-proxy-middleware

// proxy middleware options 
var options = {
    target: backend, // target host 
    changeOrigin: true, // needed for virtual hosted sites 
    ws: true, // proxy websockets 
    pathRewrite: {

    },
    router: {
        // when request.headers.host == 'dev.localhost:3000', 
        // override target 'http://www.example.org' to 'http://localhost:8000'
        // 'dev.localhost:3000' : 'http://localhost:8000'        
        // 'integration.localhost:3000': 'http://localhost:8001', // host only 
        // 'staging.localhost:3000': 'http://localhost:8002', // host only 
        // 'localhost:3000/api': 'http://localhost:8003', // host + path 
        // '/rest': 'http://localhost:8004' // path only 
    }
};

// create the proxy (without context) 
var exampleProxy = proxy(options);

// mount `exampleProxy` in web server 
var app = express();
app.use('/api', exampleProxy);
app.use(express.static(__dirname + '/build'));
app.listen(3000);


spawn('open', ['http://localhost:3000']);

console.log('Listening on http://localhost:3000');

```
