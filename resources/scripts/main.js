// @ts-check


const CARD_MODAL_ID = 'card-modal';
const ELEMENT_CLASSES =  {
  ACCORDION: 'accordion',
  BOARD: 'board',
};
/** @type {string[]} */
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
/** @type {{card_update: string}} */
const MESSAGE_TYPE = {
  card_update: 'CARD_UPDATE'
};
/** @type {string} */
const PRIMARY_THEME_COLOR = '#ffe959';
/** @type {string} */
const SECONDARY_THEME_COLOR = '#d9bc00';
/** @type {string} */
const SECONDARY_THEME_COLOR_LIGHT = '#fffdf2';

/** @type {{unassigned: {[key: string]: {name: string, cards: object[]}}, assigned: {[key: string]: {name: string, cards: object[]}}}} */
let boards = {
  unassigned: {},
  assigned: {},
};
let CommentsLoading = false;
/** @type {{card: string | null, list: string | null}} */
let drag = {card: null, list: null};
/** @type {{id: string, avatarUrl: string | null, lastActiveDate: Date | null, email?: string | string, fullName: string | null, username: string | null} | null} */
let member = null;
/** @type {string[]} */
let memberCommentColors = [];
/** @type {number} */
let minListLengthAssigned = 100, minListLengthUnassigned = 100; 
/** @type {{[key: string]: {id: string, name: string, color: string}}} */
let tags = {};

/** @type {HTMLElement | null} */
const assignedBoard = document.getElementById('assigned-tasks-section');
/** @type {HTMLElement | null} */
const cardModal = document.getElementById('card-modal');
/** @type {HTMLElement | null} */
const unassignedBoard = document.getElementById('unassigned-tasks-section');
// @ts-ignore
const vscode = acquireVsCodeApi();


/**
 * Extracts intials form string value
 * @param {string} value 
 * @returns 
 */
const _getInitials = (/** @type {string} */ value) => {
  return value?.split(' ').reduce((prev, entry) => prev + entry[0].toUpperCase(), '');
};

/**
 * Gets color that corresponds to member
 * @param {string} idMember 
 * @returns 
 */
const _getMemberColor = (/** @type {string} */ idMember) => {
  const index = memberCommentColors.indexOf(idMember);
  if (index >= 0) {
    return LIST_COLORS[index];
  }
  memberCommentColors.push(idMember);
  const memberCommentColorsLen = memberCommentColors.length;
  return LIST_COLORS[(memberCommentColorsLen === 0 ? 1 : memberCommentColorsLen) - 1];
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
      const message = e.data;
      switch (message.type) {
        case 'CARD_UPDATE_RESP':
          break;
        case 'BOARD_LOAD':
          handleBoardLoads(message);
          break;
        case 'GET_COMMENTS':
          handleCommentLoads(message);
          break;
      }
  });
};

/**
 * Appends tag elements to the provided html element container
 * @param {HTMLElement} container 
 * @param {string[]} tagIds 
 */
const addTags = (/** @type {HTMLElement} */ container, /** @type {string[]} */ tagIds) => {
  for (const tagId of tagIds) {
    const tag = tags[tagId];
    if (!tag || !tag.name) {
      continue;
    }
    container.appendChild(createTagElement(tag));
  }
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
  /** @type {string} */ bgColor = ''
) => {
  color = _validateColor(color) ? color : SECONDARY_THEME_COLOR;
  /** @type {HTMLSpanElement} */
  let badgeElement = document.createElement('span');
  badgeElement.classList.add('badge');
  badgeElement.style.border = `1px solid ${color}`;
  badgeElement.style.color = color;
  badgeElement.style.borderRadius = circular ? '5em' : '0.5em';
  if (bgColor && _validateColor(bgColor)) {
    badgeElement.style.backgroundColor = bgColor;
  }
  badgeElement.innerText = value;
  return badgeElement;
};

/**
 * Creates project board card element
 * @param {object}  card 
 * @param {string} colorCode border colorcode
 * @returns {HTMLElement}
 */
