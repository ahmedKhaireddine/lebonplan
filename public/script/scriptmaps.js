// navbar js
function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
// table de ville
// doc https://www.synbioz.com/blog/carte_france_svg
// dept http://les-departements.fr/carte-des-departements.html
var tableVille = {
    01: { name: "Bourg-en-bresse" },
    02: { name: "Laon" },
    03: { name: "Moulins" },
    04: { name: "Digne-les-bains" },
    05: { name: "Gap" },
    06: { name: "Nice" },
    07: { name: "Privas" },
    08: { name: "Charleville-mézières" },
    09: { name: "Foix" },
    10: { name: "Troyes" },
    11: { name: "Carcassonne" },
    12: { name: "Rodez" },
    13: { name: "Marseille" },
    14: { name: "Caen" },
    15: { name: "Aurillac" },
    16: { name: "Angoulême" },
    17: { name: "Larochelle" },
    18: { name: "Bourges" },
    19: { name: "Tulle" },
    "2A": { name: "Ajaccio" },
    "2B": { name: "Bastia" },
    21: { name: "Dijon" },
    22: { name: "Saint-brieuc" },
    23: { name: "Guéret" },
    24: { name: "Périgueux" },
    25: { name: "Besançon" },
    26: { name: "Valence" },
    27: { name: "Évreux" },
    28: { name: "Chartres" },
    29: { name: "Quimper" },
    30: { name: "Nîmes" },
    31: { name: "Toulouse" },
    32: { name: "Auch" },
    33: { name: "Bordeaux" },
    34: { name: "Montpellier" },
    35: { name: "Rennes" },
    36: { name: "Châteauroux" },
    37: { name: "Tours" },
    38: { name: "Grenoble" },
    39: { name: "Lons-le-saunier" },
    40: { name: "Mont-de-marsan" },
    41: { name: "Blois" },
    42: { name: "Saint-étienne" },
    43: { name: "Le puy-en-velay" },
    44: { name: "Nantes" },
    45: { name: "Orléans" },
    46: { name: "Cahors" },
    47: { name: "Agen" },
    48: { name: "Mende" },
    49: { name: "Angers" },
    50: { name: "Saint-lô" },
    51: { name: "Châlons-en-champagne" },
    52: { name: "Chaumont" },
    53: { name: "Laval" },
    54: { name: "Nancy" },
    55: { name: "Bar-le-duc" },
    56: { name: "Vannes" },
    57: { name: "Metz" },
    58: { name: "Nevers" },
    59: { name: "Lille" },
    60: { name: "Beauvais" },
    61: { name: "Alençon" },
    62: { name: "Arras" },
    63: { name: "Clermont-ferrand" },
    64: { name: "Pau" },
    65: { name: "Tarbes" },
    66: { name: "Perpignan" },
    67: { name: "Strasbourg" },
    68: { name: "Colmar" },
    69: { name: "Lyon" },
    70: { name: "Vesoul" },
    71: { name: "Mâcon" },
    72: { name: "Lemans" },
    73: { name: "Chambéry" },
    74: { name: "Annecy" },
    75: { name: "Paris" },
    76: { name: "Rouen" },
    77: { name: "Melun" },
    78: { name: "Versailles" },
    79: { name: "Niort" },
    80: { name: "Amiens" },
    81: { name: "Albi" },
    82: { name: "Montauban" },
    83: { name: "Toulon" },
    84: { name: "Avignon" },
    85: { name: "Laroche-sur-yon" },
    86: { name: "Poitiers" },
    87: { name: "Limoges" },
    88: { name: "Épinal" },
    89: { name: "Auxerre" },
    90: { name: "Belfort" },
    91: { name: "Évry" },
    92: { name: "Nanterre" },
    93: { name: "Bobigny" },
    94: { name: "Créteil" },
    95: { name: "Pontoise" },
    971: { name: "Basse-terre" },
    972: { name: "Fort-de-france" },
    973: { name: "Cayenne" },
    974: { name: "Saint-denis" },
    976: { name: "Dzaoudzi" }
};

$('#select-city').click(function() {
    $('#select-city').html("");
    var keys = Object.keys(tableVille);
    console.log('keys: ', keys);
    var html = "";
    for (var i = 0; i < keys.length; i++) {
        html += "<option value='" + tableVille[keys[i]].name + "'>" + tableVille[keys[i]].name + "</option>";
        console.log(tableVille[keys[i]].name);
    }
    $('#select-city').append(html);
});
// carte map
document.addEventListener('DOMContentLoaded', function() {
    map = this.getElementById('map');
    paths = map.getElementsByTagName('path');

    for (var i = 0; i < paths.length; i++) {
        paths[i].addEventListener("click", function(e) {
            // console.log("Dpt: " + e.target.getAttribute('data-num'));
            var link = "/cities/" + tableVille[e.target.getAttribute('data-num')].name.toLowerCase();
            // console.log('link : ', link);
            var search = document.getElementById('search');
            search.setAttribute("href", link);

        })
    }

});