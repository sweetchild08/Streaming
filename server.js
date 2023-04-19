const {Server} = require('@tus/server')
const {FileStore} = require('@tus/file-store')
const express = require('express')
const cors = require('cors');
const fs = require('fs');
const {EVENTS} = require('@tus/server');
const { encode } = require('./Helper/helper');

const app = express()
// allow all origin
app.use(cors());

// tus server configuration
const server = new Server({
    path: '/files',
    datastore: new FileStore({ directory: './files' })
})

// event handling for upload finish
server.on(EVENTS.POST_FINISH, (req, res, upload) => {
    console.log(upload)
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
      res.json({files});
    });
  });

// uploading file
const uploadApp = express()
uploadApp.all('*', server.handle.bind(server))
app.use('/uploads',uploadApp)

app.listen(3000, function () {
    console.log('Listening on port 3000!')
  })


//   references
// express with tus
// https://github.com/tus/tus-node-server/tree/main/packages/server#events
