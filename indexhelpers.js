function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }
    
    // Check for saved dark mode preference on page load
    document.addEventListener('DOMContentLoaded', (event) => {
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
      }
    });


// Custom Dropdown Logic
const customSelectors = [
  {
    trigger: document.getElementById('league-select-trigger'),
    options: document.getElementById('league-select-options'),
    hiddenSelect: leagueSelect
  },
  {
    trigger: document.getElementById('position-select-trigger'),
    options: document.getElementById('position-select-options'),
    hiddenSelect: positionSelect
  },
  {
    trigger: document.getElementById('age-select-trigger'),
    options: document.getElementById('age-select-options'),
    hiddenSelect: ageInput
  }
];

// Generic function to handle dropdown behavior
function setupCustomSelector(selector) {
  const { trigger, options, hiddenSelect } = selector;
  
  // Add keyboard navigation for this selector
  document.addEventListener('keydown', function(e) {
    // Only process keyboard input when this dropdown is open
    if (!trigger.classList.contains('open')) return;
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      
      const visibleOptions = Array.from(options.querySelectorAll('.custom-select-option'));
      const currentIndex = visibleOptions.findIndex(opt => opt.classList.contains('selected'));
      let newIndex;
      
      if (e.key === 'ArrowDown') {
        newIndex = currentIndex < visibleOptions.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : visibleOptions.length - 1;
      }
      
      // Update selection
      visibleOptions.forEach(opt => opt.classList.remove('selected'));
      visibleOptions[newIndex].classList.add('selected');
      
      // Ensure the selected option is visible in the dropdown
      visibleOptions[newIndex].scrollIntoView({ block: 'nearest' });
      
      return;
    }
    
    // Handle Enter key to select the currently highlighted option
    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedOption = options.querySelector('.selected');
      if (selectedOption) {
        selectedOption.click();
      }
      return;
    }
    
    // Handle Escape key to close the dropdown
    if (e.key === 'Escape') {
      e.preventDefault();
      trigger.classList.remove('open');
      options.style.display = 'none';
      // Keep highlighting - don't clear it
      return;
    }
  });
  
  // Open/close dropdown
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    // Close other open dropdowns
    document.querySelectorAll('.custom-select-trigger.open').forEach(openTrigger => {
      if (openTrigger !== trigger) {
        openTrigger.classList.remove('open');
        openTrigger.nextElementSibling.style.display = 'none';
      }
    });
    // Toggle this dropdown
    const isOpen = trigger.classList.contains('open');
    trigger.classList.toggle('open');
    options.style.display = isOpen ? 'none' : 'block';
    
    // Set initial selection when opening dropdown (only if needed)
    if (!isOpen) {
      const currentValue = hiddenSelect.value;
      const currentlyHighlighted = options.querySelector('.custom-select-option.selected');
      const shouldBeHighlighted = options.querySelector(`[data-value="${currentValue}"]`);
      
      // Only update highlighting if it's wrong
      if (!currentlyHighlighted || currentlyHighlighted !== shouldBeHighlighted) {
        // Clear any previous selections
        options.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
        
        // Highlight the correct option
        if (shouldBeHighlighted) {
          shouldBeHighlighted.classList.add('selected');
          shouldBeHighlighted.scrollIntoView({ block: 'nearest' });
        }
      }
    }
  });
  
  // Option selection
  options.querySelectorAll('.custom-select-option').forEach(option => {
    option.addEventListener('click', function() {
      // Update selected class
      options.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      // Update trigger text and icon
      const triggerSpan = trigger.querySelector('span');
      const optionSpan = option.querySelector('span');
      const optionIcon = option.querySelector('iconify-icon');
      const optionScotlandFlag = option.querySelector('.scotland-flag-icon');
      const triggerIcon = trigger.querySelector('iconify-icon');
      
      triggerSpan.textContent = optionSpan.textContent;
      if (optionSpan.getAttribute('data-i18n')) {
        triggerSpan.setAttribute('data-i18n', optionSpan.getAttribute('data-i18n'));
      }
      
      // Clean up any existing Scotland flag
      const existingScotlandFlag = trigger.querySelector('.scotland-flag-icon');
      if (existingScotlandFlag) {
        existingScotlandFlag.remove();
      }
      
      // Handle regular iconify icons
      if (optionIcon && triggerIcon) {
        // Copy all attributes from option icon to trigger icon
        triggerIcon.setAttribute('icon', optionIcon.getAttribute('icon'));
        if (optionIcon.getAttribute('width')) {
          triggerIcon.setAttribute('width', optionIcon.getAttribute('width'));
        }
        if (optionIcon.getAttribute('height')) {
          triggerIcon.setAttribute('height', optionIcon.getAttribute('height'));
        }
        triggerIcon.style.display = 'inline-block';
        trigger.classList.add('has-icon');
      }
      // Handle Scotland flag special case
      else if (optionScotlandFlag && triggerIcon) {
        // Replace iconify-icon with Scotland flag div
        const scotlandDiv = optionScotlandFlag.cloneNode(true);
        triggerIcon.style.display = 'none';
        trigger.insertBefore(scotlandDiv, triggerSpan);
        trigger.classList.add('has-icon');
      }
      
    
    
      // Update hidden select
      hiddenSelect.value = option.getAttribute('data-value');
      hiddenSelect.dispatchEvent(new Event('change'));
      
      // Close dropdown
      trigger.classList.remove('open');
      options.style.display = 'none';
      
      // Update selector restrictions
      if (typeof handleSelectorsChange === 'function') handleSelectorsChange();
      
      // Trigger filtering
      if (typeof filterTable === 'function') filterTable();
    });
  });
}

