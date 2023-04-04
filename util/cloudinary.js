const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'ds2kuym9e',
    api_key: '311923179892598',
    api_secret: 'BthSpp1yuJujLyJeMYfuk6EtGoU'
});

const upload = async file => {
    return await cloudinary.uploader.upload(file, {
        folder: 'covers',

    })
}
module.exports = upload;


