# worldwarpaint
####Paint the world!

The premise of this game is that you create towers that spread your color of paint across the map, and battle other players who are trying to spread their color.

It's a game written exclusively in ECMA6, using the phaser library. I use node6 and chrome to run it.

##setup:
You will need nodejs installed on your system for this game to work. If you don't know what that is or how to install it, you should consult the Google. (hint, on a mac you will end up running something like ```brew install node``` from the cmd line)

I split the worldwarpaint file tree into two main sections (the http server, and the ws server), so you will need to do two npm installs. From the worldwarpaint directory, running something like this should do it:

    cd app_server
    npm install
    cd ../game_server
    npm install
    cd ../

##to run:
Like I said above, this project is split into two servers, so you will need two commands run each of them.

from the worldwarpaint directory run:
    
    node app_server/app_server.js
and:
    
    node game_server/game_server.js

These commands will start the app server and the game server respectively. The app server is the http server that serves the game files, and the game server is the websocket server that handles game mechanics.

To play the game, in your webbrowser go to:

    localhost:8080
