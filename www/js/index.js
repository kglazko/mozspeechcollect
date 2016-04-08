/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var client = new BinaryClient('ws://10.252.34.21:9000');
var speakbtn = document.querySelector("#speak");
var sayaudio = document.querySelector("#say");
var recognizing = false;
var final_transcript = "";
var _stream;
//var sr;
var recording_state = 0;
var offline = true;
var global_phrase;
var audio_context = new window.AudioContext;
var recorder;
var str_grm = "#JSGF V1.0; grammar test;  <numeros> =  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 ; public <numbers> = <numeros>+;"
var blob = null;
localStorage.setItem("totalsamples", 0 );

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        // Wait for connection to BinaryJS server
client.on('open', function(){
    offline = false;
    changelabel("You are connected. Please, push the microphone to start testing.");
});

// Wait for connection to BinaryJS server
client.on('error', function(){
    offline = true;
    changelabel("Sorry, you are offline. Please, restart the application.");
    alert("You have disconnected. Please, restart the application.");
});

navigator.mozGetUserMedia({audio: true},
    function(stream){
        // if everything ok
        var options = {};
        _stream = stream;
        success_gum(_stream) ;
        nomike = false;
    } ,
    function(_error){
        if (error) error(_error)
        nomike = true;
    } 
);

function success_gum(stream){
    var input = audio_context.createMediaStreamSource(stream);
    console.log('Media stream created.');
    recorder = new Recorder(input);
}

function sendVoice(){
    try {
        randomnumber= +new Date();
        var stream = client.send(blob, {name:  randomnumber + "audio.wav" , size: blob.size});
        stream = client.send(final_transcript, {name: randomnumber + "asr.txt", size: final_transcript.length});
        stream = client.send(global_phrase, {name: randomnumber + "word.txt", size: global_phrase.length});
        stream = client.send(str_grm, {name: randomnumber + "grm.txt", size: str_grm.length});

        console.log("streaming");

        document.querySelector("#sendbtn").value = "Thanks for the contribution!";
        blob = null;
        localStorage.setItem("totalsamples" , (+localStorage.getItem("totalsamples"))+1 );

    } 
    catch (err) {
        alert("You have disconnected. Please, restart the application.");
        return;
    }


    window.setTimeout(
        function(){  
            document.querySelector("#divsendbtn").style.display = 'none';
            changelabel("Please press the microphone to record.");
            document.querySelector("#lblstatus").style.display = 'block';
            document.querySelector("#fox").style.display = 'block';
            document.querySelector("#mic").style.display = 'block';
          }, 
        1000);
}

function startRecording() {
    document.querySelector("#listening").style.display = 'block';
    document.querySelector("#clicktostop").style.display='block';
    document.querySelector("#speak").className = 'recording';
    recorder && recorder.record();
    console.log('Recording...');
}

function stopRecording(button) {
    recorder && recorder.stop();
    document.querySelector("#listening").style.display = 'none';
    document.querySelector("#clicktostop").style.display='none';
    document.querySelector("#speak").className = 'not-recording';
    console.log('Stopped recording.');
    // create WAV download link using audio data blob
    createUploadLink();
    recording_state = 0;
    recorder.clear();
}


function createUploadLink() {
    recorder && recorder.exportWAV(function(_blob) {
      blob  = _blob;
      document.querySelector("#divsendbtn").style.display = 'block';
      document.querySelector("#sendbtn").value = "Submit";

      // hide mic and thanks text
      document.querySelector("#mic").style.display = 'none';
      document.querySelector("#lblstatus").style.display = 'none';
      console.log('mediarecorder stopped');
      document.querySelector("#msgsamples").innerHTML = "You contributed with "+localStorage.getItem("totalsamples") +" samples so far!";

    });
}


function onendspeak(number)
{
    console.log('starting')
    //sr.start(); // Validation of sr.grammars occurs here
    startRecording();
    //sr.onresult = function(event){
        //document.getElementById("mic").addEventListener("click", stopRecording);
        recognizing = false;
        //document.querySelector("#listening").style.display = 'none';
        document.querySelector("#fox").style.display = 'block';
        //document.querySelector("#lblstatus").style.display='none';

        final_transcript = '';
        // Assemble the transcript from the array of results
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                console.log("recognition.onresult : isFinal");
                final_transcript += event.results[i][0].transcript;
            } 
        }

        var e = document.createElement("audio");
        e.src = "camcorder_end.opus";
        e.setAttribute("autoplay", "true");
        changelabel("Thank you! <br> Tap the microphone to say the next sequence.");
    //};
}

function say(phrase,file){

   recording_state = 1;
    if (recognizing){
        return;
    }
    
    document.querySelector("#divsendbtn").style.display = 'none';
    //changelabel("Please tap on the microphone to record.");

   /** var number = "(";
    for (i = 0; i<=9; i++){
        
        if (i == 3)
            number = number.concat(") ")
        
        var rnd = Math.random().toString().substring(2,3);
        var number = number.concat( rnd ); 

    }**/
    phrase = phrase.concat("Hey Vaani");
    global_phrase = "Hey Vaani";

    recognizing = true;
    var e = document.createElement("audio");
    e.src = "camcorder_start.opus";
    e.setAttribute("autoplay", "true");
    e.addEventListener("ended", function(){
        changelabel(phrase);
        document.querySelector("#listening").style.display = 'block';
        onendspeak("Hey Vaani");
    });
}

function changelabel(str){
    document.querySelector("#lblstatus").style.display = 'block';
    document.querySelector("#lblstatus").innerHTML = str;
}

function load(){
    checkoptin();

    speakbtn.onclick = function (){

        if (offline)
            alert("You have disconnected. Please, restart the application.");
        else
            if (recording_state == 0) {
                say("Say this phrase:<br>");
            }

            else if (recording_state == 1) {
                stopRecording();
            }
            
    }

    agreebtn.onclick = function (){
      localStorage.setItem("optin" , "1");;
      checkoptin();
    }

    cancelbtn.onclick = function (){
      document.querySelector("#divsendbtn").style.display = 'none';
      document.querySelector("#mic").style.display = 'block';
      document.querySelector("#lblstatus").style.display = 'block';
      //STATE MACHINE RECORDING IS EQUAL TO NOT RECORDING
      //RENDER MIC, RENDER VAANI, ETC.
    }

    sendbtn.onclick = function (){
        if (blob != null)
         sendVoice();
    }
}
    function checkoptin(){
    if (localStorage.getItem("optin") == "1"){
        document.querySelector("#optincard").style.display = 'none';
        document.querySelector("#maindiv").style.display = 'block';
    }
}

document.body.onload = function () {
    load();
}
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
