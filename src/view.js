
import onChange from 'on-change';
import i18next from 'i18next';
import en from './locales/en.js';

const elements = {
  form: document.querySelector('form'),
  inputField: document.getElementById('url-input'),
  addButton: document.querySelector('button'),
  feedback: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
  modal: {
    titleEl: document.querySelector('.modal-title'),
    descriptionEl: document.querySelector('.modal-body'),
    readMoreButton: document.querySelector('.full-article'),
  },
};


const getProcessHandler = (processState, elements, i18nInstance) => {
  const { addButton, inputField, feedback } = elements;
  switch (processState) {
    case 'validating':
      addButton.disabled = true;
      inputField.readOnly = true;
      break;
    case 'error':
      addButton.disabled = false;
      inputField.removeAttribute('readonly');
      break;
    case 'filling':
      addButton.disabled = false;
      inputField.removeAttribute('readonly');
      inputField.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18nInstance.t('success');
      elements.inputField.value = '';
      elements.inputField.focus();
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

const getErrorFeedback = (error, elements, i18nInstance) => {
  const { inputField, feedback } = elements;
  if (error) {
    inputField.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t(`errors.${error}`);
  }
};


const getFeeds = (feeds, elements, i18nInstance) => {
  const { feeds: rootFeeds } = elements;
  rootFeeds.innerHTML = '';
  const cardFeeds = document.createElement('div');
  cardFeeds.classList.add('card', 'border-0');
  rootFeeds.append(cardFeeds);

  const bodyFeeds = document.createElement('div');
  bodyFeeds.classList.add('card-body');
  cardFeeds.append(bodyFeeds);

  const titleFeeds = document.createElement('h2');
  titleFeeds.classList.add('card-title', 'h4');
  titleFeeds.textContent = i18nInstance.t('feeds');
  bodyFeeds.append(titleFeeds);

  const listFeeds = document.createElement('ul');
  listFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  cardFeeds.append(listFeeds);

  feeds.forEach((feed) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    listFeeds.append(listItem);

    const titleItem = document.createElement('h3');
    titleItem.classList.add('m-0', 'h6');
    titleItem.textContent = feed.title;
    listItem.append(titleItem);

    const descriptionItem = document.createElement('p');
    descriptionItem.classList.add('m-0', 'small', 'text-black-50');
    descriptionItem.innerHTML = feed.description;
    listItem.append(descriptionItem);
  });
};


const getPosts = (posts, elements, i18nInstance) => {
  const { posts: rootPosts } = elements;
  rootPosts.innerHTML = '';

  const cardPosts = document.createElement('div');
  cardPosts.classList.add('card', 'border-0');
  rootPosts.append(cardPosts);

  const bodyPosts = document.createElement('div');
  bodyPosts.classList.add('card-body');
  cardPosts.append(bodyPosts);

  const titlePosts = document.createElement('h2');
  titlePosts.classList.add('card-title', 'h4');
  titlePosts.textContent = i18nInstance.t('posts');
  bodyPosts.append(titlePosts);

  const groupListPosts = document.createElement('ul');
  groupListPosts.classList.add('list-group', 'border-0', 'rounded-0');
  posts.forEach((post) => {

    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const link = document.createElement('a');
    link.setAttribute('href', post.url);
    link.dataset.id = post.id;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;
    listItem.append(link);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18nInstance.t('posts');
    listItem.append(button);

    groupListPosts.append(listItem);
  });

  cardPosts.append(groupListPosts);
};


const getPostsUiState = (postsUiState) => {
  postsUiState.forEach((post) => {
    const postEl = document.querySelector(`a[data-id="${post.id}"]`);
    switch (post.status) {
      case 'unread':
        postEl.classList.add('fw-bold');
        break;

      case 'read':
        postEl.classList.remove('fw-bold');
        postEl.classList.add('fw-normal');
        break;

      default:
        throw new Error(`Unknown status: ${post.status}`);
    }
  });
};


const renderModal = (postId, state, elements) => {
  const activePost = state.posts.find((post) => post.id === postId.toString());

  elements.modal.titleEl.textContent = activePost.title;
  elements.modal.descriptionEl.textContent = activePost.description;
  elements.modal.readMoreButton.setAttribute('href', activePost.url);
};

const render = (state) => (path, value) => {
  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'en',
    debug: false,
    resources: { en },
  });


  switch (path) {
    case 'form.processState':
      getProcessHandler(value, elements, i18nInstance);
      break;

    case 'form.error':
      getErrorFeedback(value, elements, i18nInstance);
      break;

    case 'feeds':
      getFeeds(value, elements, i18nInstance);
      break;

    case 'posts':
      getPosts(value, elements, i18nInstance);
      break;

    case 'uiState.posts':
      getPostsUiState(value);
      break;

    case 'uiState.modalPostId':
      renderModal(value, state, elements);
      break;

    default:
      throw new Error(`Unknown path: ${path}`);
  }
};

const watcher = (state) => onChange(state, render(state));

export default watcher;