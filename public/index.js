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
});