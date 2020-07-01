import React, {Component} from 'react'
import {render} from 'react-dom'
import AgoraRtcEngine from 'agora-electron-sdk'
import path from 'path'
import os from 'os'

const APPID = YOUR APPID

export default class App extends Component {

    constructor(props) {
        super(props);
    }

    changeResolution(resolution){
        if(resolution.target.value == "480P"){
            rtcEngine.setVideoEncoderConfiguration({width: 848, height: 480, frameRate: 30, bitrate: 930})
        }else{
            rtcEngine.setVideoEncoderConfiguration({width: 1280, height: 720, frameRate: 30, bitrate: 1710})
        }
        console.log(resolution.target.value);
    }

    componentDidMount(){
        if(global.rtcEngine) {
            global.rtcEngine.release()
            global.rtcEngine = null
        }

        if(!APPID) {
            alert('Please provide APPID in App.jsx')
            return
        }

        const consoleContainer = document.querySelector('#console')

        let rtcEngine = new AgoraRtcEngine()
        let delay = 0;
        let receivedBitrate = 0;
        rtcEngine.initialize(APPID)
        
        // listen to events
        rtcEngine.on('joinedChannel', (channel, uid, elapsed) => {
            consoleContainer.innerHTML = `join channel success ${channel} ${uid}`
            let localVideoContainer = document.querySelector('#local')
            //setup render area for local user
            rtcEngine.setupLocalVideo(localVideoContainer)
        })

        rtcEngine.on('remoteAudioStats', (remoteAudioStats) => {
            delay = remoteAudioStats.networkTransportDelay;
            consoleContainer.innerHTML = `Delay: ${delay}ms / Bitrate: ${receivedBitrate}kbps`
        })

        rtcEngine.on('remoteVideoStats', (remoteVideoStats) => {
            receivedBitrate = remoteVideoStats.receivedBitrate;
            consoleContainer.innerHTML = `Delay: ${delay}ms / Bitrate: ${receivedBitrate}kbps`
        })
        
        rtcEngine.on('error', (err, msg) => {
          consoleContainer.innerHTML = `error: code ${err} - ${msg}`
        })
        rtcEngine.on('userJoined', (uid) => {
          //setup render area for joined user
          let remoteVideoContainer = document.querySelector('#remote')
          rtcEngine.setupViewContentMode(uid, 1);
          rtcEngine.subscribe(uid, remoteVideoContainer)
        })

        // set channel profile, 0: video call, 1: live broadcasting
        
        rtcEngine.setChannelProfile(1)
        rtcEngine.setClientRole(1)
        
        rtcEngine.setVideoEncoderConfiguration({width: 1280, height: 720, frameRate: 30, bitrate: 1710})

        // enable video, call disableVideo() is you don't need video at all
        rtcEngine.enableVideo()
    

        //https://docs.agora.io/en/Video/API%20Reference/electron/enums/video_profile_type.html#video_profile_landscape_720p
        const logpath = path.join(os.homedir(), 'agorasdk.log')
        // set where log file should be put for problem diagnostic
        rtcEngine.setLogFile(logpath)

        // rtcEngine.setParameters("{\"rtc.enable_proxy\":true}");
        // rtcEngine.setParameters("{\"rtc.proxy_server\":[0, \"IP\", 1080]}");

        
        // join channel to rock!
        rtcEngine.joinChannel(null, "demoChannel", null, Math.floor(new Date().getTime() / 1000))

        global.rtcEngine = rtcEngine
    }
    render() {
        // const logosRender = logos.map( (logo, index) => {
        //     return <Logo key = {index} src = { logo } />
        // })

        return (
            <div>
                <select　onChange={this.changeResolution}>
                    <option value="720P">720P</option>
                    <option value="480P">480P</option>
                </select>
                <div className="video" id="local"></div>
                <div className="video" id="remote"></div>
                {/* {logosRender} */}
                {/*<div className="hello">
                    <div className="video" id="local"></div>
                    <div className="video" id="remote"></div>
                </div>*/}
                <div className="console" id="console"></div>
            </div>
        )
    }
}
