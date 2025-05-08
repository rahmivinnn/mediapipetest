// DOM Elements
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output-canvas');
const startCameraButton = document.getElementById('start-camera');
const stopCameraButton = document.getElementById('stop-camera');
const trackingModeSelect = document.getElementById('tracking-mode');
const analysisTypeSelect = document.getElementById('analysis-type');
const exerciseCategorySelect = document.getElementById('exercise-category');
const exerciseTypeSelect = document.getElementById('exercise-type');
const shoulderAngleElement = document.getElementById('shoulder-angle');
const elbowAngleElement = document.getElementById('elbow-angle');
const kneeAngleElement = document.getElementById('knee-angle');
const hipAngleElement = document.getElementById('hip-angle');
const repCountElement = document.getElementById('rep-count');
const postureQualityElement = document.getElementById('posture-quality');
const caloriesElement = document.getElementById('calories');
const logContainerElement = document.getElementById('log-container');
const downloadCsvButton = document.getElementById('download-csv');
const statusMessageElement = document.getElementById('status-message');
const themeToggleButton = document.getElementById('theme-toggle');
const angleChartCanvas = document.getElementById('angle-chart');

// Global variables
let camera = null;
let mediaPipePose = null;
let posenetModel = null;
let currentTrackingMode = 'mediapipe';
let currentAnalysisType = 'posture';
let currentExerciseType = 'none';
let isTracking = false;
let videoStream = null;
let angleData = [];
let timeData = [];
let repCount = 0;
let lastRepState = false;
let startTime = null;
let angleChart = null;
let poseData = [];
let isPostureBad = false;
let badPostureTimeout = null;
let caloriesBurned = 0;
let calorieInterval = null;

// Exercise definitions organized by category
const exercises = {
    upper: [
        { id: 'bicep_curl', name: 'Bicep Curl', primaryAngle: 'elbow', threshold: 90, caloriesPerRep: 0.5 },
        { id: 'shoulder_press', name: 'Shoulder Press', primaryAngle: 'shoulder', threshold: 150, caloriesPerRep: 0.7 },
        { id: 'lateral_raise', name: 'Lateral Raise', primaryAngle: 'shoulder', threshold: 90, caloriesPerRep: 0.6 },
        { id: 'tricep_extension', name: 'Tricep Extension', primaryAngle: 'elbow', threshold: 160, caloriesPerRep: 0.5 },
        { id: 'chest_press', name: 'Chest Press', primaryAngle: 'elbow', threshold: 160, caloriesPerRep: 0.8 }
    ],
    lower: [
        { id: 'squat', name: 'Squat', primaryAngle: 'knee', threshold: 100, caloriesPerRep: 1.0 },
        { id: 'lunge', name: 'Lunge', primaryAngle: 'knee', threshold: 110, caloriesPerRep: 0.9 },
        { id: 'calf_raise', name: 'Calf Raise', primaryAngle: 'ankle', threshold: 70, caloriesPerRep: 0.4 },
        { id: 'leg_extension', name: 'Leg Extension', primaryAngle: 'knee', threshold: 160, caloriesPerRep: 0.6 },
        { id: 'glute_bridge', name: 'Glute Bridge', primaryAngle: 'hip', threshold: 150, caloriesPerRep: 0.7 }
    ],
    core: [
        { id: 'crunch', name: 'Crunch', primaryAngle: 'hip', threshold: 120, caloriesPerRep: 0.5 },
        { id: 'russian_twist', name: 'Russian Twist', primaryAngle: 'hip', threshold: 100, caloriesPerRep: 0.6 },
        { id: 'plank', name: 'Plank', primaryAngle: 'elbow', threshold: 90, caloriesPerMin: 5.0, isStatic: true },
        { id: 'mountain_climber', name: 'Mountain Climber', primaryAngle: 'knee', threshold: 90, caloriesPerRep: 0.3 },
        { id: 'leg_raise', name: 'Leg Raise', primaryAngle: 'hip', threshold: 90, caloriesPerRep: 0.6 }
    ],
    cardio: [
        { id: 'jumping_jack', name: 'Jumping Jack', primaryAngle: 'shoulder', threshold: 150, caloriesPerRep: 0.3 },
        { id: 'high_knees', name: 'High Knees', primaryAngle: 'knee', threshold: 90, caloriesPerRep: 0.2 },
        { id: 'burpee', name: 'Burpee', primaryAngle: 'knee', threshold: 90, caloriesPerRep: 1.5 },
        { id: 'jump_squat', name: 'Jump Squat', primaryAngle: 'knee', threshold: 90, caloriesPerRep: 1.2 }
    ],
    yoga: [
        { id: 'warrior_pose', name: 'Warrior Pose', primaryAngle: 'knee', threshold: 120, isStatic: true, caloriesPerMin: 3.0 },
        { id: 'tree_pose', name: 'Tree Pose', primaryAngle: 'hip', threshold: 90, isStatic: true, caloriesPerMin: 2.5 },
        { id: 'downward_dog', name: 'Downward Dog', primaryAngle: 'hip', threshold: 90, isStatic: true, caloriesPerMin: 3.0 }
    ],
    rehab: [
        { id: 'shoulder_rotation', name: 'Shoulder Rotation', primaryAngle: 'shoulder', threshold: 45, caloriesPerRep: 0.2 },
        { id: 'knee_extension', name: 'Knee Extension', primaryAngle: 'knee', threshold: 160, caloriesPerRep: 0.3 },
        { id: 'ankle_circles', name: 'Ankle Circles', primaryAngle: 'ankle', threshold: 30, caloriesPerRep: 0.1 }
    ]
};

