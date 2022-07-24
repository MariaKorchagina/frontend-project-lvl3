import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js';

const elements = {
  form: document.querySelector('form'),
  inputField: document.getElementById('url-input'),
  addButton: document.querySelector('button'),
  feedback: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
  modal: {
    titleElement: document.querySelector('.modal-title'),
    descriptionElement: document.querySelector('.modal-body'),
    readMoreButton: document.querySelector('.full-article'),
  },
};

const render = (state) => (path, value) => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'en',
    debug: true,
    resources,
  });

  switch (path) {
    case 'form.processHandler': {
      const getProcessHandler = (processHandler) => {
        const { addButton, inputField, feedback } = elements;
        switch (processHandler) {
          case 'validating': {
            addButton.disabled = true;
            inputField.readOnly = true;
            break;
          }
          case 'failing': {
            addButton.disabled = false;
            inputField.removeAttribute('readonly');
            break;
          }
          case 'filling': {
            addButton.disabled = false;
            inputField.removeAttribute('readonly');
            inputField.classList.remove('is-invalid');
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
            feedback.textContent = i18nInstance.t('success');
            elements.inputField.value = '';
            elements.inputField.focus();
            break;
          }
          default:
            throw new Error(`Unknown state: ${processHandler}`);
        }
      };
      getProcessHandler(value, elements, i18nInstance);
      break;
    }

    case 'form.error': {
      const getErrorFeedback = (error) => {
        const { inputField, feedback } = elements;
        if (error) {
          inputField.classList.add('is-invalid');
          feedback.classList.remove('text-success');
          feedback.classList.add('text-danger');
          feedback.textContent = i18nInstance.t(`errors.${error}`);
        }
      };
      getErrorFeedback(value, elements, i18nInstance);
      break;
    }

    case 'feeds': {
      const getFeeds = (feeds) => {
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
      getFeeds(value, elements, i18nInstance);

      break;
    }

    case 'posts': {
      const getPosts = (posts) => {
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
          button.classList.add('btn', 'btn-outline-info', 'btn-sm');
          button.dataset.id = post.id;
          button.dataset.bsToggle = 'modal';
          button.dataset.bsTarget = '#modal';
          button.textContent = i18nInstance.t('posts');
          listItem.append(button);

          groupListPosts.append(listItem);
        });

        cardPosts.append(groupListPosts);
      };

      getPosts(value, elements, i18nInstance);
      break;
    }

    case 'postsHandler.posts': {
      const getPostsReader = (postsHandler) => {
        postsHandler.forEach((post) => {
          const postItem = document.querySelector(`a[data-id="${post.id}"]`);
          switch (post.status) {
            case 'read':
              postItem.classList.add('fw-normal');
              break;
            case 'unread':
              postItem.classList.add('fw-normal');
              break;
            default:
              throw new Error(`Unknown status: ${post.status}`);
          }
        });
      };
      getPostsReader(value);
      break;
    }

    case 'postsHandler.readModal': {
      const getPostsReaderModal = (postId) => {
        const { modal } = elements;
        const activePost = state.posts.find((post) => post.id === postId.toString());

        modal.titleElement.textContent = activePost.title;
        modal.descriptionElement.textContent = activePost.description;
        modal.readMoreButton.setAttribute('href', activePost.url);
      };

      getPostsReaderModal(value, state, elements);
      break;
    }
    default:
      throw new Error(`Unknown path: ${path}`);
  }
};

const view = (state) => onChange(state, render(state));

export default view;
