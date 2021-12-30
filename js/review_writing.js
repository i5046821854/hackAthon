function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-image').src = e.target.result;
            };
        reader.readAsDataURL(input.files[0]);
    } 
    else {
        document.getElementById('preview').src = "";
    }
}
function save_review(){
    var title = $('#title').val();
    var name = $('#name').val();
    var strap = $('#mask-strap').val();
    var kf = $('#KF-level').val();
    var size = $('#mask-size').val();
    var shape = $('#mask-design').val();
    var content = $('textarea[name=body]').val();

    $.ajax({
        type: "POST",
        url: "/review_writing",
        data:{
            'title':title,
            'name':name,
            'strap':strap,
            'kf':kf,
            'size':size,
            'shape':shape,
            'content':content,
        },
        success: function() {
            window.location.href="/review";
        },
        error: function() {}
    });
}