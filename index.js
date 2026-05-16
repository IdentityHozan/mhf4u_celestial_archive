let currentModelId = null;
let validModelIds = [];

// Async loader that fetches standalone markup fragments and hooks UI events
async function showModel(idNumber) {
    if (validModelIds.length === 0) {
        gatherValidModelIds();
    }
    
    if (!validModelIds.includes(idNumber)) return;
    currentModelId = idNumber;

    // Manage Sidebar Navigation Tab States
    const tabs = document.querySelectorAll('.model-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const targetTab = document.querySelector(`button[onclick="showModel(${idNumber})"]`);
    if (targetTab) targetTab.classList.add('active');

    // Set programmatic hash location tracking in the browser URL bar
    if (history.replaceState) {
        history.replaceState(null, '', `#model-${idNumber}`);
    }

    // Re-render active dots to match the current pagination placement
    renderPageDots();

    // Request the individual sub-template markup file asynchronously
    const targetContainer = document.getElementById('dynamic-model-target');
    try {
        const response = await fetch(`models/model${idNumber}.html`);
        if (!response.ok) throw new Error(`Model archive entry data [id: ${idNumber}] could not be retrieved.`);
        
        const htmlContent = await response.text();
        targetContainer.innerHTML = htmlContent;

        const loadedView = targetContainer.querySelector('.model-view');
        if (loadedView) loadedView.classList.add('active-view');
        
        loadDesmosForModel(targetContainer);
        moveDesmosButton(targetContainer);
        initializeResizer(targetContainer);

        // Force MathJax to scan and typeset the newly injected LaTeX equations
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            window.MathJax.typesetPromise([targetContainer]);
        }

    } catch (error) {
        targetContainer.innerHTML = `
            <article class="model-view active-view">
                <div class="model-card" style="text-align:center; padding: 50px; color:#161C48;">
                    <h2>✦ Archive Entry Access Interrupted ✦</h2>
                    <p style="margin: 20px 0; color:#9f7634;">${error.message}</p>
                    <p style="font-size:0.9rem; opacity:0.8;">Local filesystem restrictions (CORS) may block asynchronous operations. Ensure workspace is hosted through VSCode Live Server.</p>
                </div>
            </article>`;
        console.error(error);
    }
}


function gatherValidModelIds() {
    validModelIds = [];
    const buttons = document.querySelectorAll('#tabContainer .model-tab');
    
    buttons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        const match = onclickAttr ? onclickAttr.match(/showModel\((\d+)\)/) : null;
        if (match) {
            validModelIds.push(Number(match[1]));
        }
    });

    // Sort numerically to ensure linear logic loops function correctly
    validModelIds.sort((a, b) => a - b);
}

// Navigation Controls: Bound checking to move through the mapped dynamic index paths
function nextModel() {
    if (validModelIds.length === 0) gatherValidModelIds();
    const currentIndex = validModelIds.indexOf(currentModelId);
    if (currentIndex < validModelIds.length - 1) {
        showModel(validModelIds[currentIndex + 1]);
    }
}

function prevModel() {
    if (validModelIds.length === 0) gatherValidModelIds();
    const currentIndex = validModelIds.indexOf(currentModelId);
    if (currentIndex > 0) {
        showModel(validModelIds[currentIndex - 1]);
    }
}

