const { Server } = require('@tus/server')
const { FileStore } = require('@tus/file-store')
const express = require('express')
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');

require('dotenv').config();

const { EVENTS } = require('@tus/server');
const { encode } = require('./Helper/helper');
const Uploads = require('./Models/Uploads')

mongoose.connect(process.env.MONGOURLSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// const Sentry = require("@sentry/node");
const Sentry = require('@sentry/node');
const app = express()

Sentry.init({
  dsn: "https://a463844187714700b250b86273f2cbdc@o4505044719501312.ingest.sentry.io/4505044721467392",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    // new Tracing.Integrations.Express({ app }),
    // Automatically instrument Node.js libraries and frameworks
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});


// RequestHandler creates a separate execution context, so that all
// transactions/spans/breadcrumbs are isolated across requests
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// allow all origin
app.use(cors());

// tus server configuration
const server = new Server({
  path: '/files',
  datastore: new FileStore({ directory: './files' })
})

// event handling for upload finish
server.on(EVENTS.POST_FINISH, async(req, res, upload) => {
  console.log(upload)
  await Uploads.create(upload)
  encode(upload.id)
})

// Define a route to get a list of uploaded files
app.get('/files', (req, res) => {
  // Read the contents of the uploads directory
  fs.readdir('./files', (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading files');
    }

    // Send the list of files as JSON
    res.json({ files });
  });
});

// uploading file
const uploadApp = express()
uploadApp.all('*', server.handle.bind(server))
app.use('/uploads', uploadApp)

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})


//   references
// express with tus
// https://github.com/tus/tus-node-server/tree/main/packages/server#events