// Initialize the application
function init() {
    // Populate exercise dropdown
    populateExerciseDropdown();

    // Set up event listeners
    startCameraButton.addEventListener('click', startCamera);
    stopCameraButton.addEventListener('click', stopCamera);
    trackingModeSelect.addEventListener('change', changeTrackingMode);
    analysisTypeSelect.addEventListener('change', changeAnalysisType);
    exerciseCategorySelect.addEventListener('change', filterExercisesByCategory);
    exerciseTypeSelect.addEventListener('change', changeExerciseType);
    downloadCsvButton.addEventListener('click', downloadCsv);
    themeToggleButton.addEventListener('click', toggleTheme);

    // Initialize chart
    initChart();

    // Log initialization
    updateLog('Application initialized. Ready to start.');
}

// Populate exercise dropdown with all exercises
function populateExerciseDropdown() {
    // Clear existing options
    exerciseTypeSelect.innerHTML = '';

    // Add "None" option
    const noneOption = document.createElement('option');
    noneOption.value = 'none';
    noneOption.textContent = 'None (Free Movement)';
    exerciseTypeSelect.appendChild(noneOption);

    // Get selected category
    const selectedCategory = exerciseCategorySelect.value;

    // Add exercises based on selected category
    if (selectedCategory === 'all') {
        // Add all exercises with category headers
        Object.keys(exercises).forEach(category => {
            addExerciseCategoryGroup(category);
        });
    } else {
        // Add only exercises from the selected category
        if (exercises[selectedCategory]) {
            addExerciseCategoryGroup(selectedCategory);
        }
    }
}

// Add a category group of exercises to the dropdown
function addExerciseCategoryGroup(category) {
    // Create category label
    const categoryOption = document.createElement('option');
    categoryOption.disabled = true;
    categoryOption.className = 'exercise-category';

    // Format category name
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1) + ' Body';
    categoryOption.textContent = '--- ' + categoryName + ' ---';
    exerciseTypeSelect.appendChild(categoryOption);

    // Add exercises for this category
    exercises[category].forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.id;
        option.textContent = exercise.name;
        exerciseTypeSelect.appendChild(option);
    });
}

// Filter exercises by category
function filterExercisesByCategory() {
    populateExerciseDropdown();
}

// Initialize Chart.js
function initChart() {
    const ctx = angleChartCanvas.getContext('2d');
    angleChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Primary Angle',
                data: [],
                borderColor: '#03dac6',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    },
                    ticks: {
                        color: document.body.classList.contains('light-theme') ? '#333' : '#e0e0e0'
                    },
                    grid: {
                        color: document.body.classList.contains('light-theme') ?
                            'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Angle (°)'
                    },
                    ticks: {
                        color: document.body.classList.contains('light-theme') ? '#333' : '#e0e0e0'
                    },
                    grid: {
                        color: document.body.classList.contains('light-theme') ?
                            'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('light-theme') ? '#333' : '#e0e0e0'
                    }
                }
            }
        }
    });
}

