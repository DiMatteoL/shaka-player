"use strict";

let manifestUri =
    'https://live-d-l3-delivery-live.secure2.footprint.net/liveOriginTimestamps/bbb_30fps_live.smil/manifest.mpd';

let initApp = () => {
    console.log('Hello Streamroot!');




    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        initPlayer();
    } else {
        console.error('Browser not supported!');
    }
};

let initPlayer = () => {
    // Create a Player instance.
    let video = document.getElementById('video');
    let player = new shaka.Player(video);

    // Attach player to the window to make it easy to access in the JS console.
    window.player = player;

    // Listen for error events.
    player.addEventListener('error', onErrorEvent);

    player.addEventListener('streaming', onStreamingEvent);

    player.addEventListener('unloading', onUnloadingEvent);
    player.addEventListener('loading', onLoadingEvent);

    player.addEventListener('trackschanged', onTracksChangedEvent);
    player.addEventListener('adaptation', onAdaptationEvent);

    // Try to load a manifest.
    // This is an asynchronous process.
    player.load(manifestUri).catch(onError);  // onError is executed if the asynchronous load fails.
};

let onTracksChangedEvent = () => {
    let tracks = player.getVariantTracks();
    if(tracks){
        console.log(`[METADATA_PARSED] ${tracks.length} video tracks`);
        let activeTrack = tracks.find(track => track.active);
        console.log(`[MEDIA_VARIANT] size : [${activeTrack.width} x ${activeTrack.height}] - bandwidth : ${Math.floor(activeTrack.bandwidth/8000)} KB/s`);
        // looks like the first active track is always the lighter one !
    }
};

let onAdaptationEvent = () => {
    // console.log("");
};

let onLoadingEvent = () => {
    console.log('[VIDEO_LOADS]', manifestUri);
};

let onUnloadingEvent = () => {
    console.log('[VIDEO_UNLOADED]');
};

let onStreamingEvent = () => {
    let type = 'unknown';
    if(player.isLive()){
        type = 'Live';
    } else if (player.isInProgress()){
        type = 'VoD';
    }
    console.log('[STREAM_TYPE]', type);
};

let onErrorEvent = (event) => {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
};

let onError = (error) => {
    // Log the error.
    console.error('[ERROR]', error.code);
};

document.addEventListener('DOMContentLoaded', initApp);