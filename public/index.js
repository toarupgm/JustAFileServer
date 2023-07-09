$(document).ready(function(){
    $(".delete-btn").each(function(i, e){ 
        console.log(e);
        $(e).on("click",function(){
            fetch('/delete/' + files[i].token.admin || files[i].token.delete,  {
                method: 'DELETE'
            }).then(()=>{
                location.reload();
            })
        })
        
    });
    $(".download-btn").each(function(i, e){ 
        console.log(e);
        $(e).on("click",function(){
            location.href = '/download/' + files[i].token.admin || files[i].token.read;
        })
        
    });

    $("#upload").on(function () {
        var data = new FormData();
        data.append('file', $("#file")[0].files[0]);
    
        var config = {
            onUploadProgress: function(progressEvent) {
                var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                console.log(percentCompleted);
            }
        };
    
        axios.put('/upload/', data, config)
            .then(function (res) {
                output.className = 'container';
                output.innerHTML = res.data;
            })
            .catch(function (err) {
                output.className = 'container text-danger';
                output.innerHTML = err.message;
            });
    });
});