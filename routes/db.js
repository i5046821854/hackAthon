const fs = require('fs')
const mysql = require('mysql2')
const data = fs.readFileSync('./database.json')
const conf = JSON.parse(data)

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

module.exports = db;