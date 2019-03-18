var mongoose = require('mongoose');
var mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/lebonplan";
var db = mongoose.connect(mongoUri, {
    useNewUrlParser: true
});

var FavoriteSchema = new mongoose.Schema({
    offerId: Number,
    isFavorite: Boolean,
    created: { type: Date, default: Date.now }
});



var Favorite = mongoose.model('Favorite', FavoriteSchema);

module.exports = Favorite;