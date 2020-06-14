'use strict';
var r, s;
const MSRadio = () => {
	const radio = {
		baseUrl: 'https://mashiron.xyz:8443/',
		mountPoint : 'MSRadio'
	},
	player = () => {
		const howly = new Howl ({
			src: radio.baseUrl + radio.mountPoint,
			html5: !0,
			format: 'ogg',
			mute: !1,
			volume: 0,
			autoplay: !1,
			onload: () => {
				console.info ('loaded', radio.baseUrl + radio.mountPoint);
			},
			onloaderror: (e) => {
				console.error (e);
			},
			onplay: () => {
				console.info ('play', radio.baseUrl + radio.mountPoint);
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
				parseInfo ();
				r.play ();
				r.fade(0, 1, 3500);
			}
		});
		return r = howly;
	},
	getStreamData = async (url) => {
		let response = await fetch (url),
			data = await response.json ()
		return data;
	},
	parseInfo = () => {
		let info = {};
		getStreamData (radio.baseUrl + 'status-json.xsl')
		.then (data => {
			let src = data.icestats.source.title,
				srcSpltd = src.split(' — ');
			info = {
				title: srcSpltd[1],
				artist: srcSpltd[2]
			};
			console.log(info);
			s = data
			s.info = info
		}).catch(err => console.error (err));
		return info;
	}
	MSRadio.player = player;
	MSRadio.parseInfo = parseInfo;
	return player();
};

MSRadio ();
