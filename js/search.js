function search() {
    var data = {};
    if (document.getElementById('strap').value)
        data.strap = document.getElementById('strap').value
    if (document.getElementById('design').value)
        data.design = document.getElementById('design').value
    if (document.getElementById('filter').value)
        data.filter = document.getElementById('filter').value
    if (document.getElementById('size').value)
        data.size = document.getElementById('size').value
    data.name = document.getElementById('text').value.trim().replace('-', '')
    $.ajax({
        type: "POST",
        url: "/search",
        data,
        success: function(result) {
            $('#search').empty()
            var data = 1
            if (result[0] == "실패")
                alert("검색 결과가 없어 유사한 마스크가 추천됩니다")
            while (data != result.length) {
                console.log(data)
                $('#search').append('<li class="result-list" onclick="location.href=`/detail?prod=' + result[data].idx + '`""> <figure> <img src="/image/mask.jpg"> <figcaption>' + result[data].brand + '/' + result[data].size + '/' + result[data].color + '</figcaption> </figure> </li>');
                data++;
            }
        },
        error: function() {}
    });
}


function pressEnter() {
    if (event.keyCode == 13) {
        search()
    }
}