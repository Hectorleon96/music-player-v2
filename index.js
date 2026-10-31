const DOM = {
  currentTimeDOM: document.getElementById("track-currenttime"),
  trackDurationDOM: document.getElementById("track-duration"),
  trackNameDOM: document.getElementById("track-name"),
  inputTrackDOM: document.getElementById("input-track-container"),
  repeatDOM: document.getElementById("repeat-toggle"),
  exampleTracksList: document.getElementById("example-tracks-list"),
  progressBarContainer: document.getElementById("progress-bar-container"),
  progressBarIndicator: document.getElementById("progress-bar-indicator"),
};

const CONTROLS = {
  inputFile: document.getElementById("input-file"),
  playbackBtn: document.getElementById("playback-toggle"),
  stopBtn: document.getElementById("control-stop"),
  volumeInput: document.getElementById("volumen-input"),
  repeatBtn: document.getElementById("repeat-toggle"),
};

const TRACKS_EXAMPLES = [
  {
    id: 1,
    name: "Meditation/Spiritual",
    artist: "Alex Morgan",
    fileSrc: document.getElementById("audio-example-1").src,
  },
  {
    id: 2,
    name: "Funk",
    artist: "Moodmode",
    fileSrc: document.getElementById("audio-example-2").src,
  },
];

const TRACK_CLASS_NAME = "track-item";

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
  if (from === "upload" && isValidFile(file) === false) {
    resetFileInput();
    return;
  }

  if (from === "upload") {
    toggleActiveExampleTrack("");
    DOM.inputTrackDOM.dataset.selected = "true";
  } else {
    DOM.inputTrackDOM.dataset.selected = "false";
  }

  DOM.progressBarIndicator.style.width = "0%";
  DOM.trackNameDOM.textContent = file.name;
  updateAudioFile(file, from);
  play();
  CONTROLS.playbackBtn.disabled = false;
}

function updateAudioFile(file, from) {
  if (audio.src) {
    URL.revokeObjectURL(audio.src);
  }
  if (from === "upload") {
    audio.src = URL.createObjectURL(file);
  } else {
    audio.src = file.fileSrc;
  }
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
  DOM.progressBarIndicator.style.width = "0%";
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
    const progressBarPorcent = (seconds / audio.duration) * 100;
    DOM.progressBarIndicator.style.width = `${progressBarPorcent}%`;
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
      loadTrack(track, "selection");
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

function calculateHoverTime(event) {
  if (audio.src) {
    const rect = DOM.progressBarContainer.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const totalWidth = rect.width;

    if (audio.duration && totalWidth > 0) {
      const fraction = relativeX / totalWidth;
      const seconds = fraction * audio.duration;
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const hoverOn = `${mins}:${secs.toString().padStart(2, "0")}`;
      DOM.progressBarContainer.setAttribute("data-time", hoverOn);
      DOM.progressBarContainer.style.setProperty("--mouse-x", `${relativeX}px`);
    }
  }
}

DOM.progressBarContainer.addEventListener("mouseenter", calculateHoverTime);
DOM.progressBarContainer.addEventListener("mousemove", calculateHoverTime);
DOM.progressBarContainer.addEventListener("mouseleave", function () {
  DOM.progressBarContainer.removeAttribute("data-time");
  DOM.progressBarContainer.style.removeProperty("--mouse-x");
});

DOM.progressBarContainer.addEventListener("click", function (event) {
  if (audio.src) {
    const rect = DOM.progressBarContainer.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const totalWidth = rect.width;

    if (audio.duration && totalWidth > 0) {
      const fraction = relativeX / totalWidth;
      const seconds = fraction * audio.duration;
      audio.currentTime = seconds;
    }
  }
});

audio.volume = Number(savedVolumen);
CONTROLS.volumeInput.value = savedVolumen;
configureAudioEvents();
configureExampleTracks();
configureExampleTracksInteraction();