// Setup all custom selectors
customSelectors.forEach(setupCustomSelector);

// Custom Metric Selector Logic (special handling due to dynamic options)
const metricTrigger = document.getElementById('metric-select-trigger');
const metricOptions = document.getElementById('metric-select-options');

// Add keyboard navigation variables
let searchTerm = '';
let searchTimeout;

// Add keydown event listener to the document for metric selector
document.addEventListener('keydown', function(e) {
    // Only process keyboard input when metric dropdown is open
    if (!metricTrigger.classList.contains('open')) return;
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        const visibleOptions = Array.from(metricOptions.querySelectorAll('.custom-select-option:not(.metric-category-header)'));
        const currentIndex = visibleOptions.findIndex(opt => opt.classList.contains('selected'));
        let newIndex;
        
        if (e.key === 'ArrowDown') {
            newIndex = currentIndex < visibleOptions.length - 1 ? currentIndex + 1 : 0;
        } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : visibleOptions.length - 1;
        }
        
        // Update selection
        visibleOptions.forEach(opt => opt.classList.remove('selected'));
        visibleOptions[newIndex].classList.add('selected');
        
        // Ensure the selected option is visible in the dropdown
        visibleOptions[newIndex].scrollIntoView({ block: 'nearest' });
        
        return;
    }
    
    // Handle Enter key to select the currently highlighted option
    if (e.key === 'Enter') {
        e.preventDefault();
        const selectedOption = metricOptions.querySelector('.selected');
        if (selectedOption) {
            selectedOption.click();
        }
        return;
    }
    
    // Handle Escape key to close the dropdown
    if (e.key === 'Escape') {
        e.preventDefault();
        metricTrigger.classList.remove('open');
        metricOptions.style.display = 'none';
        // Clear search term but keep highlighting
        searchTerm = '';
        return;
    }
    
    // Handle typing to search
    if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9%\s\-\+\(\)]/)) {
        // Clear the previous timeout
        clearTimeout(searchTimeout);
        
        // Add the key to the search term
        searchTerm += e.key.toLowerCase();
        
        // Find the first option that starts with the search term
        const matchingOption = Array.from(metricOptions.querySelectorAll('.custom-select-option:not(.metric-category-header)')).find(option => {
            const optionText = option.querySelector('span').textContent.toLowerCase();
            return optionText.startsWith(searchTerm);
        });
        
        // If a matching option is found, select it
        if (matchingOption) {
            metricOptions.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
            matchingOption.classList.add('selected');
            matchingOption.scrollIntoView({ block: 'nearest' });
        }
        
        // Clear the search term after a delay
        searchTimeout = setTimeout(() => {
            searchTerm = '';
        }, 400);
    }
});

metricTrigger.addEventListener('click', function(e) {
  e.stopPropagation();
  // Close other open dropdowns
  document.querySelectorAll('.custom-select-trigger.open').forEach(openTrigger => {
    if (openTrigger !== metricTrigger) {
      openTrigger.classList.remove('open');
      openTrigger.nextElementSibling.style.display = 'none';
    }
  });
  // Toggle this dropdown
  const isOpen = metricTrigger.classList.contains('open');
  metricTrigger.classList.toggle('open');
  metricOptions.style.display = isOpen ? 'none' : 'block';
  
  // When opening, ensure the currently selected metric is highlighted (only if needed)
  if (!isOpen) {
    const currentValue = metricSelect.value;
    const currentlyHighlighted = metricOptions.querySelector('.custom-select-option.selected');
    const shouldBeHighlighted = metricOptions.querySelector(`[data-value="${currentValue}"]`);
    
    // Only update highlighting if it's wrong
    if (!currentlyHighlighted || currentlyHighlighted !== shouldBeHighlighted) {
      // Clear all selections first
      metricOptions.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
      
      // Highlight the correct option
      if (shouldBeHighlighted) {
        shouldBeHighlighted.classList.add('selected');
        shouldBeHighlighted.scrollIntoView({ block: 'nearest' });
      }
    }
  }
});

