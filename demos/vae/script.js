(function () {
  "use strict";

  const latentCanvas = document.getElementById("latentCanvas");
  const latentCtx = latentCanvas.getContext("2d");
  const inputCanvas = document.getElementById("inputCanvas");
  const inputCtx = inputCanvas.getContext("2d");
  const previewCanvas = document.getElementById("previewCanvas");
  const previewCtx = previewCanvas.getContext("2d");
  const previewImageStack = document.getElementById("previewImageStack");
  const inputChoiceList = document.getElementById("inputChoiceList");

  const latentCanvas3d = document.getElementById("latentCanvas3d");
  const canvasWrap = document.querySelector(".canvas-wrap");
  const view2dButton = document.getElementById("view2dButton");
  const view3dButton = document.getElementById("view3dButton");
  const latentViewTitle = document.getElementById("latentViewTitle");
  const latentViewHint = document.getElementById("latentViewHint");
  const withKlButton = document.getElementById("withKlButton");
  const withoutKlButton = document.getElementById("withoutKlButton");
  const checkpointButtons = Array.from(document.querySelectorAll(".checkpoint-button"));
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const playButton = document.getElementById("playButton");
  const sampleCloudButton = document.getElementById("sampleCloudButton");
  const zValue = document.getElementById("zValue");
  const muValue = document.getElementById("muValue");
  const sigmaValue = document.getElementById("sigmaValue");
  const epsilonValue = document.getElementById("epsilonValue");
  const modeValue = document.getElementById("modeValue");
  const regionValue = document.getElementById("regionValue");
  const priorValue = document.getElementById("priorValue");
  const regionBadge = document.getElementById("regionBadge");
  const takeawayText = document.getElementById("takeawayText");
  const pinnedText = document.getElementById("pinnedText");
  const selectedInputValue = document.getElementById("selectedInputValue");
  const stepNote = document.getElementById("stepNote");
  const observationText = document.getElementById("observationText");
  const sampleStrip = document.getElementById("sampleStrip");
  const decodeStatus = document.getElementById("decodeStatus");

  const latentRange = 3;
  const mapSamples = 112;
  const trailLimit = 20;
  const sampleCloudSize = 32;
  const pathDuration = 3600;

  const inputExamples = [
    { label: "Messi", detail: "portrait cluster", z1: -0.7, z2: 0.45, z3: -0.28, noKl: [-2.05, 0.9, -0.7], sigma: [0.5, 0.42, 0.34], imageSrc: "assets/messi.png", color: "#d71920" },
    { label: "Kim", detail: "near portraits", z1: 0.45, z2: 0.1, z3: 0.22, noKl: [1.2, 0.92, 0.72], sigma: [0.48, 0.44, 0.32], imageSrc: "assets/kim.png", color: "#111111" },
    { label: "KW", detail: "portrait cluster", z1: -0.25, z2: 0.3, z3: 0.08, noKl: [-1.15, -0.55, 0.34], sigma: [0.5, 0.4, 0.3], imageSrc: "assets/kw.png", color: "#315f8c" },
    { label: "Grass", detail: "different class", z1: 1.45, z2: -1.05, z3: 1.1, noKl: [2.18, -1.82, 1.7], sigma: [0.58, 0.48, 0.44], imageSrc: "assets/grass.png", color: "#2f7d5c" }
  ];

  const islands = inputExamples.map((example, index) => ({
    center: example.noKl,
    type: "asset",
    imageIndex: index,
    color: example.color
  }));

  const checkpoints = [
    {
      label: "Messi / KW",
      z1: -0.48,
      z2: 0.38,
      z3: -0.1,
      noKl: [-1.6, 0.15, -0.18],
      note: {
        withKL: "Interpolation starts inside overlapping face posteriors, so decoding should stay stable here.",
        withoutKL: "No-KL can reconstruct near this face island, but it has not learned what the surrounding prior should mean."
      }
    },
    {
      label: "Kim",
      z1: 0.45,
      z2: 0.1,
      z3: 0.22,
      noKl: [1.2, 0.92, 0.72],
      note: {
        withKL: "This point tests whether nearby face encodings blend smoothly instead of jumping between memorized examples.",
        withoutKL: "This point is still near a no-KL island, so reconstruction can look okay even though the global space is fragmented."
      }
    },
    {
      label: "Gap to grass",
      z1: 1.05,
      z2: -0.62,
      z3: 0.62,
      noKl: [1.68, -0.42, 1.15],
      note: {
        withKL: "This middle point is the important test: KL gives the decoder reason to make in-between prior-like points usable.",
        withoutKL: "This middle point exposes the failure mode: no-KL leaves space between posterior islands undertrained."
      }
    },
    {
      label: "Grass",
      z1: 1.45,
      z2: -1.05,
      z3: 1.1,
      noKl: [2.18, -1.82, 1.7],
      note: {
        withKL: "The route ends at a different kind of input, showing that latent movement can still land on a meaningful decode.",
        withoutKL: "Near the grass island, no-KL can decode grass; the problem is the disconnected space needed to get there."
      }
    }
  ];

  const guidedPath = [
    checkpoints[0],
    checkpoints[1],
    checkpoints[2],
    checkpoints[3]
  ];

  function checkpointPoint(checkpoint) {
    if (state.mode === "withoutKL") {
      return { z1: checkpoint.noKl[0], z2: checkpoint.noKl[1], z3: checkpoint.noKl[2] };
    }
    return { z1: checkpoint.z1, z2: checkpoint.z2, z3: checkpoint.z3 };
  }

  const state = {
    mode: "withKL",
    viewDimension: "2d",
    currentZ: { z1: 0, z2: 0, z3: 0 },
    pinnedZ: null,
    isPointerInside: false,
    activeCheckpoint: 0,
    selectedInput: 0,
    currentEpsilon: { e1: 0, e2: 0, e3: 0 },
    lastLatentSource: "mean",
    isPlaying: false,
    animationFrame: null,
    trail: [],
    sampleCloud: [],
    images: [],
    trainingPoints: {
      withKL: [],
      withoutKL: []
    },
    three: {
      ready: false,
      scene: null,
      camera: null,
      renderer: null,
      root: null,
      animationFrame: null,
      angle: 0
    }
  };

  function init() {
    generateTrainingPoints();
    preloadImages().then(() => {
      renderInputChoices();
      attachEventListeners();
      setMode("withKL");
      selectInput(0);
    });
  }

  function preloadImages() {
    return Promise.all(inputExamples.map((example, index) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        state.images[index] = image;
        resolve();
      };
      image.onerror = () => {
        state.images[index] = null;
        resolve();
      };
      image.src = example.imageSrc;
    })));
  }

  function attachEventListeners() {
    if (view2dButton) view2dButton.addEventListener("click", () => setViewDimension("2d"));
    if (view3dButton) view3dButton.addEventListener("click", () => setViewDimension("3d"));
    withKlButton.addEventListener("click", () => {
      setMode("withKL");
      revealResults();
    });
    withoutKlButton.addEventListener("click", () => {
      setMode("withoutKL");
      revealResults();
    });
    checkpointButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setCheckpoint(Number(button.dataset.checkpoint));
        revealResults();
      });
    });
    prevButton.addEventListener("click", () => stepCheckpoint(-1));
    nextButton.addEventListener("click", () => stepCheckpoint(1));
    playButton.addEventListener("click", playGuidedPath);
    if (sampleCloudButton) sampleCloudButton.addEventListener("click", () => {
      sampleCloudFromSelectedInput();
      revealResults();
    });

    latentCanvas.addEventListener("pointerdown", (event) => {
      latentCanvas.setPointerCapture(event.pointerId);
      moveToEventPoint(event);
    });

    latentCanvas.addEventListener("pointermove", (event) => {
      moveToEventPoint(event);
    });

    latentCanvas.addEventListener("pointerup", (event) => {
      if (latentCanvas.hasPointerCapture(event.pointerId)) {
        latentCanvas.releasePointerCapture(event.pointerId);
      }
    });

    latentCanvas.addEventListener("pointerleave", () => {
      state.isPointerInside = false;
      draw();
    });

    latentCanvas.addEventListener("click", (event) => {
      stopPlayback();
      const point = eventToLatent(event);
      state.pinnedZ = point;
      state.activeCheckpoint = -1;
      updateCheckpointButtons();
      state.lastLatentSource = "manual";
      updateCurrentZ(point.z1, point.z2, true, 0);
      pinnedText.innerHTML = `Pinned latent vector <span class="math">z = (${format(point.z1)}, ${format(point.z2)})</span>`;
    });

    latentCanvas3d.addEventListener("pointerdown", (event) => {
      latentCanvas3d.setPointerCapture(event.pointerId);
      moveToThreeEventPoint(event);
    });

    latentCanvas3d.addEventListener("pointermove", (event) => {
      moveToThreeEventPoint(event);
    });

    latentCanvas3d.addEventListener("pointerup", (event) => {
      if (latentCanvas3d.hasPointerCapture(event.pointerId)) {
        latentCanvas3d.releasePointerCapture(event.pointerId);
      }
    });

    latentCanvas3d.addEventListener("pointerleave", () => {
      state.isPointerInside = false;
      draw();
    });

    latentCanvas3d.addEventListener("click", (event) => {
      stopPlayback();
      const point = eventToLatent3d(event);
      if (!point) return;
      state.pinnedZ = point;
      state.activeCheckpoint = -1;
      updateCheckpointButtons();
      state.lastLatentSource = "manual";
      updateCurrentZ(point.z1, point.z2, true, point.z3);
      pinnedText.innerHTML = `Pinned latent vector <span class="math">z = ${formatVector([point.z1, point.z2, point.z3])}</span>`;
    });

    document.addEventListener("keydown", handleKeydown, true);
    window.addEventListener("resize", () => {
      resizeThreeScene();
      draw();
    });
    if (window.THREE && view3dButton) {
      setupThreeScene();
    }
  }

  function moveToEventPoint(event) {
    stopPlayback();
    const point = eventToLatent(event);
    state.isPointerInside = true;
    state.activeCheckpoint = -1;
    updateCheckpointButtons();
    state.lastLatentSource = "manual";
    updateCurrentZ(point.z1, point.z2, true, 0);
  }

  function moveToThreeEventPoint(event) {
    stopPlayback();
    const point = eventToLatent3d(event);
    if (!point) return;
    state.isPointerInside = true;
    state.activeCheckpoint = -1;
    updateCheckpointButtons();
    state.lastLatentSource = "manual";
    updateCurrentZ(point.z1, point.z2, true, point.z3);
  }

  function renderInputChoices() {
    inputExamples.forEach((example, index) => {
      const button = document.createElement("button");
      button.className = "input-choice";
      button.type = "button";
      button.dataset.input = String(index);
      button.setAttribute("aria-pressed", String(index === state.selectedInput));

      const canvas = document.createElement("canvas");
      canvas.width = 120;
      canvas.height = 120;

      const label = document.createElement("span");
      label.innerHTML = `<strong>Highlight ${example.label}</strong><span>${example.detail}</span>`;

      button.append(canvas, label);
      button.addEventListener("click", () => selectInput(index));
      inputChoiceList.appendChild(button);

      renderInputAsset(canvas.getContext("2d"), example, index);
    });
  }

  function selectInput(index) {
    stopPlayback();
    const example = inputExamples[index];
    state.selectedInput = index;
    state.activeCheckpoint = -1;
    state.pinnedZ = null;
    state.trail = [];
    state.sampleCloud = [];
    updateInputButtons();
    updateCheckpointButtons();
    updateStepNote();
    sampleSelectedInput();
    pinnedText.innerHTML = state.mode === "withKL"
      ? `Highlighted ${example.label}: the oval is its encoded region; nearby dots are other training samples.`
      : `Highlighted ${example.label}: no-KL encoder places it in a separate tight island.`;
  }

  function updateInputButtons() {
    Array.from(inputChoiceList.children).forEach((button, index) => {
      const active = index === state.selectedInput;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function generateTrainingPoints() {
    const klRng = mulberry32(1248);
    const noKlRng = mulberry32(9817);

    state.trainingPoints.withKL = inputExamples.flatMap((example) => {
      const count = example.label === "Grass" ? 18 : 24;
      return Array.from({ length: count }, () => ({
        z1: clamp(example.z1 + randn(klRng) * example.sigma[0], -2.7, 2.7),
        z2: clamp(example.z2 + randn(klRng) * example.sigma[1], -2.7, 2.7),
        z3: clamp(example.z3 + randn(klRng) * example.sigma[2], -2.7, 2.7),
        color: example.color
      }));
    });

    state.trainingPoints.withoutKL = islands.flatMap((island) => {
      const count = 8 + Math.floor(noKlRng() * 5);
      return Array.from({ length: count }, () => ({
        z1: island.center[0] + randn(noKlRng) * 0.22,
        z2: island.center[1] + randn(noKlRng) * 0.22,
        z3: island.center[2] + randn(noKlRng) * 0.22,
        color: island.color
      }));
    });
  }

  function setViewDimension(nextDimension) {
    state.viewDimension = nextDimension;
    const is3d = nextDimension === "3d";
    if (view2dButton) {
      view2dButton.classList.toggle("active", !is3d);
      view2dButton.setAttribute("aria-pressed", String(!is3d));
    }
    if (view3dButton) {
      view3dButton.classList.toggle("active", is3d);
      view3dButton.setAttribute("aria-pressed", String(is3d));
    }
    canvasWrap.classList.toggle("view-3d", is3d);
    latentViewTitle.textContent = is3d ? "z1 by z2 by z3" : "z1 by z2";
    latentViewHint.textContent = is3d
      ? "Drag the 3D view to set z on the current slice. The decoder updates immediately."
      : "Drag anywhere on the map. The decoder preview changes as z moves.";
    resizeThreeScene();
    draw();
    revealResults();
  }

  function setMode(nextMode) {
    stopPlayback();
    state.mode = nextMode;
    state.trail = [];

    const withKl = nextMode === "withKL";
    withKlButton.classList.toggle("active", withKl);
    withoutKlButton.classList.toggle("active", !withKl);
    withKlButton.setAttribute("aria-pressed", String(withKl));
    withoutKlButton.setAttribute("aria-pressed", String(!withKl));
    modeValue.textContent = withKl ? "With KL" : "No KL";
    takeawayText.innerHTML = withKl
      ? `With KL: encodings are pulled toward <span class="math">N(0, I)</span>, so interpolation and random prior samples are more likely to decode.`
      : `No KL: the encoder can place examples in separated islands; reconstruction works locally, but interpolation crosses undertrained gaps.`;
    pinnedText.innerHTML = withKl
      ? `With KL active: posterior ellipses overlap with likely prior mass.`
      : `No KL active: tight islands reconstruct locally, but gaps are not trained to decode.`;

    state.sampleCloud = [];
    updateStepNote();
    sampleSelectedInput();
  }

  function sampleSelectedInput() {
    stopPlayback();
    const example = inputExamples[state.selectedInput];
    const encoder = encoderForExample(example, state.mode);
    const sample = sampleFromEncoder(encoder, Math.random);
    state.currentEpsilon = { e1: sample.e1, e2: sample.e2, e3: sample.e3 };
    state.lastLatentSource = "sample";
    state.pinnedZ = null;
    state.trail = [];
    state.activeCheckpoint = -1;
    state.sampleCloud = [];
    updateCheckpointButtons();
    updateStepNote();
    pinnedText.innerHTML = state.mode === "withKL"
      ? `Sampled ${example.label}: <span class="math">z = &mu; + &sigma; &odot; &epsilon;</span>`
      : `Sampled ${example.label} with no KL: <span class="math">q(z|x)</span> is not prior-matched.`;
    updateCurrentZ(sample.z1, sample.z2, false, sample.z3);
  }

  function sampleCloudFromSelectedInput() {
    stopPlayback();
    const example = inputExamples[state.selectedInput];
    const encoder = encoderForExample(example, state.mode);
    const rng = Math.random;
    state.sampleCloud = Array.from({ length: sampleCloudSize }, () => sampleFromEncoder(encoder, rng));
    const latest = state.sampleCloud[state.sampleCloud.length - 1];
    state.currentEpsilon = { e1: latest.e1, e2: latest.e2, e3: latest.e3 };
    state.lastLatentSource = "sample";
    state.pinnedZ = null;
    state.trail = [];
    state.activeCheckpoint = -1;
    updateCheckpointButtons();
    updateStepNote();
    pinnedText.innerHTML = state.mode === "withKL"
      ? `Drew ${sampleCloudSize} samples from <span class="math">q(z|x)</span>. More image files are not needed.`
      : `Drew ${sampleCloudSize} no-KL samples. Notice how little they explain unused latent space.`;
    updateCurrentZ(latest.z1, latest.z2, false, latest.z3);
  }

  function setCheckpoint(index) {
    stopPlayback();
    const checkpoint = checkpoints[index];
    const point = checkpointPoint(checkpoint);
    state.activeCheckpoint = index;
    state.pinnedZ = null;
    state.trail = [];
    state.lastLatentSource = "manual";
    updateCheckpointButtons();
    updateStepNote();
    pinnedText.textContent = `Checkpoint: ${checkpoint.label}`;
    updateCurrentZ(point.z1, point.z2, false, point.z3);
  }

  function stepCheckpoint(direction) {
    const current = state.activeCheckpoint >= 0 ? state.activeCheckpoint : nearestCheckpointIndex();
    const next = (current + direction + checkpoints.length) % checkpoints.length;
    setCheckpoint(next);
  }

  function nearestCheckpointIndex() {
    let bestIndex = 0;
    let bestDistance = Infinity;
    checkpoints.forEach((checkpoint, index) => {
      const point = checkpointPoint(checkpoint);
      const d = distance([state.currentZ.z1, state.currentZ.z2], [point.z1, point.z2]);
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  function updateCheckpointButtons() {
    checkpointButtons.forEach((button, index) => {
      button.classList.toggle("active", index === state.activeCheckpoint);
    });
  }

  function updateStepNote() {
    if (state.activeCheckpoint < 0) {
      stepNote.innerHTML = state.mode === "withKL"
        ? `Encode input: the encoder creates an ellipse <span class="math">q(z|x)</span>; the decoder sees one sampled <span class="math">z</span> from it.`
        : `No-KL keeps reconstruction local: the encoded examples work, but the space between them may not.`;
      return;
    }
    const checkpoint = checkpoints[state.activeCheckpoint];
    stepNote.innerHTML = mathify(checkpoint.note[state.mode]);
  }

  function playGuidedPath() {
    stopPlayback();
    state.isPlaying = true;
    state.pinnedZ = null;
    state.activeCheckpoint = -1;
    state.trail = [];
    state.lastLatentSource = "manual";
    updateCheckpointButtons();
    updateStepNote();
    playButton.textContent = "Testing";

    const startTime = performance.now();
    const animate = (now) => {
      const t = clamp((now - startTime) / pathDuration, 0, 1);
      const point = interpolateGuidedPath(t);
      updateCurrentZ(point.z1, point.z2, true, point.z3);
      if (t < 1 && state.isPlaying) {
        state.animationFrame = requestAnimationFrame(animate);
      } else {
        state.isPlaying = false;
        state.animationFrame = null;
        playButton.textContent = "Play interpolation";
        state.activeCheckpoint = 3;
        updateCheckpointButtons();
        updateStepNote();
      }
    };
    state.animationFrame = requestAnimationFrame(animate);
  }

  function stopPlayback() {
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }
    if (state.isPlaying) {
      state.isPlaying = false;
      playButton.textContent = "Play interpolation";
    }
  }

  function interpolateGuidedPath(t) {
    const segments = guidedPath.length - 1;
    const scaled = clamp(t, 0, 1) * segments;
    const index = Math.min(segments - 1, Math.floor(scaled));
    const localT = scaled - index;
    const a = checkpointPoint(guidedPath[index]);
    const b = checkpointPoint(guidedPath[index + 1]);
    return {
      z1: lerp(a.z1, b.z1, smoothstep(localT)),
      z2: lerp(a.z2, b.z2, smoothstep(localT)),
      z3: lerp(a.z3, b.z3, smoothstep(localT))
    };
  }

  function handleKeydown(event) {
    if (isTextEntryTarget(event.target)) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepCheckpoint(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stepCheckpoint(1);
    } else if (event.key === " " || event.key === "Spacebar" || event.code === "Space") {
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;
      playGuidedPath();
    } else if (event.key.toLowerCase() === "k") {
      event.preventDefault();
      setMode(state.mode === "withKL" ? "withoutKL" : "withKL");
    }
  }

  function isTextEntryTarget(target) {
    if (!target) return false;
    const tagName = target.tagName;
    return target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
  }

  function revealResults() {
    const target = document.querySelector(".explore-layout");
    const canvas = state.viewDimension === "3d" ? latentCanvas3d : latentCanvas;
    if (!target) return;
    window.requestAnimationFrame(() => {
      const canvasTop = canvas ? canvas.getBoundingClientRect().top : 0;
      if (canvasTop < window.innerHeight - 180) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateCurrentZ(z1, z2, addTrail, z3 = state.currentZ.z3 || 0) {
    state.currentZ = {
      z1: clamp(z1, -latentRange, latentRange),
      z2: clamp(z2, -latentRange, latentRange),
      z3: clamp(z3, -latentRange, latentRange)
    };

    if (addTrail) {
      state.trail.push({ ...state.currentZ });
      if (state.trail.length > trailLimit) {
        state.trail.shift();
      }
    }

    const decoded = getDecoded(state.currentZ.z1, state.currentZ.z2);
    updateStats(decoded);
    draw(decoded);
  }

  function updateStats(decoded) {
    const encoder = encoderForExample(inputExamples[state.selectedInput], state.mode);
    zValue.textContent = formatVector([state.currentZ.z1, state.currentZ.z2, state.currentZ.z3]);
    muValue.textContent = formatVector(encoder.mu);
    sigmaValue.textContent = formatVector(encoder.sigma);
    if (epsilonValue) {
      epsilonValue.textContent = state.lastLatentSource === "manual"
        ? "manual z"
        : formatVector([state.currentEpsilon.e1, state.currentEpsilon.e2, state.currentEpsilon.e3]);
    }
    regionValue.textContent = decoded.region;
    if (priorValue) {
      const priorDensity = Math.exp(-0.5 * (state.currentZ.z1 * state.currentZ.z1 + state.currentZ.z2 * state.currentZ.z2));
      priorValue.textContent = priorDensity > 0.45 ? "high" : priorDensity > 0.08 ? "medium" : "low";
    }
    regionBadge.textContent = `${decoded.region} region`;
    regionBadge.classList.toggle("gap", decoded.region === "gap");
    regionBadge.classList.toggle("island", decoded.region === "island");
    regionBadge.classList.toggle("transition", decoded.region === "transition");
    updateDecodeStatus(decoded);
  }

  function updateDecodeStatus(decoded) {
    decodeStatus.classList.toggle("warning", decoded.region === "transition");
    decodeStatus.classList.toggle("gap", decoded.region === "gap");

    if (state.mode === "withKL") {
      decodeStatus.innerHTML = state.lastLatentSource === "sample"
        ? `Encoder sample: picked one <span class="math">z</span> from the selected input's posterior, then decoded it.`
        : `Decoder test: this <span class="math">z</span> is in a KL-regularized space, so nearby points should decode coherently.`;
    } else if (decoded.region === "island") {
      decodeStatus.innerHTML = `No-KL island: decoding can work near an encoded example, but this region is not matched to <span class="math">N(0, I)</span>.`;
    } else if (decoded.region === "transition") {
      decodeStatus.textContent = "In-between point: no-KL gives the decoder little training signal here.";
    } else {
      decodeStatus.textContent = "Unused gap: without KL, this latent region was not trained to decode from the prior.";
    }
  }

  function draw(decoded) {
    const currentDecoded = decoded || getDecoded(state.currentZ.z1, state.currentZ.z2);
    drawLatentMap();
    drawPosteriorDistributions();
    drawTrainingPoints();
    drawSampleCloud();
    drawGuidedPath();
    drawTrail();
    drawCursor();
    renderInputExample(inputCtx, currentDecoded);
    renderPreview(previewCtx, currentDecoded);
    renderSampleStrip();
    updateObservation(currentDecoded);
    updateThreeScene();
  }

  function drawLatentMap() {
    const width = latentCanvas.width;
    const height = latentCanvas.height;
    const cell = width / mapSamples;
    latentCtx.clearRect(0, 0, width, height);

    for (let row = 0; row < mapSamples; row += 1) {
      for (let col = 0; col < mapSamples; col += 1) {
        const px = col * cell;
        const py = row * cell;
        const latent = pixelToLatent(px + cell / 2, py + cell / 2);
        latentCtx.fillStyle = state.mode === "withKL"
          ? colorForKlMap(latent.z1, latent.z2)
          : colorForNoKlMap(latent.z1, latent.z2);
        latentCtx.fillRect(px, py, Math.ceil(cell), Math.ceil(cell));
      }
    }

    drawLatentStructureOverlay();
    drawAxes();
  }

  function drawLatentStructureOverlay() {
    latentCtx.save();
    if (state.mode === "withKL") {
      const center = latentToPixel(0, 0);
      [1, 2].forEach((radius, index) => {
        const edge = latentToPixel(radius, 0);
        latentCtx.beginPath();
        latentCtx.arc(center.x, center.y, Math.abs(edge.x - center.x), 0, Math.PI * 2);
        latentCtx.strokeStyle = index === 0 ? "rgba(47, 125, 92, 0.28)" : "rgba(47, 125, 92, 0.18)";
        latentCtx.lineWidth = 2;
        latentCtx.setLineDash(index === 0 ? [] : [6, 7]);
        latentCtx.stroke();
      });
      latentCtx.setLineDash([]);
      latentCtx.fillStyle = "rgba(47, 125, 92, 0.9)";
      latentCtx.font = "700 12px Inter, system-ui, sans-serif";
      latentCtx.fillText("KL: likely prior samples decode here", center.x + 18, center.y - 82);
    } else {
      islands.forEach((island) => {
        const center = latentToPixel(island.center[0], island.center[1]);
        const validRadius = Math.abs(latentToPixel(island.center[0] + 0.65, island.center[1]).x - center.x);
        const transitionRadius = Math.abs(latentToPixel(island.center[0] + 1, island.center[1]).x - center.x);
        latentCtx.beginPath();
        latentCtx.arc(center.x, center.y, transitionRadius, 0, Math.PI * 2);
        latentCtx.strokeStyle = "rgba(178, 48, 58, 0.46)";
        latentCtx.lineWidth = 2;
        latentCtx.setLineDash([5, 6]);
        latentCtx.stroke();
        latentCtx.setLineDash([]);
        latentCtx.beginPath();
        latentCtx.arc(center.x, center.y, validRadius, 0, Math.PI * 2);
        latentCtx.strokeStyle = "rgba(47, 125, 92, 0.52)";
        latentCtx.lineWidth = 2;
        latentCtx.stroke();
      });
      latentCtx.fillStyle = "rgba(125, 31, 40, 0.9)";
      latentCtx.font = "800 12px Inter, system-ui, sans-serif";
      latentCtx.fillText("unused gap: decoder not trained here", 28, 34);
      const faceLabel = latentToPixel(islands[0].center[0] + 0.1, islands[0].center[1] + 0.55);
      latentCtx.fillStyle = "rgba(125, 31, 40, 0.86)";
      latentCtx.fillText("reconstruction islands", faceLabel.x, faceLabel.y);
    }
    latentCtx.restore();
  }

  function drawPosteriorDistributions() {
    latentCtx.save();
    inputExamples.forEach((example, index) => {
      const encoder = encoderForExample(example, state.mode);
      const pixel = latentToPixel(encoder.mu[0], encoder.mu[1]);
      const displayScale = state.mode === "withKL" ? 2.6 : 1.45;
      const sigmaX = Math.abs(latentToPixel(encoder.mu[0] + encoder.sigma[0] * displayScale, encoder.mu[1]).x - pixel.x);
      const sigmaY = Math.abs(latentToPixel(encoder.mu[0], encoder.mu[1] + encoder.sigma[1] * displayScale).y - pixel.y);
      const isSelected = index === state.selectedInput;

      latentCtx.beginPath();
      latentCtx.ellipse(pixel.x, pixel.y, sigmaX, sigmaY, 0, 0, Math.PI * 2);
      latentCtx.fillStyle = mixHexWithAlpha(example.color, isSelected ? 0.15 : 0.08);
      latentCtx.fill();
      latentCtx.strokeStyle = mixHexWithAlpha(example.color, isSelected ? 0.72 : 0.38);
      latentCtx.lineWidth = isSelected ? 3 : 1.5;
      latentCtx.setLineDash(state.mode === "withKL" ? [] : [4, 4]);
      latentCtx.stroke();
    });
    latentCtx.setLineDash([]);
    latentCtx.restore();
  }

  function colorForKlMap(z1, z2) {
    const quality = Math.exp(-0.5 * (z1 * z1 + z2 * z2));
    const redWash = sigmoid(0.9 * z1 - 0.3 * z2);
    const r = Math.round(244 - quality * 30 + redWash * 8);
    const g = Math.round(248 - quality * 10 - redWash * 8);
    const b = Math.round(242 - quality * 28 - redWash * 8);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function colorForNoKlMap(z1, z2) {
    const nearest = nearestIsland(z1, z2);
    if (nearest.distance < 0.65) {
      return mixHex("#f8fbf7", nearest.island.color, 0.22 * (1 - nearest.distance / 0.65) + 0.1);
    }
    if (nearest.distance < 1) {
      return mixHex("#ffe8e8", "#b2303a", 0.3 * (1 - (nearest.distance - 0.65) / 0.35) + 0.18);
    }
    return "#d8d9d2";
  }

  function drawAxes() {
    const center = latentToPixel(0, 0);
    latentCtx.save();
    latentCtx.strokeStyle = "rgba(25, 23, 20, 0.18)";
    latentCtx.lineWidth = 1;
    latentCtx.beginPath();
    latentCtx.moveTo(center.x, 0);
    latentCtx.lineTo(center.x, latentCanvas.height);
    latentCtx.moveTo(0, center.y);
    latentCtx.lineTo(latentCanvas.width, center.y);
    latentCtx.stroke();

    latentCtx.strokeStyle = "rgba(25, 23, 20, 0.09)";
    for (let tick = -2; tick <= 2; tick += 1) {
      if (tick === 0) continue;
      const vertical = latentToPixel(tick, 0).x;
      const horizontal = latentToPixel(0, tick).y;
      latentCtx.beginPath();
      latentCtx.moveTo(vertical, 0);
      latentCtx.lineTo(vertical, latentCanvas.height);
      latentCtx.moveTo(0, horizontal);
      latentCtx.lineTo(latentCanvas.width, horizontal);
      latentCtx.stroke();
    }
    latentCtx.restore();
  }

  function drawTrainingPoints() {
    const points = state.mode === "withKL"
      ? state.trainingPoints.withKL
      : state.trainingPoints.withoutKL;

    latentCtx.save();
    points.forEach((point) => {
      const pixel = latentToPixel(point.z1, point.z2);
      latentCtx.beginPath();
      latentCtx.arc(pixel.x, pixel.y, 3.4, 0, Math.PI * 2);
      latentCtx.fillStyle = point.color || "rgba(29, 37, 40, 0.72)";
      latentCtx.fill();
      latentCtx.strokeStyle = "rgba(251, 248, 242, 0.82)";
      latentCtx.lineWidth = 1;
      latentCtx.stroke();
    });
    latentCtx.restore();
  }

  function drawSampleCloud() {
    if (!state.sampleCloud.length) return;

    latentCtx.save();
    state.sampleCloud.forEach((point, index) => {
      const pixel = latentToPixel(point.z1, point.z2);
      const alpha = 0.28 + (index + 1) / state.sampleCloud.length * 0.42;
      latentCtx.beginPath();
      latentCtx.arc(pixel.x, pixel.y, 4.5, 0, Math.PI * 2);
      latentCtx.fillStyle = `rgba(184, 107, 44, ${alpha})`;
      latentCtx.fill();
      latentCtx.strokeStyle = "rgba(255, 255, 255, 0.78)";
      latentCtx.lineWidth = 1;
      latentCtx.stroke();
    });
    latentCtx.restore();
  }

  function drawGuidedPath() {
    latentCtx.save();
    latentCtx.lineWidth = 4;
    latentCtx.lineCap = "round";
    latentCtx.lineJoin = "round";
    latentCtx.strokeStyle = "rgba(49, 95, 140, 0.72)";
    latentCtx.beginPath();
    guidedPath.map(checkpointPoint).forEach((point, index) => {
      const pixel = latentToPixel(point.z1, point.z2);
      if (index === 0) {
        latentCtx.moveTo(pixel.x, pixel.y);
      } else {
        latentCtx.lineTo(pixel.x, pixel.y);
      }
    });
    latentCtx.stroke();

    guidedPath.map(checkpointPoint).forEach((point, index) => {
      const pixel = latentToPixel(point.z1, point.z2);
      latentCtx.beginPath();
      latentCtx.arc(pixel.x, pixel.y, 7, 0, Math.PI * 2);
      latentCtx.fillStyle = "#ffffff";
      latentCtx.fill();
      latentCtx.strokeStyle = "rgba(49, 95, 140, 0.9)";
      latentCtx.lineWidth = 2;
      latentCtx.stroke();
      latentCtx.fillStyle = "#315f8c";
      latentCtx.font = "800 10px Inter, system-ui, sans-serif";
      latentCtx.textAlign = "center";
      latentCtx.textBaseline = "middle";
      latentCtx.fillText(String(index + 1), pixel.x, pixel.y);
    });
    latentCtx.restore();
  }

  function drawTrail() {
    if (state.trail.length < 2) return;

    latentCtx.save();
    state.trail.forEach((point, index) => {
      const pixel = latentToPixel(point.z1, point.z2);
      const alpha = (index + 1) / state.trail.length;
      latentCtx.beginPath();
      latentCtx.arc(pixel.x, pixel.y, 2 + alpha * 2, 0, Math.PI * 2);
      latentCtx.fillStyle = `rgba(200, 111, 74, ${0.08 + alpha * 0.3})`;
      latentCtx.fill();
    });
    latentCtx.restore();
  }

  function drawCursor() {
    drawMarker(state.currentZ, "#a94f3d", 9, state.isPointerInside || !state.pinnedZ);
    if (state.pinnedZ) {
      drawMarker(state.pinnedZ, "#1d2528", 7, true);
    }
  }

  function drawMarker(point, color, radius, emphasized) {
    const pixel = latentToPixel(point.z1, point.z2);
    latentCtx.save();
    latentCtx.lineWidth = emphasized ? 3 : 2;
    latentCtx.strokeStyle = color;
    latentCtx.fillStyle = "rgba(255, 255, 255, 0.88)";
    latentCtx.beginPath();
    latentCtx.arc(pixel.x, pixel.y, radius, 0, Math.PI * 2);
    latentCtx.fill();
    latentCtx.stroke();
    latentCtx.beginPath();
    latentCtx.moveTo(pixel.x - radius - 4, pixel.y);
    latentCtx.lineTo(pixel.x + radius + 4, pixel.y);
    latentCtx.moveTo(pixel.x, pixel.y - radius - 4);
    latentCtx.lineTo(pixel.x, pixel.y + radius + 4);
    latentCtx.stroke();
    latentCtx.restore();
  }

  function setupThreeScene() {
    if (state.three.ready || !window.THREE || !latentCanvas3d) return;

    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({
      canvas: latentCanvas3d,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xf7f7f4, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(4.6, 3.6, 6.2);
    camera.lookAt(0, 0, 0);

    const root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(3, 5, 4);
    scene.add(light);

    state.three = {
      ...state.three,
      ready: true,
      scene,
      camera,
      renderer,
      root
    };

    resizeThreeScene();
    updateThreeScene();
    animateThreeScene();
  }

  function resizeThreeScene() {
    if (!state.three.ready) return;
    const rect = latentCanvas3d.getBoundingClientRect();
    const size = Math.max(1, Math.round(rect.width || latentCanvas3d.clientWidth || latentCanvas3d.width));
    state.three.renderer.setSize(size, size, false);
    state.three.camera.aspect = 1;
    state.three.camera.updateProjectionMatrix();
  }

  function animateThreeScene() {
    if (!state.three.ready) return;
    state.three.angle += 0.004;
    if (state.viewDimension === "3d") {
      state.three.root.rotation.y = state.three.angle;
      state.three.renderer.render(state.three.scene, state.three.camera);
    }
    state.three.animationFrame = requestAnimationFrame(animateThreeScene);
  }

  function updateThreeScene() {
    if (!state.three.ready) return;

    const THREE = window.THREE;
    const root = state.three.root;
    while (root.children.length) {
      const child = root.children[0];
      root.remove(child);
      disposeThreeObject(child);
    }

    addThreeAxes(root);
    addThreePrior(root);
    inputExamples.forEach((example, index) => addThreePosterior(root, example, index === state.selectedInput));
    const points = state.mode === "withKL" ? state.trainingPoints.withKL : state.trainingPoints.withoutKL;
    points.forEach((point) => addThreePoint(root, point, point.color, 0.045, 0.76));
    state.sampleCloud.forEach((point) => addThreePoint(root, point, "#b86b2c", 0.065, 0.9));

    addThreePath(root);
    addThreePoint(root, state.currentZ, "#a94f3d", 0.11, 1);

    const current = new THREE.Vector3(state.currentZ.z1, state.currentZ.z2, state.currentZ.z3);
    const marker = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(current.x - 0.22, current.y, current.z),
        new THREE.Vector3(current.x + 0.22, current.y, current.z),
        new THREE.Vector3(current.x, current.y - 0.22, current.z),
        new THREE.Vector3(current.x, current.y + 0.22, current.z),
        new THREE.Vector3(current.x, current.y, current.z - 0.22),
        new THREE.Vector3(current.x, current.y, current.z + 0.22)
      ]),
      new THREE.LineBasicMaterial({ color: 0xa94f3d })
    );
    root.add(marker);

    state.three.renderer.render(state.three.scene, state.three.camera);
  }

  function addThreePrior(root) {
    const THREE = window.THREE;
    [1, 2].forEach((radius, index) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 18),
        new THREE.MeshBasicMaterial({
          color: 0x2f7d5c,
          wireframe: true,
          transparent: true,
          opacity: index === 0 ? 0.2 : 0.12
        })
      );
      root.add(mesh);
    });
  }

  function addThreeAxes(root) {
    const THREE = window.THREE;
    const material = new THREE.LineBasicMaterial({ color: 0x8d969a, transparent: true, opacity: 0.55 });
    const points = [
      new THREE.Vector3(-latentRange, 0, 0), new THREE.Vector3(latentRange, 0, 0),
      new THREE.Vector3(0, -latentRange, 0), new THREE.Vector3(0, latentRange, 0),
      new THREE.Vector3(0, 0, -latentRange), new THREE.Vector3(0, 0, latentRange)
    ];
    root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  function addThreePosterior(root, example, selected) {
    const THREE = window.THREE;
    const encoder = encoderForExample(example, state.mode);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 28, 16),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(example.color),
        wireframe: true,
        transparent: true,
        opacity: selected ? 0.52 : 0.26
      })
    );
    mesh.position.set(encoder.mu[0], encoder.mu[1], encoder.mu[2]);
    mesh.scale.set(encoder.sigma[0] * 2, encoder.sigma[1] * 2, encoder.sigma[2] * 2);
    root.add(mesh);
    addThreePoint(root, { z1: encoder.mu[0], z2: encoder.mu[1], z3: encoder.mu[2] }, example.color, selected ? 0.09 : 0.07, 1);
  }

  function addThreePoint(root, point, color, radius, opacity) {
    const THREE = window.THREE;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 16, 10),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity
      })
    );
    mesh.position.set(point.z1, point.z2, point.z3 || 0);
    root.add(mesh);
  }

  function addThreePath(root) {
    const THREE = window.THREE;
    const points = guidedPath.map(checkpointPoint).map((point) => new THREE.Vector3(point.z1, point.z2, point.z3 || 0));
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0x315f8c, transparent: true, opacity: 0.9 })
    );
    root.add(line);
    guidedPath.map(checkpointPoint).forEach((point) => addThreePoint(root, point, "#315f8c", 0.075, 1));
  }

  function disposeThreeObject(object) {
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  function renderPreview(ctx, decoded) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawPreviewBackground(ctx, decoded);

    if (!decoded.valid) {
      if (ctx.canvas.id === "previewCanvas") {
        setPreviewImageStack(null);
      }
      renderInvalid(ctx, decoded);
      return;
    }

    if (decoded.kind === "image") {
      if (ctx.canvas.id === "previewCanvas") {
        setPreviewImageStack(decoded);
      }
      renderImageDecode(ctx, decoded);
      return;
    }

    if (ctx.canvas.id === "previewCanvas") {
      setPreviewImageStack(null);
    }
    if (decoded.region === "transition") {
      renderTransition(ctx, decoded);
      return;
    }

    renderGlyph(ctx, decoded);
  }

  function renderInputExample(ctx) {
    const example = inputExamples[state.selectedInput];
    const encoder = encoderForExample(example, state.mode);
    selectedInputValue.innerHTML = state.mode === "withKL"
      ? `<span class="math">q(z|x)</span>: center ${formatVector(encoder.mu)}, spread ${formatVector(encoder.sigma)}`
      : `no-KL posterior: tight center ${formatVector(encoder.mu)}, spread ${formatVector(encoder.sigma)}`;
    renderInputAsset(ctx, example, state.selectedInput);
  }

  function renderInputAsset(ctx, example, imageIndex) {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = "#fffaf2";
    roundRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, Math.max(8, Math.min(canvas.width, canvas.height) * 0.06));
    ctx.fill();
    ctx.strokeStyle = "rgba(25, 23, 20, 0.08)";
    ctx.stroke();
    clipRoundRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, Math.max(8, Math.min(canvas.width, canvas.height) * 0.05));
    drawImageCover(ctx, state.images[imageIndex], 12, 12, canvas.width - 24, canvas.height - 24);
    ctx.restore();
  }

  function renderSampleStrip() {
    if (!sampleStrip.dataset.ready) {
      for (let i = 0; i < 5; i += 1) {
        const item = document.createElement("div");
        item.className = "strip-sample";
        const canvas = document.createElement("canvas");
        canvas.width = 260;
        canvas.height = 260;
        const label = document.createElement("p");
        item.append(canvas, label);
        sampleStrip.appendChild(item);
      }
      sampleStrip.dataset.ready = "true";
    }

    Array.from(sampleStrip.children).forEach((item, index) => {
      const t = index / 4;
      const point = interpolateGuidedPath(t);
      const decoded = getDecoded(point.z1, point.z2);
      const canvas = item.querySelector("canvas");
      const label = item.querySelector("p");
      renderPreview(canvas.getContext("2d"), decoded);
      label.innerHTML = `<span class="math">z = (${format(point.z1)}, ${format(point.z2)})</span> ${decoded.region}`;
    });
  }

  function updateObservation(decoded) {
    if (state.mode === "withKL") {
      observationText.textContent = decoded.valid
        ? "Interpolation passes through prior-shaped space, so in-between points should still decode."
        : "The VAE should remain sampleable near the high-density prior mass.";
      return;
    }
    if (decoded.region === "gap") {
      observationText.textContent = "No-KL can reconstruct near islands, but interpolation through unused gaps breaks.";
    } else if (decoded.region === "transition") {
      observationText.textContent = "This transition is the point of the test: the in-between space was not learned cleanly.";
    } else {
      observationText.textContent = "Near a posterior island, no-KL can still reconstruct; the failure is between islands.";
    }
  }

  function setPreviewImageStack(decoded) {
    if (!previewImageStack) return;
    previewImageStack.textContent = "";

    if (!decoded || decoded.region === "gap" || decoded.region === "transition") {
      previewImageStack.classList.remove("active");
      return;
    }

    const layers = decoded.weights
      ? decoded.weights.filter((weight) => weight.alpha > 0.01)
      : [{ index: decoded.imageIndex, alpha: 1 }];

    layers.forEach((layer) => {
      const image = document.createElement("img");
      image.src = inputExamples[layer.index].imageSrc;
      image.alt = "";
      image.style.opacity = String(layer.alpha);
      previewImageStack.appendChild(image);
    });
    previewImageStack.classList.add("active");
  }

  function renderImageDecode(ctx, decoded) {
    const canvas = ctx.canvas;
    const size = Math.min(canvas.width, canvas.height);
    const box = size * 0.74;
    const x = (canvas.width - box) / 2;
    const y = (canvas.height - box) / 2;

    ctx.save();
    if (decoded.weights) {
      decoded.weights.forEach((weight) => {
        if (weight.alpha <= 0.01) return;
        ctx.globalAlpha = weight.alpha;
        drawImageCover(ctx, state.images[weight.index], x, y, box, box);
      });
      ctx.globalAlpha = 1;
    } else {
      drawImageCover(ctx, state.images[decoded.imageIndex], x, y, box, box);
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(21, 32, 43, 0.16)";
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, box, box, Math.max(12, box * 0.08));
    ctx.stroke();
    ctx.restore();

    if (decoded.region === "transition") {
      drawImageGlitch(ctx, decoded);
    }

  }

  function drawImageGlitch(ctx, decoded) {
    const rng = mulberry32(Math.floor((decoded.seed + 4) * 10000));
    const canvas = ctx.canvas;
    ctx.save();
    ctx.globalAlpha = 0.3 + decoded.instability * 0.35;
    ctx.fillStyle = "rgba(178, 48, 58, 0.5)";
    for (let i = 0; i < 12; i += 1) {
      const y = 36 + rng() * (canvas.height - 72);
      const h = 4 + rng() * 10;
      const x = 24 + rng() * 54;
      ctx.fillRect(x, y, canvas.width - x * 2, h);
    }

    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = "rgba(21, 32, 43, 0.32)";
    ctx.lineWidth = 3;
    for (let x = -canvas.height; x < canvas.width; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - 28);
      ctx.lineTo(x + canvas.height, 28);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 220; i += 1) {
      ctx.fillRect(rng() * canvas.width, rng() * canvas.height, 1 + rng() * 2, 1 + rng() * 2);
    }
    ctx.restore();
  }

  function drawPreviewBackground(ctx, decoded) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const inset = Math.max(6, width * 0.038);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (decoded.region === "gap") {
      gradient.addColorStop(0, "#f4f4ef");
      gradient.addColorStop(1, "#deded8");
    } else if (decoded.region === "transition") {
      gradient.addColorStop(0, "#fff5f5");
      gradient.addColorStop(1, "#f0d0d2");
    } else if (decoded.region === "island") {
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#f4eeee");
    } else {
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#eeeeea");
    }
    ctx.fillStyle = gradient;
    roundRect(ctx, inset, inset, width - inset * 2, height - inset * 2, width * 0.062);
    ctx.fill();
  }

  function renderGlyph(ctx, decoded, center) {
    const origin = center || ctx.canvas.width / 2;
    ctx.save();
    ctx.translate(origin, origin);
    ctx.rotate(decoded.rotation);
    ctx.lineWidth = decoded.stroke;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = decoded.color || "#24353a";
    ctx.fillStyle = decoded.fill || "rgba(47, 125, 92, 0.14)";

    if (isObjectFamily(decoded.family)) {
      drawObjectGlyph(ctx, decoded);
      ctx.restore();
      return;
    }

    if (decoded.family === "triangle") {
      drawTriangle(ctx, decoded);
    } else if (decoded.family === "square") {
      roundRect(ctx, -decoded.width / 2, -decoded.height / 2, decoded.width, decoded.height, decoded.roundness * 18);
      ctx.fill();
      ctx.stroke();
    } else if (decoded.family === "ring") {
      drawOval(ctx, decoded);
      ctx.globalCompositeOperation = "destination-out";
      drawEllipsePath(ctx, 0, 0, decoded.width * 0.26, decoded.height * 0.26);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      drawEllipsePath(ctx, 0, 0, decoded.width * 0.26, decoded.height * 0.26);
      ctx.stroke();
    } else if (decoded.family === "stroke") {
      drawStrokeGlyph(ctx, decoded);
    } else {
      drawOval(ctx, decoded);
    }

    if (decoded.hole > 0.34 && decoded.family !== "ring" && decoded.family !== "stroke" && decoded.family !== "triangle") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      drawEllipsePath(ctx, 2, -2, decoded.width * decoded.hole * 0.16, decoded.height * decoded.hole * 0.18);
      ctx.fill();
      ctx.restore();
      drawEllipsePath(ctx, 2, -2, decoded.width * decoded.hole * 0.16, decoded.height * decoded.hole * 0.18);
      ctx.stroke();
    }

    if (decoded.tail > 0.35) {
      ctx.beginPath();
      ctx.moveTo(decoded.width * 0.18, decoded.height * 0.26);
      ctx.quadraticCurveTo(decoded.width * 0.5, decoded.height * 0.5, decoded.width * (0.3 + decoded.tail * 0.28), decoded.height * 0.74);
      ctx.stroke();
    }

    ctx.restore();
  }

  function isObjectFamily(family) {
    return ["shoe", "mug", "leaf", "chair", "bottle", "lamp"].includes(family);
  }

  function renderTransition(ctx, decoded) {
    ctx.save();
    ctx.globalAlpha = 0.82;
    renderGlyph(ctx, { ...decoded, rotation: decoded.rotation + 0.22, width: decoded.width * 0.95, height: decoded.height * 1.12 });
    ctx.globalAlpha = 0.38;
    renderGlyph(ctx, { ...decoded, rotation: decoded.rotation - 0.42, width: decoded.width * 1.18, height: decoded.height * 0.82, color: "#a66422" });
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(166, 100, 34, 0.36)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      const y = 72 + i * 26 + Math.sin(decoded.instability * 10 + i) * 7;
      ctx.beginPath();
      ctx.moveTo(56, y);
      ctx.bezierCurveTo(96, y - 18, 156, y + 18, 204, y - 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderInvalid(ctx, decoded) {
    const rng = mulberry32(Math.floor((decoded.seed + 10) * 10000));
    ctx.save();
    ctx.fillStyle = "#d7ddda";
    roundRect(ctx, 62, 72, 136, 116, 14);
    ctx.fill();

    for (let i = 0; i < 180; i += 1) {
      const value = Math.floor(130 + rng() * 86);
      ctx.fillStyle = `rgba(${value}, ${value + 2}, ${value}, ${0.12 + rng() * 0.22})`;
      ctx.fillRect(48 + rng() * 164, 50 + rng() * 160, 1 + rng() * 3, 1 + rng() * 3);
    }

    ctx.strokeStyle = "rgba(95, 104, 104, 0.55)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(84, 90);
    ctx.lineTo(178, 170);
    ctx.moveTo(178, 90);
    ctx.lineTo(84, 170);
    ctx.stroke();
    ctx.restore();
  }

  function drawOval(ctx, decoded) {
    drawEllipsePath(ctx, 0, 0, decoded.width / 2, decoded.height / 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawTriangle(ctx, decoded) {
    const w = decoded.width;
    const h = decoded.height;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(-w / 2, h / 2 - decoded.roundness * 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawStrokeGlyph(ctx, decoded) {
    ctx.beginPath();
    ctx.moveTo(-decoded.width * 0.35, -decoded.height * 0.32);
    ctx.bezierCurveTo(decoded.width * 0.15, -decoded.height * 0.58, decoded.width * 0.44, -decoded.height * 0.08, decoded.width * 0.1, decoded.height * 0.08);
    ctx.bezierCurveTo(-decoded.width * 0.28, decoded.height * 0.3, -decoded.width * 0.18, decoded.height * 0.55, decoded.width * 0.38, decoded.height * 0.38);
    ctx.stroke();
  }

  function drawObjectGlyph(ctx, decoded) {
    if (decoded.family === "shoe") {
      drawShoe(ctx, decoded);
    } else if (decoded.family === "mug") {
      drawMug(ctx, decoded);
    } else if (decoded.family === "leaf") {
      drawLeaf(ctx, decoded);
    } else if (decoded.family === "chair") {
      drawChair(ctx, decoded);
    } else if (decoded.family === "bottle") {
      drawBottle(ctx, decoded);
    } else {
      drawLamp(ctx, decoded);
    }
  }

  function drawShoe(ctx, decoded) {
    const w = decoded.width;
    const h = decoded.height;
    ctx.beginPath();
    ctx.moveTo(-w * 0.48, h * 0.12);
    ctx.bezierCurveTo(-w * 0.34, -h * 0.28, -w * 0.05, -h * 0.34, w * 0.18, -h * 0.08);
    ctx.bezierCurveTo(w * 0.32, h * 0.08, w * 0.48, h * 0.07, w * 0.54, h * 0.26);
    ctx.lineTo(-w * 0.48, h * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-w * 0.5, h * 0.32);
    ctx.lineTo(w * 0.55, h * 0.32);
    ctx.stroke();

    for (let i = 0; i < 3; i += 1) {
      const x = -w * 0.12 + i * w * 0.12;
      ctx.beginPath();
      ctx.moveTo(x, -h * 0.02);
      ctx.lineTo(x + w * 0.08, h * 0.08);
      ctx.stroke();
    }
  }

  function drawMug(ctx, decoded) {
    const w = decoded.width * 0.78;
    const h = decoded.height;
    roundRect(ctx, -w * 0.44, -h * 0.38, w * 0.72, h * 0.72, decoded.roundness * 16);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(w * 0.36, -h * 0.03, w * 0.22, h * 0.24, 0, -Math.PI * 0.55, Math.PI * 0.55);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-w * 0.28, -h * 0.14);
    ctx.lineTo(w * 0.08, -h * 0.08);
    ctx.stroke();
  }

  function drawLeaf(ctx, decoded) {
    const w = decoded.width;
    const h = decoded.height;
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.48);
    ctx.bezierCurveTo(w * 0.44, -h * 0.22, w * 0.42, h * 0.3, 0, h * 0.48);
    ctx.bezierCurveTo(-w * 0.42, h * 0.3, -w * 0.44, -h * 0.22, 0, -h * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -h * 0.34);
    ctx.quadraticCurveTo(-w * 0.02, h * 0.04, w * 0.12, h * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-w * 0.08, h * 0.1);
    ctx.lineTo(-w * 0.26, h * 0.02);
    ctx.moveTo(w * 0.06, h * 0.2);
    ctx.lineTo(w * 0.25, h * 0.08);
    ctx.stroke();
  }

  function drawChair(ctx, decoded) {
    const w = decoded.width;
    const h = decoded.height;
    roundRect(ctx, -w * 0.34, -h * 0.44, w * 0.56, h * 0.5, decoded.roundness * 10);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-w * 0.42, h * 0.08);
    ctx.lineTo(w * 0.34, h * 0.08);
    ctx.lineTo(w * 0.24, h * 0.24);
    ctx.lineTo(-w * 0.36, h * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-w * 0.28, h * 0.24);
    ctx.lineTo(-w * 0.36, h * 0.48);
    ctx.moveTo(w * 0.18, h * 0.24);
    ctx.lineTo(w * 0.28, h * 0.48);
    ctx.stroke();
  }

  function drawBottle(ctx, decoded) {
    const w = decoded.width * 0.7;
    const h = decoded.height;
    roundRect(ctx, -w * 0.18, -h * 0.5, w * 0.36, h * 0.28, 5);
    ctx.fill();
    ctx.stroke();
    roundRect(ctx, -w * 0.34, -h * 0.22, w * 0.68, h * 0.7, decoded.roundness * 15);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w * 0.18, -h * 0.02);
    ctx.lineTo(w * 0.18, -h * 0.02);
    ctx.stroke();
  }

  function drawLamp(ctx, decoded) {
    const w = decoded.width;
    const h = decoded.height;
    ctx.beginPath();
    ctx.moveTo(-w * 0.36, -h * 0.28);
    ctx.lineTo(w * 0.36, -h * 0.28);
    ctx.lineTo(w * 0.24, h * 0.06);
    ctx.lineTo(-w * 0.24, h * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, h * 0.06);
    ctx.lineTo(0, h * 0.42);
    ctx.moveTo(-w * 0.28, h * 0.42);
    ctx.lineTo(w * 0.28, h * 0.42);
    ctx.stroke();
  }

  function drawEllipsePath(ctx, x, y, radiusX, radiusY) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(1, radiusX), Math.max(1, radiusY), 0, 0, Math.PI * 2);
  }

  function decodeWithKL(z1, z2) {
    const quality = Math.exp(-0.5 * (z1 * z1 + z2 * z2));
    const weights = imageBlendWeights(z1, z2, 1.15);

    return {
      valid: true,
      region: "smooth",
      kind: "image",
      weights,
      quality,
      rotation: 0
    };
  }

  function decodeWithoutKL(z1, z2) {
    const nearest = nearestIsland(z1, z2);
    const island = nearest.island;
    const d = nearest.distance;
    const dx = z1 - island.center[0];
    const dy = z2 - island.center[1];

    if (d >= 1) {
      return {
        valid: false,
        region: "gap",
        family: "invalid",
        instability: 1,
        seed: Math.abs(z1 * 17.7 + z2 * 31.3)
      };
    }

    const transition = d >= 0.65;
    const local = clamp(d / 0.65, 0, 1);

    return {
      valid: true,
      region: transition ? "transition" : "island",
      kind: "image",
      imageIndex: island.imageIndex,
      quality: 1 - local * 0.45,
      instability: transition ? (d - 0.65) / 0.35 : 0,
      rotation: 0,
      seed: Math.abs(z1 * 17.7 + z2 * 31.3)
    };
  }

  function encoderForExample(example, mode) {
    if (mode === "withKL") {
      return {
        mu: [example.z1, example.z2, example.z3],
        sigma: example.sigma
      };
    }

    return {
      mu: example.noKl,
      sigma: [0.04, 0.04, 0.04]
    };
  }

  function sampleFromEncoder(encoder, rng) {
    const e1 = randn(rng);
    const e2 = randn(rng);
    const e3 = randn(rng);
    return {
      e1,
      e2,
      e3,
      z1: encoder.mu[0] + encoder.sigma[0] * e1,
      z2: encoder.mu[1] + encoder.sigma[1] * e2,
      z3: encoder.mu[2] + encoder.sigma[2] * e3
    };
  }

  function addSampleCloudPoint(point) {
    state.sampleCloud.push(point);
    if (state.sampleCloud.length > sampleCloudSize) {
      state.sampleCloud.shift();
    }
  }

  function imageBlendWeights(z1, z2, temperature) {
    const raw = inputExamples.map((example, index) => {
      const d2 = (z1 - example.z1) ** 2 + (z2 - example.z2) ** 2;
      return { index, value: Math.exp(-d2 / temperature) };
    });
    const total = raw.reduce((sum, weight) => sum + weight.value, 0) || 1;
    return raw
      .map((weight) => ({ index: weight.index, alpha: weight.value / total }))
      .sort((a, b) => a.alpha - b.alpha);
  }

  function nearestTrainingPoint(z1, z2) {
    const points = state.mode === "withKL"
      ? state.trainingPoints.withKL
      : state.trainingPoints.withoutKL;
    let nearest = points[0];
    let bestDistance = Infinity;
    points.forEach((point) => {
      const d = distance([z1, z2], [point.z1, point.z2]);
      if (d < bestDistance) {
        nearest = point;
        bestDistance = d;
      }
    });
    return nearest;
  }

  function getDecoded(z1, z2) {
    return state.mode === "withKL" ? decodeWithKL(z1, z2) : decodeWithoutKL(z1, z2);
  }

  function eventToLatent(event) {
    const rect = latentCanvas.getBoundingClientRect();
    const scaleX = latentCanvas.width / rect.width;
    const scaleY = latentCanvas.height / rect.height;
    return pixelToLatent((event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY);
  }

  function eventToLatent3d(event) {
    if (!state.three.ready || !window.THREE) return null;
    const THREE = window.THREE;
    const rect = latentCanvas3d.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, state.three.camera);

    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(state.three.root.quaternion).normalize();
    const planePoint = new THREE.Vector3(0, 0, state.currentZ.z3 || 0).applyMatrix4(state.three.root.matrixWorld);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, planePoint);
    const hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(plane, hit)) return null;

    const local = state.three.root.worldToLocal(hit.clone());
    return {
      z1: clamp(local.x, -latentRange, latentRange),
      z2: clamp(local.y, -latentRange, latentRange),
      z3: clamp(local.z, -latentRange, latentRange)
    };
  }

  function pixelToLatent(px, py) {
    return {
      z1: (px / latentCanvas.width) * latentRange * 2 - latentRange,
      z2: latentRange - (py / latentCanvas.height) * latentRange * 2
    };
  }

  function latentToPixel(z1, z2) {
    return {
      x: ((z1 + latentRange) / (latentRange * 2)) * latentCanvas.width,
      y: ((latentRange - z2) / (latentRange * 2)) * latentCanvas.height
    };
  }

  function nearestIsland(z1, z2) {
    let nearest = null;
    islands.forEach((island) => {
      const d = distance([z1, z2], island.center);
      if (!nearest || d < nearest.distance) {
        nearest = { island, distance: d };
      }
    });
    return nearest;
  }

  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  function distance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }

  function format(value) {
    return value.toFixed(2);
  }

  function formatVector(values) {
    return `(${values.map((value) => format(value)).join(", ")})`;
  }

  function mathify(text) {
    return text
      .replace(/q\(z\s*\|\s*x\)/g, `<span class="math">q(z|x)</span>`)
      .replaceAll("N(0, I)", `<span class="math">N(0, I)</span>`);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function clipRoundRect(ctx, x, y, width, height, radius) {
    roundRect(ctx, x, y, width, height, radius);
    ctx.clip();
  }

  function drawImageCover(ctx, image, x, y, width, height) {
    if (!image) {
      ctx.fillStyle = "#e3e6e4";
      ctx.fillRect(x, y, width, height);
      return;
    }

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = width / height;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > boxRatio) {
      sourceWidth = image.naturalHeight * boxRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / boxRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  }

  function mulberry32(seed) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function randn(rng) {
    const u = 1 - rng();
    const v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function mixHex(hexA, hexB, amount) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const t = clamp(amount, 0, 1);
    return `rgb(${Math.round(lerp(a.r, b.r, t))}, ${Math.round(lerp(a.g, b.g, t))}, ${Math.round(lerp(a.b, b.b, t))})`;
  }

  function mixHexWithAlpha(hex, alpha) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const value = parseInt(clean, 16);
    return {
      r: value >> 16 & 255,
      g: value >> 8 & 255,
      b: value & 255
    };
  }

  init();
})();
