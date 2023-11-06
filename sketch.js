let song;
let fft;
let galaxySlider, sensitivitySlider;
let galaxyArms = [];
let lastCentroid = 0;

function preload() {
	song = loadSound("sample-visualisation.mp3");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	angleMode(DEGREES);
	colorMode(HSB);
	fft = new p5.FFT(0.9, 512);
	noLoop();

	galaxySlider = createSlider(1, 5, 3);
	galaxySlider.position(10, 10);
	sensitivitySlider = createSlider(1, 5, 3);
	sensitivitySlider.position(10, 30);

	for (let i = 0; i < galaxySlider.value(); i++) {
		let angleOffset = TWO_PI / galaxySlider.value();
		galaxyArms.push(new GalaxyArm(i * angleOffset));
	}
}

function draw() {
	updateGalaxyArms();
	background(0);
	let centroid = fft.getCentroid();
	let hueValue = map(centroid, 0, 10000, 0, 255);

	fft.analyze();
	let spectrum = fft.analyze();
	let amp = fft.getEnergy(20, 200);

	for (let arm of galaxyArms) {
		arm.show(spectrum, sensitivitySlider.value(), hueValue, amp);
	}

	// Pulsating center of the galaxy with color variations
	let centerSize = map(amp, 0, 256, 50, 200);
	fill(hueValue, 255, 255);
	ellipse(width / 2, height / 2, centerSize);
}

function updateGalaxyArms() {
	if (galaxySlider.value() !== galaxyArms.length) {
		galaxyArms = [];
		for (let i = 0; i < galaxySlider.value(); i++) {
			let angleOffset = TWO_PI / galaxySlider.value();
			galaxyArms.push(new GalaxyArm(i * angleOffset));
		}
	}
}

function mouseClicked() {
	if (song.isPlaying()) {
		song.pause();
		noLoop();
	} else {
		song.play();
		loop();
	}
}

class GalaxyArm {
	constructor(startAngle) {
		this.startAngle = startAngle;
		this.rotation = 0;
		this.spinRate = random(0.5, 2.5); // Unique spin rate for each arm
	}

	show(spectrum, sensitivity, hueValue, amp) {
		this.rotation += this.spinRate;
		push();
		translate(width / 2, height / 2);
		rotate(this.rotation + this.startAngle);

		stroke(hueValue, 255, 255); // Set the stroke color based on hue value

		beginShape();
		for (let j = 0; j < spectrum.length; j++) {
			let angle = map(j, 0, spectrum.length, 0, TWO_PI);
			let rad = map(spectrum[j], 0, 256, 50, width / 2) * (amp / 255); // amplify arm's response
			let x = rad * cos(angle);
			let y = rad * sin(angle);
			vertex(x, y);

			// Draw stars
			let starSize = map(spectrum[j], 0, 256, 1, 10) * sensitivity;
			fill(hueValue, 255, 255); // Set star color based on hue value
			ellipse(x, y, starSize);
		}
		endShape(CLOSE);
		pop();
	}
}
