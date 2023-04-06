function injectCode(src) {
  const script = document.createElement('script');
  script.src = src;
  document.head.appendChild(script);
}

function triggerResize() {
  injectCode(chrome.runtime.getURL('/resize.js'));
}

function toggleHeaderRemoval(value) {
  const html = document.querySelector('html');
  const header = document.querySelector('header[role="banner"]');

  if (!html || !header) return;
  
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
  const breadcrumbs = document.querySelector('div[data-testid="rapidboard-breadcrumbs"]');

  if (!breadcrumbs) return;
  
  if (value) {
    breadcrumbs.style.height = 0;
    breadcrumbs.style.overflow = 'hidden';
  } else {
    breadcrumbs.style.height = null;
    breadcrumbs.style.overflow = null;
  }
}

function toggleSprintHeaderRemoval(value) {
  const sprintHeader = document.querySelector('#ghx-header');

  if (!sprintHeader) return;

  if (value) {
    sprintHeader.style.display = 'none';
  } else {
    sprintHeader.style.display = 'flex';
  }
}

function toggleFiltersRemoval(value) {
  const filters = document.querySelector('#ghx-operations');

  if (!filters) return;

  if (value) {
    filters.style.display = 'none';
  } else {
    filters.style.display = 'flex';
  }
}

function toggleSwimlaneHeadersRemoval(value) {
  const swimlaneHeaders = document.querySelectorAll('.ghx-swimlane-header');

  [...swimlaneHeaders].forEach(header => {
    if (value) {
      header.style.display = 'none';
    } else {
      header.style.display = 'block';
    }
  });  
}

function setColumnHeaderPadding(value) {
  const columns = document.querySelectorAll('#ghx-column-headers > .ghx-column');
  const swimlaneHeaders = document.querySelectorAll('.ghx-swimlane-header');

  [...columns].forEach(column => {
    column.style.padding = `${value}px`;
  });

  [...swimlaneHeaders].forEach(header => {
    header.style.top = `${value * 2 + 12}px`;
  });

  triggerResize();
}

function toggleColumnsRemoval(data) {
  Object.keys(data || {}).forEach(key => {
    const columns = document.querySelectorAll(`.ghx-column[title="${key}" i]`);
    const column = columns && columns[0];
  
    if (!column) return;
  
    const columnId = column.getAttribute('data-id'); 
    const mainColumns = document.querySelectorAll(`.ghx-column[data-column-id="${columnId}"]`);
    const mainColumn = mainColumns && mainColumns[0];

    if (!mainColumn) return;
    
    if (data[key]) {
      column.style.display = 'none';
      mainColumn.style.display = 'none';
    } else {
      column.style.display = 'block';
      mainColumn.style.display = 'block';
    }
  });
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
  if (request.action === 'toggleSwimlaneHeadersRemoval') {
    toggleSwimlaneHeadersRemoval(request.value);
  }
  if (request.action === 'setColumnHeaderPadding') {
    setColumnHeaderPadding(request.value);
  }
  if (request.action === 'toggleColumnsRemoval') {
    toggleColumnsRemoval(request.value);
  }
});