// Function to update custom selector display to match actual select value
function updateCustomSelectorDisplay(triggerId, optionsId, value) {
  const trigger = document.getElementById(triggerId);
  const options = document.getElementById(optionsId);
  const selectedOption = options.querySelector(`[data-value="${value}"]`);
  
  if (trigger && selectedOption) {
    // Clear all previous selections
    options.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
    
    // Mark the current option as selected
    selectedOption.classList.add('selected');
    
    // Update the trigger display
    const triggerSpan = trigger.querySelector('span');
    const optionSpan = selectedOption.querySelector('span');
    const triggerIcon = trigger.querySelector('iconify-icon');
    const optionIcon = selectedOption.querySelector('iconify-icon');
    const optionScotlandFlag = selectedOption.querySelector('.scotland-flag-icon');
    
    if (triggerSpan && optionSpan) {
      triggerSpan.textContent = optionSpan.textContent;
      triggerSpan.setAttribute('data-i18n', optionSpan.getAttribute('data-i18n'));
    }
    
    // Handle icons
    const existingScotlandFlag = trigger.querySelector('.scotland-flag-icon');
    if (existingScotlandFlag) {
      existingScotlandFlag.remove();
    }
    
    if (optionIcon && triggerIcon) {
      triggerIcon.setAttribute('icon', optionIcon.getAttribute('icon'));
      if (optionIcon.getAttribute('width')) {
        triggerIcon.setAttribute('width', optionIcon.getAttribute('width'));
      }
      if (optionIcon.getAttribute('height')) {
        triggerIcon.setAttribute('height', optionIcon.getAttribute('height'));
      }
      triggerIcon.style.display = 'inline-block';
      trigger.classList.add('has-icon');
    } else if (optionScotlandFlag && triggerIcon) {
      const scotlandDiv = optionScotlandFlag.cloneNode(true);
      triggerIcon.style.display = 'none';
      trigger.insertBefore(scotlandDiv, triggerSpan);
      trigger.classList.add('has-icon');
    }
  }
}

// Function to update metric options (called when toggling)
function updateMetricOptions() {
  const currentSelection = metricSelect.value; // Preserve current selection
  metricOptions.innerHTML = '';
  

  customMetricOrder.forEach(metric => {
    const option = document.createElement('div');
    option.className = 'custom-select-option';
    
    if (metric.text.startsWith("CATEGORY: ")) {
      option.className = 'metric-category-header';
      option.innerHTML = `<span data-i18n="${metric.i18n}">${metric.text.replace("CATEGORY: ", "")}</span>`;
    } else {
      const metricName = isToggled ? metric.text.replace(' per 90', '') : metric.text;
      const index = currentDataArray[0].indexOf(metricName);
      if (index !== -1) {
        option.setAttribute('data-value', index);
        option.innerHTML = `<span data-i18n="${metric.i18n}">${metricName}</span>`;
        
        // Add click handler for metric options
        option.addEventListener('click', function() {
          if (option.style.pointerEvents === 'none') return;
          
          // Update selected class
          metricOptions.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
          option.classList.add('selected');
          
          // Update trigger text
          const triggerSpan = metricTrigger.querySelector('span');
          const optionSpan = option.querySelector('span');
          triggerSpan.textContent = optionSpan.textContent;
          triggerSpan.setAttribute('data-i18n', optionSpan.getAttribute('data-i18n'));
          
          // Update hidden select
          metricSelect.value = option.getAttribute('data-value');
          metricSelect.dispatchEvent(new Event('change'));
          
          // Close dropdown
          metricTrigger.classList.remove('open');
          metricOptions.style.display = 'none';
          
          // Update selector restrictions
          if (typeof handleSelectorsChange === 'function') handleSelectorsChange();
          
          // Trigger filtering
          if (typeof filterTable === 'function') filterTable();
        });
      }
    }
    metricOptions.appendChild(option);
  });
  
  // Apply translations to the newly created options
  const preferredLanguage = getPreferredLanguage();
  applyLanguage(preferredLanguage);
  
  // Also update the trigger text if it's currently showing a metric
  const currentMetricValue = metricSelect.value;
  if (currentMetricValue) {
    const selectedMetricOption = metricOptions.querySelector(`[data-value="${currentMetricValue}"]`);
    if (selectedMetricOption) {
      const triggerSpan = metricTrigger.querySelector('span');
      const optionSpan = selectedMetricOption.querySelector('span');
      if (triggerSpan && optionSpan) {
        triggerSpan.textContent = optionSpan.textContent;
        triggerSpan.setAttribute('data-i18n', optionSpan.getAttribute('data-i18n'));
      }
    }
  }
  
}

