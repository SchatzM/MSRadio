'use strict';
const	cnf = {
			radio: {
				baseUrl: 'https://mashiron.xyz:8443/',
				mountPoint : 'MSRadio'
			},
			player: {
				volume: {
					mute: false,
					defaultValueInt: 50,
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
		};

let r, s = {};

const MSRadio = () => {
	const	player = () => {
				const	radioURL = cnf.radio.baseUrl + cnf.radio.mountPoint,
						p = new Howl ({
							src: radioURL,
							html5: !0,
							format: 'ogg',
							mute: cnf.player.volume.mute,
							volume: 0,
							autoplay: !1,
							onload: () => {
								console.info ('loaded', radioURL);
							},
							onloaderror: (e) => {
								console.error (e);
							},
							onplay: () => {
								console.info ('play', radioURL);
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
								if (s.live) {
									r.play ();
									r.fade (0, cnf.player.volume.defaultValueInt/100, cnf.player.volume.fadeTime.in);
								};
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
				return getStreamData (cnf.radio.baseUrl + 'status-json.xsl').then (data => {
					const dataProcessed = data.icestats.source;
					if (dataProcessed) {
						if (dataProcessed.title) {
							const	src = dataProcessed.title,
									srcSpltd = src.split (' — '),
									info = new track (srcSpltd[1], srcSpltd[2], srcSpltd[3], srcSpltd[4]);

							// console.info ('track checking...')
							infoTrack (info);

							s.meta = data;
							s.info = info;
						};
						r ? !1 : player ();
						s.live = !0;
					} else {
						s.live = !1;
						console.warn ('Offline.'); // Offline stream handler
						r ? (r.volume () > 0) ? r.fade(r.volume (), 0, 1500) : !1 : !1;
					}
				}).catch(err => {
					console.error (err);
				});
			},
			infoTrack = (currentTrack) => {
				let cTrk = currentTrack || !1,
					prevTrack = s ? s.info : !1,
					isPlaying = r ? r.playing() : !1;

				if (isPlaying) {
					if (!cTrk) {
						return console.warn ('Current track is:', `${prevTrack.title} by ${prevTrack.artist} (${prevTrack.date}) [${prevTrack.genre}]`);
					} else {
						let infoTemplate = `${cTrk.title} by ${cTrk.artist} (${cTrk.date}) [${cTrk.genre}]`;
						if (cTrk.ID != prevTrack.ID) { // Current track has changed
							return console.warn ('Track changed to:', infoTemplate);
						} else { // Current track has not changed
							if (!s.cTrackAnnounced) {
								console.warn ('Current track is:', infoTemplate);
								s.cTrackAnnounced = !0;
							}
						};
					}
					// console.info (info)
				};
			},
			getStreamInfo = (Interval) => {
				if (cnf.info.autoUpdate.enabled) {
					if (Interval) {
						setInterval (() => {
							parseInfo ();
						}, cnf.info.autoUpdate.refreshTime * 1000);
					} else {
						parseInfo ();
					};
				};
			};

			// MSRadio.player = player;
			// MSRadio.parseInfo = parseInfo;
			MSRadio.getInfo = getStreamInfo;
			MSRadio.getCurrentTrack = infoTrack;

			return MSRadio.getInfo();
		},
		IDgen = (str) => {
			let encodeMe = str || new Date ().now;
			return Base64.encode (encodeMe);
		},
		init = () => {
			MSRadio ();
		};

function track (artist, title, date, genre) {
	this.artist = artist;
	this.title = title;
	this.date = date;
	this.genre = genre;
	this.ID = IDgen (title + artist);
};

init ();
