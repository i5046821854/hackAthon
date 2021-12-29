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
                $('#search').append('<li class="result-list" onclick="location.href=`/detail?prod=' + result[data].idx + '`""> <figure> <img src="/image/mask/' + result[data].image + '"> <figcaption>' + result[data].brand + '/' + result[data].size + '/' + result[data].kf + '</figcaption> </figure> </li>');
                data++;
            }
        },
        error: function() {}
    });
}

function purchase_search() {
    var data = {};
    data.area = document.getElementById('area').value
    data.search = document.getElementById('search').value.trim().replace('-', '')
    $.ajax({
        type: "POST",
        url: "/purchase_search",
        data,
        success: function(result) {
            $('#purchase').empty()
            var data = 0
            while (data != result.length) {
                console.log(data)
                if (result[data].status == 1) {
                    $('#purchase').append('<li onclick="location.href=`/purchase_detail?idx=' + result[data].idx + '`"><span class="area">' + result[data].location + '</span><span class="contents"><span class="contents_title">' + result[data].title + '</span><span class="mask">' + result[data].prodName + '</span></span><span class="people">' + result[data].max_number + '</span></li>');
                } else
                    $('#purchase').append('<li onclick="location.href=`/purchase_detail?idx=' + result[data].idx + '`"><span class="area">' + result[data].location + '</span><span class="contents"><span class="contents_title finished">' + result[data].title + '</span><span class="mask">' + result[data].prodName + '</span></span><span class="people">' + result[data].max_number + '</span></li>');
                data++;
            }
        },
        error: function() {
            $('#purchase').empty()
        }
    });
}

function findclosed() {
    if (document.getElementById("check").checked)
        find();
    var data = {};
    data.area = document.getElementById('area').value
    data.search = document.getElementById('search').value.trim().replace('-', '')
    $.ajax({
        type: "POST",
        url: "/purchase_search_deactive",
        data,
        success: function(result) {
            $('#purchase').empty()
            var data = 0
            while (data != result.length) {
                console.log(data)
                if (result[data].status == 1) {
                    $('#purchase').append('<li onclick="location.href=`/purchase_detail?idx=' + result[data].idx + '`"><span class="area">' + result[data].location + '</span><span class="contents"><span class="contents_title">' + result[data].title + '</span><span class="mask">' + result[data].prodName + '</span></span><span class="people">' + result[data].max_number + '</span></li>');
                } else
                    $('#purchase').append('<li onclick="location.href=`/purchase_detail?idx=' + result[data].idx + '`"><span class="area">' + result[data].location + '</span><span class="contents"><span class="contents_title finished">' + result[data].title + '</span><span class="mask">' + result[data].prodName + '</span></span><span class="people">' + result[data].max_number + '</span></li>');
                data++;
            }
        },
        error: function() {
            $('#purchase').empty()
        }
    });
}

function find() {
    var data = {};
    data.area = document.getElementById('area').value
    data.search = document.getElementById('search').value.trim().replace('-', '')
    $.ajax({
        type: "POST",
        url: "/purchase_search_active",
        data,
        success: function(result) {
            $('#purchase').empty()
            var data = 0
            while (data != result.length) {
                console.log(data)
                if (result[data].status == 1) {
                    $('#purchase').append('<li onclick="location.href=`/purchase_detail?idx=' + result[data].idx + '`"><span class="area">' + result[data].location + '</span><span class="contents"><span class="contents_title">' + result[data].title + '</span><span class="mask">' + result[data].prodName + '</span></span><span class="people">' + result[data].max_number + '</span></li>');
                } else
                    $('#purchase').append('<li onclick="location.href=`/purchase_detail?idx=' + result[data].idx + '`"><span class="area">' + result[data].location + '</span><span class="contents"><span class="contents_title finished">' + result[data].title + '</span><span class="mask">' + result[data].prodName + '</span></span><span class="people">' + result[data].max_number + '</span></li>');
                data++;
            }
        },
        error: function() {
            $('#purchase').empty()
        }
    });
}


function handleclick(element) {
    if (element.checked) {
        find();
    } else {
        findclosed();
    }
}


function psearch() {
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
                $('#search').append('<li class="result-list" onclick="window.opener.document.getElementById(`hidden`).value = `' + result[data].idx + '; window.opener.document.getElementById(`mask`).value = `' + result[data].prodName + '`; window.close();"> <figure> <img src="/image/mask/' + result[data].image + '"> <figcaption>' + result[data].brand + '/' + result[data].size + '/' + result[data].kf + '</figcaption> </figure> </li>');
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