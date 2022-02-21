const express = require("express");
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");

const initializePassport = require("./passportConfig");
const req = require("express/lib/request");
initializePassport(passport);
const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: false }));
//app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

//middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use;
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/users/register", (req, res) => {
  res.render("register");
});

app.get("/users/login", (req, res) => {
  res.render("login");
});

app.get("/users/dashbord", (req, res) => {
  res.render("dashbord", { user: req.user.name });
});

app.get("/users/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You have logged out");
  res.redirect("/users/login");
});
app.post("/users/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;
  console.log({
    name,
    email,
    password,
    password2,
  });
  //pesan error
  let errors = [];
  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }
  if (password.length < 6) {
    errors.push({ message: "password should be at least 6 characters" });
  }
  if (password != password2) {
    errors.push({ message: "password do not match" });
  }
  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    //FOR VALIDATION HAS PASSED
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    pool.query(
      `SELECT * FROM users
       WHERE email =$1`,
      [email],
      (err, result) => {
        if (err) {
          throw err;
        }
        console.log(result.rows);
        if (result.rows.length > 0) {
          errors.push({ message: "Email Already Registered" });
          res.render("register", { errors });
        } else {
          pool.query(
            `INSERT INTO users (name,email,password)
            VALUES($1,$2,$3) RETURNING id,password`,
            [name, email, hashedPassword],
            (err, result) => {
              if (err) {
                throw err;
              }
              console.log(result.rows);
              req.flash("success_msg", "you are now registered. Please log in!");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashbord",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashbord");
  }
  next();
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/user/login");
}

//admin
// const credential = {
//   email: "admin@gmail.com",
//   password: "admin",
// };
// app.get("/admin", (req, res) => {
//   res.render("loginAdmin");
// });
// app.get("/admin/dashboard", (req, res) => {
//   res.render("pageadmin");
// });
// app.post("/admin", (req, res) => {
//   if (req.body.email == credential.email && req.body.password == credential.password) {
//     req.session.user = req.body.email;
//     res.redirect("/admin/dashboard");
//   } else {
//     res.send("invalid uname");
//   }
// });

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
