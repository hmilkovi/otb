	var vid = document.getElementById('videoel');
				var overlay = document.getElementById('overlay');
				var overlayCC = overlay.getContext('2d');
				var txt = document.getElementById('tekst');
				
				/********** check and set up video/webcam **********/

				function enablestart() {
					var startbutton = document.getElementById('startbutton');
					startbutton.value = "Start detecting!";
					startbutton.disabled = null;
				}
				
				/*var insertAltVideo = function(video) {
					if (supports_video()) {
						if (supports_ogg_theora_video()) {
							video.src = "../media/cap12_edit.ogv";
						} else if (supports_h264_baseline_video()) {
							video.src = "../media/cap12_edit.mp4";
						} else {
							return false;
						}
						//video.play();
						return true;
					} else return false;
				}*/
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
				window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

				// check for camerasupport
				if (navigator.getUserMedia) {
					// set up stream
					
					var videoSelector = {video : true};
					if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
						var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
						if (chromeVersion < 20) {
							videoSelector = "video";
						}
					};
				
					navigator.getUserMedia(videoSelector, function( stream ) {
						if (vid.mozCaptureStream) {
							vid.mozSrcObject = stream;
						} else {
							vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
						}
						vid.play();
					}, function() {
						//insertAltVideo(vid);
						alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
					});
				} else {
					//insertAltVideo(vid);
					alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
				}

				vid.addEventListener('canplay', enablestart, false);
				
				/*********** setup of emotion detection *************/

				var ctrack = new clm.tracker({useWebGL : true});
				ctrack.init(pModel);

				function startVideo() {
					// start video
					vid.play();
					// start tracking
					ctrack.start(vid);
					// start loop to draw face
					drawLoop();

					startbutton.value = "Detecting...";
					startbutton.disabled = "disabled"
					txt.style.visibility = "visible";
				}
				
				function drawLoop() {
					requestAnimFrame(drawLoop);
					overlayCC.clearRect(0, 0, 400, 300);
					if (ctrack.getCurrentPosition()) {
						ctrack.draw(overlay);
					}
					var cp = ctrack.getCurrentParameters();
					
					var er = ec.meanPredict(cp);
					var emonum = 0;
					if (er) {
						//updateData(er);
						for (var i = 0;i < er.length;i++) {
							if (er[i].value > 0.4) {
								document.getElementById('icon'+(i+1)).style.visibility = 'visible';
								emonum = i+1;
								switch(emonum) {
								    case 1:
								        document.getElementById("emo").innerHTML = "angry";
								        break;
								    case 2:
								        document.getElementById("emo").innerHTML = "sad";
								        break;
								    case 3:
								        document.getElementById("emo").innerHTML = "surprised";
								        break;
								    case 4:
								        document.getElementById("emo").innerHTML = "happy";
								        break;
								    default:
								        document.getElementById("emo").innerHTML = "Error";
								}
							} else {
								document.getElementById('icon'+(i+1)).style.visibility = 'hidden';
							}
						}
					}
				}
				
				var ec = new emotionClassifier();
				ec.init(emotionModel);
				var emotionData = ec.getBlank();