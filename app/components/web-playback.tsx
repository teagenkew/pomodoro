import React, { useState, useEffect } from "react";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  addListener: (event: string, callback: (args: any) => void) => void;
  removeListener: (event: string, callback?: (args: any) => void) => void;
}

interface WebPlaybackProps {
  token: string;
}

function WebPlayback({ token }: WebPlaybackProps) {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      setPlayer(playerInstance);

      playerInstance.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      playerInstance.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      playerInstance.connect();
    };

    return () => {
      if (player) {
        player.removeListener("ready");
        player.removeListener("not_ready");
        console.log("Cleanup complete");
      }
    };
  }, [token, player]);

  return (
    <div className="container">
      <div className="main-wrapper"></div>
    </div>
  );
}

export default WebPlayback;
