const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);

// Corentin FAY 
// N°22013398


var listeJoueurs = [];
var hex = [];
var jeton = 0;
var limitejoueur;
var chats = [];
var couleur = ['red', 'blue', 'green', 'orange'];


app.get('/', (request, response) => {
    response.sendFile('clientHex2_0.html', { root: __dirname });
});


server.listen(8888, () => { console.log('Le serveur écoute sur le port 8888'); });
io.on('connection', (socket) => {
    socket.on('joueurs', () => {
        socket.emit('infojouer', listeJoueurs)
    }); // un joueur essaye de connaître les joueurs connectés

    socket.on('entree', nomJoueur => {
        if (listeJoueurs.length < limitejoueur && !listeJoueurs.includes(nomJoueur)) {
            listeJoueurs.push(nomJoueur);
            console.log(listeJoueurs);
            io.emit('entree', listeJoueurs);
            socket.emit('unlockentrer')
        } else {
            socket.emit('entree2', { joueurs: listeJoueurs, erreur: "Connu !" });
        }
        if (limitejoueur == listeJoueurs.length) {
            io.emit('allP');
        }


    }); // un joueur essaye d'entrer dans la partie

    socket.on('sortie', nomJoueur => {
        //le cas avant de lancer le jeu
        if (hex.length == 0) {
            let index = listeJoueurs.indexOf(nomJoueur);
            if (index != -1) {
                listeJoueurs.splice(index, 1);
            }
        } else { // le cas pendant le jeu
            var sorteur = listeJoueurs.indexOf(nomJoueur);
            listeJoueurs.splice(sorteur, 1);
            couleur.splice(sorteur, 1);
            if (sorteur == jeton) {
                if (jeton < listeJoueurs.length - 1) {
                    jeton++;
                } else {
                    jeton = 0;
                }
            }
            socket.emit('deuxBis');

        }
        io.emit('sortie', listeJoueurs);

    }); // un joueur essaye de sortir de la partie


    socket.on('deuxP', () => {
        if (listeJoueurs.length == 2) {
            io.emit('deuxP');
        }
    })

    socket.on('constructeurJ', data => { //permet d'avoir ,la limite constament avec sois
        limitejoueur = data.joueurs;
        io.emit('lockJ');
    });
    socket.on('constructeurT', (data) => { //pour creer le tableau et utilise tableau puis generer le damier
        hex = []
        for (var i = 0; i < (data.taille * data.taille); i++) {
            hex.push(-1);
        }
        // hex.fill(-1);
        io.emit('taille', data.taille)
        io.emit('lock');

    });

    socket.on('unlock', () => {
        io.emit('unlock');
    });

    socket.on('pion', data => {
        var numj = listeJoueurs.indexOf(data.nomJ);

        if (hex[data.ID] == -1 && jeton == numj) {
            hex[data.ID] = numj;

            if (jeton < listeJoueurs.length - 1) {
                jeton++;
            } else {
                jeton = 0;
            }


            io.emit('coloris', { 'numJ': numj, 'id': data.ID, 'couleur': couleur })
        } else {
            console.log("Le pion n'a pas était placer car appartient a l'adversaire");
        }

    });

    socket.on('chat message', data => {

        if (chats.length == 6) {
            chats.shift();
            chats.push([data.nomJ + " : " + data.msg]);

        } else {
            chats.push([data.nomJ + " : " + data.msg]);
        }
        io.emit('chat message', chats);
    });


    // c'est la fin    
});