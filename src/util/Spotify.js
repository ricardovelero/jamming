let accessToken;
const clientId = "5e704f782f7d433681e0d0d76012b969";
const redirectUri = "http://localhost:3000/";

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
        const headers = {
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        return fetch(
            `https://api.spotify.com/v1/search?type=track&q=${term}`,
            headers
        )
            .then((response) => {
                return response.json();
            })
            .then((jsonResponse) => {
                if (!jsonResponse.tracks) return [];
                return jsonResponse.tracks.items.map((track) => ({
                    id: track.id,
                    name: track.id,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri,
                }));
            });
    },
};

export default Spotify;