// Start camera and tracking
async function startCamera() {
    try {
        showStatus('Requesting camera access...', 'success');

        // Request camera access
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        webcamElement.srcObject = videoStream;

        // Wait for video to be ready
        webcamElement.onloadedmetadata = async () => {
            // Initialize canvas
            canvasElement.width = webcamElement.videoWidth;
            canvasElement.height = webcamElement.videoHeight;

            // Initialize tracking based on selected mode
            await initializeTracking();

            // Update UI
            startCameraButton.disabled = true;
            stopCameraButton.disabled = false;
            isTracking = true;
            startTime = Date.now();

            // Clear data
            angleData = [];
            timeData = [];
            repCount = 0;
            caloriesBurned = 0;
            repCountElement.textContent = '0';
            caloriesElement.textContent = '0 kcal';

            // Start calorie tracking for static exercises
            startCalorieTracking();

            // Update chart
            updateChart();

            showStatus('Camera started. Tracking pose...', 'success');
            updateLog('Camera started. Tracking in ' + currentTrackingMode + ' mode.');
        };
    } catch (error) {
        console.error('Error starting camera:', error);
        showStatus('Could not access camera: ' + error.message, 'error');
    }
}

// Start calorie tracking for static exercises
function startCalorieTracking() {
    // Clear any existing interval
    if (calorieInterval) {
        clearInterval(calorieInterval);
    }

    // Get current exercise
    const exerciseId = exerciseTypeSelect.value;
    if (exerciseId === 'none') return;

    // Find exercise in all categories
    let currentExercise = null;
    Object.values(exercises).forEach(category => {
        const found = category.find(ex => ex.id === exerciseId);
        if (found) currentExercise = found;
    });

    if (!currentExercise) return;

    // If it's a static exercise, update calories every second
    if (currentExercise.isStatic && currentExercise.caloriesPerMin) {
        calorieInterval = setInterval(() => {
            if (isTracking) {
                // Add calories for 1 second of activity (calories per minute / 60)
                caloriesBurned += currentExercise.caloriesPerMin / 60;
                caloriesElement.textContent = caloriesBurned.toFixed(1) + ' kcal';
            }
        }, 1000);
    }
}

// Stop camera and tracking
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        webcamElement.srcObject = null;
    }

    if (camera) {
        camera.stop();
    }

    // Clear canvas
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Update UI
    startCameraButton.disabled = false;
    stopCameraButton.disabled = true;
    isTracking = false;

    // Stop calorie tracking
    if (calorieInterval) {
        clearInterval(calorieInterval);
        calorieInterval = null;
    }

    showStatus('Camera stopped', 'success');
    updateLog('Camera and tracking stopped.');
}

// Initialize tracking based on selected mode
async function initializeTracking() {
    currentTrackingMode = trackingModeSelect.value;

    if (currentTrackingMode === 'mediapipe' || currentTrackingMode === 'hybrid') {
        await initializeMediaPipe();
    }

    if (currentTrackingMode === 'openpose' || currentTrackingMode === 'hybrid') {
        await initializePoseNet();
    }
}

// Initialize MediaPipe Pose
async function initializeMediaPipe() {
    showStatus('Loading MediaPipe model...', 'success');

    mediaPipePose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });

    mediaPipePose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    mediaPipePose.onResults(onMediaPipeResults);

    camera = new Camera(webcamElement, {
        onFrame: async () => {
            if (isTracking && (currentTrackingMode === 'mediapipe' || currentTrackingMode === 'hybrid')) {
                await mediaPipePose.send({ image: webcamElement });
            }
        },
        width: 1280,
        height: 720
    });

    await camera.start();
    showStatus('MediaPipe model loaded', 'success');
}

