/**
 * MSRadio
 * @author Brian Passos
 */

'use strict';

let r, s = {};
const	cnf = {
			radio: {
				baseUrl: '//mashiron.xyz:7566',
				status: '/health'
			},
			player: {
				volume: {
					mute: false,
					defaultValueInt: 45,
					fadeTime: {
						in: 2500,
						out: 1500
					}
				}
			},
			info: {
				autoUpdate: {
					enabled: true,
					refreshTime: 10
				}
			}
		},
		DEBUG = !1;

function track (obj) {
	const meta = Object.values(obj)[0];
	this.artist = meta.artist;
	this.title = meta.title;
	this.album = meta.album;
	this.albumArtist = meta.albumArtist;
	this.duration = meta.duration;
	this.ID = IDgen (meta.title + meta.artist);
};
// function MSRadioPlayer (cnf) {

// }
const MSRadio = () => {
	const	player = (stream_url) => {
				const	pnope = (stream_url) => {
					const audio = new Audio ();
					audio.loop = !1;
					audio.autoplay = !0;
					audio.src = stream_url[0];
				},
				p = new Howl ({
					src: stream_url,
					html5: !0,
					format: ['aac','mp3','aac+'],
					mute: cnf.player.volume.mute,
					volume: 0,
					autoplay: !1,
					autoUnlock: !0,
					onload: () => {
						console.info ('loaded', stream_url);
					},
					onloaderror: (e) => {
						console.error (e);
					},
					onplay: () => {
						console.info ('play', stream_url);
						getStreamInfo (!0);
						// WATest ();
					},
					onplayerror: (e) => {
						console.error (e);
					},
					onvolume: () => {
						// console.info ('volume', r.volume ());
						r.volume () == cnf.player.volume.defaultValueInt/100 ? setoVolume () : false;
					},
					onfade: (e) => {

					},
					onstop: (e) => {
						console.warn ('stop', e);
					},
					onend: (e) => {
						console.warn ('end', e);
					},
					onunlock: (e) => {
						console.info ('unlock', e);
					}
				});
				return r = p;
			},
			parseInfo = async () => {
				return getStreamData (cnf.radio.baseUrl + cnf.radio.status)
				.then (response => response.json ())
				.then (data => {
					const dataProcessed = Object.entries (data.mounts)[0] ? Object.entries (data.mounts)[0][1] : false;
					if (dataProcessed) {
						let np = dataProcessed.metadata.now_playing || false;
						if (np) {
							getMetadata ();
							s.meta = data;
						};
					r ? !1 : player (Object.keys (data.mounts).map (i => cnf.radio.baseUrl + i + '?latency=low'));
						s.live = !0;
						document.body.classList.add ('live');
					} else {
						s.live = !1;
						console.warn ('Offline.'); // Offline stream handler
						r ? (r.volume () > 0) ? r.fade (r.volume (), 0, 1500) : !1 : !1;
					}
					buttonPlacerholder ();
				}).catch(err => {
					console.error (err);
				});
			},
			infoTrack = (currentTrack) => {
				let cTrk = currentTrack || !1,
					prevTrack = s.info ? s.info : !1,
					isPlaying = r ? r.playing () : !1;

				if (isPlaying) {
					if (!cTrk) {
						// Current track single call handler
						return console.warn ('Current track is:', `${prevTrack.title} by ${prevTrack.artist} (${prevTrack.date}) [${prevTrack.genre}]`);
					} else {
						// Current track info changed/not changed handler
						let infoTemplate = `${cTrk.title} by ${cTrk.artist} (${cTrk.date}) [${cTrk.genre}]`;
						if (cTrk.ID != prevTrack.ID) { // Current track has changed
							appendInfoUI (cTrk);
							// MB.getID (cTrk.albumArtist,cTrk.album);
							return console.warn ('Track changed to:', infoTemplate);
						} else { // Current track has not changed
							if (!s.cTrackAnnounced) {
								console.warn ('Current track is:', infoTemplate);
								s.cTrackAnnounced = !0;
								appendInfoUI (cTrk);
							};
						};
					};
					console.info (currentTrack)
				};
			},
			getStreamInfo = (Interval) => {
				if (cnf.info.autoUpdate.enabled) {

					parseInfo ();
					// if (Interval) {
					// 	setInterval (() => {
						//parseInfo ();
					// 	}, cnf.info.autoUpdate.refreshTime * 1000);
					// } else {
						//parseInfo ();
					// };
				};
			},
			getMetadata = () => {
				let stream_url = cnf.radio.baseUrl,
					isPlaying = r ? r.playing () : !1;

				if (isPlaying) {
					try {
						const	url = stream_url + '/MSRadio/metadata',
								eventSource = new EventSource (url);

						eventSource.onmessage = (event) => {
							const	data = JSON.parse (event.data),
									meta = data['metadata'],
									info = new track (JSON.parse (meta));

							console.info (meta)
							// console.info ('track checking...');
							// console.warn ('src', srcSpltd);
							infoTrack (info);
							// console.warn (artistTitle);
							s.info = info;
						}
					} catch (error) {
						console.error ('EventSource initialization failed');
						console.error (error);
					}
				}
			},
			setoVolume = () => {
				const steps = 5,
					mainUI = document.querySelector ('.MSR-main'),
					baseEl = document.createElement ('section'),
					percentsEl = document.createElement ('div');

				let timer,
					flag = false;

				if (!document.querySelector ('.volBar')) {
					baseEl.classList.add ('volBar', 'navbar', 'has-background-light', 'is-fixed-top');
					percentsEl.classList.add ('volVal', 'has-background-primary');
					baseEl.appendChild (percentsEl);
					document.body.querySelector ('main').appendChild (baseEl);
				}

				mainUI.addEventListener ('wheel', (e) => {
					console.log ('onwheel');

					if (!flag) {
						flag = true;
						baseEl.classList.add ('changingVol');
					}

					clearTimeout (timer);
					timer = setTimeout (() => {
						baseEl.classList.remove ('changingVol');
						flag = false;
					}, 1000);

					// e.deltaY > 0 ? r.volume () != 0 ? r.volume ((r.volume ()-(steps/100)).toFixed (2)) : false : r.volume () != 1 ? r.volume ((r.volume ()+(steps/100)).toFixed (2)) : false;

					if (e.deltaY > 0) {
						if (r.volume() != 0) {
							const volTarget = (r.volume() - (steps/100)).toFixed(2);
							r.volume (volTarget);
						}
					} else {
						if (r.volume() != 1) {
							let volTarget = (r.volume() + (steps/100)).toFixed(2)
							r.volume (volTarget);
						}
					}
					setTimeout (() => {
						percentsEl.style.width = `${r.volume () * 100}%`;
					}, 200);
					// console.warn (r.volume ());
				});
			}

			// MSRadio.player = player;
			// MSRadio.parseInfo = parseInfo;
			MSRadio.getInfo = getStreamInfo;
			MSRadio.getCurrentTrack = infoTrack;

			return MSRadio.getInfo ();
		},
		getStreamData = async (url) => {
			let response = await fetch (url);
			return await response;
		},
		IDgen = (str) => {
			return Base64.encode (str || new Date ().now);
		},
		appendInfoUI = (str) => {
			let el = document.querySelector ('.mainInfoContainer'),
				table = document.createElement ('table'),
				tableBody = document.createElement ('tbody'),
				tableRow = document.createElement ('tr'),
				tableCell = {
					artist: document.createElement ('td'),
					title: document.createElement ('td')
				},
				inCell = {
					artist: document.createTextNode (str.artist),
					title: document.createTextNode (str.title)
				},
				artisTitle = `${str.title}${(str.artist) ? ' — ' + str.artist : ''}`;

			// if (!document.querySelector ('.playlist')) {
			// 	table.appendChild (tableBody);
			// 	table.classList.add ('playlist', 'table', 'is-bordered', 'is-striped', 'is-narrow', 'is-hoverable', 'is-fullwidth')
			// 	el.appendChild (table);
			// } else {
			// 	tableBody = document.querySelector ('.playlist tbody');
			// }
			// tableRow.appendChild (tableCell.title);
			// tableRow.appendChild (tableCell.artist);

			// tableCell.artist.appendChild (inCell.artist);
			// tableCell.title.appendChild (inCell.title);
			// tableBody.appendChild (tableRow);

			setTimeout (() => {
				el.classList.add ('tracking-in-expand');
				el.querySelector ('h1').textContent = str.title;
				document.title = 'MSRadio: ' + artisTitle;
				el.querySelector ('h2').textContent = str.artist;
			}, 500);
			el.classList.remove ('tracking-in-expand');

			// bkChanger (stringToColour (str.artist))
		},
		stringToColour = (str) => {
			let hash = 0,
				colour = '#';
			for (let i = 0; i < str.length; i++) {
				hash = str.charCodeAt (i) + ((hash << 5) - hash);
			};
			for (let i = 0; i < 3; i++) {
				const value = (hash >> (i * 8)) & 0xFF;
				colour += ('00' + value.toString (16)).substr (-2);
			};
			return colour;
		},
		bkChanger = (colour) => {
			let el = document.querySelector ('.hero');
			el.style.backgroundColor = colour + 90;
		},
		buttonPlacerholder = () => {
			let isPlaying = r ? r.playing () : !1;

			if (s.live) {
				appendInfoUI ({title: 'live', artist: 'click to play'});

				document.querySelector ('body').addEventListener ('click', () => {
					if (s.init != true) {
						if (isPlaying == !1) {
							appendInfoUI ({title: 'loading', artist: '...'});
							document.body.classList.add ('initd');
							r.play ();
							r.fade (0, cnf.player.volume.defaultValueInt/100, cnf.player.volume.fadeTime.in);
						};
						s.init = !0;
					};s
				});
			} else {
				appendInfoUI ({title: 'offline', genre: ':c'});
				bkChanger ('#eb4d4b');
			}
		},
		MB = {
			getID: (artist, album) => {
				const url = 'https://musicbrainz.org/ws/2/release?query=',
					encoded = encodeURI (url + `artist:${artist}+recording:${album}&fmt=json`)

				if (artist || album) {
					artist.toLowerCase () == 'compcomp' ? artist = 'Various Artists': artist;
					console.info ('MB.getID: ', encoded)
					getStreamData (encoded)
					.then (response => response.json ())
					.then (data => {
						for (const [key, value] of Object.entries (data.releases)) {
							console.log ('Artist: ', value['artist-credit'][0].name,'-', 'Album: ', value.title);
						}

						Object.entries (data.releases).some ((v) => {
							console.info ('|',v[1]['artist-credit'][0].name.includes (artist),'|',artist,'=',v[1]['artist-credit'][0].name,'\n|',v[1].title.includes (album),'|',album,'=',v[1].title)
						});

						console.log ('releases: ', data.releases)
						return data;
					})
					.then (data => getStreamData ('https://coverartarchive.org/release/' + data.releases[0].id))
					.then (response => response.json ())
					.then (data => {
						let img = data.images[0].thumbnails.small;
						if (document.querySelectorAll ('img').length < 1) {
							let imgEl = document.createElement('img');
							imgEl.style.background = `url(${img}) no-repeat center center`;
							document.body.appendChild (imgEl)
						} else {
							let imgEl = document.querySelector ('img');
							imgEl.style.background = `url(${img}) no-repeat center center`;
						}
						console.log (img)
					})
					.catch (err => console.log (err))
				};
			}
		},
		xmlToJson = (xml) => {
			// Create the return object
			var obj = {};

			if (xml.nodeType == 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
					obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType == 3) { // text
				obj = xml.nodeValue;
			}

			// do children
			if (xml.hasChildNodes()) {
				for(var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item (i);
					var nodeName = item.nodeName;
					if (typeof (obj[nodeName]) == "undefined") {
						obj[nodeName] = xmlToJson (item);
					} else {
						if (typeof (obj[nodeName].push) == "undefined") {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push (old);
						}
						obj[nodeName].push (xmlToJson (item));
					}
				}
			}
			return obj;
		},
		WATest = () => {
			// const audio = new Audio();
			let context = Howler.ctx
			let analyser = context.createAnalyser ()
			const gainNode = context.createGain ();
			Howler.masterGain.connect (analyser);
			analyser.connect (context.destination)
			// analyser.connect(gainNode);
			// gainNode.connect(context.destination);
			// const source = context.createMediaElementSource(audio);
			// source.connect(analyser);
			analyser.fftSize = 256
			let bufferLength = analyser.frequencyBinCount
			let dataArray = new Uint8Array (bufferLength)
			let canvas = document.createElement ('canvas')
			document.body.appendChild (canvas)
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
			let ctx = canvas.getContext ('2d')
			let WIDTH = canvas.width;
			let HEIGHT = canvas.height;
			let barWidth = (WIDTH / bufferLength) * 2.5
			let barHeight
			let x = 0
			function renderFrame() {
				console.log (analyser.getByteTimeDomainData (dataArray))
				requestAnimationFrame (renderFrame);
				x = 0;
				analyser.getByteFrequencyData (dataArray);
				ctx.fillStyle = "#000";
				ctx.fillRect (0, 0, WIDTH, HEIGHT);
				for (let i = 0; i < bufferLength; i++) {
					barHeight = dataArray[i];

					let r = barHeight + (25 * (i/bufferLength));
					let g = 250 * (i/bufferLength);
					let b = 50;
					ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
					ctx.fillRect (x, HEIGHT - barHeight, barWidth, barHeight);
					x += barWidth + 1;
				}
			}
			renderFrame()
		},
		init = () => {
			MSRadio ();
		};

DEBUG || (console = {info:() => {}, log:() => {}, warn:() => {}, error:() => {}});
init ();
