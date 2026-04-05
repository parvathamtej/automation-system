const state = {
  workflows: [],
  scenarios: [],
};

const architectureSteps = [
  {
    index: "01",
    title: "Event Triggers",
    description: "External events enter the system through forms, tickets, CRM updates, or webhooks.",
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`
  },
  {
    index: "02",
    title: "Workflow Definitions",
    description: "Reusable workflow templates define triggers, rules, and downstream actions.",
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>`
  },
  {
    index: "03",
    title: "AI Reasoning Layer",
    description: "A custom AI module classifies intent, applies personalization, and selects the best path.",
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`
  },
  {
    index: "04",
    title: "Execution Engine",
    description: "An external orchestrator carries out integrations like email, CRM sync, and notifications.",
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>`
  },
];

const workflowGrid = document.querySelector("#workflow-grid");
const architectureGrid = document.querySelector("#architecture-grid");
const workflowSelect = document.querySelector("#workflowId");
const scenarioPicker = document.querySelector("#scenario-picker");
const urgencyInput = document.querySelector("#urgency");
const urgencyValue = document.querySelector("#urgency-value");
const form = document.querySelector("#simulation-form");
const placeholder = document.querySelector("#results-placeholder");
const resultsContainer = document.querySelector("#results-container");
const statusBadge = document.querySelector("#status-badge");
const workflowCount = document.querySelector("#workflow-count");

// --- Scroll Reveal Animations (for standard fade-ins) ---

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const checkVisibility = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      
      const counters = entry.target.querySelectorAll('.counter');
      counters.forEach(c => animateCounter(c));
    }
  });
};

const observer = new IntersectionObserver(checkVisibility, observerOptions);

