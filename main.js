let clickedEl = null;

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
  const breadcrumbsContainer = document.querySelector('nav[aria-label="Breadcrumbs"]');
  const breadcrumbs = breadcrumbsContainer?.parentElement;
  
  if (!breadcrumbs) return;
  
  if (value) {
    breadcrumbs.style.display = 'none';
  } else {
    breadcrumbs.style.display = 'block';
  }
}

function toggleSprintHeaderRemoval(value) {
  const headerTitleContainer = document.querySelector('div[data-testid="software-board.header.title.container"]');
  const sprintHeader = headerTitleContainer?.parentElement?.parentElement;

  if (!sprintHeader) return;

  if (value) {
    sprintHeader.style.display = 'none';
  } else {
    sprintHeader.style.display = 'flex';
  }
}

function toggleFiltersRemoval(value) {
  const controlsBar = document.querySelector('div[data-testid="software-board.header.controls-bar"]');
  const filters = controlsBar?.parentElement?.parentElement;
  const filtersParent = filters?.parentElement;

  if (!filters) return;

  if (value) {
    filters.style.display = 'none';
    if (filtersParent) {
      filtersParent.style.margin = '0';
    }
  } else {
    filters.style.display = 'flex';
    if (filtersParent) {
      filtersParent.style.margin = null;
    }
  }
}

function toggleSwimlaneHeadersRemoval(value) {
  const columnHeaderContainer = document.querySelector('div[data-testid="platform-board-kit.common.ui.column-header.header.column-header-container"]');
  const swimlaneContents = document.querySelectorAll('div[data-test-id="platform-board-kit.ui.swimlane.swimlane-content"]');
  const swimlaneWrappers = document.querySelectorAll('div[data-test-id="platform-board-kit.ui.swimlane.swimlane-wrapper"]');

  const swimlaneHeader = columnHeaderContainer?.parentElement?.parentElement?.parentElement?.parentElement;

  if (!swimlaneHeader) return;

  const neighbor = swimlaneHeader.nextSibling;
  const placeholder = neighbor?.firstChild;

  [...swimlaneContents].forEach(swimlaneContent => {
    swimlaneContent.parentElement.style.top = value ? '0' : null;
  });
  
  [...swimlaneWrappers].forEach(swimlaneWrapper => {
    swimlaneWrapper.firstChild.style.top = value ? '40px' : null;
  });

  if (value) {
    swimlaneHeader.style.display = 'none';
    
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  } else {
    swimlaneHeader.style.display = 'grid';

    if (placeholder) {
      placeholder.style.display = 'block';
    }
  }
}

function toggleUnassignedRowRemoval(value) {
  const swimlaneWrapper = [...document.querySelectorAll('div[data-test-id="platform-board-kit.ui.swimlane.swimlane-wrapper"]')]
    .find(el => el.textContent.includes('Unassigned'));

  if (!swimlaneWrapper) return;

  if (value) {
    swimlaneWrapper.style.display = 'none';
  } else {
    swimlaneWrapper.style.display = 'block';
  }
}

function setColumnHeaderPadding(value) {
  const columnHeaderContainers = document.querySelectorAll('div[data-testid="platform-board-kit.common.ui.column-header.header.column-header-container"]');
  const swimlaneContents = document.querySelectorAll('div[data-test-id="platform-board-kit.ui.swimlane.swimlane-content"]');
  const swimlaneWrappers = document.querySelectorAll('div[data-test-id="platform-board-kit.ui.swimlane.swimlane-wrapper"]');

  [...columnHeaderContainers].forEach(columnHeaderContainer => {
    columnHeaderContainer.parentElement.style.height = `${value}px`;
  });

  [...swimlaneContents].forEach(swimlaneContent => {
    swimlaneContent.parentElement.style.top = `${value}px`;
  });
  
  [...swimlaneWrappers].forEach(swimlaneWrapper => {
    swimlaneWrapper.firstChild.style.top = `${value}px`;
  });

  if (swimlaneWrappers[0]) {
    swimlaneWrappers[0].parentElement.firstChild.style.height = `${value}px`;
    swimlaneWrappers[0].parentElement.firstChild.style.marginTop = `-${value}px`;
  }
 
  triggerResize();
}

