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
const { uploadFile, getFileStream, deleteFile } = require('./s3.js')
const data = fs.readFileSync('./database.json')
const conf = JSON.parse(data)
const path = require('path')
const aws = require('aws-sdk');
const { CloudFront } = require('aws-sdk');
const { networkInterfaces } = require('os');
const s3 = new aws.S3()


app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
const Dirpath = path.join(__filename, "../")
app.use(express.static(Dirpath))

const PORT = 3000 || process.env.PORT

//사용자 로그인 여부 미들웨어
const auth = function(req, res, next) {
    if (!req.session.user)
        res.send("<script>alert('로그인 후 이용가능합니다');window.location.href='/login';</script>")
    else
        next();
}

//사용자 권한 판단 미들웨어
const authAdmin = function(req, res, next) {
    if (req.session.user.authority <= 3)
        res.send(`res.send("<script>alert('접근 권한이 없습니다');window.location.href="javascript:window.history.back();";</script>")`);
    else
        next();
}

//이미지 파일 저장 multer 미들웨어
const upload = multer({
    dest: "logo"
});

//mysql 연결 정보
const db = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    database: conf.database
})

//유저 로그인 세션 정보 저장용
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
    })
)


//db에 연결
db.connect((err) => {
    if (err)
        throw err;
    console.log("connected")
})

//인덱스 페이지
app.get('', (req, res) => {
    if (req.session.user) //로그인 여부에 따라 페이지 로드
        res.redirect("/getOne")
    else
        res.redirect("/login")
})

//로그인 로직
const login = async function(id, pw) {
    let result2 = "";
    let sql =
        `select * from CLUB_OLD where admin_id = "${id}"`
    const result = await db.promise().query(sql)
    const textRow = JSON.parse(JSON.stringify(result[0]))
    if (!textRow[0]) {
        result2 = "No id"
    } else {
        const isMatch = await bcrypt.compare(pw, textRow[0].admin_pw);
        if (isMatch)
            result2 = textRow[0];
        else
            result2 = "invalid password"
    }
    return new Promise((resolve, reject) => {
        resolve(result2)
    })
}

//로그인 페이지 (get)
app.get('/login', (req, res) => {
    res.render('login.ejs');
})

//로그인 페이지 (post)
app.post('/login', async(req, res) => {
    var id = req.body.id;
    var pw = req.body.pwd;
    const result = await login(id, pw);
    if (result.cid) { //해당 id/pw로 이루어진 계정 존재 시
        req.session.user = result
        res.cookie('cnt', 0)
        if (result.authority <= 3) { //권한에 따라 페이지 로드 
            res.redirect("/getOne")
        } else {
            res.redirect('/getAll')
        }
    } else { //로그인 횟수 저장 (TBD)
        if (!req.cookies.cnt) {
            res.cookie('cnt', 1);
        } else {
            res.cookie('cnt', Number(req.cookies.cnt) + 1)
        }
        res.send(`<script> alert("그런 계정은 없습니다"); window.location.href='/login'; </script>`)
    }
})


//로그아웃 페이지 (get)
app.get('/logout', (req, res) => {
    req.session.user = undefined;
    //로그아웃 : destroy 메소드
    res.send("<script>alert(`로그아웃되었습니다.\n다시 로그인 해주세요`);window.location.href='/login';</script>")
})


//일반사용자 조회 페이지
app.get('/getOne', auth, (req, res) => {
    let sql = `select * from CLUB_OLD WHERE cid = ${req.session.user.cid}`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        req.session.user = result[0]
        res.render('myInfo.ejs', {
            data: JSON.parse(JSON.stringify(result[0]))
        })
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
    let sql = `update CLUB_OLD SET cname = "${data.cname}", category1= "${data.category1}", category2 = "${data.category2}", category3 = "${data.category3}", campus = "${data.campus}", estab_year = "${data.estab_year}",intro_text = "${data.intro_text}", intro_sentence = "${data.intro_sentence}", activity_info = "${data.activity_info}", meeting_time = "${data.meeting_time}", activity_location = "${data.activity_location}", activity_num = "${data.acticity_num}", recruit_season = "${data.recruit_season}", activity_period = "${data.activity_period}", recruit_process = "${data.recruit_process}", recruit_num = "${data.recruit_num}", recruit_site = "${data.recruit_site}", president_name = "${data.president_name}", president_contact = "${data.president_contact}", emergency_contact = "${data.emergency_contact}", website_link = "${data.website_link}", website_link2 = "${data.website_link2}"  WHERE cid = ${data.cid} `
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.redirect('/getOne')
    })
})


