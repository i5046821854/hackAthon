function search() {
    var strap = $('#mask-strap').val();
    var kf = $('#KF-level').val();
    var size = $('#mask-size').val();
    var shape = $('#mask-design').val();

    $.ajax({
        type: "POST",
        url: "/review",
        data: {
            'strap': strap,
            'kf': kf,
            'size': size,
            'shape': shape,
        },
        success: function(result) {
            if (result.length == 0) {
                alert('해당하는 마스크가 없습니다!');
            } else {
                $('.review-container').empty();
                var data = 0
                while (data != result.length) {
                    $('.review-container').append(`<div class="review-contents">
                    <div class='review-image'>
                        <img src="image/mask.jpeg" width="350" height="300">
                    </div>
                    <div class='review-text'>
                        <p>작성자 : ` + result[data].nickname + `</p>
                        <p>제목 : ` + result[data].title + `</p>
                        <p>내용 : ` + result[data].contents + `</p>
                    </div>
                    <br>
                    <div class="review-hashtag">
                        #` + result[data].strap + ` #` + result[data].kf + ` #` + result[data].size + ` #` + result[data].shape + `
                    </div>
                </div>`);
                    data++;
                }
            }

        },
        error: function() {
            window.location.href = '/error';
        }
    });
}

function review_delete(e) {

    $.ajax({
        type: "POST",
        url: "/review_delete",
        data: {
            'idx': e,
        },
        success: function(result) {
            if (result == "성공")
                alert('삭제 완료되었습니다.');
            window.location.href = '/myPage';
        },
        error: function() {
            window.location.href = '/error';
        }
    });
}