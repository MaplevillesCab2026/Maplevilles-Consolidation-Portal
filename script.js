document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CLEAN SLATE CONFIGURATION ---
    // We start with an empty object so the portal has NO tools by default.
    // You can now add them manually via the Settings button.
    const DEFAULT_TOOLS = {}; 

    // --- 2. STORAGE RESET ---
    // I changed the key to 'maplevilleTools_v2'. 
    // This forces the browser to drop the old data and start fresh.
    let toolLinks = JSON.parse(localStorage.getItem('maplevilleTools_v2')) || DEFAULT_TOOLS;
    
    // Load text content from Local Storage
    const goalsTextarea = document.getElementById('ourGoals');
    const extensionsTextarea = document.getElementById('extensions');
    const announcementsTextarea = document.getElementById('announcements');
    const remindersTextarea = document.getElementById('reminders'); 
    
    if(goalsTextarea) goalsTextarea.value = localStorage.getItem('maplevilleGoals') || '';
    if(extensionsTextarea) extensionsTextarea.value = localStorage.getItem('maplevilleExtensions') || '';
    if(announcementsTextarea) announcementsTextarea.value = localStorage.getItem('maplevilleAnnouncements') || '';
    if(remindersTextarea) remindersTextarea.value = localStorage.getItem('maplevilleReminders') || '';
    
    // --- DOM Elements ---
    const toolSearchInput = document.getElementById('toolSearch');
    const toolSections = document.getElementById('toolSections');
    const toggleEditModeButton = document.getElementById('toggleEditMode');
    const body = document.body;
    
    // Modals
    const editModal = document.getElementById("editModal");
    const modalToolNameInput = document.getElementById('modalToolName');
    const modalToolURLInput = document.getElementById('modalToolURL');
    const saveUrlButton = document.getElementById('saveUrlButton');
    
    const addToolModal = document.getElementById("addToolModal");
    const addToolNameInput = document.getElementById('addToolName');
    const addToolURLInput = document.getElementById('addToolURL');
    const addNewToolButton = document.getElementById('addNewToolButton');
    
    let currentCategory = null; 

    // --- Helper Functions ---

    function renderTools() {
        // Clear all sections first
        document.querySelectorAll('.tool-links').forEach(div => div.innerHTML = '');

        // Re-render links from the data model
        for (const [name, data] of Object.entries(toolLinks)) {
            const categoryDiv = document.querySelector(`#${data.category} .tool-links`);
            if (categoryDiv) {
                const link = document.createElement('a');
                link.href = data.url;
                link.target = "_blank";
                link.setAttribute('data-label', name);
                link.textContent = name;
                categoryDiv.appendChild(link);
            }
        }
        // Save to the NEW storage key
        localStorage.setItem('maplevilleTools_v2', JSON.stringify(toolLinks));
        checkToolLimits(); 
    }
    
    function checkToolLimits() {
        document.querySelectorAll('.tool-category').forEach(section => {
            const maxTools = parseInt(section.dataset.maxTools);
            const toolCount = section.querySelectorAll('.tool-links a').length;
            const addButton = section.querySelector('.add-tool-button');

            if (addButton) {
                if (toolCount >= maxTools) {
                    addButton.disabled = true;
                    addButton.textContent = `Limit (${maxTools}) Reached`;
                    addButton.style.opacity = 0.6;
                } else {
                    addButton.disabled = false;
                    addButton.textContent = '+ Add Tool';
                    addButton.style.opacity = 1;
                }
            }
        });
    }

    function filterTools() {
        const searchTerm = toolSearchInput.value.toLowerCase();
        
        document.querySelectorAll('.tool-links a').forEach(link => {
            const toolName = link.dataset.label.toLowerCase();
            const categorySection = link.closest('.tool-category');
            
            const isMatch = toolName.includes(searchTerm);
            link.style.display = isMatch ? 'inline-block' : 'none';

            const visibleLinksInGroup = categorySection.querySelectorAll('.tool-links a:not([style*="display: none"])').length;

            if (searchTerm) {
                 categorySection.style.display = visibleLinksInGroup > 0 ? 'block' : 'none';
            } else {
                 categorySection.style.display = 'block'; 
            }
        });
    }

    function openEditModal(linkElement) {
        const toolName = linkElement.dataset.label;
        const toolURL = toolLinks[toolName].url; 
        
        modalToolNameInput.value = toolName;
        modalToolURLInput.value = toolURL === '#' ? '' : toolURL; 
        editModal.style.display = "block";
    }

    // --- Event Listeners ---
    
    if(goalsTextarea) goalsTextarea.addEventListener('input', () => localStorage.setItem('maplevilleGoals', goalsTextarea.value));
    if(extensionsTextarea) extensionsTextarea.addEventListener('input', () => localStorage.setItem('maplevilleExtensions', extensionsTextarea.value));
    if(announcementsTextarea) announcementsTextarea.addEventListener('input', () => localStorage.setItem('maplevilleAnnouncements', announcementsTextarea.value));
    if(remindersTextarea) remindersTextarea.addEventListener('input', () => localStorage.setItem('maplevilleReminders', remindersTextarea.value));

    // Search Bar
    toolSearchInput.addEventListener('keyup', filterTools);

    // Edit Mode Toggle
    toggleEditModeButton.addEventListener('click', () => {
        const isEditMode = body.classList.toggle('edit-mode');
        
        toggleEditModeButton.innerHTML = isEditMode 
            ? '<span id="editIcon">✅</span> Save/Exit' 
            : '<span id="editIcon">⚙️</span> Settings';

        if (isEditMode) {
            toolSearchInput.value = '';
            filterTools(); 
            toolSearchInput.disabled = true; 
        } else {
            toolSearchInput.disabled = false;
        }
    });

    // Tool Link Clicks (Browse or Edit/Delete)
    toolSections.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        
        const toolName = link.dataset.label;
        
        if (body.classList.contains('edit-mode')) {
            event.preventDefault(); 
            
            // Since we have no defaults anymore, ALL tools can be deleted.
            if (confirm(`Do you want to DELETE "${toolName}" or EDIT its URL? \n\n Press OK to delete, or Cancel to edit URL.`)) {
                delete toolLinks[toolName];
                renderTools();
            } else {
                openEditModal(link);
            }
        }
    });
    
    // Add Tool Button Handler
    toolSections.addEventListener('click', (event) => {
        const button = event.target.closest('.add-tool-button');
        if (!button || button.disabled) return; 

        const categoryId = button.dataset.category;
        
        currentCategory = categoryId;
        addToolNameInput.value = '';
        addToolURLInput.value = '';
        addToolModal.style.display = "block";
    });

    // Save URL Button (Edit Modal)
    saveUrlButton.addEventListener('click', () => {
        const newUrl = modalToolURLInput.value.trim();
        const toolName = modalToolNameInput.value;
        
        if (newUrl) {
            toolLinks[toolName].url = newUrl;
            renderTools();
            editModal.style.display = "none";
        } else {
            alert("Please enter a valid URL.");
        }
    });

    // Add New Tool Button (Add Modal)
    addNewToolButton.addEventListener('click', () => {
        const newName = addToolNameInput.value.trim();
        const newUrl = addToolURLInput.value.trim();
        
        if (!newName || !newUrl) {
            alert("Both Tool Name and URL are required.");
            return;
        }
        
        // Prevent duplicates
        if (toolLinks[newName]) {
            alert(`A tool named "${newName}" already exists. Please choose a unique name.`);
            return;
        }

        toolLinks[newName] = { url: newUrl, category: currentCategory };
        renderTools();
        addToolModal.style.display = "none";
    });

    // Modal Close Logic
    document.querySelector(".close-button").addEventListener('click', () => { editModal.style.display = "none"; });
    document.querySelector(".add-close-button").addEventListener('click', () => { addToolModal.style.display = "none"; });

    window.addEventListener('click', (event) => {
        if (event.target === editModal) editModal.style.display = "none";
        if (event.target === addToolModal) addToolModal.style.display = "none";
    });
    
    // Initial Render
    renderTools();
});