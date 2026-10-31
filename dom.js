const currentTimeDOM = document.getElementById("track-currenttime");
const trackDurationDOM = document.getElementById("track-duration");
const trackNameDOM = document.getElementById("track-name");
const inputTrackDOM = document.getElementById("input-track-container");
const repeatDOM = document.getElementById("repeat-toggle");
const exampleTracksList = document.getElementById("example-tracks-list");

export const DOM = {
  currentTimeDOM,
  trackDurationDOM,
  trackNameDOM,
  inputTrackDOM,
  repeatDOM,
  exampleTracksList,
};

const inputFile = document.getElementById("input-file");
const playbackBtn = document.getElementById("playback-toggle");
const stopBtn = document.getElementById("control-stop");
const volumeInput = document.getElementById("volumen-input");
const repeatBtn = document.getElementById("repeat-toggle");

export const CONTROLS = {
  inputFile,
  playbackBtn,
  stopBtn,
  volumeInput,
  repeatBtn,
};
