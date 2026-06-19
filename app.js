const stages = [
  {
    title: "Prepare",
    goal: "Arrive prepared and ready to lead the conversation.",
    tip: "Review the CV before the call—not during it. Highlight the experience and competencies you want to explore in advance.",
    items: [
      "Reviewed the candidate’s CV before the interview",
      "Identified competencies to assess",
      "Prepared behavioral questions",
      "Reviewed the interview structure and timing"
    ]
  },
  {
    title: "Open",
    goal: "Create a positive first impression and establish expectations.",
    tip: "Every interview is also an opportunity to represent BairesDev. A clear, warm opening builds trust and sets the tone for the conversation.",
    items: [
      "Introduced the company, team, and role",
      "Explained the interview agenda and expectations",
      "Established a professional and welcoming tone"
    ]
  },
  {
    title: "Explore",
    goal: "Gather meaningful information through effective questioning and listening.",
    tip: "Don’t settle for vague answers. Go deeper: ask what the candidate did, why they chose that action, and what changed as a result.",
    items: [
      "Used behavioral questions linked to competencies",
      "Took notes throughout the interview",
      "Avoided interrupting candidate responses",
      "Used follow-up questions to clarify vague answers",
      "Explored outcomes, actions, and lessons learned using follow-up questions"
    ]
  },
  {
    title: "Close",
    goal: "End the interview with engagement, clarity, and professionalism.",
    tip: "Connect what motivates the candidate to the real opportunity, then finish with clear next steps and genuine enthusiasm.",
    items: [
      "Identified candidate motivations",
      "Connected motivations to the opportunity",
      "Explained next steps clearly",
      "Closed the interview with confidence and enthusiasm"
    ]
  }
];

const STORAGE_KEY = "bairesdev-scorecard-draft-v1";
const HISTORY_KEY = "bairesdev-scorecard-history-v1";

const sectionsContainer = document.querySelector("#scorecardSections");
const form = document.querySelector("#scorecardForm");
const scoreValue = document.querySelector("#scoreValue");
const statusPill = document.querySelector("#statusPill");
const statusMessage = document.querySelector("#statusMessage");
const progressBar = document.querySelector("#progressBar");
const progressTrack = document.querySelector("[role='progressbar']");
const candidateName = document.querySelector("#candidateName");
const interviewDate = document.querySelector("#interviewDate");
const desiredPositions = document.querySelector("#desiredPositions");
const wentWell = document.querySelector("#wentWell");
const toImprove = document.querySelector("#toImprove");
const tipDialog = document.querySelector("#tipDialog");
const historyDialog = document.querySelector("#historyDialog");
const completionDialog = document.querySelector("#completionDialog");

function lightbulbIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M8.2 14.5A7 7 0 1 1 15.8 14.5c-.6.5-.8 1.2-.8 1.5H9c0-.3-.2-1-.8-1.5Z"/></svg>`;
}

function checkIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>`;
}

function renderStages() {
  sectionsContainer.innerHTML = stages.map((stage, stageIndex) => `
    <section class="stage-card" aria-labelledby="stage-${stageIndex}-title">
      <div class="stage-top">
        <div class="section-heading">
          <span class="section-number">${stageIndex + 1}</span>
          <div>
            <p class="section-kicker">Stage ${stageIndex + 1}</p>
            <h2 id="stage-${stageIndex}-title">${stage.title}</h2>
          </div>
        </div>
        <div class="stage-actions">
          <span class="stage-points">${stage.items.length} points</span>
          <button class="tip-button" type="button" data-tip-index="${stageIndex}" aria-label="Open SME tip for ${stage.title}" title="SME tip">
            ${lightbulbIcon()}
          </button>
        </div>
      </div>
      <p class="stage-goal"><strong>Goal:</strong> ${stage.goal}</p>
      <div class="checklist">
        ${stage.items.map((item, itemIndex) => {
          const id = `behavior-${stageIndex}-${itemIndex}`;
          return `<div class="check-item">
            <input type="checkbox" id="${id}" name="behavior" value="${id}" data-label="${item}">
            <label for="${id}">
              <span class="checkbox-ui">${checkIcon()}</span>
              <span class="check-label">${item}</span>
            </label>
          </div>`;
        }).join("")}
      </div>
    </section>
  `).join("");
}

function getCheckedIds() {
  return [...document.querySelectorAll("input[name='behavior']:checked")].map(input => input.id);
}

function getResult(score) {
  if (score >= 14) return { label: "Success", className: "success", message: "Excellent—your interview followed a strong structure." };
  if (score >= 10) return { label: "On Track", className: "on-track", message: "Good progress. Focus on the remaining behaviors." };
  return { label: "Needs Improvement", className: "needs-improvement", message: score ? "Keep going—each behavior makes the interview stronger." : "Start checking behaviors as you go." };
}

function updateScore() {
  const score = getCheckedIds().length;
  const result = getResult(score);
  scoreValue.textContent = score;
  statusPill.textContent = result.label;
  statusPill.className = `status-pill ${result.className}`;
  statusMessage.textContent = result.message;
  progressBar.style.width = `${(score / 16) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", score);
  return { score, result };
}

