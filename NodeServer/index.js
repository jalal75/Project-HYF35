var express = require("express");
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var _ = require("lodash");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: '123456',
    database: 'HP35'
});
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'tasmanianDevil';
var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
//   var user = users[_.findIndex(users, {id: jwt_payload.id})];
connection.query('select * from Users where userID = ?', [jwt_payload.userID], function (err, rows) {
    
     if (!err) {
        //  var payload = {id: rows[0].userID};
        //  var token = jwt.sign(payload, jwtOptions.secretOrKey);
        //  console.log('The solution is: ', rows[0].userID);
        //  console.log('token====> ' + token)
        //  rows[0].token = token
        //  res.end(JSON.stringify(rows))
        var user =  rows[0]
         if (user) {
            next(null, user);
          } else {
            next(null, false);
          }
     } else
         console.log('Error while performing Query.');
 })
    
});
passport.use(strategy);
var app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ... nn 8888");
    } else {
        console.log("Error connecting database ... nn");
    }
});
app.get("/login/:email", function (req, res) {
    const email = req.params.email;
    console.log('===>>' + email)
    connection.query('select * from Users where email = ?', [email], function (err, rows) {
       
        if (!err) {
            var payload = {id: rows[0].userID};
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            console.log('The solution is: ', rows[0].userID);
            console.log('token====> ' + token)
            rows[0].token = token
            res.end(JSON.stringify(rows))
           
        } else
            console.log('Error while performing Query.');
    });
});
app.post("/signup/:email/:firstname/:lastname/:password", function (req, res,next) {
    const email = req.params.email;
    const firstname = req.params.firstname;
    const lastname = req.params.lastname;
    const password = req.params.password;
    console.log('first name => ' + firstname);
    console.log('last name => ' + lastname);
    console.log('email => ' + email);
    console.log('password=>' + password);
    
    
    const sqlValues = {
        first_name: req.params.firstname,
        last_name: req.params.lastname,
        email: req.params.email,
        passwordHashFromBcrypt: password
    };
    connection.query('insert into Users set ?', sqlValues, (err, data) => {
        if (!!err) {
            throw err;
        }
        console.log(data);
    });
    res.end()
});
app.get("/program", passport.authenticate('jwt', { session: true }), function (req, res) {
    console.log('jalal')
    connection.query('SELECT * from Programs', function (err, rows) {
        // connection.end();
        if (!err) {
            console.log('The solution is: ', rows);
            res.end(JSON.stringify(rows))
        } else
            console.log('Error while performing Query.');
    });
});
app.listen(8888);
