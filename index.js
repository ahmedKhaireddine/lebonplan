var express = require('express');
var exphbs = require('express-handlebars');
var expressSession = require("express-session");
var MongoStore = require("connect-mongo")(expressSession);
var mongoose = require("mongoose");
var passport = require("passport");
var multer = require("multer");
var fs = require("fs");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models").User;
var Favorite = require("./models").Favorite;
var OfferModel = require('./models').Offer;
var port = process.env.PORT || 3000;
var upload = multer({ dest: "public/img/profils/" });
mongoose.connect(
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/lebonplan", {
        useNewUrlParser: true,
        useCreateIndex: true
    }
);

var app = express();

// Express configuration

app.use(express.static('public'));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }));

// enable session management
app.use(
    expressSession({
        secret: "konexioasso07",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

// enable Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // JSON.stringify
passport.deserializeUser(User.deserializeUser()); // JSON.parse

app.get('/offer/:id', function(req, res) {
    var id = req.params.id;
    console.log('id est : ', id);
    OfferModel.findOne({ id: id }, function(err, offer) {
        if (err !== null) {
            console.log('err', err);
        } else {
            // console.log(offer);
            OfferModel.
            findOne({ id: id }).
            populate('user'). // ici le nom de cle qui relis les deux tables
            exec(function(err, userInfos) {
                console.log('le createur : ', userInfos.user);
                res.render('offer', {
                    product: JSON.parse(JSON.stringify(offer)),
                    date: formatDate(offer.created),
                    user: userInfos.user
                });
            });
        }
    });

});


app.get('/cities/:city', function(req, res) {
    var city = req.params.city;
    console.log("city ", city);
    OfferModel.find({ city: city }, function(err, offers) {
        if (err !== null) {
            console.log('err', err);
        } else {
            var newoffers = offers.map(function(offer) {
                return {
                    firstimage: offer.images[0],
                    id: offer.id,
                    title: offer.title,
                    date: formatDate(offer.created)
                };
            });
            res.render('offers', {
                products: newoffers,
                city: city
            });
        }
    });

});

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/admin", function(req, res) {
    if (req.isAuthenticated()) {
        console.log(req.user);
        res.render("admin");
    } else {
        res.redirect("/");
    }
});

app.get("/signup", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("signup");
    }
});

app.post("/signup", upload.single("image"), function(req, res) {

    console.log("will signup");
    console.log("infos : ", req.body);
    console.log("image : ", req.file)
    var error = {};
    var regex = new RegExp("(?=.*[A-Z])(?=.*[0-9])([a-z0-9]{8,})", "ig");
    var username = req.body.username;
    var surname = req.body.Surname;
    var email = req.body.email;
    var password = req.body.password;
    var passwordComfirm = req.body.passwordComfirm;
    if (regex.test(password) === false) {
        error.email = "Le mot de passe doit contenir au moins un chiffre et une majuscule et Il doit avoir 8 caractères";
    }
    if (passwordComfirm != password) {
        error.passwordComfirm = "il n'est pas correct verifie";
    }

    console.log('error : ', error);

    if (Object.keys(error).length > 0) {
        res.render("signup", {
            error: error
        });
    } else {
        fs.rename(
            req.file.path, // take the original path
            "public/img/profils/" + req.file.filename + ".jpg", // rename it to your liking
            function() {
                User.register(
                    new User({
                        username: username,
                        surname: surname,
                        email: email,
                        profilPicture: "img/profils/" + req.file.filename + ".jpg"
                            // other fields can be added here
                    }),
                    password, // password will be hashed
                    function(err, user) {
                        if (err) {
                            console.log("/signup user register err", err);
                            return res.render("signup");
                        } else {
                            passport.authenticate("local")(req, res, function() {
                                res.redirect("/admin");
                            });
                        }
                    }
                );
            }
        );
    }

});

app.get("/login", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("login");
    }
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/login"
    })
);

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get('/add/favorites/:offerId', function(req, res) {
    var offerId = req.params.offerId;
    console.log('offerId add : ', offerId);
    Favorite.findOne({ offerId: offerId }, function(err, offerFavorite) {
        if (err) {
            console.log('something went wrong err', err);
        } else {
            console.log("test#0");
            if (offerFavorite === null) {
                console.log("test#1");
                var newOfferFavorite = new Favorite({
                    offerId: offerId,
                    isFavorite: true,
                });
                newOfferFavorite.save(function(err, Favorite) {
                    if (err !== null) {
                        console.log('something went wrong err', err);
                    } else {
                        console.log('we just saved the new student ' + Favorite);
                    }
                });
            } else {
                console.log("test#2");
                Favorite.updateOne({ offerId: offerId }, { isFavorite: true }, function(err) {
                    if (err !== null) {
                        console.log("something went wrong err", err);
                    } else {
                        console.log("Student has been updated");
                    }
                });
            }
            res.json({
                isFavorite: true
            });
        }
    });
});
app.get('/remove/favorites/:offerId', function(req, res) {
    var offerId = req.params.offerId;
    console.log('offerId remove : ', offerId);

    res.json({
        isFavorite: false
    });
});


app.listen(port, function() {
    console.log('Serveur lancer', port);
});

function formatDate() {
    var date = new Date();
    var tableMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // console.log(date.getMonth());
    result = tableMonth[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    //  + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    // console.log(result);
    return result;
}