// Generate structural grid tracking navigation dots matching the current elements
function renderPageDots() {
    const dotsContainer = document.getElementById('pageDots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    
    validModelIds.forEach(id => {
        const dot = document.createElement('span');
        if (id === currentModelId) dot.classList.add('active');
        dot.addEventListener('click', () => showModel(id));
        dotsContainer.appendChild(dot);
    });
}

//Interactive filter options covering custom search phrases or string category attributes
function filterModels() {
    const textFilter = document.getElementById("searchInput").value.toUpperCase();
    const categoryFilter = document.getElementById("categoryFilter").value;
    const container = document.getElementById("tabContainer");
    const buttons = container.getElementsByClassName("model-tab");

    for (let i = 0; i < buttons.length; i++) {
        let btn = buttons[i];
        let txtValue = btn.textContent || btn.innerText;
        let categoryValue = btn.getAttribute("data-category");
        
        let matchesText = txtValue.toUpperCase().indexOf(textFilter) > -1;
        let matchesCategory = (categoryFilter === "all") || (categoryValue === categoryFilter);

        if (matchesText && matchesCategory) {
            btn.style.display = "flex";
        } else {
            btn.style.display = "none";
        }
    }
}

// Split Pane System: Manage safe pointer captures with structural boundary protections
function initializeResizer(scopeElement) {
    const resizer = scopeElement.querySelector('.resizer');
    if (!resizer) return;

    const graphFrame = resizer.previousElementSibling;
    const modelCard = resizer.closest('.model-card');
    const analysisPanel = modelCard ? modelCard.querySelector('.analysis-panel') : null;
    const headerElement = modelCard ? modelCard.querySelector('.model-header') : null;

    if (!graphFrame || !modelCard || !analysisPanel) return;

    let startY = 0;
    let startHeight = 0;
    let isDragging = false;

    resizer.addEventListener('pointerdown', startResize);

    function getAvailableGraphSpace() {
        const cardStyle = window.getComputedStyle(modelCard);
        const cardHeight = modelCard.clientHeight;
        const paddingTop = parseFloat(cardStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(cardStyle.paddingBottom) || 0;
        const headerHeight = headerElement ? headerElement.offsetHeight : 0;
        const resizerHeight = resizer.offsetHeight || 0;
        const panelMinHeight = 115;
        const breathingRoom = 18;

        return cardHeight - paddingTop - paddingBottom - headerHeight - resizerHeight - panelMinHeight - breathingRoom;
    }

    function startResize(e) {
        if (window.matchMedia('(max-width: 950px)').matches) return;

        e.preventDefault();
        isDragging = true;
        startY = e.clientY;
        startHeight = graphFrame.getBoundingClientRect().height;

        try {
            resizer.setPointerCapture(e.pointerId);
        } catch (err) {}

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'ns-resize';

        const iframe = graphFrame.querySelector('iframe');
        if (iframe) iframe.style.pointerEvents = 'none';

        window.addEventListener('pointermove', resize);
        window.addEventListener('pointerup', stopResize);
        window.addEventListener('pointercancel', stopResize);
    }

    function resize(e) {
        if (!isDragging) return;

        const availableGraphSpace = getAvailableGraphSpace();
        const minGraphHeight = 170;
        const maxGraphHeight = Math.max(minGraphHeight, availableGraphSpace);

        const deltaY = e.clientY - startY;
        const newHeight = startHeight + deltaY;
        const clampedHeight = Math.max(minGraphHeight, Math.min(newHeight, maxGraphHeight));

        graphFrame.style.height = `${clampedHeight}px`;
    }

    function stopResize(e) {
        if (!isDragging) return;

        isDragging = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        const iframe = graphFrame.querySelector('iframe');
        if (iframe) iframe.style.pointerEvents = '';

        window.removeEventListener('pointermove', resize);
        window.removeEventListener('pointerup', stopResize);
        window.removeEventListener('pointercancel', stopResize);

        try {
            resizer.releasePointerCapture(e.pointerId);
        } catch (err) {}
    }
}

//Lazy load Desmos interactive graph sources cleanly on switch actions
function loadDesmosForModel(scopeElement) {
    const iframe = scopeElement.querySelector('iframe[data-src]');
    if (iframe && !iframe.src) {
        iframe.src = iframe.dataset.src;
    }
}


// Move the floating Desmos link above the graph so it does not cover graph labels.
function moveDesmosButton(scopeElement) {
    const graphFrame = scopeElement.querySelector('.graph-frame');
    const desmosButton = scopeElement.querySelector('.open-embed-btn');

    if (!graphFrame || !desmosButton) return;

    let actionRow = scopeElement.querySelector('.embed-action-row');
    if (!actionRow) {
        actionRow = document.createElement('div');
        actionRow.className = 'embed-action-row';
        graphFrame.parentNode.insertBefore(actionRow, graphFrame);
    }

    actionRow.appendChild(desmosButton);
}

// Determine initial model ID via URL Hash fragments or fall back to the first available entry
window.addEventListener('DOMContentLoaded', () => {
    gatherValidModelIds();
    
    if (validModelIds.length === 0) return; // Escape safely if sidebar components are missing

    const hashMatch = window.location.hash.match(/model-(\d+)/);
    const initialId = hashMatch ? Number(hashMatch[1]) : validModelIds[0];
    
    if (validModelIds.includes(initialId)) {
        showModel(initialId);
    } else {
        showModel(validModelIds[0]);
    }
});