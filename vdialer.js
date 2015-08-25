var client = new BinaryClient('ws://speechan.cloudapp.net:9000');
var speakbtn = document.querySelector("#speak");
var sayaudio = document.querySelector("#say");
var recognizing = false;
var final_transcript = "";
var _stream;
var mediaRecorder;

var sr = new SpeechRecognition();
sr.lang ="en-US";
var sgl = new SpeechGrammarList();
sgl.addFromString("#JSGF V1.0; grammar test;  <numeros> =  oh | 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 |  8 |  9 ; public <numbers> = <numeros>+; " ,1);
sr. grammars = sgl;



// Wait for connection to BinaryJS server
client.on('open', function(){
    changelabel("You are connected with our server. Please, push the microphone to start testing.");
});

// Wait for connection to BinaryJS server
client.on('error', function(){
    changelabel("Sorry, we can't connect you with our server. Please check your connection.");
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
        sendVoice(e);
        //wsstream = client.send(e.data, {name: "audio", size: e.data.size});
  };
  mediaRecorder.onerror = function(e){
        console.log('on error');

  };

  mediaRecorder.onstop = function()
  {
      console.log('mediarecorder stopped');
  };
}

function sendVoice(e)
{
    randomnumber= +new Date();
    var stream = client.send(e.data, {name:  randomnumber + "audio.opus" , size: e.data.size});
    var stream = client.send(final_transcript, {name: randomnumber + "asr.txt", size: final_transcript.length});
    console.log("streaming");
}

speakbtn.onclick = function ()
{
    recognizing = true;
    say("Say this phone number:<br>");
}

agreebtn.onclick = function (){
  localStorage.optin  = true;
  checkoptin();
}

function onendspeak(number)
{
    if (!recognizing)
    {
        return;
    }

    console.log('starting')
    sr.start(); // Validation of sr.grammars occurs here
    mediaRecorder.start();
    sr.onresult = function(event)
    {
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

        changelabel("Thank you! <br> Press the microphone to say the next sequence.");

    };
}

function say(phrase,file){
    var number = "(";
    for (i = 0; i<=9; i++){
        
        if (i == 3)
            number = number.concat(") ")
        
        var rnd = Math.random().toString().substring(2,3);
        var number = number.concat( rnd );

    }
    phrase = phrase.concat(number);
    changelabel(phrase);
    document.querySelector("#listening").style.display = 'block';
    document.querySelector("#fox").style.display = 'none';
    onendspeak(number);
}


function changelabel(str){
    document.querySelector("#lblstatus").style.display = 'block';
    document.querySelector("#lblstatus").innerHTML = str;
}


function checkoptin(){
    if (localStorage.optin){
        document.querySelector("#optincard").style.display = 'none';
        document.querySelector("#maindiv").style.display = 'block';
    }
}



