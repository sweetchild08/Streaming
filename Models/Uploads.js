const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filetype: { type: String, required: true },
});

const uploadSchema = new mongoose.Schema({
    id: { type: String, required: true },
    size: { type: Number, required: true },
    offset: { type: Number, required: true },
    metadata: metadataSchema,
    creation_date: { type: Date, default: Date.now },
});

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;