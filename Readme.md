My_IRC

Introduction :

My_IRC est un projet visant à développer un serveur Internet Relay Chat (IRC) en utilisant NodeJS. Le serveur supporte plusieurs connexions simultanées et permet aux utilisateurs de rejoindre et interagir dans plusieurs "channels".

Technologies Utilisées :

Node.js

Socket.io (pour les websockets et rooms)

Express.js

React.js


Installation :
git clone git@github.com:EpitechWebAcademiePromo2025/W-JSC-502-MAR-2-1-irc-cassidy.nguyen.git 

Installez les dépendances :

npm install

Démarrez le serveur back:

node index.js

Démarrez le serveur front : 

npm start

Fonctionnalités :
Gestion des Utilisateurs
Système de connexion avec nom d'utilisateur.
Les membres peuvent modifier leurs informations et ajouter des channels.
Les créateurs de channels peuvent supprimer et modifier leurs channels.

Gestion des Channels :

Création et suppression des channels avec notifications globales.
Auto-suppression des channels après 2 jours d'inactivité (5 minutes pour la soutenance).
Envoi de messages visibles par tous les utilisateurs d'un channel.
Mise à jour en temps réel des utilisateurs et des channels connectés.


Commandes Disponibles : 

/nick nickname : Définit le surnom de l'utilisateur.
/list [string] : Liste les channels disponibles contenant la chaîne spécifiée.
/create channel : Crée un channel.
/delete channel : Supprime un channel.
/join channel : Rejoint un channel.
/leave channel : Quitte un channel.
/users : Liste les utilisateurs connectés au channel.
message : Envoie un message à tous les utilisateurs connectés au channel.
