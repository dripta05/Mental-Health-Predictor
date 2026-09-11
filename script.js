(() => {
  "use strict";

  const API_BASE = "https://mental-health-predictor-7w4y.onrender.com";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     STARFIELD — a quiet, drifting canvas of twinkling stars
     ========================================================= */
  (function starfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    }

    function buildStars() {
      const count = Math.round((w * h) / 9000);
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.3 + 0.3,
        base: Math.random() * 0.5 + 0.35,
        speed: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.0025,
      }));
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.drift * 0.02;
        if (s.x > 1) s.x -= 1;
        if (s.x < 0) s.x += 1;
        const twinkle = prefersReducedMotion ? s.base : s.base + Math.sin(t * 0.001 * s.speed + s.phase) * 0.35;
        ctx.globalAlpha = Math.max(0, Math.min(1, twinkle));
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);
    if (prefersReducedMotion) draw(0); // single static frame
  })();

  /* =========================================================
     FORM WIRING
     ========================================================= */
  const form = document.getElementById("predict-form");
  const submitBtn = document.getElementById("submit-btn");
  const resetBtn = document.getElementById("reset-btn");
  const errorRetryBtn = document.getElementById("error-retry-btn");

  const stateIdle = document.getElementById("state-idle");
  const stateLoading = document.getElementById("state-loading");
  const stateResult = document.getElementById("state-result");
  const stateError = document.getElementById("state-error");

  const scoreNumberEl = document.getElementById("score-number");
  const scoreBandEl = document.getElementById("score-band");
  const scoreContextEl = document.getElementById("score-context");
  const gaugeFill = document.getElementById("gauge-fill");
  const gaugeNeedle = document.getElementById("gauge-needle");
  const errorLabelEl = document.getElementById("error-label");
  const errorCopyEl = document.getElementById("error-copy");
  const resultPanel = document.querySelector(".result-panel");
  const sparklesEl = document.getElementById("sparkles");

  const GAUGE_ARC_LENGTH = 314;

  function drawTicks() {
    document.querySelectorAll(".gauge-ticks").forEach((g) => {
      g.innerHTML = "";
      const cx = 120, cy = 140, rOuter = 100, rInner = 90;
      for (let i = 0; i <= 10; i += 2) {
        const angle = Math.PI - (i / 10) * Math.PI;
        const x1 = cx + rOuter * Math.cos(angle);
        const y1 = cy - rOuter * Math.sin(angle);
        const x2 = cx + rInner * Math.cos(angle);
        const y2 = cy - rInner * Math.sin(angle);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1.toFixed(1));
        line.setAttribute("y1", y1.toFixed(1));
        line.setAttribute("x2", x2.toFixed(1));
        line.setAttribute("y2", y2.toFixed(1));
        g.appendChild(line);
      }
    });
  }
  drawTicks();

  /* ---- slider fill + live value labels ---- */
  const SLIDERS = ["sleep_hours_per_night", "study_hours", "physical_activity_hours", "avg_daily_usage_hours"];
  function updateSliderFill(input) {
    const min = parseFloat(input.min), max = parseFloat(input.max), val = parseFloat(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(to right, var(--purple) ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
    const out = document.getElementById(`${input.id}-value`);
    if (out) out.textContent = `${val.toFixed(1)} hrs`;
  }
  SLIDERS.forEach((id) => {
    const el = document.getElementById(id);
    updateSliderFill(el);
    el.addEventListener("input", () => updateSliderFill(el));
  });

  function fieldWrapper(input) { return input.closest(".field"); }

  function setFieldError(input, message) {
    const wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.remove("field-error");
    void wrap.offsetWidth;
    wrap.classList.add("field-error");
    const msgEl = wrap.querySelector(".error-msg");
    if (msgEl) msgEl.textContent = message;
  }

  function clearFieldError(input) {
    const wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.remove("field-error");
    const msgEl = wrap.querySelector(".error-msg");
    if (msgEl) msgEl.textContent = "";
  }

  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("field-error"));
    form.querySelectorAll(".error-msg").forEach((m) => (m.textContent = ""));
  }

  function validate(payload) {
    const errors = [];
    const numericChecks = [
      ["age", 10, 100],
      ["avg_daily_usage_hours", 0, 24],
      ["daily_unlocks", 0, Infinity],
      ["study_hours", 0, 24],
      ["physical_activity_hours", 0, 24],
      ["sleep_hours_per_night", 0, 24],
    ];
    numericChecks.forEach(([key, min, max]) => {
      const input = document.getElementById(key);
      const val = payload[key];
      if (val === "" || val === null || Number.isNaN(val)) {
        errors.push([input, "This field is required."]);
      } else if (val < min || val > max) {
        errors.push([input, `Must be between ${min} and ${max === Infinity ? "0+" : max}.`]);
      }
    });
    ["gender", "country", "academic_level", "most_used_platform", "purpose_of_use", "stress_level"].forEach((key) => {
      const input = document.getElementById(key);
      if (!payload[key] || String(payload[key]).trim() === "") {
        errors.push([input, "This field is required."]);
      }
    });
    return errors;
  }

  function collectPayload() {
    const fd = new FormData(form);
    return {
      age: fd.get("age") === "" ? NaN : parseInt(fd.get("age"), 10),
      gender: fd.get("gender") || "",
      country: (fd.get("country") || "").trim(),
      academic_level: fd.get("academic_level") || "",
      most_used_platform: fd.get("most_used_platform") || "",
      purpose_of_use: fd.get("purpose_of_use") || "",
      avg_daily_usage_hours: fd.get("avg_daily_usage_hours") === "" ? NaN : parseFloat(fd.get("avg_daily_usage_hours")),
      daily_unlocks: fd.get("daily_unlocks") === "" ? NaN : parseInt(fd.get("daily_unlocks"), 10),
      study_hours: fd.get("study_hours") === "" ? NaN : parseFloat(fd.get("study_hours")),
      physical_activity_hours: fd.get("physical_activity_hours") === "" ? NaN : parseFloat(fd.get("physical_activity_hours")),
      sleep_hours_per_night: fd.get("sleep_hours_per_night") === "" ? NaN : parseFloat(fd.get("sleep_hours_per_night")),
      stress_level: fd.get("stress_level") || "",
    };
  }

  const STATES = { idle: stateIdle, loading: stateLoading, result: stateResult, error: stateError };

  function showState(name) {
    const next = STATES[name];
    const current = Object.values(STATES).find((s) => !s.hidden && s !== next);
    if (current === next) return;

    const revealNext = () => {
      next.hidden = false;
      void next.offsetWidth;
      next.classList.remove("state-out");
      next.classList.add("state-in");
      window.setTimeout(() => next.classList.remove("state-in"), 450);
    };

    if (current) {
      current.classList.add("state-out");
      window.setTimeout(() => {
        current.hidden = true;
        current.classList.remove("state-out");
        revealNext();
      }, prefersReducedMotion ? 0 : 260);
    } else {
      revealNext();
    }
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("loading", isSubmitting);
  }

  function bandFor(score) {
    if (score < 4) {
      return {
        label: "Signal: strained",
        context: "Your responses suggest elevated strain right now. Small shifts in sleep or screen time can go a long way.",
        glow: "rgba(226,104,95,0.4)",
        sparkle: false,
      };
    }
    if (score < 7) {
      return {
        label: "Signal: balanced",
        context: "Your rhythm looks fairly steady, with some room to recover and reset.",
        glow: "rgba(232,179,75,0.35)",
        sparkle: false,
      };
    }
    return {
      label: "Signal: strong",
      context: "Your habits point to a well-supported, resilient baseline. Keep it up.",
      glow: "rgba(87,198,160,0.4)",
      sparkle: true,
    };
  }

  function animateScoreNumber(el, to, duration = 900) {
    if (prefersReducedMotion) {
      el.textContent = to.toFixed(2);
      return;
    }
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(2);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = to.toFixed(2);
    }
    requestAnimationFrame(tick);
  }

  function spawnSparkles(count = 12) {
    sparklesEl.innerHTML = "";
    if (prefersReducedMotion) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = `${8 + Math.random() * 84}%`;
      s.style.top = `${10 + Math.random() * 65}%`;
      s.style.animationDelay = `${Math.random() * 0.7}s`;
      sparklesEl.appendChild(s);
    }
    window.setTimeout(() => { sparklesEl.innerHTML = ""; }, 2800);
  }

  function setNeedle(score) {
    const clamped = Math.max(0, Math.min(10, score));
    const deg = -90 + (clamped / 10) * 180;
    gaugeNeedle.style.transform = `rotate(${deg}deg)`;
  }

  function renderResult(score) {
    const clamped = Math.max(0, Math.min(10, score));
    const { label, context, glow, sparkle } = bandFor(clamped);

    animateScoreNumber(scoreNumberEl, score);
    scoreBandEl.textContent = label;
    scoreContextEl.textContent = context;
    resultPanel.style.setProperty("--glow-color", glow);
    setNeedle(clamped);

    gaugeFill.style.transition = "none";
    gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);
    requestAnimationFrame(() => {
      gaugeFill.style.transition = "";
      const offset = GAUGE_ARC_LENGTH * (1 - clamped / 10);
      gaugeFill.style.strokeDashoffset = String(offset);
    });

    showState("result");
    if (sparkle) window.setTimeout(spawnSparkles, prefersReducedMotion ? 0 : 500);
  }

  function renderError(label, copy) {
    errorLabelEl.textContent = label;
    errorCopyEl.textContent = copy;
    showState("error");
  }

  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return false;
    let matched = false;
    detail.forEach((err) => {
      const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : null;
      const input = field ? document.getElementById(field) : null;
      if (input) {
        setFieldError(input, err.msg || "Invalid value.");
        matched = true;
      }
    });
    return matched;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const payload = collectPayload();
    const clientErrors = validate(payload);

    if (clientErrors.length > 0) {
      clientErrors.forEach(([input, msg]) => input && setFieldError(input, msg));
      clientErrors[0][0]?.focus?.();
      return;
    }

    setSubmitting(true);
    showState("loading");

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 422) {
        const body = await res.json().catch(() => null);
        const matched = body && applyServerValidationErrors(body.detail);
        renderError(
          "Check your inputs",
          matched
            ? "The API rejected a few fields — details are marked on the form."
            : "The API rejected this submission. Please review your inputs and try again."
        );
        return;
      }

      if (!res.ok) {
        let detailMsg = `The API responded with status ${res.status}.`;
        const body = await res.json().catch(() => null);
        if (body && typeof body.detail === "string") detailMsg = body.detail;
        renderError("Prediction failed", detailMsg);
        return;
      }

      const data = await res.json();
      if (typeof data.predicted_mental_health_score !== "number") {
        renderError("Unexpected response", "The API responded, but the score was missing or malformed.");
        return;
      }

      renderResult(data.predicted_mental_health_score);
    } catch (err) {
      renderError(
        "Can't reach the server",
        `Couldn't connect to ${API_BASE}. Make sure the backend is running (uvicorn main:app --reload) and reachable from this page.`
      );
    } finally {
      setSubmitting(false);
    }
  });

  form.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => clearFieldError(el));
    el.addEventListener("change", () => clearFieldError(el));
  });

  resetBtn.addEventListener("click", () => {
    resultPanel.style.setProperty("--glow-color", "rgba(140,126,240,0.4)");
    sparklesEl.innerHTML = "";
    showState("idle");
  });

  errorRetryBtn.addEventListener("click", () => {
    showState("idle");
  });
})();
