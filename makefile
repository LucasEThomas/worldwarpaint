all:
	echo "localhost:8080"
	node game_server/game_server.js & node app_server/app_server.js

add:
	git add app_server game_server utilities www ideas.txt makefile README.md

