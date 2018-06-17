"use strict";

let http = require('http');
let url = require('url');
let fs = require('fs');
let path = require('path');
let baseDirectory = __dirname;

let port = 5000;

http.createServer((request, response) => {
    try {
        let requestUrl = url.parse(request.url);

        // need to use path.normalize so people can't access directories underneath baseDirectory
        let fsPath = baseDirectory + path.normalize(requestUrl.pathname);

        let fileStream = fs.createReadStream(fsPath);
        fileStream.pipe(response);
        fileStream.on('open', function() {
            response.writeHead(200)
        });
        fileStream.on('error',function() {
            response.writeHead(404);     // assume the file doesn't exist
            response.end();
        })
    } catch(e) {
        response.writeHead(500);
        response.end();     // end the response so browsers don't hang
        console.log(e.stack);
    }
}).listen(port);

console.log('listening on port', port);