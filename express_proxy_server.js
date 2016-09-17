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
