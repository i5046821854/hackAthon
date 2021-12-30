function pwdCheck(){
    var pwd = $('#pwd').val();
    var pwdconf = $('#pwdconfirm').val();

    if(pwd==""){
        $('#pwdCheckResult').html("비밀번호를 입력해주세요");
    }else if(pwd != pwdconf){
        $('#pwdCheckResult').html("비밀번호가 일치하지 않습니다");
    } else{
        $('#pwdCheckResult').attr('value', '1');
        $('#pwdCheckResult').html("비밀번호가 일치합니다");
    }
}
function signup(){
    var strap = $('#string_priority').val();
    var kf = $('#KF_priority').val();
    var shape = $('#shape_priority').val();
    var size = $('#size_priority').val();
    console.log(strap, kf, shape, size);
    if($('#pwdCheckResult').attr('value')==0){
        alert('비밀번호를 확인하세요!');
    }
    else{
        var name = $('#name').val();
        var nickname = $('#nickname').val();
        var adr = $('#adr').val();
        var id = $('#id').val();
        var pwd = $('#pwd').val();
        var img = parseInt($("input[name='profile']:checked").val());
        if(id=="" || nickname==""){
            alert("별명과 아이디는 필수 입력 항목입니다.");
        }
        else{
            $.ajax({
                type: "POST",
                url: "/signup",
                data:{
                    'name':name,
                    'nickname':nickname,
                    'adr':adr,
                    'id':id,
                    'pwd':pwd,
                    'img':img,
                },
                success: function() {
                 console.log('success');
                },
                error: function() {}
            });
        }
    }
}