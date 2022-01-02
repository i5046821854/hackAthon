var express = require('express');
var router = express.Router();
const db = require('./db')

//사용자 로그인 여부 미들웨어
const auth = function(req, res, next) {
    if (!req.session.user)
        res.send("<script>alert('로그인 후 이용가능합니다');window.location.href='/login';</script>")
    else
        next();
}


//회원가입 페이지 (get)
router.get('/signup', (req, res) => {
    res.render('signup.ejs', {
        method: 'signup',
        login: islogin
    })
})

//회원가입 페이지 (post)
router.post('/signup', async(req, res) => {
    const data = req.body
    let sql = `select COUNT(*) from USER where id = "${data.id}" OR nickname = "${data.nickname}"`
    const result = await db.promise().query(sql)
    const textRow = JSON.parse(JSON.stringify(result[0]))
    if (textRow[0]['COUNT(*)'] == 0) {
        var sql2 = `INSERT INTO USER(id, password, NAME, ADDRESS, nickname, image, kfnum, shapenum, strapnum, sizenum, strap, size, kf, shape) values ('${data.id}', '${data.pwd}', '${data.name}', '${data.adr}', '${data.nickname}', ${data.img},${data.kfnum}, ${data.shapenum}, ${data.strapnum}, ${data.sizenum}, '${data.strap}', '${data.size}', '${data.kf}', '${data.shape}')`;
        db.query(sql2, async(err, result) => {
            if (err) {
                console.log(err);
                res.send("실패");
            } else {
                res.send("성공")
            }
        })
    } else {
        res.send("중복")
    }
})

//마이 페이지 (get)
router.get('/myPage', auth, (req, res) => {
    let sql = `select b.* from CART as a inner join MASK as b ON a.prodIdx = b.idx WHERE id = '${req.session.user.id}';`
    let sq12 = `select a.idx, a.title, a.prodName from PURCHASE a inner join MASK b on a.prodIdx = b.idx    where userid = '${req.session.user.id}';`;
    let sql3 = `select * from REVIEW WHERE nickname ='${req.session.user.nickname}'`;
    db.query(sql + sq12 + sql3, async(err, result) => {
        if (err)
            console.log(err);
        res.render('myPage.ejs', {
            dataArr: result[0],
            purchase: result[1],
            review: result[2],
            login: req.session.user,
            user: req.session.user
        })
    })
})

//로그인 페이지 (get)
router.get('/login', (req, res) => {
    res.render('login.ejs', {
        login: islogin
    })
})

//로그인 로직
const login = async function(id, pw) {
    let result2 = "";
    let sql =
        `select * from USER where id = "${id}"`
    const result = await db.promise().query(sql)
    const textRow = JSON.parse(JSON.stringify(result[0]))
    if (!textRow[0]) {
        result2 = "No id"
    } else {
        var isMatch = true;
        if (pw !== textRow[0].password)
            isMatch = false;
        if (isMatch)
            result2 = textRow[0];
        else
            result2 = "invalid password"
    }
    return new Promise((resolve, reject) => {
        resolve(result2)
    })
}

//로그인 페이지 (post)
router.post('/login', async(req, res) => {
    var id = req.body.id;
    var pw = req.body.pwd;
    const result = await login(id, pw);
    if (result.id) { //해당 id/pw로 이루어진 계정 존재 시
        islogin = true;
        req.session.user = result
        res.cookie('cnt', 0)
        if (result.authority <= 3) { //권한에 따라 페이지 로드
            res.redirect("/")
        } else {
            res.redirect('/')
        }
    } else { //로그인 횟수 저장 (TBD)
        if (!req.cookies.cnt) {
            res.cookie('cnt', 1);
        } else {
            res.cookie('cnt', Number(req.cookies.cnt) + 1)
        }
        res.send(`<script> alert("다시 로그인해주세요"); window.location.href='/login'; </script>`)
    }
})


//로그아웃 페이지 (get)
router.get('/logout', (req, res) => {
    req.session.user = undefined;
    islogin = false;
    res.send("<script>alert(`로그아웃되었습니다.\n다시 로그인 해주세요`);window.location.href='/login';</script>")
})


//회원정보 수정 페이지 (본인)
router.get('/updateData', auth, (req, res) => {
    res.render('update.ejs', {
        data: JSON.parse(JSON.stringify(req.session.user))
    })
})

//회원정보 수정 페이지 (post)
router.post('/updateData', (req, res) => {
    const data = req.body
    let sql = `UPDATE USER SET ADDRESS = "${data.address}", NICKNAME= "${data.nickname}", kf = "${data.kf}", color = "${data.color}", shape = "${data.shape}", strap = "${data.strap}", kfnum = "${data.kfnum}", colornum = "${data.colornum}", shapenum = "${data.shapenum}", strapnum = "${data.strapnum}" `
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.redirect('/getOne')
    })
})


//비밀번호 변경 페이지 (get)
router.get('/changePWD', auth, (req, res) => {
    res.render('changePWD.ejs', {
        pwd: req.session.user.admin_pw
    });
})

//비밀번호 변경 페이지 (post)
router.post('/changePWD', (req, res) => {
    const pwd = req.body.pwd1
    bcrypt.genSalt(10, function(err, salt) {
        if (err)
            res.send("<script>alert('에러발생');window.location.href='/changePWD';</script>")
        bcrypt.hash(pwd, salt, function(err, hashedPWD) {
            if (err) {
                res.send("<script>alert('에러발생');window.location.href='/changePWD';</script>")
            }
            let sql = `update CLUB_OLD set pw = "${hashedPWD}" WHEREE cid = ${req.session.user.cid}`
            db.query(sql, async(err, result) => {
                if (err)
                    res.send("<script>alert('에러발생');window.location.href='/changePWD';</script>")
                req.session.user = undefined
                res.send("<script>alert(`성공적으로 변경되었습니다.\n다시 로그인 해주세요`);window.location.href='/login';</script>")
            })
        })
    })
})


module.exports = router;