function saveDraft() {
  const draft = {
    candidateName: candidateName.value,
    interviewDate: interviewDate.value,
    desiredPositions: desiredPositions.value,
    checked: getCheckedIds(),
    wentWell: wentWell.value,
    toImprove: toImprove.value,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!draft) {
      interviewDate.value = new Date().toISOString().slice(0, 10);
      return;
    }
    candidateName.value = draft.candidateName || "";
    interviewDate.value = draft.interviewDate || new Date().toISOString().slice(0, 10);
    desiredPositions.value = draft.desiredPositions || "";
    (draft.checked || []).forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) checkbox.checked = true;
    });
    wentWell.value = draft.wentWell || "";
    toImprove.value = draft.toImprove || "";
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateString));
}

function formatInterviewDate(dateString) {
  if (!dateString) return "Date not provided";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(year, month - 1, day));
}

function escapeHTML(value = "") {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function renderHistory() {
  const history = readHistory();
  const historyList = document.querySelector("#historyList");
  if (!history.length) {
    historyList.innerHTML = `<p class="empty-history">No completed interviews yet.</p>`;
    return;
  }
  historyList.innerHTML = history.map(entry => `
    <article class="history-item">
      <strong>${escapeHTML(entry.candidateName || "Unnamed candidate")}</strong>
      <span class="history-position">${escapeHTML(entry.desiredPositions || "Position not provided")}</span>
      <span>${formatInterviewDate(entry.interviewDate)} · Saved ${formatDate(entry.completedAt)}</span>
      <span class="history-result">${escapeHTML(entry.result)}</span>
      <span class="history-score">${entry.score}/16</span>
    </article>
  `).join("");
}

function openTip(stageIndex) {
  const stage = stages[stageIndex];
  document.querySelector("#tipTitle").textContent = `${stage.title}: practical tip`;
  document.querySelector("#tipText").textContent = stage.tip;
  tipDialog.showModal();
}

function resetScorecard() {
  form.reset();
  interviewDate.value = new Date().toISOString().slice(0, 10);
  localStorage.removeItem(STORAGE_KEY);
  updateScore();
  candidateName.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

renderStages();
loadDraft();
updateScore();

form.addEventListener("change", event => {
  if (event.target.matches("input[name='behavior']")) {
    updateScore();
    saveDraft();
  }
});

form.addEventListener("input", event => {
  if (event.target.matches("textarea, input[type='text'], input[type='date']")) saveDraft();
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const { score, result } = updateScore();
  const history = readHistory();
  history.unshift({
    candidateName: candidateName.value.trim(),
    interviewDate: interviewDate.value,
    desiredPositions: desiredPositions.value.trim(),
    score,
    result: result.label,
    checked: getCheckedIds(),
    wentWell: wentWell.value.trim(),
    toImprove: toImprove.value.trim(),
    completedAt: new Date().toISOString()
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  localStorage.removeItem(STORAGE_KEY);
  document.querySelector("#completionScore").textContent = `${score}/16`;
  document.querySelector("#completionResult").textContent = result.label;
  completionDialog.showModal();
});

sectionsContainer.addEventListener("click", event => {
  const button = event.target.closest("[data-tip-index]");
  if (button) openTip(Number(button.dataset.tipIndex));
});

document.querySelector("#historyButton").addEventListener("click", () => {
  renderHistory();
  historyDialog.showModal();
});

document.querySelector("#resetButton").addEventListener("click", resetScorecard);
document.querySelector("#closeTipButton").addEventListener("click", () => tipDialog.close());
document.querySelector("#gotItButton").addEventListener("click", () => tipDialog.close());
document.querySelector("#closeHistoryButton").addEventListener("click", () => historyDialog.close());
document.querySelector("#closeCompletionButton").addEventListener("click", () => completionDialog.close());
document.querySelector("#clearHistoryButton").addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

[tipDialog, historyDialog, completionDialog].forEach(dialog => {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
});
