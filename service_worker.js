const storageKeys = [
  'removeHeader', 
  'removeBreadcrumbs',
  'removeSprintHeader', 
  'removeFilters',
  'removeSwimlaneHeaders',
  'columnHeaderPadding',
];

function sendMessage(message, value) {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: message, value: value });
    });
  });
}

function loadState(callback) {
  chrome.storage.sync.get(storageKeys, callback);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs = []) => {
    if (changeInfo.status == 'complete' && tabs[0] && tabId === tabs[0].id) {
      loadState(state => {
        sendMessage('toggleHeaderRemoval', state.removeHeader);
        sendMessage('toggleBreadcrumbsRemoval', state.removeBreadcrumbs);
        sendMessage('toggleSprintHeaderRemoval', state.removeSprintHeader);
        sendMessage('toggleFiltersRemoval', state.removeFilters);
        sendMessage('toggleSwimlaneHeadersRemoval', state.removeSwimlaneHeaders);
        sendMessage('setColumnHeaderPadding', state.columnHeaderPadding);
      });
    }
  });
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === 'loadState') {
    console.info('LOAD STATE');
    loadState(sendResponse);
    return true;
  }
});