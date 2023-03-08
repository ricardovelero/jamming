let accessToken;
const clientId = "5e704f782f7d433681e0d0d76012b969";
// const redirectUri = "http://erect-twig.surge.sh";
const redirectUri = "http://localhost:3000";

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }
        // check access token using match
        const accessTokenMatch =
            window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
            window.history.pushState("Access Token", null, "/");
            return accessToken;
        } else {
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
        }
    },
    search(term) {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: headers,
        })
            .then((response) => {
                return response.json();
            })
            .then((jsonResponse) => {
                if (!jsonResponse.tracks) return [];
                return jsonResponse.tracks.items.map((track) => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri,
                    preview_url: track.preview_url,
                }));
            });
    },
    savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) return;
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        let userId;
        return fetch(`https://api.spotify.com/v1/me`, { headers: headers })
            .then((res) => {
                return res.json();
            })
            .then((jsonRes) => {
                userId = jsonRes.id;
                return fetch(
                    `https://api.spotify.com/v1/users/${userId}/playlists`,
                    {
                        headers: headers,
                        method: "POST",
                        body: JSON.stringify({ name: name }),
                    }
                )
                    .then((res) => res.json())
                    .then((jsonRes) => {
                        const playlistId = jsonRes.id;
                        return fetch(
                            `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
                            {
                                headers: headers,
                                method: "POST",
                                body: JSON.stringify({ uris: trackUris }),
                            }
                        );
                    });
            });
    },
};

export default Spotify;
