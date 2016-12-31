
var baseUrl = 'http://localhost:8080';
var verified = {};


$.ajax({
  url: '/features'
}).done(function(data) {

    $("tbody").html($("#featuresTemplate").render(data));

    setInterval(function(){
        //loadVerified()
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
                    verified[data[i].id] = data[i];
                    delete verified[data[i].id]._id;
                    if(!data[i].featureflag){
                        verified[data[i].id].featureflag = 'featureflag_na';//set default
                    }
                }
                markVerified();
            }
          });
}

//check the verified features
function markVerified(){
    for (itemId in verified){
        var obj = verified[itemId];
        document.getElementById('usweb02_'+itemId).checked = obj.usweb02;
        document.getElementById('fnf_'+itemId).checked = obj.fnf;
        document.getElementById('checkpoint_'+itemId).checked = obj.checkpoint;
        document.getElementById('unittests_'+itemId).checked = obj.unittests;
        document.getElementById('demo_'+itemId).checked = obj.demo;
        document.getElementById(obj.featureflag+'_'+itemId).selected = 'selected';

        /*
        if(document.getElementById(item)){
            document.getElementById(item).checked = true;
            applyStyle(document.getElementById(item));
        }
        */
    }
}

function verifyChanged(cb){
    var properties = cb.id.split('_');
    var cbId = properties[1];
    if(!verified[cbId]){
        verified[cbId] = {id:cbId};
        verified[cbId].featureflag = 'featureflag_na';//set default
    }
    verified[cbId][properties[0]] = cb.checked;
    updateServerOnVerifyChanged(cbId);

}

function featureFlagChanged(cb){
    var cbId = cb.id.split('_')[1];
    if(!verified[cbId]){
        verified[cbId] = {id:cbId};
    }
    verified[cbId].featureflag = cb.value;
    updateServerOnVerifyChanged(cbId);
}

function updateServerOnVerifyChanged(id){
    var url = '/verify';
    $.ajax({
            url: url,
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(verified[id])
        });
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
        //document.getElementById("tr-"+cb.id.split('_')[1]).style["text-decoration"]=cb.checked?"line-through":"";
    }
}