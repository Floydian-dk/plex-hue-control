# Plex HUE Control

Project inspired by the work done by [Nathan Paul] here (https://npaul.uk/2020/04/using-plex-and-hue-together/)

Instead of having hardcoded parameters, his code has been ammended to use .env variables, making it easier to change parameters.

## Version History
* v1.0.0: Initial implementation of control.
* v1.1.0: Implementing use of sunset/sunrise to determine when to control the lights.
* v1.1.1: Fixing missing packages
* v1.2.0: Adding setting for trailershow before movies.
* v1.2.2: More details in logging
* v1.2.3: This is a security fix only. Updating modules, node version etc. No new features implemented. Solves CVE-2024-45296 issue.

## Deployment

This will guide you throug the process of running Plex HUE Control on a Mac, using 10.15 Catalina.

### Install required build tools
```bash
$ brew update
$ brew install node
```

### Verify that Node.js is installed and working
```bash
$ node -v
v22.11.0

$ npm -v
10.9.0
```

### Install PM2 - the Node.js process manager
```bash
$ npm i -g pm2
```

### Clone Plex HUE Control from GitHub

The easiest is to clone into the user directory of the user running Plex Server e.g. /Users/<my-user-name>/github/plex-hue-control, but any non root directory should be fine.

```bash
git clone https://github.com/floydian-dk/plex-hue-control.git
```

### Create the .env file

```bash
$ cp sample.env .env
```

### CONFIGURATION

Open the .env file in your favorite text editor.

The following parameters are needed for the program to work:

* `HUE_ADDRESS`
The IP address of your Philips HUE


* `HUE_TOKEN`
The user token from your Philips HUE brick.
To get a new token do the following: (Or read Philips official documentation here: https://developers.meethue.com/develop/get-started-2/)

1. In a web browser on your home network go to http://<ip-address-of-hue>/debug/clip.html
This will show you the CLIP API Debugger

2. In the following fields:
	URL: /api
	Message Body: {"devicetype":"plex_hue_control#[device] [name]"}

3. Click on "POST"
If it works, it will generate an error message, that you need to press the link button on your Philips HUE.

4. Press the link button on your Philips HUE, then click on "POST" again. This will now provide you with the needed token.
Copy this into the .env config file.

* `LISTEN_PORT`
The network port this application will listen on.
If you have a firewall between your Plex Server and the computer you are running plex-hue-control on, be sure to allow TCP trafic on this port.
The default is port 8000.
Be sure to select a port which is not used for other services.

Be sure to have configured the 3 scenes (star/resume, pause & stop) in your Philips HUE before you proceed.

To get the group and scene ID's use your previously obtained token and go to http://<ip-address-of-hue>/debug/clip.html. 
In URL field type: /api/<token>/scenes
Click on "GET".
This will output a lot of data. In this search for the scene names and note down the group number, and the ID (this is found on line before the name).

* `HUE_SCENE_PLAY`
This is the ID of the HUE lighting scene that should be started when you start (or resume) playing a movie/TV-Show.

* `HUE_SCENE_PAUSE`
This is the ID of the HUE lighting scene that should be started when you pause playback of a movie/TV-Show.

* `HUE_SCENE_STOP`
This is the ID of the HUE lighting scene that should be started when your movie/TV-Show finishes.

* `HUE_SCENE_TRAILER`
This is the ID of the HUE lighting scene that should be started when the trailer show is starting, or you are watching clips.

* `HUE_SCENE_GROUPID`
This is the lighting group ID for the the scenes - note that the scenes used should all be part of the same group of lights for this to work.

* `HUE_SCENE_TRANSITION`
This is not used at the moment, so can be left empty.
Transition times between scenes are currently hardcoded.

* `PLAYER_ID1/PLAYER_ID2`
This is the Plex PlayerID(s) that should activate your lights.
Currently only two players are supported.
To get this/these ID's you need to monitor the log output. See below.

* `HOME_LATITUDE=`
Latitide of your home location - used to calculate sunset and sunrise.
If left empty, lights will only be controlled if they are turned on when you start watching a Move/TV-Show.

* `HOME_LONGITUDE=`
Longitude of your home location - used to calculate sunset and sunrise.
If left empty, lights will only be controlled if they are turned on when you start watching a Move/TV-Show.


### Build the app

```bash
$ npm install
```

### Start Plex HUE Control

```bash
$ npm start
```

Plex HUE Control should now be running and listening on the configured port.
You can do a simple test using curl
```bash
$ curl http://localhost:<port-number>
```


### Monitor log output
```bash
$ pm2 logs
```
This will let you monitor the log output of Plex HUE Control.

### Configuring Plex
In order to notify Plex HUE Control of actions made in Plex, we need to configure a Webhook in the Plex Server control panel.

1. In a browser navigate to your Plex Server and go to Settings -> Webhooks

2. Click on "Add Webhook"

3. Fill in the URL of the webhook
e.g. http://<ip-address>:<port-number>

If Plex HUE Control is running on the same machine as the Plex Server you can use localhost or 127.0.0.1 as the IP address.
The Port Number is the port configured above.

4. Save the changes.


### Getting Player ID's

Monitor the log output of PM2 and then start playing a movie on the device you want to control your lights.
In the log output you will see the player ID followed by the action taken.
Fill in this player ID in the .env file.

Then restart PM2
```bash
$ pm2 restart all
```

### Check that light control is working
Ensure the lights you want to control are on - The Plex HUE Control checks these before taking any actions, to ensure that lights on not turned on during daytime.

Monitor the log output of PM2

Then start playing a movie on one of the configured devices, and you should see the lights change.

## Update of Plex HUE Control

Run the following command inside the plex-hue-control directory
```bash
 git stash && git pull && npm install && pm2 restart all
 ```

 ## Acknowledgments

* Thank you [Nathan Paul](https://npaul.uk) for your work


