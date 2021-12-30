function search(){
    var strap = $('#mask-strap').val();
    var kf = $('#KF-level').val();
    var size = $('#mask-size').val();
    var shape = $('#mask-design').val();

    console.log(strap, kf, size, shape);
    $.ajax({
        type: "POST",
        url: "/review",
        data:{
            'strap' : strap,
            'kf' : kf,
            'size' : size,
            'shape' : shape,
        },
        success: function(result) {
            if(result.length==0){
                alert('해당하는 마스크가 없습니다!');
            }
            else{
                $('.review-container').empty();
                var data = 0
                while (data != result.length) {
                    $('.review-container').append(`<div class="review-contents">
                    <div class='review-image'>
                        <img src="image/mask.jpeg" width="350" height="300">
                    </div>
                    <div class='review-text'>
                        <p>별명 : `+result[data].nickname+`</p>
                        <p>제목 : `+result[data].title+`</p>
                        <p>내용 : `+result[data].contents+`</p>
                    </div>
                    <br>
                    <div class="review-hashtag">
                        #`+result[data].strap+` #`+result[data].kf+` #`+result[data].size+` #`+result[data].shape+`
                    </div>
                </div>`);
                    data++;
                }
            }

        },
        error: function() {
            //error
        }
    });
}