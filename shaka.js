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

    //
    player.addEventListener('streaming', onStreamingEvent);

    player.addEventListener('unloading', onUnloadingEvent);
    player.addEventListener('loading', onLoadingEvent);

    player.addEventListener('trackschanged', onTracksChangedEvent);
    player.addEventListener('adaptation', onAdaptationEvent);

    player.load(manifestUri).then(() => {
        console.log('[VIDEO_IS_LOADED]', player.getManifestUri());
    }).catch(onError);  // onError is executed if the asynchronous load fails.
};

// Logs the number of
let onTracksChangedEvent = () => {
    // Get all tracks and logs data on the active one.
    // It seems like the first active one is always the lightest. Some configuration tweeking might change that.
    let tracks = player.getVariantTracks();
    let activeTrack = tracks.find(track => track.active);
    console.log(`[METADATA_PARSED] ${tracks.length} video tracks`);
    console.log(`[MEDIA_VARIANT] size : [${activeTrack.width} x ${activeTrack.height}] - bandwidth : ${Math.floor(activeTrack.bandwidth/8000)} KB/s`);

    // Finds all the segment renferences for the entire video and logs the number of segments
    // Has coherent values only for VoDs
    let segment_count = stream.findSegmentPosition(0);
    let segment;
    do {
        segment = stream.getSegmentReference(i);
        segment_count++;
    } while (segment);
    segment_count--;
    console.log("[TOTAL_MEDIA_SEGMENTS]", segment_count);
};

// Logs the current media segment URL
let onAdaptationEvent = () => {
    // Logs the type of the current stream

    // TODO : Find a way to detect manifest on get request (not in adaptation event..)
    // console.log("[MANIFEST_DETECTED]", player.getManifestUri());


    // TODO : Find a way to detect media segment on get request (not in adaptation event..)
    let tracks = player.getVariantTracks();
    let activeTrackIndex = tracks.findIndex(track => track.active);
    let manifest = player.getManifest();

    // TODO : Find a way to acces that current period that is not '0'...
    let stream = manifest.periods[0].variants[activeTrackIndex].video;

    // TODO : Find a way to access current segment position  that is not '0'
    // stream.createSegmentIndex().then((position) => {}) doesn't seem work
    let current_segment_position = stream.findSegmentPosition(0);
    let current_segment_reference = stream.getSegmentReference(current_segment_position);
    // this log has coherent values for streams only (due to current_segment_position, having coherent values for streams)
    console.log("[SEGMENT_DETECTED]", current_segment_reference.a()[0]);
};

// Logs the manifest URL
let onLoadingEvent = () => {
    // the player doesn't have a manifest URI on loadingEvent : player.getManifestUri()) is undefined.
    console.log('[VIDEO_LOADS]', manifestUri);
};

let onUnloadingEvent = () => {
    console.log('[VIDEO_UNLOADED]');
};

// Logs the type of the current stream
let onStreamingEvent = () => {
    let type = 'Unknown';
    if(player.isLive()){
        type = 'Live';
    // TODO : isInProgress() is not the right function, but the API seems to say so?
    } else if (player.isInProgress()){
        type = 'VoD';
    }
    console.log('[STREAM_TYPE]', type);
};

let onErrorEvent = (event) => {
    onError(event.detail);
};

let onError = (error) => {
    console.error('[ERROR]', error.code);
};

document.addEventListener('DOMContentLoaded', initApp);