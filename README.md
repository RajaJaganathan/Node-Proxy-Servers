# Node-Proxy-Server

Simple node proxy server is created by using express, browser-sync, http-proxy-middleware and gulp.

###BrowserSync Proxy Server:

'Server' gulp taks is very useful when your application running in local dev environment where as all your service(consuming) api on another server.  Usallly we got error like 'XMLHttpRequest cannot load http://domain.com/api/post. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'null' is therefore not allowed access'. In order resolve the above issue you  could use below gulp task.

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

At the same time we don't really need to hit really server on development environment. In this scenario we can use below gulp task which serve the mock data json instead of calling original service.

```
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
            var body = fs.readFileSync(filePath, 'utf8');
            res.setHeader("Content-Type", "application/json");
            res.end(body);
        } else {
            console.log('File not found ', req.url);
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
