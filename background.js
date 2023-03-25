const storageKeys = [
  'removeHeader', 
  'removeBreadcrumbs',
  'removeSprintHeader', 
  'removeFilters'
];

function sendMessage(message, value) {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: message, value: value });
    });
  });
}

function loadState(callback) {
  chrome.storage.sync.get(storageKeys, result => {
    if (callback) {
      callback(result);
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (changeInfo.status == 'complete' && tabId === tabs[0].id) {
      loadState(state => {
        sendMessage('toggleHeaderRemoval', state.removeHeader);
        sendMessage('toggleBreadcrumbsRemoval', state.removeBreadcrumbs);
        sendMessage('toggleSprintHeaderRemoval', state.removeSprintHeader);
        sendMessage('toggleFiltersRemoval', state.removeFilters);
      });
    }
  });
});