app.post('/updated', (req, res) => {
    if (req.body.updatedData !== undefined) {
        req.body.updatedData.forEach((e) => {
            let sql =
                `UPDATE SHARE SET upt = 1 WHERE CID = "${Number(e)}"`
            db.query(sql, async(err, result) => {
                if (err)
                    throw err;
            })
        })
    }
    if (req.body.sharedData !== undefined) {
        req.body.sharedData.forEach((e) => {
            let sql =
                `UPDATE SHARE SET share = 1 WHERE CID = "${Number(e)}"`
            db.query(sql, async(err, result) => {
                if (err)
                    throw err;
            })
        })
    }
    if (req.body.unupdatedData !== undefined) {
        req.body.unupdatedData.forEach((e) => {
            let sql =
                `UPDATE SHARE SET upt = 0 WHERE CID = "${Number(e)}"`
            db.query(sql, async(err, result) => {
                if (err)
                    throw err;
            })
        })
    }
    if (req.body.unsharedData !== undefined) {
        req.body.unsharedData.forEach((e) => {
            let sql =
                `UPDATE SHARE SET share = 0 WHERE CID = "${Number(e)}"`
            db.query(sql, async(err, result) => {
                if (err)
                    throw err;
            })
        })
    }
})

//관리자 용 동아리 조회 페이지 
app.get('/getAll', auth, authAdmin, (req, res) => {
    res.render('master.ejs')
})

//관리자 용 동아리 조회 페이지 - ajax 요청 처리 로직
app.get('/getData', (req, res) => {
    let sql = "SELECT a.* ,b.share ,b.upt FROM CLUB_OLD AS a INNER JOIN SHARE AS b ON a.cid = b.cid"
    db.query(sql, async(err, data) => {
        if (err)
            throw err;
        res.send((JSON.stringify(data)))
    })
})

//관리자 조회 페이지 => 동아리 권한 설정 기능
app.post('/updated', (req, res) => {
    if (req.body.updatedData !== undefined) {
        req.body.updatedData.forEach((e) => {
            let sql =
                `UPDATE SHARE SET upt = 1 WHERE CID = "${Number(e)}"`
            db.query(sql, async(err, result) => {
                if (err)
                    throw err;
            })
        })
    }
    if (req.body.sharedData !== undefined) {
        req.body.sharedData.forEach((e) => {
            let sql =
                `UPDATE SHARE SET share = 1 WHERE CID = "${Number(e)}"`
            db.query(sql, async(err, result) => {
                if (err)
                    throw err;
            })
        })
    }
    if (req.body.unupdatedData !== undefined) {
        req.body.unupdatedData.forEach((e) => {
            let sql =
                `UPDATE SHARE SET upt = 0 WHERE CID = "${Number(e)}"`
            db.query(sql, async(err, result) => {
                if (err)
                    throw err;
            })
        })
    }
    if (req.body.unsharedData !== undefined) {
        req.body.unsharedData.forEach((e) => {
            let sql =
                `UPDATE SHARE SET share = 0 WHERE CID = "${Number(e)}"`
            db.query(sql, async(err, result) => {
                if (err)
                    throw err;
            })
        })
    }
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
            let sql = `update CLUB_OLD set admin_pw = "${hashedPWD}" WHERE cid = ${req.session.user.cid}`
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



/**
    TODO : 임시저장 => 각 상황에 따라 상태관리 => 임시저장버튼
    동아리 게시판 / 관리자, 일반사용자 기능 (공지페이지, 마스터만 글을 쓰고 수정할 수 있도록)
**/