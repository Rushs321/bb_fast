"use strict";

const sharp = require('sharp')
const redirect = require('./rrd')

const sharpStream = _ => sharp({ animated: !process.env.NO_ANIMATE, unlimited: true });

function compress(req, res, input) {
  const format = req.params.webp ? 'webp' : 'jpeg'

  input.body.pipe(sharpStream()
    .grayscale(req.params.grayscale)
    .toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true
    })
    .toBuffer((err, output, info) => _sendResponse(err, output, info, format, req, res)))
}

function _sendResponse(err, output, info, format, req, res) {
  if (err || !info) return redirect(req, res);

  res.setHeader('content-type', 'image/' + format);
  res.setHeader('content-length', info.size);
  res.setHeader('x-original-size', req.params.originSize);
  res.setHeader('x-bytes-saved', req.params.originSize - info.size);
  res.status(200);
  res.write(output);
  res.end();
}

module.exports = compress;
