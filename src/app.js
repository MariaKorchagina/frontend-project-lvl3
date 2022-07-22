import * as yup from 'yup';
import watcher from './view.js';
import parse from './parser.js';
import axios from 'axios';

let id = (function () {
  let num = 0;
  return function (prefix) {
    prefix = String(prefix);
    num += 1;
    return prefix + num;
  }
}
  ());

const fillContent = () => {
  const state = {
    form: {
      error: '',
      processHandler: 'filling',
    },
    feeds: [],
    posts: [],
    postsHandler: {
      posts: [],
      readModal: '',
    },
  };

  yup.setLocale({
    mixed: {
      notOneOf: 'sameUrl',
    },
    string: {
      url: 'notValidUrl',
    },
  });

  const viewState = watcher(state);
  
  const getAddedPost = (post, idFeed) => {
    const idPost = id();
    viewState.posts.push({ ...post, id: idPost, idFeed });
    viewState.postsHandler.posts.push({ id: idPost, status: 'unread' });
  };

  const getReadedPosts = () => {
    document.querySelector('.posts').addEventListener('click', (event) => {
      const idPost = event.target.dataset;
      if (idPost.bsToggle === 'modal') {
        viewState.postsHandler.readModal = idPost.id;
      }
    });
  };

  getReadedPosts();

  
  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    viewState.form.processHandler = 'validating';
    const url = new FormData(e.target).get('url');

    const schema = yup
      .string()
      .url()
      .notOneOf(viewState.feeds.map((feed) => feed.url));
    const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`
    schema.validate(url)

      .then(() => {
        viewState.form.processHandler = 'filling';
        return axios.get(proxyUrl);
      })
      .then((response) => {
        const { feed, posts } = parse(response.data.contents, url);

        const idFeed = id();
        viewState.feeds.push({ ...feed, id: idFeed });

        posts.forEach((post) => {
          getAddedPost(post, idFeed);
        });
      })
      .catch((fail) => {
        if (fail.message === 'Network Error') {
          viewState.form.error = 'networkError';
        } else if (fail.message === 'NotValidRss') {
          viewState.form.error = 'notValidLink';
        } else if (fail.message === 'error 404') {
          viewState.form.error = 'error404';
        } else if (fail.message === 'error 405') {
          viewState.form.error = 'error405';
        } else if (fail.message === 'error 406') {
          viewState.form.error = 'error406';
        } else if (fail.message === 'error 500') {
          viewState.form.error = 'error500';
        } else {
          viewState.form.error = fail.message;
        }
        viewState.form.processHandler = 'failing';
      });
  });
};

export default fillContent;