const createCardElement = (/** @type {object}*/ card, /** @type { string } */ colorCode, /** @type {string} */ idList = '') => {
  /** @type {HTMLElement} */
  let cardElement = document.createElement('div');
  cardElement.classList.add('board-list-card');
  cardElement.id = card.id;
  cardElement.draggable = true;
  cardElement.setAttribute('list-id', idList);
  cardElement.onclick = e => handleCardSelect(e, card);
  cardElement.ondragleave = e => handleCardDragOverCardLeave(e, cardElement);
  cardElement.ondragover = e => handleCardDragOverCard(e, cardElement);
  cardElement.ondragstart = e => handleCardDrag(e, cardElement.id);
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
    addTags(tagsElement, card.tags);
    cardElement.appendChild(tagsElement);
  }

  return cardElement;
};

const createCommentElement = (/** @type {object}*/ action) => {
  const commentElement = document.createElement('div');
  commentElement.classList.add('comment');
  commentElement.id = action.id;
  const creatorElement = document.createElement('div');
  creatorElement.classList.add('comment-creator');
  const creatorBadge = createBadgeElement(_getInitials(action.member.fullName), true, PRIMARY_THEME_COLOR, _getMemberColor(action.member.id));
  creatorElement.appendChild(creatorBadge);
  const commentContainerElement = document.createElement('div');
  commentContainerElement.classList.add('comment-container');
  const commentData = document.createElement('div');
  commentData.classList.add('comment-metadata');
  commentData.innerHTML = `By ${action.member.fullName} on ${new Date(action.date)}`;
  const commentTextElement = document.createElement('div');
  commentTextElement.classList.add('comment-text');
  commentTextElement.innerHTML = action.text;
  commentContainerElement.appendChild(commentTextElement);
  commentContainerElement.appendChild(commentData);
  commentElement.appendChild(creatorElement);
  commentElement.appendChild(commentContainerElement);
  console.log(commentElement);

  return commentElement;
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
  listElement.classList.add(`${boardType}-board-list`);
  listElement.id = `${boardType}-${idList}`;
  listElement.setAttribute('color', colorCode);
  listElement.ondrop = e => handleCardDrop(e, listElement);
  listElement.ondragenter = e => handleCardDragOverList(e, listElement);
  listElement.ondragover = e => handleCardDragOverList(e, listElement);
  listElement.ondragleave = e => handleCardDragOverListLeave(e, listElement);
  let header = document.createElement('div');
  header.classList.add('board-list-header');
  header.style.border = `2px solid ${colorCode}`;
  header.innerText = name.toUpperCase();
  header.appendChild(createBadgeElement('0', true, colorCode));
  listElement.appendChild(header);

  return listElement;
};

const createModalElement = (/** @type {object} */ card) => {
  if (!cardModal) {return;}
  /** @type {HTMLElement | null} */
  const modalHeader = cardModal?.querySelector('.card-modal-header >h1');
  if (!!modalHeader) {
    modalHeader.innerHTML = `<span class="emoji-icon">\u{2615}</span> ${card.name}`;
    /** @type {HTMLElement | null} */
    const modalCloseIcon = cardModal?.querySelector('.card-modal-header .close');
    if (!!modalCloseIcon) {
      modalCloseIcon.onclick = e => handleCardClose(e);
    }
    /** @type {HTMLElement | null} */
    const tagsElement = cardModal?.querySelector('.card-modal-body .card-tags');
    if (!!tagsElement) {
      tagsElement.innerHTML = '';
      addTags(tagsElement, card.tags);
    }
    /** @type {HTMLElement | null} */
    const descriptionElement = cardModal?.querySelector('.card-modal-body .card-description .card-description-content');
    if (!!descriptionElement) {
      /** @type {string} */
      let description = card.description;
      description = description.replaceAll('\n', '<br>').replaceAll('\\-', '&middot;');
      descriptionElement.innerHTML = description;
    }
    sendMessage('GET_COMMENTS', {card: {id: card.id}});

  }
};

/**
 * Creates tag element
 * @param {{name: string, color: string, id: string}} tag 
 * @returns 
 */
const createTagElement = (/** @type {object} */ tag) => {
  const tagElement = createBadgeElement(tag.name.toUpperCase(), false, tag.color);
  tagElement.classList.add('tag');
  return tagElement;
};