// Initialize PoseNet (OpenPose alternative)
async function initializePoseNet() {
    showStatus('Loading PoseNet model...', 'success');

    try {
        posenetModel = await posenet.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75
        });

        if (currentTrackingMode === 'openpose') {
            // Start PoseNet detection loop
            detectPoseNetFrame();
        }

        showStatus('PoseNet model loaded', 'success');
    } catch (error) {
        console.error('Error loading PoseNet:', error);
        showStatus('Error loading PoseNet: ' + error.message, 'error');
    }
}

// Process MediaPipe results
function onMediaPipeResults(results) {
    if (!isTracking) return;

    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the pose landmarks
    if (results.poseLandmarks) {
        // Draw pose connections
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });

        // Draw landmarks
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });

        // Process pose data
        processPoseData(results.poseLandmarks, 'mediapipe');
    }

    canvasCtx.restore();
}

// Detect pose using PoseNet
async function detectPoseNetFrame() {
    if (!isTracking || !posenetModel || currentTrackingMode !== 'openpose') return;

    try {
        const pose = await posenetModel.estimateSinglePose(webcamElement, {
            flipHorizontal: false
        });

        if (pose.score > 0.2) {
            drawPoseNetResults(pose);
            processPoseData(pose.keypoints, 'posenet');
        }

        // Continue detection loop
        requestAnimationFrame(detectPoseNetFrame);
    } catch (error) {
        console.error('PoseNet detection error:', error);
    }
}

// Draw PoseNet results
function drawPoseNetResults(pose) {
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw keypoints
    pose.keypoints.forEach(keypoint => {
        if (keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#FF0000';
            ctx.fill();
        }
    });

    // Draw skeleton
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, 0.5);
    adjacentKeyPoints.forEach(keypoints => {
        ctx.beginPath();
        ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
        ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00FF00';
        ctx.stroke();
    });
}

// Process pose data from either model
function processPoseData(landmarks, source) {
    // Store pose data for CSV export
    const timestamp = (Date.now() - startTime) / 1000;

    // Calculate angles based on the source
    let shoulderAngle, elbowAngle, kneeAngle, hipAngle;

    if (source === 'mediapipe') {
        // MediaPipe landmarks
        shoulderAngle = calculateMediaPipeShoulderAngle(landmarks);
        elbowAngle = calculateMediaPipeElbowAngle(landmarks);
        kneeAngle = calculateMediaPipeKneeAngle(landmarks);
        hipAngle = calculateMediaPipeHipAngle(landmarks);
    } else {
        // PoseNet keypoints
        shoulderAngle = calculatePoseNetShoulderAngle(landmarks);
        elbowAngle = calculatePoseNetElbowAngle(landmarks);
        kneeAngle = calculatePoseNetKneeAngle(landmarks);
        hipAngle = calculatePoseNetHipAngle(landmarks);
    }

    // Update UI with angles
    shoulderAngleElement.textContent = `${shoulderAngle.toFixed(1)}°`;
    elbowAngleElement.textContent = `${elbowAngle.toFixed(1)}°`;
    kneeAngleElement.textContent = `${kneeAngle.toFixed(1)}°`;
    hipAngleElement.textContent = `${hipAngle.toFixed(1)}°`;

    // Store data for export
    poseData.push({
        timestamp,
        shoulderAngle,
        elbowAngle,
        kneeAngle,
        hipAngle,
        source
    });

    // Get current exercise
    const exerciseId = exerciseTypeSelect.value;
    if (exerciseId === 'none') return;

    // Find exercise in all categories
    let currentExercise = null;
    Object.values(exercises).forEach(category => {
        const found = category.find(ex => ex.id === exerciseId);
        if (found) currentExercise = found;
    });

    if (!currentExercise) return;

    // Get primary angle for the exercise
    let primaryAngle;
    switch (currentExercise.primaryAngle) {
        case 'shoulder':
            primaryAngle = shoulderAngle;
            break;
        case 'elbow':
            primaryAngle = elbowAngle;
            break;
        case 'knee':
            primaryAngle = kneeAngle;
            break;
        case 'hip':
            primaryAngle = hipAngle;
            break;
        default:
            primaryAngle = shoulderAngle;
    }

    // Add data to chart
    timeData.push(timestamp);
    angleData.push(primaryAngle);

    // Keep only the last 100 data points for performance
    if (timeData.length > 100) {
        timeData.shift();
        angleData.shift();
    }

    // Update chart
    updateChart();

    // Check for repetitions
    if (!currentExercise.isStatic) {
        countRepetitions(primaryAngle, currentExercise);
    }

    // Check posture
    checkPosture(shoulderAngle, elbowAngle, kneeAngle, hipAngle);
}

