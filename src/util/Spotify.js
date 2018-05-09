let accessToken;
let expiresIn;
const clientId = '1ba2f71ff460497d8c4059120c24468a';
const redirectUri = 'http://localhost:3000/';

let Spotify = {
	getAccessToken() {
		const url = window.location.href;
		if(accessToken) {
			return accessToken;
		}
		else if(url.includes('access_token') && url.includes('expires_in')) {
			accessToken = url.match(/access_token=([^&]*)/)[1];
			expiresIn = url.match(/expires_in=([^&]*)/)[1];
			window.setTimeout(() => accessToken = null, expiresIn * 1000);
			window.history.pushState('Access Token', null, '/');
			return accessToken;
		}
		else {
			// window.location = 'https://accounts.spotify.com/authorize?client_id=' + clientId + '&response_type=token&scope=playlist-modify-public&redirect_uri=' + redirectUri;
			window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token`;
		}
	},

	search(term) {
		this.getAccessToken();
		return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {headers: {Authorization: `Bearer ${accessToken}`}})
		.then(response => {
			if(response.ok) {
				return response.json();
			}
			throw new Error('Request Failed!');
		}, networkError => console.log(networkError.message))
		.then(jsonResponse => {
			console.log(jsonResponse);
			if(jsonResponse.tracks.length === 0) {
				return [];
			}
			else {
				return jsonResponse.tracks.items.map(track => {
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
		this.getAccessToken();
		if(!playlistName && !trackUris) {
			return;
		} 
		else {
			let userId;
			let playlistId;
			return fetch('https://api.spotify.com/v1/me', {headers: {Authorization: `Bearer ${accessToken}`}})
			.then(response => {
				if(response.ok) {
					return response.json();
				}
				throw new Error('Request Failed!');
			}, networkError => console.log(networkError.message))
			.then(jsonResponse => {
				return userId = jsonResponse.id;
			}).then(() => {
				fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
				method: 'POST',
				headers: {Authorization: `Bearer ${accessToken}`},
				body: JSON.stringify({name: playlistName})
				})
				.then(response => {
					if(response.ok) {
						return response.json();
					}
					throw new Error('Request Failed!');
				}, networkError => console.log(networkError.message))
				.then(jsonResponse => {
					return playlistId = jsonResponse.id;
				});
			}).then(() => {
				return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
					method: 'POST',
					headers: {Authorization: `Bearer ${accessToken}`},
					body: JSON.stringify({uris: trackUris})
				})
				.then(response => {
					if(response.ok) {
						return response.json();
					}
					throw new Error('Request Failed!');
				}, networkError => console.log(networkError.message))
				.then(jsonResponse => {
					return jsonResponse.id;
				});
			});
		}

	}
};

export { Spotify };