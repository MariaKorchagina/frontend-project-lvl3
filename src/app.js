import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import view from './view.js';
import parse from './parser.js';

const fillContent = () => {
  const state = {
    form: {
      error: '',
      formState: 'filling',
    },
    feeds: [],
    posts: [],
    uiState: {
      readedPosts: [],
      readModal: '',
    },
  };

  yup.setLocale({
    mixed: {
      notOneOf: 'sameUrl',
    },
    string: {
      url: 'notValidUrl',
      url: 'notValidLink',
    },
  });

  const viewState = view(state);

  document.querySelector('.posts').addEventListener('click', (event) => {
    const idPost = event.target.dataset.id;
    viewState.uiState.readedPosts = viewState.uiState.readedPosts.map((post) => (post.id === idPost ? { id: idPost, status: 'read' } : post));
    if (event.target.dataset.bsToggle === 'modal') {
      viewState.uiState.readModal = idPost;
    }
  });

  const proxyUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

  const setAddedPost = (post, idFeed) => {
    const idPost = _.uniqueId();
    viewState.posts.push({ ...post, id: idPost, idFeed });
    viewState.uiState.readedPosts.push({ id: idPost, status: 'unread' });
  };

  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    viewState.form.formState = 'validating';
    const url = new FormData(e.target).get('url');
    const schema = yup.string().url().notOneOf(viewState.feeds.map((feed) => feed.url));
    schema.validate(url)

      .then(() => {
        viewState.form.formState = 'filling';
        return axios.get(proxyUrl(url));
      })

      .then((response) => {
        const { feed, posts } = parse(response.data.contents, url);
        const idFeed = _.uniqueId();
        viewState.feeds.push({ ...feed, id: idFeed });
        posts.forEach((post) => {
          setAddedPost(post, idFeed);
        });
      })

      .catch((fail) => {
        viewState.form.error = fail.message;
        viewState.form.formState = 'failing';
      });
  });
};

export default fillContent;
