import { TRACKS_EXAMPLES, TRACK_CLASS_NAME } from "./constants.js";
import { DOM, CONTROLS } from "./dom.js";

let uploadedFile;
const audio = new Audio();
const savedVolumen = localStorage.getItem("volume") || "0.50";

function updateVolume(event) {
  const value = event.target.value;
  localStorage.setItem("volume", value);
  audio.volume = Number(value);
  CONTROLS.volumeInput.value = value;
}

function isValidFile(file) {
  return file.type.startsWith("audio/");
}

function uploadFile(event) {
  const files = event.target.files;

  if (files && files.length > 0) {
    uploadedFile = files[0];
    loadTrack(uploadedFile, "upload");
    DOM.inputTrackDOM.classList.add(TRACK_CLASS_NAME);
    DOM.inputTrackDOM.querySelector("h3").textContent = uploadedFile.name;
  } else {
    resetFileInput();
  }
}

function loadTrack(file, from) {
  if (isValidFile(file) === false) {
    resetFileInput();
    return;
  }

  if (from === "upload") {
    toggleActiveExampleTrack("");
    DOM.inputTrackDOM.dataset.selected = "true";
  } else {
    DOM.inputTrackDOM.dataset.selected = "false";
  }

  updateAudioFile(file);
  DOM.trackNameDOM.textContent = file.name;
  play();
  CONTROLS.playbackBtn.disabled = false;
}

function updateAudioFile(file) {
  if (audio.src) {
    URL.revokeObjectURL(audio.src);
  }
  audio.src = URL.createObjectURL(file);
}

async function play() {
  try {
    await audio.play();
    CONTROLS.playbackBtn.textContent = "Pause";
  } catch (error) {
    console.error("Error al reproducir el audio:", error);
    CONTROLS.playbackBtn.textContent = "Play";
  }
}

function pause() {
  CONTROLS.playbackBtn.textContent = "play";
  audio.pause();
}

function playbackToggle() {
  if (!audio.src || audio.src === "") return;
  if (audio.paused) {
    play();
  } else {
    pause();
  }
}

function stop() {
  audio.pause();
  audio.currentTime = 0;
  CONTROLS.playbackBtn.textContent = "Play";
  DOM.currentTimeDOM.textContent = "0:00";
}

function configureAudioEvents() {
  audio.addEventListener("loadedmetadata", function () {
    if (!audio.src || audio.src === "") return;
    const mins = Math.floor(audio.duration / 60);
    const seconds = Math.floor(audio.duration % 60);
    const duration = `${mins}:${seconds}`;
    DOM.trackDurationDOM.textContent = duration;
  });
  audio.addEventListener("timeupdate", function () {
    const seconds = audio.currentTime;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const newTime = `${mins}:${secs.toString().padStart(2, "0")}`;
    DOM.currentTimeDOM.textContent = newTime;
  });
  audio.addEventListener("ended", stop);
}

function resetFileInput() {
  CONTROLS.inputFile.files = null;
  CONTROLS.inputFile.value = "";
}

function configureExampleTracks() {
  const examplesAsListItem = TRACKS_EXAMPLES.map((track) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <h3 class='example-track-title'>${track.name}</h3>
        <p class='example-track-artist'>${track.artist}</p>
      `;
    listItem.id = `${TRACK_CLASS_NAME}-${track.id}`;
    listItem.dataset.selected = "false";
    listItem.classList.add(TRACK_CLASS_NAME);
    listItem.draggable = true;
    return listItem;
  });

  examplesAsListItem.forEach((item) => DOM.exampleTracksList.appendChild(item));
}

function configureExampleTracksInteraction() {
  DOM.exampleTracksList.addEventListener("click", async (event) => {
    const composedPath = event.composedPath();

    const trackClicked = composedPath.find((element) => {
      const el = element;
      return el.classList && el.classList.contains(TRACK_CLASS_NAME);
    });

    if (trackClicked === undefined) return;
    if (trackClicked.dataset.selected === "true") return;

    const trackClickedId = trackClicked.id.replace(`${TRACK_CLASS_NAME}-`, "");

    const track = TRACKS_EXAMPLES.find(
      (track) => track.id === Number(trackClickedId),
    );

    if (track === undefined) return;

    try {
      const response = await fetch(track.fileSrc);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const blob = await response.blob();
      const file = new File([blob], track.name, { type: blob.type });

      loadTrack(file, "selection");
      toggleActiveExampleTrack(trackClicked.id);
      DOM.inputTrackDOM.dataset.selected = "false";
    } catch (error) {
      console.error("No se pudo cargar la pista:", error);
    }
  });
}

function toggleActiveExampleTrack(clickedElementId) {
  [...DOM.exampleTracksList.children].forEach((el) => {
    if (el.id === clickedElementId) {
      el.dataset.selected = el.dataset.selected === "true" ? "false" : "true";
    } else {
      el.dataset.selected = "false";
    }
  });
}

CONTROLS.inputFile.addEventListener("change", uploadFile);
CONTROLS.volumeInput.addEventListener("change", updateVolume);
CONTROLS.playbackBtn.addEventListener("click", playbackToggle);
CONTROLS.stopBtn.addEventListener("click", stop);

CONTROLS.repeatBtn.addEventListener("click", function () {
  audio.loop = !audio.loop;
  let text = "Repeat";
  if (audio.loop === true) {
    text += ": On";
  }
  DOM.repeatDOM.textContent = text;
});

DOM.inputTrackDOM.addEventListener("click", function () {
  if (uploadedFile) {
    loadTrack(uploadedFile, "upload");
    toggleActiveExampleTrack("");
  }
});

document.addEventListener("keydown", function (event) {
  if (event.code !== "Space") return;
  event.preventDefault();
  playbackToggle();
});

audio.volume = Number(savedVolumen);
CONTROLS.volumeInput.value = savedVolumen;
configureAudioEvents();
configureExampleTracks();
configureExampleTracksInteraction();
