import React, { Component } from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import Playlist from '../Playlist/Playlist';
import SearchResults from '../SearchResults/SearchResults';
import { Spotify } from '../../util/Spotify';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchResults: [{
        name: 'name',
        artist: 'artist',
        album: 'album',
        id: 'id'
      }],
      playlistName: 'playlistName',
      playlistTracks: [{
        name: 'pname',
        artist: 'partist',
        album: 'palbum',
        id: 'pid',
        uri: 'uri'
      }]
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    if(!this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      
      let newPlaylistTracks = this.state.playlistTracks;
      newPlaylistTracks.push(track);
      
      this.setState({
        playlistTracks: newPlaylistTracks
      });
    }
  }

  removeTrack(track) {
    let newPlaylistTracks = this.state.playlistTracks.filter(savedTrack => savedTrack.id !== track.id);

    this.setState({
      playlistTracks: newPlaylistTracks
    });
  }

  updatePlaylistName(name) {
    this.setState({
      playlistName: name
    })
  }

  savePlaylist() {
    let trackURIs = [];
    this.state.playlistTracks.forEach(track => {
      trackURIs.push(track.uri);
    });
    Spotify.savePlaylist(this.state.playlistName, trackURIs);

    this.setState({
      playlistName: 'New Playlist',
      playlistTracks: []
    });
  }

  search(term) {
    let results = Spotify.search(term);
    this.setState({
      searchResults: results
    });
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;