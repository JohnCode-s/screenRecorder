let start = document.querySelector(".start-btn")
let stop = document.querySelector(".stop-btn")
var player = document.querySelector(".videoPlayer");
var download = document.querySelector(".download-btn");

start.addEventListener("click", async function () {
    let stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
    });

    mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm"
    });

    mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm"
    });
    
    mediaRecorder.start()
    let chunks = []
    mediaRecorder.addEventListener('dataavailable', function (e) {
        chunks.push(e.data)
        //console.log(e.data);
    });


    mediaRecorder.addEventListener('stop', function () {
        stop.style.display = "none";
        let blob = new Blob(chunks, {
            type: chunks[0].type
        });
        let url = URL.createObjectURL(blob);
        //console.log(url);

        let video = document.querySelector("video")
        video.src = url
        player.style.display = "";
        video.play();
        download.href = url
        download.download = 'screenRecord.webm';
        download.style.display = "";


        stop.addEventListener("click", function () {
            mediaRecorder.stop();
            stop.style.display = "none";
        });
    })
})