var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;


router.use(passport.initialize());

passport.use(new FacebookStrategy({
  clientID: '530114747457611',
  clientSecret: 'da0bbace107ae4b40a26f797b041dd42',
  enableProof: true,
  callbackURL: 'https://6d204a2c.ap.ngrok.io/auth/facebook/done',
  profileFields: ['id', 'displayName', 'emails']
}, function(accessToken, refreshToken, profile, next){
  return next(null, profile);
}));

passport.serializeUser(function(user, next){
  return next(null, user);
});

passport.deserializeUser(function(user, next){
  return next(null, user);
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['public_profile', 'email']}));

router.get('/auth/facebook/done', passport.authenticate('facebook', { failureRedirect: '/' })
  , function (req, res) {
    let displayName = req.user.displayName;
    let facebookId = req.user.id;
    let email = req.user.emails;
    let userData = {
      displayName : displayName,
      facebookId : facebookId,
      email : email
    }

    userData = JSON.stringify(userData);
    
    let query = `SELECT id FROM user WHERE id = ?`

    connection.query(query, [facebookId], function(err, results){
      if(err){
        console.error(err);
        return res.json({
          status: "ERROR",
          message: "INTERNAL SERVER ERROR"
        });
      }

      let id = results;
      if(id.length === 0){
        return res.redirect('/register?userData=' + userData) ;
      }
      else{
        return res.redirect('/home?userData=' + userData);
      }
    })
});



let mySqlOpt={
  database: 'mccproject',
  host: 'db4free.net',
  user: 'danielanadii',
  password: 'daniel123'
};

let connection = mysql.createConnection(mySqlOpt);

connection.connect(function(err, res){
  if(err){
    console.error(err);
    return res.json({
      status: "ERROR",
      message: "INTERNAL SERVER ERROR"
    });
  };

  let query = "SELECT * FROM courses";
  connection.query(query, function(err, results){
    if (err) {
      console.error(err);
      return res.json({
          status: "ERROR",
          message: "INTERNAL SERVER ERROR!"
      });
    }
    let coursesData = results;
    if(coursesData.length === 0){
      let query = "INSERT INTO courses(Main_course, Course_name, link, Description) VALUES ?";
      let values = [
        ['Algorithm and Programming',	'[Algorithm Session 01] - IDE and I/O',	'https://www.youtube.com/embed/YvjMya_9RcA',	'Topics: - Typing code with syntax error - Compile, run, and debug program - Knowing data type and variable assignment - Creating a program using I/O syntax]'],
        ['Algorithm and Programming', '[Algorithm Session 02] - Arithmatic Operation', 'https://www.youtube.com/embed/O_E_Jzje6IM', 'Topics: - Creating a program using arithmatic operation'],
        ['Algorithm and Programming',	'[Algorithm Session 03] - Repetition',	'https://www.youtube.com/embed/GJ9vQ-CMb9M',	'Topic: - Create a program using repetition structure control'],
        ['Algorithm and Programming',	'[Algorithm Session 05] - Selection',	'https://www.youtube.com/embed/ETPxMBZCmng',	'Topic - Create a program using selection control'],
        ['Algorithm and Programming',	'[Algorithm Session 05] - Array',	'https://www.youtube.com/embed/RJkY-5hJq3k',	'Topics: - Creating a modular program using array 1D - Creating a modular program using array 2D']
      ];
      connection.query(query, [values], function(err){
        if(err){
          console.error(err);
          return res.json({
            status: "ERROR", 
            message: "INTERNAL SERVER ERROR"
          });
        }
      })
    }
  })
})

//Link to Page
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next){
  res.render('register');
});

router.get('/home', function(req, res, next){
  res.render('home');
});

router.get('/mycourse', function(req, res, next){
  res.render('mycourse');
})

router.get('/detail', function(req, res, next){
  res.render('detail');
})

router.get('/courses', function(req, res){
  let query = `SELECT id, Main_course, Course_name, Description FROM courses`

  connection.query(query, function(err, results){
    if(err){
      console.error(err);
      return res.json({
        status: "ERROR",
        message: "INTERNAL SERVER ERROR"
      });
    }

    return res.json(results);
  });
});

router.post('/detail_course', function(req, res){
  let courseId = req.body.courseId;

  let query = 'SELECT * FROM courses WHERE id = ?';

  connection.query(query, [courseId], function(err, results){
    if(err){
      console.error(err);
      return res.json({
        status: "ERROR",
        message: "INTERNAL SERVER ERROR"
      });
    }

    let courseData = results;
    return res.json({
      course: courseData[0]
    });
  });
})

