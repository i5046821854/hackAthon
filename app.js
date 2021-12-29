const mysql = require('mysql2')
const express = require('express')
const app = express()
    // const bcrypt = require('bcrypt');
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
    database: conf.database,
    multipleStatements: true
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
    res.redirect("/main")
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//메인 페이지(get)
app.get('/main', (req, res) => {
    res.render('main.ejs', {
        login: islogin
    })
})


//회원가입 페이지 (get)
app.get('/signup', (req, res) => {
    res.render('signup.ejs', {
        login: islogin
    })
})

//회원가입 로직 
function signup(name, nickname, adr, id, pw) {
    var sql = `insert into USER (id,prodIdx) values ('${id}', ${pw}, ${name}, ${adr}, ${nickname})`

    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.send(result)
    })
}

//회원가입 페이지 (post)
app.post('/signup', async(req, res) => {
    var name = req.body.name;
    var nickname = req.body.nickname;
    var adr = req.body.adr;
    var id = req.body.id;
    var pw = req.body.pwd;
    var pwconf = req.body.pwdconf;
    const result = await signup(name, nickname, adr, id, pw);

    res.redirect('login')
})


//공구 페이지 (get)
app.get('/purchase', (req, res) => {
    var sql = `select * from PURCHASE`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        console.log(sql);
        console.log(result)
        res.render('purchase.ejs', {
            login: islogin,
            dataArr: result
        })
    })
})

//공구 페이지 (get)
app.get('/purchase_detail', (req, res) => {
    let sql = `select * from PURCHASE WHERE idx = ${req.query.idx};`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        console.log(sql);
        console.log(result)
        var user = '';
        if (req.session.user)
            user = req.session.user.id
        res.render('purchase_detail.ejs', {
            user,
            login: islogin,
            data: result[0]
        })
    })
})

//공구 페이지 (get)
app.get('/close', (req, res) => {
    var sql = ''
    if (req.query.method == 'close')
        sql = `update PURCHASE set status = 2 WHERE idx = ${req.query.idx};`
    else
        sql = `update PURCHASE set status = 1 WHERE idx = ${req.query.idx};`
    let sql2 = `select * from PURCHASE WHERE idx = ${req.query.idx};`
    db.query(sql + sql2, async(err, result) => {
        if (err)
            console.log(err);
        console.log(sql);
        console.log(result[0])
        console.log(result[1][0])
        var user = '';
        if (req.session.user)
            user = req.session.user.id
        console.log(user)
        res.render('purchase_detail.ejs', {
            user,
            login: islogin,
            data: result[1][0]
        })
    })
})


//공구 페이지 (get)
app.get('/purchase_input', auth, (req, res) => {

    res.render('purchase_input.ejs', {
        login: islogin
    })
})

//공구 페이지 (post)
app.post('/purchase_input', (req, res) => {
    console.log(req.body);
    var sql = `insert into PURCHASE (userid, title, description, prodName, prodIdx, location, max_number, form_link) values ('${req.session.user.id}', '${req.body.title}', '${req.body.description}', '${req.body.mask}', '${req.body.maskIdx}', '${req.body.area}', ${req.body.people}, '${req.body.link}')`

    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        console.log(sql)
        res.redirect('/purchase')
    })
})

//마이 페이지 (get)
app.get('/myPage', auth, (req, res) => {

    let sql = `select b.* from CART as a inner join MASK as b ON a.prodIdx = b.idx WHERE id = '${req.session.user.id}';`
    let sq12 = `select a.idx, a.title, a.prodName from PURCHASE a inner join MASK b on a.prodIdx = b.idx    where userid = '${req.session.user.id}'`;
    db.query(sql + sq12, async(err, result) => {
        if (err)
            console.log(err);
        console.log(result[0]);

        console.log(result[1]);
        res.render('myPage.ejs', {
            dataArr: result[0],
            purchase: result[1],
            login: req.session.user,
            user: req.session.user
        })
    })

})

//후기 페이지 (get)
app.get('/review', (req, res) => {
    let sql = `select * from REVIEW;`
    let sql2 = `select tag, postid from HASHTAG;`
    db.query(sql + sql2, async(err, result) => {
        if (err)
            console.log(err);
        console.log(result[0]);
        res.render('review.ejs', {
            dataArr: result[0],
            hashtag: result[1],
            login: islogin
        })
    })
})

//후기 페이지 (post)
app.post('/review', (req, res) => {
    let sql = `insert int REVIEW (id, title, contents, image) values ('${req.body.name}','${req.body.title}', '${req.body.contents}','${req.body.image}' )`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.redirect('/review')
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
app.get('/logout', (req, res) => {
    req.session.user = undefined;
    islogin = false;
    res.send("<script>alert(`로그아웃되었습니다.\n다시 로그인 해주세요`);window.location.href='/login';</script>")
})



//상세정보 페이지 (get)
app.get('/detail', (req, res) => {
    let sql = `select * from MASK WHERE idx = ${req.query.prod};`
    if (islogin) {
        var sql2 = `select COUNT(*) from CART WHERE prodIdx = ${req.query.prod} AND id = '${req.session.user.id}'`
        var checked = true;
        db.query(sql + sql2, async(err, result) => {
            if (err) {
                console.log(err);
            }
            if (result[1][0]['COUNT(*)'] == 0)
                checked = false;
            res.render('detail.ejs', {
                data: result[0][0],
                check: checked,
                login: islogin
            })
        })
    } else {
        db.query(sql, async(err, result) => {
            if (err)
                console.log(err);
            res.render('detail.ejs', {
                data: result[0],
                check: false,
                login: islogin
            })
        })
    }
})

//일반사용자 조회 페이지
app.get('/purchase_search', (req, res) => {
    let sql = `select * from MASK`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.render('purchase_search.ejs', {
            method: 'all',
            dataArr: result,
            login: req.session.user
        })
    })
})