// Initial setup - updateMetricOptions() will handle highlighting based on metricSelect.value
updateMetricOptions();

// Close dropdown on outside click
document.addEventListener('click', function(e) {
  const triggers = document.querySelectorAll('.custom-select-trigger');
  const optionsContainers = document.querySelectorAll('.custom-select-options');

  let clickedInsideDropdown = false;
  
  triggers.forEach(function(trigger, index) {
    const options = optionsContainers[index];
    
    if (trigger && options && (trigger.contains(e.target) || options.contains(e.target))) {
      clickedInsideDropdown = true;
    }
  });
  
  if (!clickedInsideDropdown) {
    triggers.forEach(function(trigger, index) {
      if (trigger && optionsContainers[index]) {
        trigger.classList.remove('open');
        optionsContainers[index].style.display = 'none';
        
        // Only clear search term for metric dropdown, keep highlighting
        if (trigger === metricTrigger) {
          searchTerm = '';
        }
      }
    });
  }
});

// Ensure table loads on startup
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure all scripts have loaded
  setTimeout(() => {
    // Make sure all selectors are properly initialized
    const minutesPlayedIndex = currentDataArray[0].indexOf("Minutes played");
    if (minutesPlayedIndex !== -1) {
      metricSelect.value = minutesPlayedIndex;
    }
    leagueSelect.value = "Premier League";
    positionSelect.value = "Goalkeeper";
    ageInput.value = "";
    
    // Update custom selectors to reflect the actual select values
    updateCustomSelectorDisplay('league-select-trigger', 'league-select-options', leagueSelect.value);
    updateCustomSelectorDisplay('position-select-trigger', 'position-select-options', positionSelect.value);
    
    // Update custom metric selector after setting the value
    updateMetricOptions();
    
    // Set the trigger text to match the selected metric
    const metricValue = metricSelect.value;
    const selectedMetricOption = metricOptions.querySelector(`[data-value="${metricValue}"]`);
    if (selectedMetricOption) {
      const triggerSpan = metricTrigger.querySelector('span');
      const optionSpan = selectedMetricOption.querySelector('span');
      triggerSpan.textContent = optionSpan.textContent;
      triggerSpan.setAttribute('data-i18n', optionSpan.getAttribute('data-i18n'));
    }
    
    // Initialize the past season button
    initPastSeasonButton();
    
    // Initialize the toggle button event listener
    const toggleButtonElement = document.getElementById('toggleMetrics');
    if (toggleButtonElement) {
      toggleButtonElement.addEventListener('click', function() {
        toggleData();
      });
    }

    
    // Ensure tooltips are set correctly for initial state
    const toggleTooltip = document.querySelector('.metrics-toggle-button .btn-tooltip-text');
    const pastSeasonTooltip = document.querySelector('.past-season-button .btn-tooltip-text');
    
    // Set initial tooltip based on current state
    // Default: isToggled = false (showing per 90), so tooltip should say "Switch to total"
    if (isToggled) {
        const translatedText = getTranslatedText('toggles.switchToPer90', 'Switch to per 90');
        toggleTooltip.textContent = translatedText;
        toggleTooltip.setAttribute('data-i18n', 'toggles.switchToPer90');
    } else {
        const translatedText = getTranslatedText('toggles.switchToTotal', 'Switch to total');
        toggleTooltip.textContent = translatedText;
        toggleTooltip.setAttribute('data-i18n', 'toggles.switchToTotal');
    }
    
    if (isPastSeason) {
        const translatedText = getTranslatedText('toggles.switchToCurrentSeason', 'Switch to current season');
        pastSeasonTooltip.textContent = translatedText;
        pastSeasonTooltip.setAttribute('data-i18n', 'toggles.switchToCurrentSeason');
    } else {
        const translatedText = getTranslatedText('toggles.switchToPastSeason', 'Switch to past season');
        pastSeasonTooltip.textContent = translatedText;
        pastSeasonTooltip.setAttribute('data-i18n', 'toggles.switchToPastSeason');
    }
    
    // Initialize the selector restrictions
    handleSelectorsChange();
    
    // Trigger the initial filter
    filterTable();
  }, 50);
});
  