// Calculate angles for MediaPipe landmarks
function calculateMediaPipeShoulderAngle(landmarks) {
    const shoulder = landmarks[11]; // Right shoulder
    const elbow = landmarks[13]; // Right elbow
    const hip = landmarks[23]; // Right hip

    return calculateAngleBetweenPoints(hip, shoulder, elbow);
}

function calculateMediaPipeElbowAngle(landmarks) {
    const shoulder = landmarks[11]; // Right shoulder
    const elbow = landmarks[13]; // Right elbow
    const wrist = landmarks[15]; // Right wrist

    return calculateAngleBetweenPoints(shoulder, elbow, wrist);
}

function calculateMediaPipeKneeAngle(landmarks) {
    const hip = landmarks[23]; // Right hip
    const knee = landmarks[25]; // Right knee
    const ankle = landmarks[27]; // Right ankle

    return calculateAngleBetweenPoints(hip, knee, ankle);
}

function calculateMediaPipeHipAngle(landmarks) {
    const shoulder = landmarks[11]; // Right shoulder
    const hip = landmarks[23]; // Right hip
    const knee = landmarks[25]; // Right knee

    return calculateAngleBetweenPoints(shoulder, hip, knee);
}

// Calculate angles for PoseNet keypoints
function calculatePoseNetShoulderAngle(keypoints) {
    const shoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const elbow = keypoints.find(kp => kp.part === 'rightElbow');
    const hip = keypoints.find(kp => kp.part === 'rightHip');

    if (shoulder && elbow && hip && shoulder.score > 0.5 && elbow.score > 0.5 && hip.score > 0.5) {
        return calculateAngleBetweenPoseNetPoints(hip.position, shoulder.position, elbow.position);
    }

    return 0;
}

function calculatePoseNetElbowAngle(keypoints) {
    const shoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const elbow = keypoints.find(kp => kp.part === 'rightElbow');
    const wrist = keypoints.find(kp => kp.part === 'rightWrist');

    if (shoulder && elbow && wrist && shoulder.score > 0.5 && elbow.score > 0.5 && wrist.score > 0.5) {
        return calculateAngleBetweenPoseNetPoints(shoulder.position, elbow.position, wrist.position);
    }

    return 0;
}

function calculatePoseNetKneeAngle(keypoints) {
    const hip = keypoints.find(kp => kp.part === 'rightHip');
    const knee = keypoints.find(kp => kp.part === 'rightKnee');
    const ankle = keypoints.find(kp => kp.part === 'rightAnkle');

    if (hip && knee && ankle && hip.score > 0.5 && knee.score > 0.5 && ankle.score > 0.5) {
        return calculateAngleBetweenPoseNetPoints(hip.position, knee.position, ankle.position);
    }

    return 0;
}

function calculatePoseNetHipAngle(keypoints) {
    const shoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const hip = keypoints.find(kp => kp.part === 'rightHip');
    const knee = keypoints.find(kp => kp.part === 'rightKnee');

    if (shoulder && hip && knee && shoulder.score > 0.5 && hip.score > 0.5 && knee.score > 0.5) {
        return calculateAngleBetweenPoseNetPoints(shoulder.position, hip.position, knee.position);
    }

    return 0;
}

// Calculate angle between three points (MediaPipe)
function calculateAngleBetweenPoints(pointA, pointB, pointC) {
    const vectorAB = {
        x: pointB.x - pointA.x,
        y: pointB.y - pointA.y,
        z: (pointB.z || 0) - (pointA.z || 0)
    };

    const vectorBC = {
        x: pointC.x - pointB.x,
        y: pointC.y - pointB.y,
        z: (pointC.z || 0) - (pointB.z || 0)
    };

    // Calculate dot product
    const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y + vectorAB.z * vectorBC.z;

    // Calculate magnitudes
    const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y + vectorAB.z * vectorAB.z);
    const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y + vectorBC.z * vectorBC.z);

    // Calculate angle in radians
    const angleRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));

    // Convert to degrees
    return angleRadians * (180 / Math.PI);
}

