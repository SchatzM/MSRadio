/**
 * MSRadio
 * @author Brian Passos
 */

'use strict';

let r, s = {};
const	cnf = {
			radio: {
				baseUrl: 'https://mashiron.xyz:7566/',
				status: 'health'
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
		DEBUG = !0;

function track (artist, title, date, genre) {
	this.artist = artist;
	this.title = title;
	this.date = date;
	this.genre = genre;
	this.ID = IDgen (title + artist);
};

const MSRadio = () => {
	const	player = (stream_url) => {
				const	p = new Howl ({
							src: stream_url,
							html5: !0,
							format: 'mp3',
							mute: cnf.player.volume.mute,
							volume: 0,
							html5PoolSize: 2,
							autoplay: !1,
							onload: () => {
								console.info ('loaded', stream_url);
							},
							onloaderror: (e) => {
								console.error (e);
							},
							onplay: () => {
								console.info ('play', stream_url);
								getStreamInfo (!0);
							},
							onplayerror: (e) => {
								console.error (e);
							},
							onvolume: () => {
								console.info ('volume', r.volume ());
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
			getStreamData = async (url) => {
				let response = await fetch (url),
					data = await response.json ();
				return data;
			},
			parseInfo = async () => {
				return getStreamData (cnf.radio.baseUrl + cnf.radio.status).then (data => {
					// console.info (data.mounts['/MSRadio'])
					const dataProcessed = data.mounts['/MSRadio'];
					if (dataProcessed) {
						let np = dataProcessed.metadata.now_playing || false;
						if (np) {
							getMetadata ();
							s.meta = data;
						};
						r ? !1 : player (cnf.radio.baseUrl + 'MSRadio?latency=low');
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
						const	url = stream_url + 'MSRadio/metadata',
								eventSource = new EventSource (url);

						eventSource.onmessage = (event) => {
							const	metadata = JSON.parse (event.data),
									artistTitle = metadata['metadata'],
									src = artistTitle,
									srcSpltd = src.split (' — '),
									info = new track (srcSpltd[1], srcSpltd[2], srcSpltd[3], srcSpltd[4]);

							// console.info ('track checking...');
							infoTrack (info);
							// console.warn (artistTitle);
							s.info = info;
						}
					} catch (error) {
						console.error ('EventSource initialization failed');
						console.error (error);
					}
				}
			}

			// MSRadio.player = player;
			// MSRadio.parseInfo = parseInfo;
			MSRadio.getInfo = getStreamInfo;
			MSRadio.getCurrentTrack = infoTrack;

			return MSRadio.getInfo ();
		},
		IDgen = (str) => {
			let encodeMe = str || new Date ().now;
			return Base64.encode (encodeMe);
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
				el.querySelector ('h1').textContent = artisTitle;
				document.title = 'MSRadio: ' + artisTitle;
				el.querySelector ('h2').textContent = str.genre;
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
				appendInfoUI ({title: 'live', genre: 'click to play'});

				document.querySelector ('body').addEventListener ('click', () => {
					if (s.init != true) {
						if (isPlaying == !1) {
							appendInfoUI ({title: 'loading', genre: '...'});
							document.body.classList.add ('initd');
							r.play ();
							r.fade (0, cnf.player.volume.defaultValueInt/100, cnf.player.volume.fadeTime.in);
						};
						s.init = !0;
					};
				});
			} else {
				appendInfoUI ({title: 'offline', genre: ':c'});
				bkChanger ('#eb4d4b');
			}
		},
		init = () => {
			MSRadio ();
		};

DEBUG || (console = {info:() => {}, log:() => {}, warn:() => {}, error:() => {}});
init ();