/**
 * Loads board lists + cards
 * @param {object} message 
 */
const handleBoardLoads = (/** @type {object}*/ message) => {

  /** @type {object} */
  member = message.member;
  tags = message.board.tags;
  const board = message.board;
  if ([assignedBoard, unassignedBoard].includes(null)) {
    return;
  }
  // initialise lists for a board
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
    const isAssigned = card.idMembers?.includes(member?.id);
    const relevantBoard = isAssigned ? boards.assigned : boards.unassigned;
    relevantBoard[card.idList].cards.push(card);
    /** @type {HTMLElement | null} */
    const relevantList = document.getElementById(`${isAssigned ? 'assigned' : 'unassigned'}-${card.idList}`);

    if (!!relevantList) {
      /** @type {HTMLElement | null} */
      const listHeader = relevantList.querySelector(`.board-list-header`);
      const colorCode = !!listHeader ? listHeader.style.borderColor : '#ffffff';
      relevantList.appendChild(createCardElement(card, colorCode, relevantList.id));
      /** @type {HTMLSpanElement | null | undefined} */
      const cardCountBadge = listHeader?.querySelector('.badge');
      if (!!cardCountBadge) {
        cardCountBadge.innerText = parseInt(cardCountBadge.innerText) + 1 + '';
      }
      updateListLength(relevantList, isAssigned);
    }
  }
  console.log('boards: ', boards);
  _toggleBoard(assignedBoard);

};

/**
 * Handles card view/modal close
 * @param {MouseEvent} event 
 * @returns 
 */
const handleCardClose = (/** @type {MouseEvent} */ event) => {
  event.preventDefault();
  if (!cardModal) {return;}
  cardModal.style.display = "none";
};

/**
 * Handles card drag events
 * @param {DragEvent} event 
 */
const handleCardDrag = (/** @type {DragEvent} */ event, /** @type {string} */ idCard) => {
  console.log('Card drag: ');
  event.dataTransfer?.clearData();
  event.dataTransfer?.setData('text/plain', idCard);
};

/**
 * Handles card dragover list event ends
 * @param {DragEvent} event 
 * @param {HTMLElement} listElement
 */
const handleCardDragOverListLeave = (/** @type {DragEvent} */ event, /** @type {HTMLElement} */ listElement) => {
  event.preventDefault();
  console.log('Card drag over ends: ', listElement.id);
  event.preventDefault();
  listElement.style.border = '';
};

/**
 * Handles card dragover list events
 * @param {DragEvent} event 
 * @param {HTMLElement} listElement
 */
const handleCardDragOverList = (/** @type {DragEvent} */ event, /** @type {HTMLElement} */ listElement) => {
  event.preventDefault();
  // Check if dest list is the same as src list
  // @ts-ignore
  if (event['target']?.getAttribute('list-id') === listElement.id) {
    return;
  }
  console.log('Card drag over: ', listElement.id);
  event.preventDefault();
  listElement.style.border = `1px dotted ${PRIMARY_THEME_COLOR}`;
};

/**
 *  Handles card dragover card event ends
 * @param {DragEvent} event 
 * @param {HTMLElement} cardElement 
 */
const handleCardDragOverCardLeave = (/** @type {DragEvent} */ event, /** @type {HTMLElement} */ cardElement) => {
  console.log('Card drag over card: ', cardElement.innerText);
  event.preventDefault();
  cardElement.style.backgroundColor = '';
};

/**
 *  Handles card dragover card events
 * @param {DragEvent} event 
 * @param {HTMLElement} cardElement 
 */
const handleCardDragOverCard = (/** @type {DragEvent} */ event, /** @type {HTMLElement} */ cardElement) => {
  console.log('Card drag over card');
  event.preventDefault();
  cardElement.style.backgroundColor = SECONDARY_THEME_COLOR;
};

/**
 * Handles card drop events into a list 
 * @param {DragEvent} event 
 */
