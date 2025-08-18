# write a python server that will expose a method call "hello" that will return the value of the name passed in the query string
# example: http://localhost:3000/hello?name=world
# if the name is not passed, return "name not passed"
# if the name is passed, return "hello " + key
# if the url has other methods, return "method not implemented"
# when server is listening, log "server is listening on port 3000"
# make sure that the server is listening on the start of the application

from flask import Flask, request