function toggleColumnsRemoval(data) {
  Object.keys(data || {}).forEach(key => {
    const columnHeaderContainers = document.querySelectorAll('div[data-testid="platform-board-kit.common.ui.column-header.header.column-header-container"]');
    const columnHeaderContainersList = [...columnHeaderContainers];
    const columnHeaderContainer = columnHeaderContainersList.find(el => el.textContent.toLowerCase().includes(key.toLowerCase()));

    const column = columnHeaderContainer?.parentElement?.parentElement?.parentElement;
  
    if (!column) return;
  
    const index = columnHeaderContainersList.indexOf(columnHeaderContainer);
    const mainColumns = document.querySelectorAll(`div[data-test-id="platform-board-kit.ui.column.draggable-column.styled-wrapper"]:nth-of-type(${index + 1})`);

    [...mainColumns].forEach(mainColumn => {
      if (data[key]) {
        mainColumn.style.display = 'none';
      } else {
        mainColumn.style.display = 'flex';
      }
    });

    if (data[key]) {
      column.style.display = 'none';
    } else {
      column.style.display = 'flex';
    }
  });
}

function exportTickets(formatFor) {
  const columnName = clickedEl.innerText;
  const column = document.querySelector(`.ghx-column[title="${columnName}" i]`);

  if (!column) return;

  const columnId = column.getAttribute('data-id'); 
  const mainColumn = document.querySelector(`.ghx-column[data-column-id="${columnId}"]`);

  if (!mainColumn) return;

  const issues = mainColumn.querySelectorAll('.ghx-issue');

  if (!issues?.length) return;

  const issuesList = [...issues];

  let listHeader = `--${columnName}--\n\n`;

  if (formatFor === 'slack') {
    listHeader = `*${columnName}*\n\n`;
  }
  
  return issuesList.reduce((acc, issue, index) => {
    const summary = issue.querySelector('.ghx-summary');

    if (!summary) return acc;

    const estimate = issue.querySelector('.ghx-estimate');
    const estimateValue = estimate?.innerText || '?';
    const ticketId = issue.getAttribute('data-issue-key');
    const link = `${document.location.origin}/browse/${ticketId}`;

    let issueString = `[${ticketId}] ${summary.innerText} (${estimateValue})`;

    if (formatFor === 'slack') {
      issueString = `* [[${ticketId}](${link})] ${summary.innerText} (_${estimateValue}_)`;
    }

    return acc + issueString + (index === issuesList.length - 1 ? '' : '\n');
  }, listHeader);
}

function copyTextToClipboard(text) {
  var copyFrom = document.createElement('textarea');

  copyFrom.textContent = text;
  document.body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  copyFrom.blur();
  document.body.removeChild(copyFrom);
}

document.addEventListener('contextmenu', event => (clickedEl = event.target), true);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(request => {
  if (request.action === 'toggleHeaderRemoval') {
    toggleHeaderRemoval(request.value);
  }
  else if (request.action === 'toggleBreadcrumbsRemoval') {
    toggleBreadcrumbsRemoval(request.value);
  }
  else if (request.action === 'toggleSprintHeaderRemoval') {
    toggleSprintHeaderRemoval(request.value);
  }
  else if (request.action === 'toggleFiltersRemoval') {
    toggleFiltersRemoval(request.value);
  }
  else if (request.action === 'toggleSwimlaneHeadersRemoval') {
    toggleSwimlaneHeadersRemoval(request.value);
  }
  else if (request.action === 'toggleUnassignedRowRemoval') {
    toggleUnassignedRowRemoval(request.value);
  }
  else if (request.action === 'setColumnHeaderPadding') {
    setColumnHeaderPadding(request.value);
  }
  else if (request.action === 'toggleColumnsRemoval') {
    toggleColumnsRemoval(request.value);
  }
  else if (request.action === 'exportTicketsSlack') {
    copyTextToClipboard(exportTickets('slack'));
  }
  else if (request.action === 'exportTicketsPlain') {
    copyTextToClipboard(exportTickets('plain'));
  }
});