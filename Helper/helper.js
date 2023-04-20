const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports.encode = (filename) => {
    ffmpeg(`./watermarked/${filename}.mp4`, { timeout: 432000 }).addOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-start_number 0',
        '-hls_time 60',
        '-hls_list_size 0',
        '-f hls'
    ]).output(`./streams/${filename}.m3u8`).on('end', () => {
        console.log('end');
    }).run();
}

var ffmpeg1 = require("ffmpeg")

module.exports.createVideoWatermark = async (filename, watermarkPath = "./assets/butt.png") => {
    try{

        var video = await new ffmpeg1(`./files/${filename}`)
        var newFilepath = `./watermarked/${filename}.mp4`
    
        var settings = {
            position: "SE", // Position: NE NC NW SE SC SW C CE CW
            margin_nord: null, // Margin nord
            margin_sud: null, // Margin sud
            margin_east: null, // Margin east
            margin_west: null // Margin west
        }
    
        // deletes any existing video so we can replace it
        // fs.unlinkSync(newFilepath)
    
        // creates our watermarked video
        return await video.fnAddWatermark(watermarkPath, newFilepath, settings)
    }
    catch(err){
        console.log(err)
    }
}