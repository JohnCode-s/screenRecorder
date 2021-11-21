let shouldStop = false;
let stopped = false;
const videoElement = document.querySelector("video");
const downloadLink = document.getElementById('download');
const stopButton = document.getElementById('stop');


function startRecord() {
    $('.btn-info').prop('disabled', true);
    $('#stop').prop('disabled', false);
    $('#download').css('display', 'none')
}
    
function stopRecord() {
    $('.btn-info').prop('disabled', false);
    $('#stop').prop('disabled', true);
    $('#download').css('display', 'block')
}
 
const audioRecordConstraints = {
    echoCancellation: true
}

stopButton.addEventListener('click', function () {
    shouldStop = true;
});

const handleRecord = function ({ stream, mimeType }) {
    startRecord()
    let chunk = [];
    stopped = false;
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
            chunk.push(e.data);
        }

        if (shouldStop === true && stopped === false) {
            mediaRecorder.stop();
            stopped = true;
        }
    };

    mediaRecorder.onstop = function () {
        const blob = new Blob(chunk, {
            type: mimeType
        });
        chunk = []
        const filename = window.prompt('Enter file name');
        let url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = `${filename || 'recording'}.webm`;
        stopRecord();
        videoElement.style.display = 'block'
        //videoElement.srcObject = null;
        videoElement.src = url;

       if (screen.width > 920) {
           videoElement.width = 920;
       } else if (screen.width > 720) {
           videoElement.width = 720
       } else if (screen.width > 480) {
           videoElement.width = 480
       } else {
           videoElement.width = 320
       }

    };

    mediaRecorder.start(200);
};

async function recordAudio() {
    videoElement.style.display = 'none';
    const mimeType = 'audio/webm';
    shouldStop = false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: audioRecordConstraints });
    handleRecord({ stream, mimeType });
}

async function recordVideo() {
    const mimeType = 'video/webm';
    shouldStop = false;
    const constraints = {
        audio: true,
        video: {
            "width": {
                "min": 640,
                "max": 1024
            },
            "height": {
                "min": 480,
                "max": 768
            }
        }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    videoElement.srcObject = stream;
      if (screen.width > 920) {
           videoElement.width = 920;
       } else if (screen.width > 720) {
           videoElement.width = 720
       } else if (screen.width > 480) {
           videoElement.width = 480
       } else {
           videoElement.width = 320
       }
    handleRecord({ stream, mimeType })
}

async function recordScreen() {
    videoElement.style.display = 'none';
    const mimeType = 'video/webm';
    shouldStop = false;

    if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
        return window.alert('Screen Record not supported!')
    }
    let stream = null;
    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'motion' }, audio: { echoCancellation: true } });
    if (window.confirm("Record audio with screen?")) {
        const audioContext = new AudioContext();

        const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true }, video: false });
        const userAudio = audioContext.createMediaStreamSource(voiceStream);
            
        const audioDestination = audioContext.createMediaStreamDestination();
        userAudio.connect(audioDestination);

        if (displayStream.getAudioTracks().length > 0) {
            const displayAudio = audioContext.createMediaStreamSource(displayStream);
            displayAudio.connect(audioDestination);
        }

        const tracks = [...displayStream.getVideoTracks(), ...audioDestination.stream.getTracks()]
        stream = new MediaStream(tracks);
        handleRecord({ stream, mimeType })
    } else {
        stream = displayStream;
        handleRecord({ stream, mimeType });
    };
    videoElement.srcObject = stream;
}
