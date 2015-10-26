/**
 * AWS Module: Action: Modularized Code
 */

var AWS = require('aws-sdk'),
    keyUtil = require('../upload_key').UploadKey(process.env.HASH_SECRET);

// Export For Lambda Handler
module.exports.run = function (event, context, cb) {
    if (!keyUtil.isValidKey(event.key)) {
        cb("403: Invalid Upload Key: " + event.key, null);
        return;
    }

    var s3 = new AWS.S3({
        credentials: new AWS.Credentials(process.env.UPLOAD_API_KEY, process.env.UPLOAD_API_SECRET, null)
    })

    var params = {Bucket: process.env.BUCKET_NAME, Key: event.objKey, Expires: event.hour * 3600};
    s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
            cb("500: "+ err, null);
        } else {
            cb(null, {"url": url});
        }
    });
};