// Calculate angle between three points (PoseNet)
function calculateAngleBetweenPoseNetPoints(pointA, pointB, pointC) {
    const vectorAB = {
        x: pointB.x - pointA.x,
        y: pointB.y - pointA.y
    };

    const vectorBC = {
        x: pointC.x - pointB.x,
        y: pointC.y - pointB.y
    };

    // Calculate dot product
    const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;

    // Calculate magnitudes
    const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y);
    const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);

    // Calculate angle in radians
    const angleRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));

    // Convert to degrees
    return angleRadians * (180 / Math.PI);
}

// Update chart with new data
function updateChart() {
    if (angleChart) {
        angleChart.data.labels = timeData;
        angleChart.data.datasets[0].data = angleData;
        angleChart.update();
    }
}

// Count repetitions based on angle thresholds
function countRepetitions(angle, exercise) {
    if (!isTracking || !exercise) return;

    // Determine if we're in a rep state based on the exercise threshold
    const repState = exercise.primaryAngle === 'elbow' || exercise.primaryAngle === 'knee' || exercise.primaryAngle === 'hip'
        ? angle < exercise.threshold  // For joints that bend (smaller angle = more bent)
        : angle > exercise.threshold; // For joints that extend (larger angle = more extended)

    // Count a rep when transitioning from rep state to non-rep state
    if (lastRepState && !repState) {
        repCount++;
        repCountElement.textContent = repCount;
        updateLog(`Repetition #${repCount} completed for ${exercise.name}`);

        // Add calories for this rep if defined
        if (exercise.caloriesPerRep) {
            caloriesBurned += exercise.caloriesPerRep;
            caloriesElement.textContent = caloriesBurned.toFixed(1) + ' kcal';
        }

        // Show notification
        showToast(`Repetition #${repCount} completed!`, 'success');
    }

    lastRepState = repState;
}

// Check posture based on analysis type
function checkPosture(shoulderAngle, elbowAngle, kneeAngle, hipAngle) {
    if (!isTracking || currentAnalysisType !== 'posture') return;

    let newPostureStatus = true; // true = good posture
    let postureMessage = '';

    // Simple posture checks based on angles
    if (shoulderAngle < 80 || shoulderAngle > 110) {
        newPostureStatus = false;
        postureMessage = 'Shoulder alignment issue detected';
    }

    if (hipAngle < 160 && currentExerciseType === 'none') {
        newPostureStatus = false;
        postureMessage = 'Improve your standing posture';
    }

    // Update UI if posture status changed
    if (newPostureStatus !== isPostureBad) {
        isPostureBad = newPostureStatus;

        if (!isPostureBad) {
            postureQualityElement.textContent = 'Poor';
            postureQualityElement.style.color = '#cf6679';

            // Clear previous timeout
            if (badPostureTimeout) {
                clearTimeout(badPostureTimeout);
            }

            // Show notification after 2 seconds of bad posture
            badPostureTimeout = setTimeout(() => {
                showToast(postureMessage || 'Poor posture detected! Please correct your position.', 'error');
                updateLog('Poor posture detected');
            }, 2000);
        } else {
            postureQualityElement.textContent = 'Good';
            postureQualityElement.style.color = '#03dac6';

            // Clear timeout if posture is corrected
            if (badPostureTimeout) {
                clearTimeout(badPostureTimeout);
                badPostureTimeout = null;
            }
        }
    }
}

// Change tracking mode
function changeTrackingMode() {
    currentTrackingMode = trackingModeSelect.value;
    updateLog(`Tracking mode changed to ${currentTrackingMode}`);

    if (isTracking) {
        // Restart tracking with new mode
        stopCamera();
        startCamera();
    }
}

