const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')
const purchaseRouter = require('./routes/purchase');
const reviewRouter = require('./routes/review');
const searchRouter = require('./routes/search');
const userRouter = require('./routes/user');
const indexRouter = require('./routes/index')


app.set('views', './views/templates');
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
const Dirpath = path.join(__filename, "../")
app.use(express.static(Dirpath))

var islogin = false;
global.islogin = islogin;

const PORT = 3000 || process.env.PORT

//유저 로그인 세션 정보 저장용
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
    })
)

//라우터 정의
app.use('/', indexRouter);
app.use('/', purchaseRouter);
app.use('/', userRouter);
app.use('/', reviewRouter);
app.use('/', searchRouter);


//에러페이지
app.get('*', (req, res) => {
    res.render('error.ejs', {
        login: (req.session.user ? true : false)
    })
})

//서버 연결
app.listen(3000, () => {
    console.log("server is on " + PORT)
})