function getPreferredLanguage() {
// PRIORITY 1: Check URL parameter first
const urlParams = new URLSearchParams(window.location.search);
const langParam = urlParams.get('lang');
if (langParam) {
  return langParam;
}
// PRIORITY 2: Check localStorage
const storedLang = localStorage.getItem('preferredLanguage');
if (storedLang) {
  return storedLang;
}
// PRIORITY 3: Use browser language
return getBrowserLanguage() || 'en';
}

  function getBrowserLanguage() {
    return navigator.language.slice(0, 2);
  }

  // Helper function to get translated text
  function getTranslatedText(key, fallbackText) {
    if (!window.currentTranslations) {
      return fallbackText;
    }
    
    const keys = key.split('.');
    let value = window.currentTranslations;
    for (const keyPart of keys) {
      if (value === undefined || value === null) break;
      value = value[keyPart];
    }
    
    return value || fallbackText;
  }

    function applyLanguage(language) {
    console.log(language);

    if (language === 'en') {
      window.currentTranslations = null;
      
      // Still need to handle per 90 logic for English metrics
      document.querySelectorAll('#metric-select-options span[data-i18n], #metric-select-trigger span[data-i18n]').forEach(span => {
        const metricKey = span.getAttribute('data-i18n');
        const originalMetric = customMetricOrder.find(m => m.i18n === metricKey);
        
        if (originalMetric) {
          if (isToggled) {
            // Show totals version (remove "per 90")
            span.textContent = originalMetric.text.replace(' per 90', '');
          } else {
            // Show per 90 version (keep "per 90")
            span.textContent = originalMetric.text;
          }
        }
      });
      
      return;
    }

    fetch(`locales/${language}.json`)
        .then(response => {
            // Don't throw an error, just return null if response is not OK
            return response.ok ? response.json() : null;
        })
        .then(translations => {
            // Only proceed if translations exist
            if (translations) {
                // Store translations globally
                window.currentTranslations = translations;
                
                // Then translate everything else
                document.querySelectorAll('[data-i18n]').forEach(element => {
                    const keys = element.getAttribute('data-i18n').split('.');
                    let value = translations;
                    for (const key of keys) {
                        if (value === undefined || value === null) break;
                        value = value[key];
                                         }
                     if (value) {
                         if (element.tagName === 'META') {
                             element.setAttribute('content', value);
                         } else if (element.tagName === 'INPUT') {
                             element.setAttribute('placeholder', value);
                         } else if (value.includes('<')) {
                             element.innerHTML = value;
                         } else if (element.tagName === 'SPAN' && element.getAttribute('data-i18n') && element.closest('#metric-select-options')) {
                             // Special handling for metric spans inside options to check per 90 state
                             const metricKey = element.getAttribute('data-i18n');
                             const originalMetric = customMetricOrder.find(m => m.i18n === metricKey);
                             
                             // Only add "per 90" if not toggled AND the original metric includes "per 90"
                             const shouldAddPerNinety = !isToggled && originalMetric && originalMetric.text.includes('per 90');
                             
                             // Get the translated version of "per 90" or use default English version
                             const per90Translation = translations.common && translations.common.per90 ? 
                                                     translations.common.per90 : " per 90";
                             
                             element.textContent = value + (shouldAddPerNinety ? per90Translation : '');
                         } else if (element.tagName === 'SPAN' && element.getAttribute('data-i18n') && element.closest('#metric-select-trigger')) {
                             // Special handling for the trigger span
                             const metricKey = element.getAttribute('data-i18n');
                             const originalMetric = customMetricOrder.find(m => m.i18n === metricKey);
                             
                             const shouldAddPerNinety = !isToggled && originalMetric && originalMetric.text.includes('per 90');
                             const per90Translation = translations.common && translations.common.per90 ? 
                                                     translations.common.per90 : " per 90";
                             
                             element.textContent = value + (shouldAddPerNinety ? per90Translation : '');
                         } else {
                             element.textContent = value;
                         }
                     }
                });
            }
        })
        .catch(() => {
            // Completely empty catch block to silently ignore any errors
        });
}

const preferredLanguage = getPreferredLanguage();
applyLanguage(preferredLanguage);