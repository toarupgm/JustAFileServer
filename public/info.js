$(document).ready(function(){
    const share_url = location.origin + "/info/" + file.token.read;
    $("#share-url").val(share_url);
    $(".share-btn").on("click",function(){
        $("#share-url").select();
        $2.scrollTo($2.scrollWidth,0)
        var copytext = share_url;
        if(navigator.clipboard == undefined) {
            window.clipboardData.setData('Text', copytext);
        } else {
            navigator.clipboard.writeText(copytext);
        }
        alert("copied")
    });
    $(".download-btn").on("click",function(){
        location.href = '/download/' + file.token.admin || file.token.read;
    });
    $(".delete-btn").on("click",function(){
        fetch('/delete/' + file.token.admin || file.token.delete,  {
            method: 'DELETE'
        }).then(()=>{
            location.href = "/"
        })
     });
});