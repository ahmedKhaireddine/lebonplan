var express = require('express'); // apple au module express c'est un freamework node
var exphbs = require('express-handlebars'); // apple au module express-handlebars qui gère le templating
var expressSession = require("express-session"); // apple au module express-session qui gère les session
var MongoStore = require("connect-mongo")(expressSession); // apple au module
var mongoose = require("mongoose"); // apple au module mongoose qui gère la BD
var passport = require("passport"); // apple au module qui hash les mot de passe
var multer = require("multer"); // apple au module qui gère le telechargement du fichier
var fs = require("fs"); // apple au module qui manipule les fichiers
var bodyParser = require("body-parser"); // apple au module qui recuper les donnees de formulaire
var LocalStrategy = require("passport-local"); // apple au module
var passportLocalMongoose = require("passport-local-mongoose"); // apple au module
var expValChecker = require("express-validator/check"); // apple au module qui gère la validation de formulaire
var User = require("./models").User; // apple au model de base de donnees
var Favorite = require("./models").Favorite; // apple au model de base de donnees
var OfferModel = require('./models').Offer; // apple au model de base de donnees
var port = process.env.PORT || 3000; // creer le portou le serveur il va etre lancer
var upload = multer({ dest: "public/img/profils/" }); // creer le chemin ou les fichier vont etre enregistrer
var check = expValChecker.check; // methode pour valider les formulaire
var validationResult = expValChecker.validationResult; // methode pour retourner les error
// se connecter a la BD
mongoose.connect(
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/lebonplan", {
        useNewUrlParser: true,
        useCreateIndex: true
    }
);
// creer un instance pour le serveur
var app = express();

// utiliser les ressource dans le fichier public
app.use(express.static('public'));
// configuration necessaire pour utiliser le templaiting
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// Configuration de module bodyParser
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

// Initilisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // JSON.stringify
passport.deserializeUser(User.deserializeUser()); // JSON.parse

// Creer la roote pour recuperer un offre par son id
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
//Creer la root pour recuperer les offre dans une ville
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
// Creer la root pour aller a la page d'acceuil
app.get("/", function(req, res) {
    res.render("home");
});
//Creer la root pour aller a la page admin et que les user connecter il sont le droit
app.get("/admin", function(req, res) {
    if (req.isAuthenticated()) {
        console.log(req.user);
        res.render("admin", {
            user: user
        });
    } else {
        res.redirect("/");
    }
});
// verification si le user est connect il a plus le droit pour aller a la page signup
app.get("/signup", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("signup");
    }
});
// recuperation, traitement et sauvgarde des donner au moment de l'inscription
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
// verification si le user est connect il a plus le droit pour aller a la page login
app.get("/login", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("login");
    }
});
// recuperation, verification de user au moment de la connection
app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/login"
    })
);
// la root pour se deconnecter
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});
//root pour ajouter un produit au favorit
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
//root pour enlever un produit au favorit
app.get('/remove/favorites/:offerId', function(req, res) {
    var offerId = req.params.offerId;
    console.log('offerId remove : ', offerId);

    res.json({
        isFavorite: false
    });
});
// a tester après la fin de la pge add/offer
// app.get('/add/offre', function(req, res) {
//     if (req.isAuthenticated()) {
//         res.render('addOffer');
//     } else {
//         res.render("login");
//     }
// });
// root vers page qui ajoute un produit
app.get('/add/offre', function(req, res) {
    res.render('addOffer');
});
// recuperation, traitement et sauvgarde des donner au moment de l'ajoute d'un produit
app.post('/add/offre',
    upload.array('photos', 12),
    check('title').isEmpty().withMessage('il faut remplir se champs.'),
    // .isLength({ min: 3 }).withMessage('la taille min est 3 .'),
    function(req, res) {
        var errors = validationResult(req);
        if (errors.array().length > 0) {
            res.json({
                errors: errors.array()
            });
        }

        // console.log("tableau d'image : ", req.files);
        // console.log("tableau d'infos : ", req.body);
        // var images = [];
        // for (var i = 0; i < req.files.length; i++) {
        //     fs.rename(
        //         req.files[i].path,
        //         "public/img/profils/" + req.files[i].filename + ".png",
        //         function() {
        //             console.log("Renomation bien passer !");
        //         }
        //     );
        //     images.push("/img/profils/" + req.files[i].filename + ".png");
        // }
        // var newOffer = new OfferModel({
        //     images: images,
        //     id: 12,
        //     title: req.body.title,
        //     //ajouter l'objet de critère
        //     price: req.body.price,
        //     description: req.body.description,
        //     city: req.body.city.toLowerCase(),
        //     user: "req.user._id" //id de user connecter
        // });
        // console.log('newOffer : ', newOffer);
        // console.log("new table images :", images);

        // res.render('addOffer');
    });

//le lancement du serveur
app.listen(port, function() {
    console.log('Serveur lancer', port);
});

// function qui trnsforme la date en format en il lui faut des ameliorations bientot 
function formatDate(dateToProcessed) {
    var date = new Date(dateToProcessed);
    var tableMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // console.log(date.getMonth());
    result = tableMonth[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    //  + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    // console.log(result);
    return result;
}