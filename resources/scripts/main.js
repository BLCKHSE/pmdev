// @ts-check


const ELEMENT_CLASSES =  {
  ACCORDION: 'accordion',
  BOARD: 'board',
};

const LIST_COLORS = [
  '#fffdf2',
  '#fffad9',
  '#fff6bf',
  '#fff3a6',
  '#fff08c',
  '#ffec73',
  '#ffe959',
  '#ffe540',
  '#ffe226',
  '#ffdf0d',
  '#f2d200',
  '#d9bc00',
  '#bfa600',
  '#a69000',
  '#8c7900',
  '#736300',
  '#594d00',
  '#403700',
  '#262100',
  '#0d0b00',
];

const PRIMARY_THEME_COLOR = '#ffe959';
const SECONDARY_THEME_COLOR = '#d9bc00';


/** @type {{unassigned: {[key: string]: {name: string, cards: object[]}}, assigned: {[key: string]: {name: string, cards: object[]}}}} */
let boards = {
  unassigned: {},
  assigned: {},
};

let member = null;

/** @type {{[key: string]: {id: string, name: string, color: string}}} */
let tags = {};
/** @type {HTMLElement | null} */
const assignedBoard = document.getElementById('assigned-tasks-section');

/** @type {HTMLElement | null} */
const unassignedBoard = document.getElementById('unassigned-tasks-section');

/**
 * Checks if a color value is supported
 * @param {string} color 
 * @returns 
 */
const _validateColor = (/** @type {string} */ color) => {
  document.head.style.color = color;
  const valid = !!document.head.style.color;
  document.head.style.color = '';
  return valid;
};

/**
 * Displays the board section
 * @param {HTMLElement | null} panel 
 */
const _toggleBoard = (panel) => {
  if (!panel) {
    return;
  }
  if (panel.style.maxHeight) {
    panel.style.maxHeight = '';
  } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
  }
};

/**
 * Adds board header collapse/expand listeners
 */
const addAccordionListeners = () => {
  /**@type {NodeListOf<HTMLButtonElement>} */
  const accordionBtns = document.querySelectorAll(`.${ELEMENT_CLASSES.ACCORDION}`);
  for (const accordionBtn of accordionBtns) {
    accordionBtn.addEventListener('click', () => {
        accordionBtn.classList.toggle('active');
        /** @type {HTMLElement | null} */
        let panel = document.getElementById(accordionBtn.dataset.panel ?? '');
        if (!panel) {
            return;
        }
        _toggleBoard(panel);
    });
  }
};

/**
 * Adds event listener for boards messages from vscode api
 */
const addMessageEventListener = () => {

  window.addEventListener('message', (e) => {
      console.log("Message: ", e.data);
      /** @type {object} */
      const boardMessage = e.data;
      /** @type {object} */
      member = boardMessage.member;
      /** @type {{[key: string]: {id: string, name: string, color: string}}} */
      tags = boardMessage.board.tags;
      handleBoardLoads(boardMessage.board);
  });
};

/**
 * Creates project board card element
 * @param {string} value 
 * @param {boolean} circular
 * @param {string} color
 * @returns {HTMLElement}
 *
 */
const createBadgeElement = (
  /** @type {string} */ value,
  /** @type {boolean} */ circular = false, 
  /** @type {string} */ color = PRIMARY_THEME_COLOR,
) => {
  color = _validateColor(color) ? color : SECONDARY_THEME_COLOR;
  /** @type {HTMLSpanElement} */
  let badgeElement = document.createElement('span');
  badgeElement.classList.add('badge');
  badgeElement.style.border = `1px solid ${color}`;
  badgeElement.style.color = color;
  badgeElement.style.borderRadius = circular ? '5em' : '0.5em';
  badgeElement.innerText = value;
  return badgeElement;
};

/**
 * Creates project board card element
 * @param {object}  card 
 * @param {string} colorCode border colorcode
 * @returns {HTMLElement}
 */
