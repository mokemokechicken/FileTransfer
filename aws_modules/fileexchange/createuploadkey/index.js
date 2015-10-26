/**
 * AWS Module: Action: Modularized Code
 *
 * event
 *  masterKey: key of this function
 *  name: upload key name
 *  expire: YYYY/MM/DD
 */

var keyUtil = require('../upload_key').UploadKey(process.env.HASH_SECRET);

// Export For Lambda Handler
module.exports.run = function (event, context, cb) {
    if (event.masterKey != process.env.MASTER_SECRET) {
        cb("403: Invalid Master Key", null);
        return;
    }
    var expire = new Date(Date.parse(event.expire));
    var uploadKey = keyUtil.createUploadKey(event.name, expire);
    cb(null, {"key": uploadKey});
};

