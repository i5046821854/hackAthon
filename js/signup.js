function pwdCheck() {
    var pwd = $('#pwd').val();
    var pwdconf = $('#pwdconfirm').val();

    if (pwd == "") {
        $('#pwdCheckResult').html("비밀번호를 입력해주세요");
    } else if (pwd != pwdconf) {
        $('#pwdCheckResult').html("비밀번호가 일치하지 않습니다");
    } else {
        $('#pwdCheckResult').attr('value', '1');
        $('#pwdCheckResult').html("비밀번호가 일치합니다");
    }
}

function signup() {
    var strapnum = 5 - $('#string_priority').val();
    var kfnum = 5 - $('#KF_priority').val();
    var shapenum = 5 - $('#shape_priority').val();
    var sizenum = 5 - $('#size_priority').val();
    var strap = $('input:radio[name=strap]:checked').val();
    var kf = $('input:radio[name=KF]:checked').val();
    var size = $('input:radio[name=size]:checked').val();
    var shape = $('input:radio[name=shape]:checked').val();
    if ($('#pwdCheckResult').attr('value') == 0) {
        alert('비밀번호를 확인하세요!');
    } else {
        var name = $('#name').val();
        var nickname = $('#nickname').val();
        var adr = $('#adr').val();
        var id = $('#id').val();
        var pwd = $('#pwd').val();
        var img = parseInt($("input[name='profile']:checked").val());
        if (id == "" || nickname == "") {
            alert("별명과 아이디는 필수 입력 항목입니다.");
        } else {
            $.ajax({
                type: "POST",
                url: "/signup",
                data: {
                    name,
                    nickname,
                    adr,
                    id,
                    pwd,
                    img,
                    kfnum,
                    shapenum,
                    strapnum,
                    sizenum,
                    strap,
                    size,
                    kf,
                    shape
                },
                success: function(result) {
                    if (result == "성공") {
                        alert("가입이 완료되었습니다. 다시 로그인해주세요");
                        window.location.href = '/login';
                    } else if (result == "중복") {
                        alert("id 혹은 닉네임이 중복됩니다. 다시 입력해주세요");
                    } else {
                        alert("정상적인 입력이 아닙니다. 다시 입력해주세요");
                    }
                },
                error: function(result) {
                    alert("정상적인 입력이 아asd닙니다. 다시 입력해주세요");
                }
            });
        }
    }
}