const createCardElement = (/** @type {object}*/ card, /** @type { string } */ colorCode) => {
  /** @type {HTMLElement} */
  let cardElement = document.createElement('div');
  cardElement.classList.add('board-list-card');
  cardElement.id = card.id;
  cardElement.style.border = `1px solid ${colorCode}`;
  /** @type {HTMLElement} */
  let cardHeaderElement = document.createElement('div');
  cardHeaderElement.classList.add('board-list-card-header');
  cardHeaderElement.innerText = card.name;
  cardElement.appendChild(cardHeaderElement);
  if (card.tags) {
    /** @type {HTMLElement} */
    let tagsElement = document.createElement('div');
    tagsElement.classList.add('tags');
    for (const tagId of card.tags) {
      const tag = tags[tagId];
      if (!tag.name) {
        continue;
      }
      const tagElement = createBadgeElement(tag.name.toUpperCase(), false, tag.color);
      tagElement.classList.add('tag');
      tagsElement.appendChild(tagElement);
    }
    cardElement.appendChild(tagsElement);
  }

  return cardElement;
};

/**
 * Creates project board list element
 * @param {string} idList list id
 * @param {string} name list name
 * @param {string} colorCode header border colorcode
 * @param {string} boardType indictaes if board is assigned or unassigned
 * @returns {HTMLElement}
 */
const createListElement = (
  /** @type { string }*/ idList, 
  /** @type { string }*/ name,
  /** @type { string } */ colorCode,
  /** @type {'assigned' | 'unassigned'} */ boardType = 'unassigned'
) => {
  let listElement = document.createElement('div');
  listElement.classList.add('board-list');
  listElement.id = `${boardType}-${idList}`;
  let header = document.createElement('div');
  header.classList.add('board-list-header');
  header.style.border = `2px solid ${colorCode}`;
  header.innerText = name.toUpperCase();
  header.appendChild(createBadgeElement('0', true, colorCode));
  listElement.appendChild(header);

  return listElement;
};

/**
 * Loads board lists + cards
 * @param {object} board 
 */
const handleBoardLoads = (/** @type {object}*/ board) => {

  if ([assignedBoard, unassignedBoard].includes(null)) {
    return;
  }
  // initialise lists for each board
  for (let i = 0; i < board.lists.length; i++) {
    const list = board.lists[i];
    boards.assigned[list.id] = {name: list.name, cards: []};
    assignedBoard?.appendChild(createListElement(list.id, list.name, LIST_COLORS[i], 'assigned'));
    boards.unassigned[list.id] = {name: list.name, cards: []};
    unassignedBoard?.appendChild(createListElement(list.id, list.name, LIST_COLORS[i], 'unassigned'));
  }
  // initialise cards for each list
  for(const card of board.cards) {
    /** @type {boolean} */
    const isAssigned = card.idMembers.includes(member.id);
    const relevantBoard = isAssigned ? boards.assigned : boards.unassigned;
    relevantBoard[card.idList].cards.push(card);
    /** @type {HTMLElement | null} */
    const relevantList = document.getElementById(`${isAssigned ? 'assigned' : 'unassigned'}-${card.idList}`);

    if (!!relevantList) {
      /** @type {HTMLElement | null} */
      const listHeader = relevantList.querySelector(`.board-list-header`);
      const colorCode = !!listHeader ? listHeader.style.borderColor : '#ffffff';
      relevantList.appendChild(createCardElement(card, colorCode));
      /** @type {HTMLSpanElement | null | undefined} */
      const cardCountBadge = listHeader?.querySelector('.badge');
      if (!!cardCountBadge) {
        cardCountBadge.innerText = parseInt(cardCountBadge.innerText) + 1 + '';
      }
    }
  }
  _toggleBoard(assignedBoard);

};


addMessageEventListener();
addAccordionListeners();
