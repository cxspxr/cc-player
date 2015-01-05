<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<link rel="stylesheet" href="css/main.css">
</head>
<body>
	<div class="container">
		<div class="video-container" id="videoContainer">
			<video id="video" preload="auto" width="700" height="360">
			
				<source src="abba/ABBA.mp4" type='video/mp4' />
			</video>
			<audio src="abba/ABBA_voice.mp3" preload id="voice"></audio>
			<div class="panel">
				<div class="timeline" id="timelineId">
					<div id="inTimeline" class="in-timeline"></div>
					<div id="time">
						<div id="timeSpend"></div>
						<div id="videoDur"></div>
					</div>
					<div id="volume">
						<div id="volumeIn"></div>
					</div>
				</div>
				<div class="subtitles" id="subs">
					<table>
						<tr class="crypt" id="crypt"></tr>
						<tr class="org" id="org"></tr>
						<tr class="slate" id="slate"></tr>
						<tr class="org2" id="org2"></tr>
					</table>


					<!-- <div class="crypt" id="crypt"></div>
					<div class="org" id="org"></div>
					<div class="slate" id="slate"></div>
					<div class="org2" id="org2"></div> -->
				</div>
				<div class="control-pane" id="controlPane">
					<div>
						autopause<input type="checkbox" id="autopause">
						audiotext<input type="checkbox" id="audiotext">
					</div>
					<div class="play" id="play">play</div>
					<div class="stop" id="stop">stop</div>
					<div class="say" id="say">say</div>
					<div id="prevframe">&lt;|</div>
					<div id="nextframe">|></div>
				</div>
			</div>
		</div>

	<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
	<script src='js/underscore.js'></script>
	<script src='js/backbone-min.js'></script>
	<script src="js/timeline.js"></script>

	<script src='js/api.js'></script>

	<script src="js/script.js"></script>
</body>
</html>