//일반사용자 조회 페이지
app.post('/purchase_search', (req, res) => {
    const data = req.body
    let sql = `select * from PURCHASE WHERE 1= 1 AND title LIKE '%${data.search}%'`
    if (data.area)
        sql += `AND location = '${data.area}'`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        console.log(sql);
        console.log(result);
        res.send(result);
    })
})

//일반사용자 조회 페이지
app.post('/purchase_search_active', (req, res) => {
    const data = req.body
    let sql = `select * from PURCHASE WHERE 1= 1 AND title LIKE '%${data.search}%' AND status = 1 `
    if (data.area)
        sql += `AND location = '${data.area}'`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        console.log(sql);
        console.log(result);
        res.send(result);
    })
})

//일반사용자 조회 페이지
app.post('/purchase_search_deactive', (req, res) => {
    const data = req.body
    let sql = `select * from PURCHASE WHERE 1= 1 AND title LIKE '%${data.search}%' AND status = 2 `
    if (data.area)
        sql += `AND location = '${data.area}'`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        console.log(sql);
        console.log(result);
        res.send(result);
    })
})

//일반사용자 조회 페이지
app.get('/search', (req, res) => {
    let sql = `select * from MASK`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.render('search.ejs', {
            method: 'all',
            dataArr: result,
            login: req.session.user
        })
    })
})

//일반사용자 조회 페이지
app.get('/search/recommend', auth, (req, res) => {
    let sql1 = `select * from MASK;`
    let sql2 = `select ((select if(a.strap = b.strap,b.strapnum,0)) + (select if(a.design = b.shape,b.shapenum,0)) + (select if(a.kf = b.kf,b.kfnum,0)) + (select if(a.size = b.size,b.sizenum,0))) as close, a.* from MASK as a, USER as b WHERE a.strap = b.strap OR a.design = b.shape OR a.kf = b.kf OR a.size = b.size AND b.id = '${req.session.user.id}' ORDER BY close DESC;`
    db.query(sql1 + sql2, async(err, result) => {
        if (err)
            console.log(err);
        res.render('search.ejs', {
            method: 'recommend',
            dataArr: result[0],
            recommendData: result[1],
            login: req.session.user
        })
    })
})


app.post('/search', (req, res) => {
    const data = req.body
    let sql = `select * from MASK`
    if (Object.keys(data).length != 0) {
        sql = sql + ' WHERE 1=1 '
        if (data.strap)
            sql = sql + ` AND strap = '${data.strap}' `;
        if (data.design)
            sql = sql + ` AND design = '${data.design}'`;
        if (data.filter)
            sql = sql + ` AND kf = '${data.filter}' `;
        if (data.size)
            sql = sql + ` AND size = '${data.size}'`;
        sql = sql + `AND replace(prodName, '-', '') LIKE '%${data.name}%'`
    }
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        if (result.length == 0 && islogin) {
            sql = `select ((select if(a.strap = '${data.strap}',b.strapnum,0)) + (select if(a.design = '${data.design}',b.shapenum,0)) + (select if(a.kf = '${data.filter}',b.kfnum,0)) + (select if(a.size = '${data.size}',b.sizenum,0))) as close, a.* from MASK as a, USER as b WHERE (a.strap = '${data.strap}' OR a.design = '${data.design}' OR a.kf = '${data.filter}' OR a.size = '${data.size}') AND b.id = '${req.session.user.id}' ORDER BY close DESC;`
            console.log(sql)
            db.query(sql, async(err, result) => {
                if (err)
                    console.log(err);
                result.unshift("실패")
                res.send(result);
            })
        } else if (result.length == 0 && !islogin) {
            sql = `select ((select if(a.strap = '${data.strap}',1,0)) + (select if(a.design = '${data.design}',1,0)) + (select if(a.kf = '${data.filter}',1,0)) + (select if(a.size = '${data.size}',1,0))) as close, a.* from MASK as a WHERE a.strap = '${data.strap}' OR a.design = '${data.design}' OR a.kf = '${data.filter}' OR a.size = '${data.size}'  ORDER BY close DESC;`
            console.log(sql)
            db.query(sql, async(err, result) => {
                if (err)
                    console.log(err);
                result.unshift("실패")
                res.send(result);
            })
        } else {
            result.unshift("성공")
            res.send(result);
        }
    })
})



app.post('/check', (req, res) => {
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

app.get('*', (req, res) => {
    res.render('error.ejs', {
        login: req.session.user
    })
})
app.listen(3000, () => {
    console.log("server is on " + PORT)
})