const handleCardDrop = (/** @type {DragEvent} */ event, /** @type {HTMLElement} */ destListElement) => {
  console.log('Card drop: ', event);

  const cardId = event.dataTransfer?.getData('text');
  /** @type {HTMLElement | null} */
  const cardElement = document.getElementById(`${cardId}`);
  /** @type {HTMLElement | null} */
  // @ts-ignore
  const srcListElement = document.getElementById(cardElement?.getAttribute('list-id'));
  if (!srcListElement || !cardElement) { return; }

  srcListElement.removeChild(cardElement);
  /** @type {string} */
  const boardType = srcListElement.id.includes('unassigned') ? 'unassigned' : 'assigned';
  const card = boards[boardType][srcListElement.id.replace(/^(un)?assigned-/, '')];
  delete boards[boardType][srcListElement.id.replace(/^(un)?assigned-/, '')];
  destListElement.appendChild(cardElement);
  boards[boardType][destListElement.id.replace(/^(un)?assigned-/, '')] = card;
  destListElement.style.border = '';
  cardElement.setAttribute('list-id', destListElement.id);
  cardElement.setAttribute('prev-list-id', srcListElement.id);
  cardElement.style.border = `1px solid ${destListElement.getAttribute('color')}`;
  sendMessage(
    MESSAGE_TYPE.card_update,
    {
      card: {
        id: cardElement.id,
        idList: destListElement.id.replace(/^(un)?assigned-/, ''),
      }
    }
  );
};

/**
 * Processes card clicks
 * @param {MouseEvent} event 
 * @param {object} card 
 */
const handleCardSelect = (/** @type {MouseEvent} */ event, /** @type {object}*/ card) => {
  if (!cardModal) {return;}
  createModalElement(card);
  cardModal.style.display = "block";
};

/**
 * Handles card update response
 * @param {object} message 
 */
const handleCardUpdate = (/** @type {object}*/ message) => {
  if (!message.error) {
    return;
  }
  const card = message.card;
  /** @type {HTMLElement | null} */
  const cardElement = document.getElementById(`${card.id}`);
  /** @type {HTMLElement | null} */
  // @ts-ignore
  const srcListElement = document.getElementById(cardElement?.getAttribute('list-id'));
  // @ts-ignore
  const destListElement = document.getElementById(cardElement?.getAttribute('prev-list-id'));
  if (!srcListElement || !destListElement || !cardElement) { return; }

  srcListElement.removeChild(cardElement);
  /** @type {string} */
  const boardType = srcListElement.id.includes('unassigned') ? 'unassigned' : 'assigned';
  const cardObj = boards[boardType][srcListElement.id.replace(/^(un)?assigned-/, '')];
  delete boards[boardType][srcListElement.id.replace(/^(un)?assigned-/, '')];
  destListElement.appendChild(cardElement);
  boards[boardType][destListElement.id.replace(/^(un)?assigned-/, '')] = cardObj;
};

const handleCommentLoads = (/** @type {object}*/ message) => {
  if (message.error || !message?.actions) {
    return;
  }
  const comments = message.actions;
  /** @type {HTMLElement | null} */
  const commentsSection = document.querySelector(`.card-comments-content`);
  if (!commentsSection) { return; }
  commentsSection.innerHTML = '';
  for (const comment of comments) {
    commentsSection.appendChild(createCommentElement(comment));
  }
};

/**
 * Send messge to vscode api
 * @param {string} type 
 * @param {object} data
 */
const sendMessage = (/** @type {string} */ type, /** @type {object}*/ data) => {
  vscode.postMessage({
    type: type,
    ...data
  });
};

/**
 * updates list min length to longest list length for each board type 
 * @param {HTMLElement} list 
 * @param {boolean} isAssigned 
 */
const updateListLength = (/** @type {HTMLElement} */ list, /** @type {boolean} */ isAssigned) => {
  const listHeight = list.getBoundingClientRect().height;
  let minListLength = isAssigned ? minListLengthAssigned : minListLengthUnassigned;
  minListLength = minListLength > listHeight ? minListLength : listHeight;
  document.querySelectorAll(`.${list.classList[0]}`)?.forEach(list => list['style'].minHeight = minListLength + 'px');
};

window.onclick = (/** @type {MouseEvent} */ event) => {
  if (cardModal && event.target === cardModal) {
    handleCardClose(event);
  }
};

addMessageEventListener();
addAccordionListeners();
