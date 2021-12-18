const mysql = require('mysql2')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const fs = require('fs')
const multer = require('multer')
const multerS3 = require('multer-s3');
const cookieParser = require('cookie-parser')
const url = require('url');
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
//const { uploadFile, getFileStream, deleteFile } = require('./s3.js')
const data = fs.readFileSync('./database.json')
const conf = JSON.parse(data)
const path = require('path')
const aws = require('aws-sdk');
const { CloudFront } = require('aws-sdk');
const { networkInterfaces } = require('os');
const s3 = new aws.S3()


app.set('views', './views/templates');
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
const Dirpath = path.join(__filename, "../")
app.use(express.static(Dirpath))


const PORT = 3000 || process.env.PORT

var islogin = false;

//이미지 파일 저장 multer 미들웨어
const upload = multer({
    dest: "image"
});

//mysql 연결 정보
const db = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    database: conf.database
})


//db에 연결
db.connect((err) => {
    if (err)
        throw err;
    console.log("connected")
})


//유저 로그인 세션 정보 저장용
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
    })
)


//사용자 로그인 여부 미들웨어
const auth = function(req, res, next) {
    if (!req.session.user)
        res.send("<script>alert('로그인 후 이용가능합니다');window.location.href='/login';</script>")
    else
        next();
}

//사용자 권한 판단 미들웨어
const authAdmin = function(req, res, next) {
    if (req.session.user.authority < 2)
        res.send(`res.send("<script>alert('접근 권한이 없습니다');window.location.href="javascript:window.history.back();";</script>")`);
    else
        next();
}


//인덱스 페이지
app.get('', (req, res) => {
    if (req.session.user) //로그인 여부에 따라 페이지 로드
        res.redirect("/search")
    else
        res.redirect("/login")
})




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//회원가입 페이지 (get)
app.get('/signup', (req, res) => {


    res.render('signup.ejs', {
        login: islogin
    })
})

//회원가입 페이지 (post)
app.post('/signup', (req, res) => {


    res.redirect('login')
})

//공구 페이지 (get)
app.get('/purchase', (req, res) => {


    res.render('purchase.ejs', {
        login: islogin
    })
})


//마이 페이지 (get)
app.get('/myPage', auth, (req, res) => {


    res.render('myPage.ejs', {
        login: islogin
    })
})

//후기 페이지 (get)
app.get('/review', (req, res) => {


        res.render('review.ejs', {
            login: islogin
        })
    })
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//로그인 페이지 (get)
app.get('/login', (req, res) => {
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
app.post('/login', async(req, res) => {
    var id = req.body.id;
    var pw = req.body.pwd;
    const result = await login(id, pw);
    if (result.id) { //해당 id/pw로 이루어진 계정 존재 시
        islogin = true;
        req.session.user = result
        res.cookie('cnt', 0)
        if (result.authority <= 3) { //권한에 따라 페이지 로드
            res.redirect("/search")
        } else {
            res.redirect('/search')
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
app.get('/logout', (req, res) => {
    req.session.user = undefined;
    islogin = false;
    res.send("<script>alert(`로그아웃되었습니다.\n다시 로그인 해주세요`);window.location.href='/login';</script>")
})



//로그아웃 페이지 (get)
app.get('/detail', (req, res) => {
    console.log(req.query.prod)
    let sql = `select * from MASK WHERE idx = ${req.query.prod}`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        console.log(sql);
        console.log(result);
        res.render('detail.ejs', {
            data: result[0],
            login: islogin
        })
    })
})


//일반사용자 조회 페이지
app.get('/search', (req, res) => {
    let sql = `select * from MASK`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.render('search.ejs', {
            dataArr: result,
            login: req.session.user
        })
    })
})


app.post('/check', (req, res) => {
    console.log(req.body);
    const idx = Number(req.body.idx)
    if (req.body.checked == '1')
        var sql = `insert into CART (id,prodIdx) values ('${req.session.user.id}', ${req.body.idx})`
    else
        sql = `delete from CART where id = '${req.session.user.id}' AND prodIdx =  ${req.body.idx}`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.send(result)
    })
});


app.post('/search', (req, res) => {
    const data = req.body
    console.log("asd");
    let sql = `select * from MASK WHERE strap = '${data.strap}' AND design = '${data.design}'`
    console.log(sql);
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        console.log(result)
        res.send(result)
    })
})


//회원정보 수정 페이지 (본인)
app.get('/updateData', auth, (req, res) => {
    res.render('update.ejs', {
        data: JSON.parse(JSON.stringify(req.session.user))
    })
})

//회원정보 수정 페이지 (post)
app.post('/updateData', (req, res) => {
    const data = req.body
    let sql = `UPDATE USER SET ADDRESS = "${data.address}", NICKNAME= "${data.nickname}", kf = "${data.kf}", color = "${data.color}", shape = "${data.shape}", strap = "${data.strap}", kfnum = "${data.kfnum}", colornum = "${data.colornum}", shapenum = "${data.shapenum}", strapnum = "${data.strapnum}" `
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.redirect('/getOne')
    })
})


//비밀번호 변경 페이지 (get)
app.get('/changePWD', auth, (req, res) => {
    res.render('changePWD.ejs', {
        pwd: req.session.user.admin_pw
    });
})

//비밀번호 변경 페이지 (post)
app.post('/changePWD', (req, res) => {
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


app.listen(3000, () => {
    console.log("server is on " + PORT)
})