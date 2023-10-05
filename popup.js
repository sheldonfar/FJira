const headerRemovalSwitch = document.getElementById('header-removal-switch');
const breadcrumbsRemovalSwitch = document.getElementById('breadcrumbs-removal-switch');
const sprintHeaderRemovalSwitch = document.getElementById('sprint-header-removal-switch');
const filtersRemovalSwitch = document.getElementById('filters-removal-switch');
const swimlaneHeadersRemovalSwitch = document.getElementById('swimlane-headers-removal-switch');
const unassignedRowRemovalSwitch = document.getElementById('unassigned-row-removal-switch');
const columnHeaderPaddingRange = document.getElementById('column-header-padding-range');
const columnsRemovalContainer = document.getElementById('columns-removal-container');
const removeColumnInput = document.getElementById('remove-column-input');
const removeColumnButton = document.getElementById('remove-column-button');
const resetButton = document.getElementById('reset-button');

let rootState; 

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

function fillRemoveColumnList() {
  columnsRemovalContainer.innerHTML = '';
  
  Object.keys(rootState.removeColumns || {}).forEach(column => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.checked = rootState.removeColumns[column];
    checkbox.addEventListener('change', event => {
      rootState.removeColumns = {
        ...rootState.removeColumns,
        [column]: event.target.checked,
      };
      toggleSwitch(rootState.removeColumns, 'removeColumns', 'toggleColumnsRemoval');
    });

    const span = document.createElement('span');
    span.innerText = column;

    const removeButton = document.createElement('a');
    removeButton.setAttribute('href', '#');
    removeButton.addEventListener('click', () => {
      sendMessage('toggleColumnsRemoval', {...rootState.removeColumns, [column]: false });
      delete rootState.removeColumns[column];
      chrome.storage.sync.set({ removeColumns: rootState.removeColumns });
      fillRemoveColumnList();
    });
    removeButton.innerText = 'Remove';
    
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(removeButton);
    li.classList.add('setting');

    columnsRemovalContainer.appendChild(li);
  });
}

function setPaddingRangeState(disabled) {
  if (disabled) {
    columnHeaderPaddingRange.setAttribute('disabled', 'disabled');
  } else {
    columnHeaderPaddingRange.removeAttribute('disabled');
  }
}

function setState(_state) {
  const state = _state || {};
  rootState = state;
  headerRemovalSwitch.checked = state.removeHeader;
  breadcrumbsRemovalSwitch.checked = state.removeBreadcrumbs;
  sprintHeaderRemovalSwitch.checked = state.removeSprintHeader;
  filtersRemovalSwitch.checked = state.removeFilters;
  swimlaneHeadersRemovalSwitch.checked = state.removeSwimlaneHeaders;
  unassignedRowRemovalSwitch.checked = state.removeUnassignedRow;
  columnHeaderPaddingRange.value = state.columnHeaderPadding || columnHeaderPaddingRange.defaultValue;
  setPaddingRangeState(state.removeSwimlaneHeaders);
  fillRemoveColumnList();
}

function humanizeString(str) {
  return str.toLowerCase().replace(/\b(\w)/g, match => match.toUpperCase());
}

function resetSettings() {
  chrome.runtime.sendMessage({ action: 'resetState' }, setState);
}

function removeColumn() {
  rootState.removeColumns = {
    ...rootState.removeColumns,
    [humanizeString(removeColumnInput.value)]: true,
  };
  toggleSwitch(rootState.removeColumns, 'removeColumns', 'toggleColumnsRemoval');
  removeColumnInput.value = '';
  fillRemoveColumnList();
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'loadState' }, setState);
  
  headerRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeHeader', 'toggleHeaderRemoval'));
  breadcrumbsRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeBreadcrumbs', 'toggleBreadcrumbsRemoval'));
  sprintHeaderRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeSprintHeader', 'toggleSprintHeaderRemoval'));
  filtersRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeFilters', 'toggleFiltersRemoval'));
  swimlaneHeadersRemovalSwitch.addEventListener('change', event => {
    toggleSwitch(event.target.checked, 'removeSwimlaneHeaders', 'toggleSwimlaneHeadersRemoval');
    setPaddingRangeState(event.target.checked);
  });
  unassignedRowRemovalSwitch.addEventListener('change', event => toggleSwitch(event.target.checked, 'removeUnassignedRow', 'toggleUnassignedRowRemoval'));
  columnHeaderPaddingRange.addEventListener('input', event => toggleSwitch(+event.target.value, 'columnHeaderPadding',  'setColumnHeaderPadding'));
  resetButton.addEventListener('click', resetSettings);
  removeColumnButton.addEventListener('click', removeColumn);
});