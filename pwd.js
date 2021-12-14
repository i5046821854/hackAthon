//1차 비번 유효성 검사
function validatePWD1(pwd1, pwd2) {

    if (pwd1.value.length < 6) { //6자리 미만
        document.getElementById("wrongPWD").style.display = "inline-block";
        document.getElementById("wrongPWD3").style.display = "none";
    } else {
        document.getElementById("wrongPWD").style.display = "none";
        document.getElementById("wrongPWD3").style.display = "inline-block";
    }
    if (pwd2.value.length != 0)
        validatePWD2()
}

//2차 비번 유효성 검사
function validatePWD2(pwd1, pwd2) {

    const btn = document.getElementById('submit')
    if (pwd1.value == pwd2.value) { //1차 == 2차비번일 경우 버튼 활성화
        document.getElementById("wrongPWD2").style.display = "none";
        if (document.getElementById("wrongPWD").style.display == "none")
            btn.disabled = false
    } else { //1차 != 2차일 경우 버튼 비활
        document.getElementById("wrongPWD2").style.display = "inline-block";
        btn.disabled = true
    }
}