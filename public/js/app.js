
var baseUrl = 'http://localhost:8080';
var verified = {};


$.ajax({
  url: '/features'
}).done(function(data) {
    $("tbody").html($("#featuresTemplate").render(data));

    setInterval(function(){
        loadVerified()
    }, 30000);
    loadVerified();

  });

//load features marked as verified
function loadVerified(){
    $.ajax({
          url: '/verified'
        }).done(function(data) {
            if(Array.isArray(data) && data.length > 0){
                for (var i in data){
                    verified[data[i].id] = true;
                }
                markVerified();
            }
          });
}

//check the verified features
function markVerified(){
    for (item in verified){
        if(document.getElementById(item)){
            document.getElementById(item).checked = true;
            applyStyle(document.getElementById(item));
        }
    }
}

function verifyChanged(cb){
    var url = '/verify/'+cb.id;
    if(cb.checked){
    $.ajax({
                url: url,
                type: 'POST'
            });
    }else{
        $.ajax({
            url: url,
            type: 'DELETE'
        });
    }
    applyStyle(cb);
}

function sendEmail(){
    BootstrapDialog.show({
            title: 'Send Email',
            message: 'Email message: <input type="text" class="form-control" value="Please test your features on FnF ASAP">',
            onhide: function(dialogRef){
                var fruit = dialogRef.getModalBody().find('input').val();
            },
            buttons: [{
                label: 'Send',
                action: function(dialogRef) {
                    dialogRef.close();
                    $.ajax({
                              url: '/email?message='+encodeURIComponent(dialogRef.getModalBody().find('input').val())
                            }).done(function(data) {
                                debugger;
                              });
                }
            }]
        });

}

function applyStyle(cb){
    if(document.getElementById(cb.id)){
        document.getElementById("tr-"+cb.id).style["text-decoration"]=cb.checked?"line-through":"";
    }
}