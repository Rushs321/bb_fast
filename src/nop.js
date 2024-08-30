"use strict";

const utr = require("undici");
const { generateRandomIP, randomUserAgent } = require("./uuu.js");
const pick = require("lodash").pick;
const sc = require("./scomp.js");
const rd = require("./rrd.js");
const c = require("./comp.js");
const ch = require("./coph.js");

const viaHeaders = [
    '1.1 example-proxy-service.com (ExampleProxy/1.0)',
    '1.0 another-proxy.net (Proxy/2.0)',
    '1.1 different-proxy-system.org (DifferentProxy/3.1)',
    '1.1 some-proxy.com (GenericProxy/4.0)',
];

function randomVia() {
    const index = Math.floor(Math.random() * viaHeaders.length);
    return viaHeaders[index];
}

async function abaa(req, res) {
 
  try {
    let url = req.query.url;
  if (!url) return res.send('bandwidth-hero-proxy');

  req.params.url = decodeURIComponent(url);
  req.params.webp = !req.query.jpeg
  req.params.grayscale = req.query.bw != 0
  req.params.quality = parseInt(req.query.l, 10) || 40

        const randomIP = generateRandomIP();
    const userAgent = randomUserAgent();


    
    let origin = await utr.request(req.params.url, {
    headers: {
                ...pick(req.headers, ['cookie', 'dnt', 'referer']),
                'user-agent': userAgent,
                'x-forwarded-for': randomIP,
                'via': randomVia(),
      },
      maxRedirections: 4
    });
    _onRequestResponse(origin, req, res);
  } catch (err) {
    _onRequestError(req, res, err);
  }
}

function _onRequestError(req, res, err) {

  if (err.code === "ERR_INVALID_URL") return res.status(400).send("");

  rd(req, res);
}

function _onRequestResponse(origin, req, res) {
  if (origin.statusCode >= 400)
    return rd(req, res);


  if (origin.statusCode >= 300 && origin.headers.location)
    return rd(req, res);

  ch(origin, res);
  res.setHeader("content-encoding", "identity");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  req.params.originType = origin.headers["content-type"] || "";
  req.params.originSize = origin.headers["content-length"] || "0";

  origin.body.on('error', _ => req.socket.destroy());

  if (sc(req)) {
   
    return c(req, res, origin);
  } else {
   

    res.setHeader("x-proxy-bypass", 1);

    for (const headerName of ["accept-ranges", "content-type", "content-length", "content-range"]) {
      if (headerName in origin.headers)
        res.setHeader(headerName, origin.headers[headerName]);
    }

    return origin.body.pipe(res);
  }
}


module.exports = abaa;
