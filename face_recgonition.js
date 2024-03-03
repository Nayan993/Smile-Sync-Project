// Import necessary libraries and dependencies
const cv = require('opencv4nodejs');
const faceapi = require('face-api.js');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const { Canvas, Image, ImageData } = require('canvas');
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Function to create a new attendance CSV file with the current date in the filename
function createNewAttendanceFile() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const newAttendanceFile = `attendance_${dateStr}.csv`;
    return newAttendanceFile;
}

// Load known faces and their names
const knownFacesDir = 'known_faces';
const knownFaces = [];
const knownNames = [];

fs.readdirSync(knownFacesDir).forEach(file => {
    if (file.endsWith('.jpg') || file.endsWith('.png')) {
        const image = cv.imread(path.join(knownFacesDir, file));
        const encoding = faceapi.encode(image);
        knownFaces.push(encoding);
        knownNames.push(path.parse(file).name);
    }
});

// Create or load attendance CSV file with the current date in the filename
const attendanceFile = createNewAttendanceFile();
let attendanceData = [];

if (fs.existsSync(attendanceFile)) {
    // Load existing attendance data if the file exists
    const csvData = fs.readFileSync(attendanceFile, 'utf8');
    attendanceData = csvData.split('\n').map(row => row.split(','));
}

// Initialize webcam using WebRTC
const { createCanvas, ImageData } = require('canvas');
const videoElement = document.createElement('video');
document.body.appendChild(videoElement);

const constraints = { video: true };

(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
    } catch (err) {
        console.error('Error accessing webcam:', err);
    }
})();

// Initialize a dictionary to keep track of the last recorded time for each detected face
const cooldownDict = {};
const cooldownDuration = 5400000; // 1.5 hours in milliseconds

// Function to capture and process webcam frames
async function processWebcamFrame() {
    if (videoElement.paused || videoElement.ended) {
        return;
    }

    // Capture a frame from the webcam
    const canvas = createCanvas(videoElement.width, videoElement.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);

    // Convert the canvas image to an OpenCV Mat
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const frame = new cv.Mat(new ImageData(imgData.data, canvas.width, canvas.height), cv.CV_8UC4);

    // Detect faces in the frame
    const faceLocations = await faceapi.detectAllFaces(frame).withFaceLandmarks().withFaceDescriptors();

    for (const { detection, descriptor } of faceLocations) {
        // Compare the detected face with known faces
        const matches = knownFaces.map(knownFace => faceapi.faceDistance(knownFace, descriptor) < 0.6);
        let name = 'Unknown';

        if (matches.includes(true)) {
            const firstMatchIndex = matches.indexOf(true);
            name = knownNames[firstMatchIndex];

            // Check if enough time has passed since the last entry for this face
            const lastEntryTime = cooldownDict[name] || new Date(0);
            const now = new Date();
            if (now - lastEntryTime > cooldownDuration) {
                // Record attendance with timestamps
                const timestamp = now.toISOString();
                attendanceData.push([name, timestamp]);
                cooldownDict[name] = now;
            }
        }

        // Display the result on the canvas
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(name, detection.box.x, detection.box.y - 10);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.strokeRect(detection.box.x, detection.box.y, detection.box.width, detection.box.height);
    }

    // Display the processed frame on the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(processWebcamFrame);
}

videoElement.addEventListener('play', () => {
    // Start processing webcam frames when the video starts playing
    processWebcamFrame();
});

// Handle user input to stop the script
document.addEventListener('keydown', event => {
    if (event.key === 'q' || event.key === 'Q') {
        // Release the webcam and save the attendance data
        videoElement.pause();
        videoElement.srcObject.getTracks().forEach(track => track.stop());

        // Convert attendance data to CSV and save to file
        const csvData = attendanceData.map(row => row.join(',')).join('\n');
        writeFileAsync(attendanceFile, csvData, 'utf8')
            .then(() => {
                console.log('Attendance data saved.');
                process.exit(0);
            })
            .catch(err => {
                console.error('Error saving attendance data:', err);
                process.exit(1);
            });
    }
});
