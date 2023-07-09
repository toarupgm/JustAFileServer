$(document).ready(function(){
    $(".delete-btn").each(function(i, e){
        console.log(e);
        $(e).on("click",function(){
            $(document.body).css("cursor","wait") 
            fetch('/delete/' + files[i].token.admin || files[i].token.delete,  {
                method: 'DELETE'
            }).then((res)=>{
                // res.text().then((body)=>{console.log(body)})
                location.reload();
            })
        })
        
    });
    $(".download-btn").each(function(i, e){ 
        console.log(e);
        $(e).on("click",function(){
            $(document.body).css("cursor","wait") 
            location.href = '/download/' + files[i].token.admin || files[i].token.read;
        })
        
    });

    $("#upload").on("click",function (i, e) {
        var data = new FormData();
        if($("#file")[0].files.length>0)
        {
            console.log($("#file")[0].files[0]);
            data.append('file', $("#file")[0].files[0]);
        
            var config = {
                onUploadProgress: function(progressEvent) {
                    var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                    $("#upload-progress").width(`${percentCompleted}%`);
                }
            };
        
            $(document.body).css("cursor","wait")
            axios.post('/upload/', data, config)
                .then(function (res) {
                    location.reload()
                    $(document.body).css("cursor","auto")
                })
                .catch(function (err) {
                    alert("Failed")
                });
        }
    });
});