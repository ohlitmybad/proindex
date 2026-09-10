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
    trigger: document.getElementById('age-select-trigger'),
    options: document.getElementById('age-select-options'),
    hiddenSelect: ageInput
  }
];

// Generic function to handle dropdown behavior
function setupCustomSelector(selector) {
  const { trigger, options, hiddenSelect } = selector;
  
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
    const metricSearch = document.getElementById('metricSearch');
    if (metricSearch) {
      setTimeout(function () { metricSearch.focus(); }, 0);
    }
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

function refreshTranslatedTriggers() {
  if (typeof updateMetricTrigger === 'function') updateMetricTrigger();
  if (typeof updateLeagueTrigger === 'function') updateLeagueTrigger();
  if (typeof updatePositionTrigger === 'function') updatePositionTrigger();
  if (typeof updateMetricLegend === 'function') updateMetricLegend();
  if (typeof refreshThresholdMetricLabels === 'function') refreshThresholdMetricLabels();
  if (typeof syncToolbarLayout === 'function') syncToolbarLayout();
}

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
      }
    });
  }
});

function getOpenDropdownOptions(trigger) {
  if (!trigger) return null;
  const next = trigger.nextElementSibling;
  if (next && next.classList.contains('custom-select-options')) return next;
  const parent = trigger.parentElement;
  return parent ? parent.querySelector('.custom-select-options') : null;
}

function setupKeyboardNavigation() {
  document.addEventListener('keydown', function (e) {
    const openTrigger = document.querySelector('.custom-select-trigger.open');
    if (!openTrigger) return;
    const options = getOpenDropdownOptions(openTrigger);
    if (!options) return;

    const target = e.target;
    const isField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    const fieldInDropdown = isField && options.contains(target);

    if (isField && !fieldInDropdown) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      openTrigger.classList.remove('open');
      options.style.display = 'none';
      return;
    }

    if (fieldInDropdown && e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') {
      return;
    }

    const visible = Array.from(options.querySelectorAll('.custom-select-option:not([hidden]):not(.metric-category-header)'));
    if (!visible.length) return;
    const currentIndex = visible.findIndex(opt => opt.classList.contains('selected'));

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      let next = currentIndex;
      if (e.key === 'ArrowDown') next = currentIndex < visible.length - 1 ? currentIndex + 1 : 0;
      else next = currentIndex > 0 ? currentIndex - 1 : visible.length - 1;
      visible.forEach(opt => opt.classList.remove('selected'));
      visible[next].classList.add('selected');
      visible[next].scrollIntoView({ block: 'nearest' });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = options.querySelector('.custom-select-option.selected:not([hidden])') || visible[0];
      if (selected) selected.click();
      return;
    }

    if (e.key.length === 1 && /[a-zA-Z0-9%\s\-\+\(\)]/.test(e.key)) {
      const letter = e.key.toLowerCase();
      const start = currentIndex + 1;
      const match = visible.slice(start).concat(visible.slice(0, start)).find(opt => {
        const text = (opt.textContent || '').trim().toLowerCase();
        return text.charAt(0) === letter;
      });
      if (match) {
        visible.forEach(opt => opt.classList.remove('selected'));
        match.classList.add('selected');
        match.scrollIntoView({ block: 'nearest' });
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setupKeyboardNavigation();
  if (typeof initIndexApp === 'function') initIndexApp();
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
          let text = isToggled
            ? originalMetric.text.replace(' per 90', '')
            : originalMetric.text;
          if (originalMetric.text.startsWith('CATEGORY: ')) {
            text = text.replace('CATEGORY: ', '');
          }
          span.textContent = text;
        }
      });
      
      refreshTranslatedTriggers();
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
                refreshTranslatedTriggers();
            }
        })
        .catch(() => {
            // Completely empty catch block to silently ignore any errors
        });
}

const preferredLanguage = getPreferredLanguage();
applyLanguage(preferredLanguage);