// Change analysis type
function changeAnalysisType() {
    currentAnalysisType = analysisTypeSelect.value;
    updateLog(`Analysis type changed to ${currentAnalysisType}`);
}

// Change exercise type
function changeExerciseType() {
    const exerciseId = exerciseTypeSelect.value;

    // Find exercise in all categories
    let selectedExercise = null;
    Object.values(exercises).forEach(category => {
        const found = category.find(ex => ex.id === exerciseId);
        if (found) selectedExercise = found;
    });

    currentExerciseType = exerciseId;
    repCount = 0;
    repCountElement.textContent = '0';
    caloriesBurned = 0;
    caloriesElement.textContent = '0 kcal';

    // Restart calorie tracking for static exercises
    if (isTracking) {
        if (calorieInterval) {
            clearInterval(calorieInterval);
            calorieInterval = null;
        }
        startCalorieTracking();
    }

    updateLog(`Exercise changed to ${selectedExercise ? selectedExercise.name : 'None'}`);

    // Update chart label based on exercise
    if (angleChart && selectedExercise) {
        let angleLabel = 'Angle';

        switch (selectedExercise.primaryAngle) {
            case 'shoulder':
                angleLabel = 'Shoulder Angle';
                break;
            case 'elbow':
                angleLabel = 'Elbow Angle';
                break;
            case 'knee':
                angleLabel = 'Knee Angle';
                break;
            case 'hip':
                angleLabel = 'Hip Angle';
                break;
            case 'ankle':
                angleLabel = 'Ankle Angle';
                break;
        }

        angleChart.data.datasets[0].label = angleLabel;
        angleChart.update();
    }
}

// Download data as CSV
function downloadCsv() {
    if (poseData.length === 0) {
        showToast('No data available to download', 'error');
        return;
    }

    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Timestamp,ShoulderAngle,ElbowAngle,KneeAngle,HipAngle,Source\n';

    poseData.forEach(data => {
        csvContent += `${data.timestamp},${data.shoulderAngle.toFixed(2)},${data.elbowAngle.toFixed(2)},${data.kneeAngle.toFixed(2)},${data.hipAngle ? data.hipAngle.toFixed(2) : '0'},${data.source}\n`;
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pose_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
    document.body.appendChild(link);

    // Trigger download
    link.click();
    document.body.removeChild(link);

    showToast('Data downloaded successfully', 'success');
    updateLog('Data exported to CSV');
}

// Toggle dark/light theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');

    // Update theme toggle icon
    if (document.body.classList.contains('light-theme')) {
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Update chart colors
    if (angleChart) {
        angleChart.options.scales.x.ticks.color = document.body.classList.contains('light-theme') ? '#333' : '#e0e0e0';
        angleChart.options.scales.y.ticks.color = document.body.classList.contains('light-theme') ? '#333' : '#e0e0e0';
        angleChart.options.scales.x.grid.color = document.body.classList.contains('light-theme') ?
            'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        angleChart.options.scales.y.grid.color = document.body.classList.contains('light-theme') ?
            'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        angleChart.options.plugins.legend.labels.color = document.body.classList.contains('light-theme') ? '#333' : '#e0e0e0';
        angleChart.update();
    }
}

// Update log message
function updateLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logContainerElement.innerHTML = `<i class="fas fa-info-circle"></i> [${timestamp}] ${message}`;
}

// Show status message
function showStatus(message, type) {
    let icon = 'info-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    statusMessageElement.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    statusMessageElement.className = `alert alert-${type}`;
    statusMessageElement.style.display = 'flex';

    // Hide after 3 seconds
    setTimeout(() => {
        statusMessageElement.style.display = 'none';
    }, 3000);
}

// Show toast notification
function showToast(message, type) {
    let backgroundColor = '#03dac6'; // success
    let icon = 'check-circle';

    if (type === 'error') {
        backgroundColor = '#cf6679';
        icon = 'exclamation-circle';
    } else if (type === 'warning') {
        backgroundColor = '#ffab40';
        icon = 'exclamation-triangle';
    }

    Toastify({
        text: `<i class="fas fa-${icon}"></i> ${message}`,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor,
        stopOnFocus: true,
        escapeMarkup: false
    }).showToast();
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', init);