router.post('/assign_course', function(req, res){
  let userId = req.body.userId;
  let courseId = req.body.courseId;

  let query = `SELECT * FROM user WHERE id = ?`

  connection.query(query, [userId], function(err, results){
    if(err){
      console.error(err);
      return res.json({
        status: "ERROR",
        message: "INTERNAL SERVER ERROR"
      });
    }

    let query = `INSERT INTO user_courses(user_id, course_id) VALUES(?, ?)`;

    connection.query(query, [userId, courseId], function(err){
      if(err){
        console.error(err);
        return res.json({
          status: "ERROR",
          message: "INTERNAL SERVER ERROR"
        });
      }

      return res.json({
        user_id: userId,
        course_id: courseId,
        status: "Success"
      });
    });
  });
});

router.post('/searchCourse', function(req, res){
  let courseId = req.body.courseId;
  let userId = req.body.userId;

  let query = `SELECT * FROM user_courses WHERE user_id = ? and course_id = ?`;

  connection.query(query, [userId, courseId], function(err, results){
    if(err){
      console.error(err);
      return res.json({
        status: "ERROR",
        message: "INTERNAL SERVER ERROR"
      })
    }

    courseData = results;

    if(courseData.length === 0 ){
      return res.json({
        message: "Not found"
      });
    }

    return res.json({
      message: "Found",
    });
  });
});

router.post('/user_courses', function(req, res){
  let userId = req.body.userId;

  let query = `SELECT id, Main_course, Course_name, Description FROM courses WHERE id IN (SELECT course_id FROM user_courses WHERE user_id = ?)`;

  connection.query(query, [userId], function(err, results){
    if(err){
      console.error(err);
      return res.json({
        status: "ERROR",
        message: "INTERNAL SERVER ERROR"
      });
    }

      return res.json(results);
  });
});

router.post('/doRegister', function (req, res) {
  let nama = req.body.nama;
  let password = req.body.password;
  let email = req.body.email;
  let phonenumber = req.body.phonenumber;

  let query = `INSERT INTO user(nama, password, email, phonenumber) VALUES(?, ?, ?, ?)`;

  connection.query(query, [nama, password, email, phonenumber], function (err){
    if (err) {
        console.error(err); //kasih tau ke console ada error saat query
        return res.json({
            status: "ERROR",
            message: "Email already Registered!"
        });
    }

    let query = `SELECT * FROM user WHERE email = ?`

    connection.query(query, [email], function(err, results){
      if (err) {
        console.error(err);
        return res.json({
            status: "ERROR",
            message: "INTERNAL SERVER ERROR!"
        });
      }

      let data = results;
      return res.json({
        status: "SUCCESS",
        message: "Success Register!",
        user: data[0]
      });
    });
  });
});

router.post('/doRegisterFb', function (req, res) {
  let id = req.body.id;
  let nama = req.body.nama;
  let password = req.body.password;
  let email = req.body.email;
  let phonenumber = req.body.phonenumber;
  
  let query = `INSERT INTO user(id, nama, password, email, phonenumber) VALUES(?, ?, ?, ?, ?)` 

  connection.query(query, [id, nama, password, email, phonenumber], function (err){
    if (err) {
        console.error(err); //kasih tau ke console ada error saat query
        return res.json({
            status: "ERROR",
            message: "Email already Registered!"
        });
    }

    let query = `SELECT * FROM user WHERE email = ?`

    connection.query(query, [email], function(err, results){
      if (err) {
        console.error(err);
        return res.json({
            status: "ERROR",
            message: "INTERNAL SERVER ERROR!"
        });
      }

      let data = results;
      return res.json({
        status: "SUCCESS",
        message: "Success Register!",
        user: data[0]
      });
    });
  });
});

router.post('/doLogin', function(req, res){
  let email = req.body.email;
  let password = req.body.password;

  let query = `SELECT * FROM user WHERE email = ? AND password = ?`;

  connection.query(query, [email, password], function(err, results){
    if(err){
      console.error(err);
      return res.json({
        status: "ERROR",
        message:"INTERNAL SERVER ERROR"
      });
    }

    userData = results;
    if(userData.length === 0){
      return res.json({
        status: "ERROR",
        message: "Invalid email and password, Please enter registered email and password"
      });
    }
    return res.json({
      status: "SUCCESS",
      message: "Login success!",
      user: userData[0]
    });
  });
});

module.exports = router;
