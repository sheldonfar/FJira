const headerRemovalSwitch = document.getElementById('header-removal-switch');
const breadcrumbsRemovalSwitch = document.getElementById('breadcrumbs-removal-switch');
const sprintHeaderRemovalSwitch = document.getElementById('sprint-header-removal-switch');
const filtersRemovalSwitch = document.getElementById('filters-removal-switch');
const swimlaneHeadersRemovalSwitch = document.getElementById('swimlane-headers-removal-switch');
const columnHeaderPaddingRange = document.getElementById('column-header-padding-range');

function sendMessage(message, value) {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: message, value: value });
    });
  });
}

function toggleSwitch(value, key, message) {
  chrome.storage.sync.set({[key]: value});

  sendMessage(message, value);
}

function setState(state) {
  headerRemovalSwitch.checked = state.removeHeader;
  breadcrumbsRemovalSwitch.checked = state.removeBreadcrumbs;
  sprintHeaderRemovalSwitch.checked = state.removeSprintHeader;
  filtersRemovalSwitch.checked = state.removeFilters;
  swimlaneHeadersRemovalSwitch.checked = state.removeSwimlaneHeaders;
  columnHeaderPaddingRange.value = state.columnHeaderPadding;
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'loadState' }, setState);
  
  headerRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeHeader', 'toggleHeaderRemoval'));
  breadcrumbsRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeBreadcrumbs', 'toggleBreadcrumbsRemoval'));
  sprintHeaderRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeSprintHeader', 'toggleSprintHeaderRemoval'));
  filtersRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeFilters',  'toggleFiltersRemoval'));
  swimlaneHeadersRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeSwimlaneHeaders',  'toggleSwimlaneHeadersRemoval'));
  columnHeaderPaddingRange.addEventListener('input', event => toggleSwitch(+event.target.value, 'columnHeaderPadding',  'setColumnHeaderPadding'));
});