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
        let startY, startHeight;
        const graphFrame = resizer.previousElementSibling;

        resizer.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            startHeight = parseInt(document.defaultView.getComputedStyle(graphFrame).height, 10);
            
            document.documentElement.addEventListener('mousemove', doDrag, false);
            document.documentElement.addEventListener('mouseup', stopDrag, false);
            document.body.style.userSelect = 'none';
        });

        // Touch support for mobile dragging
        resizer.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startHeight = parseInt(document.defaultView.getComputedStyle(graphFrame).height, 10);
            
            document.documentElement.addEventListener('touchmove', doDragTouch, {passive: false});
            document.documentElement.addEventListener('touchend', stopDragTouch, false);
            document.body.style.userSelect = 'none';
        });

        function doDrag(e) {
            const newHeight = startHeight + (e.clientY - startY);
            if(newHeight > 150 && newHeight < window.innerHeight * 0.7) {
                graphFrame.style.height = `${newHeight}px`;
            }
        }
        
        function doDragTouch(e) {
            // Prevent scrolling the page while dragging the resizer
            e.preventDefault(); 
            const newHeight = startHeight + (e.touches[0].clientY - startY);
            if(newHeight > 150 && newHeight < window.innerHeight * 0.7) {
                graphFrame.style.height = `${newHeight}px`;
            }
        }

        function stopDrag() {
            document.documentElement.removeEventListener('mousemove', doDrag, false);
            document.documentElement.removeEventListener('mouseup', stopDrag, false);
            document.body.style.userSelect = '';
        }
        
        function stopDragTouch() {
            document.documentElement.removeEventListener('touchmove', doDragTouch, false);
            document.documentElement.removeEventListener('touchend', stopDragTouch, false);
            document.body.style.userSelect = '';
        }
    });
});