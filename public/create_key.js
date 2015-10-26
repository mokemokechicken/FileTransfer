/**
 * Created by k_morishita on 2015/10/26.
 */

var KeyGenerator = function(options) {
    var apiBase = options.apiBase;
    var masterKey = $('#' + options.masterKey);
    var keyName = $('#' + options.keyName);
    var expireDate = $('#' + options.expireDate);
    var generateButton = $('#' + options.generateButton);
    var result = $('#' + options.result);

    // Event Handler

    generateButton.click(function() {
        if (isNaN(Date.parse(expireDate.val()))) {
            result.html('有効期限を YYYY/MM/DD 形式で入力してください');
            expireDate.focus();
            return;
        }

        if (keyName.val().length == 0) {
            result.html("Keyの名前を入力してください");
            keyName.focus();
            return;
        }

        generateUploadKey(masterKey.val(), keyName.val(), expireDate.val());
    });

    function generateUploadKey(mKey, name, expire) {
        result.html("");
        $.ajax({
            method: 'GET',
            url: apiBase + '/fileexchange/createuploadkey',
            data: {
                masterKey: mKey,
                name: name,
                expire: expire
            }
        }).success(function(data){
            $("<div>").
                append($("<p>").append("Upload Key")).
                append($("<input>", {type: 'text', id: 'uploadKeyTextbox'}).val(data.key)).
                append($("<p>").
                    append($("<a>", {href: 'index.html#'+data.key}).append('Go to Upload Page With This Key'))
                ).
                appendTo(result);

            $('#uploadKeyTextbox').focus().select();


        }).fail(function(err) {
            console.log(err);
            var msg = JSON.stringify(err);
            if (err && err.responseJSON && err.responseJSON.errorMessage) {
                msg = err.responseJSON.errorMessage;
            }
            $("<pre>").append('ERROR: ' + msg).appendTo(result);
        })
    }

    if (expireDate.val().length == 0) {
        var d = new Date();
        d.setMonth(d.getMonth() + 1);
        expireDate.val(d.getFullYear()+"/" + (d.getMonth()+1) + "/" + d.getDate());
    }
};

window.KeyGenerator = KeyGenerator;