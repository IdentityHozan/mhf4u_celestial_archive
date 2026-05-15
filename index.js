let currentModelId = 1;
const totalModels = 9;

function showModel(idNumber) {
    currentModelId = idNumber;

    const views = document.querySelectorAll('.model-view');
    views.forEach(view => view.classList.remove('active-view'));

    const tabs = document.querySelectorAll('.model-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const targetView = document.getElementById(`model-${idNumber}`);
    if (targetView) targetView.classList.add('active-view');

    const targetTab = document.querySelector(`button[onclick="showModel(${idNumber})"]`);
    if (targetTab) targetTab.classList.add('active');
    
    if (window.MathJax) MathJax.typesetPromise();

    if (history.replaceState) {
        history.replaceState(null, '', `#model-${idNumber}`);
    }

    const activeModel = document.getElementById(`model-${idNumber}`);
    loadDesmosForModel(activeModel);
}

function nextModel() {
    if (currentModelId < totalModels) showModel(currentModelId + 1);
}
function prevModel() {
    if (currentModelId > 1) showModel(currentModelId - 1);
}


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
window.addEventListener('DOMContentLoaded', () => {
    const hashMatch = window.location.hash.match(/model-(\d+)/);

    if (hashMatch) {
        showModel(Number(hashMatch[1]));
    } else {
        showModel(1);
    }

    const resizers = document.querySelectorAll('.resizer');

    resizers.forEach(resizer => {
        const graphFrame = resizer.previousElementSibling;
        let startY = 0;
        let startHeight = 0;
        let isDragging = false;

        resizer.addEventListener('pointerdown', startResize);

        function startResize(e) {
            e.preventDefault();

            isDragging = true;
            startY = e.clientY;
            startHeight = graphFrame.getBoundingClientRect().height;

            resizer.setPointerCapture(e.pointerId);

            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'ns-resize';

            // Prevent Desmos iframe from stealing mouse events
            const iframe = graphFrame.querySelector('iframe');
            if (iframe) iframe.style.pointerEvents = 'none';

            window.addEventListener('pointermove', resize);
            window.addEventListener('pointerup', stopResize);
            window.addEventListener('pointercancel', stopResize);
        }

        function resize(e) {
            if (!isDragging) return;

            const minHeight = 180;
            const maxHeight = Math.min(window.innerHeight * 0.75, 650);
            const newHeight = startHeight + (e.clientY - startY);
            const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

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
    });
});

function loadDesmosForModel(model) {
    const iframe = model.querySelector('iframe[data-src]');

    if (iframe && !iframe.src) {
        iframe.src = iframe.dataset.src;
    }
}