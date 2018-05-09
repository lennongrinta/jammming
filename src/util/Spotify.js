let accessToken;
let expiresIn;
const clientId = '1ba2f71ff460497d8c4059120c24468a';
const redirectUri = 'http://localhost:3000/';

let Spotify = {
	getAccessToken() {
		const url = window.location.href;
		if(accessToken !== '') {
			return accessToken;
		}
		else if(url.includes('access_token') && url.includes('expires_in')) {
			accessToken = url.match('/access_token=([^&]*)/')[1];
			expiresIn = url.match('/expires_in=([^&]*)/')[1];
			window.setTimeout(() => accessToken = null, expiresIn * 1000);
			window.history.pushState('Access Token', null, '/');
			return accessToken;
		}
		else {
			window.location = 'https://accounts.spotify.com/authorize?client_id=' + clientId + '&response_type=token&scope=playlist-modify-public&redirect_uri=' + redirectUri;
		}
	},

	search(term) {
		fetch('https://api.spotify.com/v1/search?type=track&q=' + term, {headers: {Authorization: `Bearer ${accessToken}`}})
		.then(response => {
			console.log(response);
			if(response.ok) {
				return response.json();
			}
		})
		.then(jsonResponse => {
			console.log(jsonResponse);
			if(jsonResponse.tracks.length === 0) {
				return [];
			}
			else {
				jsonResponse.tracks.map(track => {
					return {
						id: track.id,
						name: track.name,
						artist: track.artists[0].name,
						album: track.album.name,
						uri: track.uri	
					}
				});
			}
		});
	},

	savePlaylist(playlistName, trackUris) {
		if(!playlistName && !trackUris) {
			return;
		} 
		else {
			const token = this.getAccessToken();
			const headers = { 'Authorization': 'Bearer ' + token };
			let userId = '';

			fetch('https://api.spotify.com/v1/me', headers).then(response => {
				if(response.ok) {
					return response.json();
				}
			})
			.then(jsonResponse => {
				userId = jsonResponse.id;
			});

			let playlistID = fetch('/v1/users/' + userId + '/playlists', {
				method: 'POST',
				headers: headers,
				body: JSON.stringify({
					name: playlistName, 
					uris: ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M"]
				})
			}).then(response => {
				if(response.ok) {
					return response.json();
				}
			}).then(jsonResponse => {
				return jsonResponse.id;
			});

			playlistID = fetch('/v1/users/' + userId + '/playlists/' + playlistID + '/tracks', {
				method: 'POST',
				headers: headers,
				body: JSON.stringify({
					name: playlistName, 
					uris: ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M"]
				})
			}).then(response => {
				if(response.ok) {
					return response.json();
				}
			}).then(jsonResponse => {
				return jsonResponse.id;
			});

		}

	}
};

export { Spotify };