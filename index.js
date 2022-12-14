#!/usr/bin/env node
const NightTimeCalc = require('./sun-calc')

// requried libraries
const express = require('express')
    , request = require('request')
    , multer = require('multer')
    , axios = require('axios');

const app = express();
const upload = multer({ dest: '/tmp/' });

// Read configuration data from .env file
const listen_port = process.env.LISTEN_PORT || 8000; // Port plex-hue-control listens on
const hueaddress = process.env.HUE_ADDRESS; //address of the hue bridge
const huetoken = process.env.HUE_TOKEN; //API token generated from hue
const playerID1 =  process.env.PLAYER_ID1; //player IDs to respond to
const playerID2 =  process.env.PLAYER_ID2;
const huesceneplay = process.env.HUE_SCENE_PLAY; // Same scene used for play & resume
const huescenepause = process.env.HUE_SCENE_PAUSE;
const huescenestop = process.env.HUE_SCENE_STOP;
const huescenegroupid = process.env.HUE_SCENE_GROUPID;
const latitude = process.env.HOME_LATITUDE || 0.0;
const longitude = process.env.HOME_LONGITUDE || 0.0;

// Require lights to be on. If turned off, we will not be changing scene.
// If Latitude & Longitude are configured in .env we will control lights during 
// nighttime (after sunset & before sunrise)
var lightson = true;

// Set the scene based on id
function setScene(groupId, scene, transitionTime) {
    var options = {
        uri: 'http://' + hueaddress + '/api/' + huetoken + '/groups/' + groupId + '/action',
        method: 'PUT',
        json: {
            "scene": scene, "transitiontime": transitionTime
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body.id)
        }
    });
}


function getGroupAnyOn(groupId) {
    return axios.get('http://' + hueaddress + '/api/' + huetoken + '/groups/' + groupId + '/')
        .then(res => { return res.data.state.any_on; })
}

app.post('/', upload.single('thumb'), function (req, res, next) {
    var payload = JSON.parse(req.body.payload);
    //console.log('Got webhook for: ', payload.event);
    console.log('Got player ID: ', payload.Player.uuid)
    //console.log('Got payload type: ', payload.Metadata.type);
    
    if ((payload.Player.uuid == playerID1 || payload.Player.uuid == playerID2) && (payload.Metadata.type == 'movie' || payload.Metadata.type == 'episode') && lightson == true) {
        console.log(payload.event);
        switch (payload.event) {
            case 'media.play':
                setScene(huescenegroupid, huesceneplay, 250); // Delay in 1/10s
                console.log("Play event");
                break;
            case 'media.pause':
                setTimeout(setScene, 1000, huescenegroupid, huescenepause, 50); // Delay in 1/10s
                console.log("pause event");
                break;
            case 'media.resume':
                setScene(huescenegroupid, huesceneplay, 30); // Delay in 1/10s
                console.log("media resume");
                break;
            case 'media.stop':
                setScene(huescenegroupid, huescenestop, 100) // Delay in 1/10s
                console.log("media stop");
                break;
        }
    }
    res.sendStatus(200);
});

app.listen(listen_port); // listen on configured port
setInterval(() => {
    if (latitude != 0.0 && longitude != 0.0 ) {
        if (NightTimeCalc(latitude, longitude) == 1) {
            lightson = true;
        }
        else {
            lightson = false;
        }
    }
    else
    {
        getGroupAnyOn(huescenegroupid).then(data => {
            lightson = data;
            //console.log("checking lights on " + data);

        });
    }
}
    , 30000); // Checking status every 30 seconds