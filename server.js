#!/usr/bin/env node
'use strict'
process.env.NO_ANIMATE="true";

const app = require('express')()
const proxy = require('./src/nop')

const PORT = process.env.PORT || 8080

app.enable('trust proxy')
app.get('/', proxy)
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.listen(PORT, () => console.log(`Worker ${process.pid}: Listening on ${PORT}`))
