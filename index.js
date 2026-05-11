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
    const input = document.getElementById("searchInput");
    const filter = input.value.toUpperCase();
    const container = document.getElementById("tabContainer");
    const buttons = container.getElementsByClassName("model-tab");

    for (let i = 0; i < buttons.length; i++) {
        let txtValue = buttons[i].textContent || buttons[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            buttons[i].style.display = "flex";
        } else {
            buttons[i].style.display = "none";
        }
    }
}


window.addEventListener('DOMContentLoaded', () => {
    // URL Hash handling
    const hashMatch = window.location.hash.match(/model-(\d+)/);
    if (hashMatch) {
        showModel(Number(hashMatch[1]));
    } else {
        // If no hash, default to model 1
        showModel(1); 
    }

    // Attach Resizer logic to all handles
    const resizers = document.querySelectorAll('.resizer');
    
    resizers.forEach(resizer => {
        let startY, startHeight;
        
        const graphFrame = resizer.previousElementSibling;

        resizer.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            startHeight = parseInt(document.defaultView.getComputedStyle(graphFrame).height, 10);
            
            // Listen on the document so drag doesn't break if mouse moves fast lol
            document.documentElement.addEventListener('mousemove', doDrag, false);
            document.documentElement.addEventListener('mouseup', stopDrag, false);
            
            // Prevent text highlighting while dragging
            document.body.style.userSelect = 'none';
        });

        function doDrag(e) {
            const newHeight = startHeight + (e.clientY - startY);
            if(newHeight > 150 && newHeight < window.innerHeight * 0.7) {
                graphFrame.style.height = `${newHeight}px`;
            }
        }

        function stopDrag() {
            document.documentElement.removeEventListener('mousemove', doDrag, false);
            document.documentElement.removeEventListener('mouseup', stopDrag, false);
            document.body.style.userSelect = '';
        }
    });
});