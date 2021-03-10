from flask import Flask, render_template, request, redirect
import os
import json

app = Flask(__name__)

tasks = {}
idCount = 0

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/login", methods=['POST'])
def loggedIn():
    return redirect("/")

@app.route("/")
def home():
    return render_template("home.html")

# @app.route('/', methods=['POST'])
# def newTask():
#     global idCount
#     global tasks
#     task = {
#     "taskID": idCount,
#     "taskName": request.form['taskName'],
#     "minutes": request.form['minutes'],
#     "priority": request.form['priority']
#     }
#     tasks[idCount] = task
#     idCount += 1
#     return render_template("home.html", classname=task)

@app.route("/schedule")
def schedule():
    global tasks
    return render_template("schedule.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

@app.route("/help")
def help():
    return render_template("help.html")

@app.route("/activity")
def activity():
    return render_template("activity.html")

    
if __name__ == "__main__":
    app.run(port=5000)