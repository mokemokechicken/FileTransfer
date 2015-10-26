/**
 * Created by k_morishita on 2015/10/26.
 */

var FileUploader = function(options) {
    var apiBase = options.apiBase;
    var webBase = options.webBase;
    var fileChooser = $('#' + options.fileChooser); // $('#file-chooser');
    var uploadButton = $('#' + options.uploadButton); // $('#upload-button');
    var result = $('#' + options.result); // $('#result');
    var uploadKeyInput = $('#' + options.uploadKey);
    var dropArea = $('#'+ options.dropArea);
    var fileSelectButton = $('#' + options.fileSelectButton);
    var uploadMessage = $('#' + options.uploadMessage);
    var expireHour = $('#' + options.expireHour);
    var downloadPassword = $('#' + options.downloadPassword);

    // Event Handle
    dropArea
        .bind('drop', function(e) {
            e.preventDefault();
            var file = e.originalEvent.dataTransfer.files[0];
            if (file) {
                uploadFile(file);
            }
        })
        .bind('dragenter', function() { return false; })
        .bind('dragover', function() { return false; });

    fileSelectButton.click(function() { fileChooser.click(); });

    fileChooser.change(function() {
        var file = fileChooser[0].files[0];
        uploadMessage.html("ファイル名: " + file.name);
        uploadButton.show();
    });

    uploadButton.on('click', function(){
        var file = fileChooser[0].files[0];
        if (file) {
            uploadFile(file);
        }
    });

    function uploadFile(file) {
        var downPass = downloadPassword.val()
        var hour = expireHour.val() * 1;
        if (!(0 < hour && hour <= 24*7) ) {
            result.html('有効期間（時間）は 0 < Hour <= 168 で指定してください');
            expireHour.focus();
            return;
        }
        dropArea.html('Uploading: ' + file.name);
        result.html('');
        var nonce = ("_" + CryptoJS.SHA256(Math.random() + '_')).substring(0, 8);
        var hashVal = CryptoJS.SHA256(nonce + downPass);
        var objKey = "uploaded/" + hashVal + "/" +file.name;
        var uploadKey = uploadKeyInput.val();

        $.ajax({ // get credentials from uploadKey
            method: 'POST',
            url: apiBase + '/fileexchange/createsessiontoken',
            data: JSON.stringify({key: uploadKey}),
            contentType: 'application/json'
        }).success(function(data) { // upload file to S3
            var cred = data.cred;
            var credentials = new AWS.Credentials(cred.AccessKeyId, cred.SecretAccessKey, cred.SessionToken);
            var bucket = new AWS.S3({
                credentials: credentials,
                region: data.bucketRegion,
                params: {
                    Bucket: data.bucketName
                }
            });

            var params = {
                Key: objKey,
                ContentType: file.type,
                Body: file
            };
            var deferred = $.Deferred();
            bucket.putObject(params, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve();
                }
            });
            return deferred.promise();
        }).then(function() { // get signed url
            return $.ajax({
                method: 'GET',
                url: apiBase + '/fileexchange/creategetobjecturl',
                data: {key: uploadKey, objKey: objKey, hour: hour}
            })
        }).then(function(data) { // All Success!
            console.log(data);
            dropArea.html('Success Uploading ' + file.name);
            var qs = data.url.split('?')[1];
            var downloadUrl = webBase + '/down.html?' + encodeURIComponent(qs + '&nonce=' + nonce + '&n=' + file.name);
            $("<div>").
                append($("<p>").append("Download URL:")).
                append($("<textarea>", {id:'textarea-url'}).val(downloadUrl)).
                append($("<br>")).
                append($("<a>", {href: downloadUrl}).append("Download Link")).
                append($("<br>")).
                append($("<p>").append('Download パスワード:')).
                append($("<b>").append(downPass)).
                appendTo(result);
            $('#textarea-url').focus().select();
        }).fail(function(err) {  // Failure something
            console.log(err);
            var msg = JSON.stringify(err);
            if (err && err.responseJSON && err.responseJSON.errorMessage) {
                msg = err.responseJSON.errorMessage;
            }
            $("<pre>").append('ERROR: ' + msg).appendTo(result);
        });
    }

    if (window.location.hash.length > 1) {
        var hash = window.location.hash.substring(1);
        uploadKeyInput.val(hash);
    }

    if (downloadPassword.val().length == 0) {
        var pw = CryptoJS.SHA256(Math.random() + '_') + "";
        downloadPassword.val(pw.substring(0, 16));
    }

};

window.FileUploader = FileUploader;