function setupScrollAnimations() {
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = true;
  
  const target = parseFloat(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const start = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    const value = (easeProgress * target).toFixed(target % 1 === 0 ? 0 : 1);
    
    el.textContent = value + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

// --- Vertical Timeline Scroll Logic ---

function setupTimelineScroll() {
  const container = document.getElementById('architecture-timeline');
  const fill = document.getElementById('timeline-fill');
  const steps = document.querySelectorAll('#architecture-grid .architecture-card');
  
  if (!container || !fill || steps.length === 0) return;

  function updateTimeline() {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const startTrigger = windowHeight / 2;
    const distance = startTrigger - rect.top;
    
    let progress = distance / rect.height;
    progress = Math.max(0, Math.min(1, progress));
    
    fill.style.height = `${progress * 100}%`;
    
    steps.forEach((step) => {
      const stepTop = step.offsetTop; 
      const fillHeightPixels = progress * rect.height;
      
      if (fillHeightPixels >= stepTop + 40) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateTimeline);
  updateTimeline();
}

// --- Dynamic Rendering ---

function renderArchitecture() {
  architectureGrid.innerHTML = architectureSteps
    .map(
      (step) => `
        <article class="architecture-card">
          <div class="ac-content">
            <div class="ac-icon">${step.icon}</div>
            <div class="ac-text">
              <h4>${step.title}</h4>
              <p>${step.description}</p>
            </div>
          </div>
          <div class="ac-action">
            <button class="ac-btn">Step ${step.index}</button>
          </div>
        </article>
      `,
    )
    .join("");
    
  setupTimelineScroll();
}

function renderWorkflowCatalog() {
  // Alternate between the two generated images
  const images = ['/card1.png', '/card2.png'];
  
  workflowGrid.innerHTML = state.workflows
    .map(
      (workflow, i) => `
        <article class="workflow-card reveal stagger-${(i % 2) + 1}" style="background-image: url('${images[i % 2]}');">
          <div class="workflow-overlay"></div>
          <div class="workflow-content">
            <div>
              <h4>${workflow.name}</h4>
              <p>${workflow.summary}</p>
            </div>
            <div class="workflow-meta">
              <span class="workflow-tag">${workflow.category}</span>
              ${workflow.actions.slice(0, 1).map(a => `<span class="workflow-tag">${a}</span>`).join('')}
            </div>
            <button class="workflow-action" onclick="document.getElementById('workflowId').value='${workflow.id}'; window.location.hash='#simulator';">Simulate flow</button>
          </div>
        </article>
      `,
    )
    .join("");
    
  document.querySelectorAll('#workflow-grid .reveal').forEach(el => observer.observe(el));
}

function populateWorkflowSelect() {
  workflowSelect.innerHTML = state.workflows
    .map((workflow) => `<option value="${workflow.id}">${workflow.name}</option>`)
    .join("");

  if (workflowCount) {
    workflowCount.setAttribute('data-target', state.workflows.length);
    if (workflowCount.dataset.animated) {
      workflowCount.textContent = state.workflows.length;
    }
  }
}

function populateScenarioPicker() {
  scenarioPicker.innerHTML = `
    <option value="">Start from a sample</option>
    ${state.scenarios.map((scenario) => `<option value="${scenario.id}">${scenario.label}</option>`).join("")}
  `;
}

function fillForm(payload) {
  Object.entries(payload).forEach(([key, value]) => {
    const field = document.querySelector(`#${key}`);
    if (field) {
      field.value = value;
    }
  });

  urgencyValue.textContent = payload.urgency;
}

function setStatus(mode, text) {
  statusBadge.className = `status-badge ${mode}`;
  statusBadge.textContent = text;
}

async function animatePipeline() {
  const fill = document.getElementById('pipeline-path-fill-sim');
  const nEvent = document.getElementById('node-event');
  const nAI = document.getElementById('node-ai');
  const nEngine = document.getElementById('node-engine');
  
  if (!fill || !nEvent || !nAI || !nEngine) return;

  fill.style.width = '0%';
  nEvent.classList.remove('active');
  nAI.classList.remove('active');
  nEngine.classList.remove('active');
  
  await new Promise(r => setTimeout(r, 150));
  
  nEvent.classList.add('active');
  fill.style.width = '30%';
  await new Promise(r => setTimeout(r, 600));
  
  nAI.classList.add('active');
  fill.style.width = '70%';
  await new Promise(r => setTimeout(r, 800));
  
  nEngine.classList.add('active');
  fill.style.width = '100%';
  await new Promise(r => setTimeout(r, 400));
}

function renderSimulation(result) {
  const executionMarkup = result.orchestration.executions
    .map(
      (execution) => `
        <div class="timber-item">
          <strong>${execution.action} | ${execution.system}</strong>
          <p>${execution.detail}</p>
        </div>
      `,
    )
    .join("");

  const timelineMarkup = result.timeline
    .map(
      (item) => `
        <div class="timber-item">
          <strong>${item.stage}</strong>
          <p>${item.detail}</p>
        </div>
      `,
    )
    .join("");

  resultsContainer.innerHTML = `
    <div class="result-stack reveal">
      <section class="result-summary">
        <strong>${result.analysis.route.label}</strong>
        <div class="result-copy">
          <p>${result.analysis.aiSummary}</p>
          <p style="margin-top: 10px;">
            Intent: <b style="color: var(--ink);">${result.analysis.intent}</b> | Urgency:
            <b style="color: var(--accent);">${result.analysis.urgencyScore}/100</b> | Tone:
            <b style="color: var(--ink);">${result.analysis.personalization.preferredTone}</b>
          </p>
        </div>
        <div class="metrics-inline" style="display: flex; gap: 8px; margin-top: 16px;">
          <span class="pill">${result.metrics.automationCoverage} coverage</span>
          <span class="pill">${result.metrics.manualInterventionReduced} less manual effort</span>
        </div>
      </section>

      <section class="timeline-card">
        <strong>Pipeline trace</strong>
        <div class="timber-list">${timelineMarkup}</div>
      </section>

      <section class="execution-card">
        <strong>External execution</strong>
        <div class="timber-list">${executionMarkup}</div>
      </section>
    </div>
  `;

  placeholder.classList.add("hidden");
  resultsContainer.classList.remove("hidden");
  
  setTimeout(() => {
    document.querySelectorAll('#results-container .reveal').forEach(el => observer.observe(el));
    const resultStack = resultsContainer.querySelector('.result-stack');
    if (resultStack) {
      resultStack.classList.add('active');
    }
  }, 50);
}

async function bootstrap() {
  setupScrollAnimations();
  
  const [workflowResponse, scenarioResponse] = await Promise.all([
    fetch("/api/workflows"),
    fetch("/api/scenarios"),
  ]);

  const workflowData = await workflowResponse.json();
  const scenarioData = await scenarioResponse.json();

  state.workflows = workflowData.workflows;
  state.scenarios = scenarioData.scenarios;

  renderArchitecture();
  renderWorkflowCatalog();
  populateWorkflowSelect();
  populateScenarioPicker();
}

// --- Event Listeners ---

scenarioPicker.addEventListener("change", (event) => {
  const scenario = state.scenarios.find((item) => item.id === event.target.value);
  if (scenario) {
    fillForm(scenario.payload);
  }
});

urgencyInput.addEventListener("input", (event) => {
  urgencyValue.textContent = event.target.value;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("running", "Executing Pipeline...");
  
  resultsContainer.classList.add("hidden");
  placeholder.classList.remove("hidden");
  placeholder.innerHTML = `<span style="color: var(--accent); font-weight: 500;">Processing event and routing through AI Engine...</span>`;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.urgency = Number(payload.urgency);

  try {
    const animationPromise = animatePipeline();
    
    const response = await fetch("/api/simulate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Simulation failed");
    }

    await animationPromise;
    renderSimulation(result);
    setStatus("complete", "Execution complete");
  } catch (error) {
    placeholder.classList.remove("hidden");
    resultsContainer.classList.add("hidden");
    placeholder.textContent = error.message;
    setStatus("idle", "Try again");
  }
});

bootstrap().catch((error) => {
  placeholder.textContent = `Unable to load project data: ${error.message}`;
});
