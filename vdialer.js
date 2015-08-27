var client = new BinaryClient('ws://speechan.cloudapp.net:9000');
var speakbtn = document.querySelector("#speak");
var sayaudio = document.querySelector("#say");
var recognizing = false;
var final_transcript = "";
var _stream;
var mediaRecorder;
var sr;
var eventmediarecorder;
var offline = true;
var global_phrase;
var str_grm = "#JSGF V1.0; grammar test;  <numeros> =  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 ; public <numbers> = <numeros>+;"
// Wait for connection to BinaryJS server
client.on('open', function(){
    offline = false;
    changelabel("You are connected. Please, push the microphone to start testing.");
});

// Wait for connection to BinaryJS server
client.on('error', function(){
    offline = true;
    changelabel("Sorry, you are offline. Please, restart the application.");
    alert("You got disconnected. Please, restart the appplication.");
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
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = function(e) {
        eventmediarecorder = e;
  };
  mediaRecorder.onerror = function(e){
        console.log('on error');
  };

  mediaRecorder.onstop = function() {
      document.querySelector("#divsendbtn").style.display = 'block';
      document.querySelector("#sendbtn").value = "Submit";

      // hide mic and thanks text
      document.querySelector("#mic").style.display = 'none';
      document.querySelector("#lblstatus").style.display = 'none';
      console.log('mediarecorder stopped');
  };
}

function sendVoice(){
    try {
        randomnumber= +new Date();
        var stream = client.send(eventmediarecorder.data, {name:  randomnumber + "audio.opus" , size: eventmediarecorder.data.size});
        stream = client.send(final_transcript, {name: randomnumber + "asr.txt", size: final_transcript.length});
        stream = client.send(global_phrase, {name: randomnumber + "word.txt", size: global_phrase.length});
        stream = client.send(str_grm, {name: randomnumber + "grm.txt", size: str_grm.length});

        console.log("streaming");
    } 
    catch (err) {
        alert("You got disconnected. Please, restart the appplication.");
        return;
    }

    document.querySelector("#sendbtn").value = "Thanks for the contribution!";
    eventmediarecorder = null;

    window.setTimeout(
        function(){  
            document.querySelector("#divsendbtn").style.display = 'none';
            document.querySelector("#lblstatus").style.display = 'block';
            document.querySelector("#fox").style.display = 'block';
            document.querySelector("#mic").style.display = 'block';
          }, 
        1000);
}

function onendspeak(number)
{
    console.log('starting')
    sr.start(); // Validation of sr.grammars occurs here
    mediaRecorder.start();
    sr.onresult = function(event){
        recognizing = false;
        mediaRecorder.stop(); 
        document.querySelector("#listening").style.display = 'none';
        document.querySelector("#fox").style.display = 'block';

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
    };
}

function say(phrase,file){
   
    if (recognizing){
        return;
    }
    
    document.querySelector("#divsendbtn").style.display = 'none';

    var number = "(";
    for (i = 0; i<=9; i++){
        
        if (i == 3)
            number = number.concat(") ")
        
        var rnd = Math.random().toString().substring(2,3);
        var number = number.concat( rnd );

    }
    phrase = phrase.concat(number);
    global_phrase = number;

    recognizing = true;
    var e = document.createElement("audio");
    e.src = "camcorder_start.opus";
    e.setAttribute("autoplay", "true");
    e.addEventListener("ended", function(){
        changelabel(phrase);
        document.querySelector("#listening").style.display = 'block';
        document.querySelector("#fox").style.display = 'none';
        onendspeak(number);
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
            alert("You got disconnected. Please, restart the appplication.");
        else
            say("Say this phone number:<br>");
    }

    agreebtn.onclick = function (){
      localStorage.setItem("optin" , "1");;
      checkoptin();
    }

    cancelbtn.onclick = function (){
      document.querySelector("#divsendbtn").style.display = 'none';
      document.querySelector("#mic").style.display = 'block';
      document.querySelector("#lblstatus").style.display = 'block';
    }

    sendbtn.onclick = function (){
        if (eventmediarecorder != null)
         sendVoice();
    }

    sr = new SpeechRecognition();
    sr.lang ="en-US";
    var sgl = new SpeechGrammarList();
    sgl.addFromString(str_grm ,1);
    sr. grammars = sgl;
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


