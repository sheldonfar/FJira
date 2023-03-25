const header = document.querySelector('header[role="banner"]');
const html = document.querySelector('html');
const breadcrumbs = document.querySelector('div[data-testid="rapidboard-breadcrumbs"]');
const sprintHeader = document.querySelector('#ghx-header');
const filters = document.querySelector('#ghx-operations');

function triggerResize() {
  if (window.GH && window.GH.Layout) {
    window.GH.Layout.fireDelayedWindowResize();
  }
}

function toggleHeaderRemoval(value) {
  if (value) {
    header.style.display = 'none';
    html.style.setProperty('--topNavigationHeight', '0px');
  } else {
    header.style.display = 'flex';
    html.style.setProperty('--topNavigationHeight', '56px');
  }

  triggerResize();
}

function toggleBreadcrumbsRemoval(value) {
  if (value) {
    breadcrumbs.style.height = 0;
    breadcrumbs.style.overflow = 'hidden';
  } else {
    breadcrumbs.style.height = null;
    breadcrumbs.style.overflow = null;
  }
}

function toggleSprintHeaderRemoval(value) {
  if (value) {
    sprintHeader.style.display = 'none';
  } else {
    sprintHeader.style.display = 'flex';
  }
}

function toggleFiltersRemoval(value) {
  if (value) {
    filters.style.display = 'none';
  } else {
    filters.style.display = 'flex';
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(request => {
  if (request.action === 'toggleHeaderRemoval') {
    toggleHeaderRemoval(request.value);
  }
  if (request.action === 'toggleBreadcrumbsRemoval') {
    toggleBreadcrumbsRemoval(request.value);
  }
  if (request.action === 'toggleSprintHeaderRemoval') {
    toggleSprintHeaderRemoval(request.value);
  }
  if (request.action === 'toggleFiltersRemoval') {
    toggleFiltersRemoval(request.value);
  }
});