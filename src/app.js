// import * as yup from 'yup';
// import axios from 'axios';
// import watcher from './view.js';
// import parse from './parser.js';

// let id = (function () {
//   let num = 0;
//   return function (prefix) {
//     prefix = String(prefix);
//     num += 1;
//     return prefix + num;
//   }
// }
//   ());

// const getValidateApp = () => {
//   const state = {
//     form: {
//       error: '',
//       processState: 'filling',
//     },
//     feeds: [],
//     posts: [],
//     uiState: {
//       posts: [],
//       modalPostId: '',
//     },
//   };

//   yup.setLocale({
//     mixed: {
//       notOneOf: 'sameUrl',
//     },
//     string: {
//       url: 'notValidUrl',
//     },
//   });

  
//   const watchedState = watcher(state);

//   const getOpenedPosts = () => {
//     const postContainerEl = document.querySelector('.posts');
//     postContainerEl.addEventListener('click', (event) => {
//       const postId = event.target.dataset.id;
//       const postsUiState = watchedState.uiState.posts.map((post) => (post.id === postId ? { id: postId, status: 'read' } : post));
//       watchedState.uiState.posts = postsUiState;
//       if (event.target.dataset.bsToggle === 'modal') {
//         watchedState.uiState.modalPostId = postId;
//       }
//     });
//   };

//   getOpenedPosts();

//   const getAddPosts = (post, feedId) => {
//     const postId = id();
//     watchedState.posts.push({ ...post, id: postId, feedId });
//     watchedState.uiState.posts.push({ id: postId, status: 'unread' });
//   };

//   const addNewPosts = (url) => axios
//     .get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
//     .then((response) => {
//       const { posts } = parse(response.data.contents, url);

//       const feedId = watchedState
//         .feeds
//         .find((feed) => feed.url === url)
//         .id;

//       posts.forEach((post) => {
//         if (!watchedState.posts.some((watchedPost) => watchedPost.url === post.url)) {
//           getAddPosts(post, feedId);
//         }
//       });
//     });

//   const formEl = document.querySelector('form');

//   formEl.addEventListener('submit', (e) => {
//     e.preventDefault();

//     watchedState.form.processState = 'validating';
//     const formData = new FormData(e.target);
//     const url = formData.get('url');

//     const schema = yup
//       .string()
//       .url()
//       .notOneOf(watchedState.feeds.map((feed) => feed.url));

//     schema.validate(url)
//       .then(() => {
//         watchedState.form.processState = 'validating';
//         return axios(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`);
//       })
//       .then((response) => {
//         const { feed, posts } = parse(response.data.contents, url);

//         const feedId = id();
//         watchedState.feeds.push({ ...feed, id: feedId });

//         posts.forEach((post) => {
//           getAddPosts(post, feedId);
//         });

//         watchedState.form.processState = 'filling';
//         watchedState.form.error = '';

//         const callTimeout = () => addNewPosts(url)
//           .finally(() => setTimeout(callTimeout, 5000));

//         setTimeout(callTimeout, 5000);
//       })

//       .catch((fail) => {
//         if (fail.message === 'Network Error') {
//           watchedState.form.error = 'networkError';
//         } else if (fail.message === 'NotValidRss') {
//           watchedState.form.error = 'notValidLink';
//         } else if (fail.message === 'error 404') {
//           watchedState.form.error = 'error404';
//         } else if (fail.message === 'error 405') {
//           watchedState.form.error = 'error405';
//         } else if (fail.message === 'error 406') {
//           watchedState.form.error = 'error406';
//         } else if (fail.message === 'error 500') {
//           watchedState.form.error = 'error500';
//         } else {
//           watchedState.form.error = fail.message;
//         }
//         watchedState.form.processState = 'error';
//       });
//   });
// };

// export default getValidateApp;


import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import watcher from './view.js';
import parse from './parser.js';


let id = (function () {
  let num = 0;
  return function (prefix) {
    prefix = String(prefix);
    num += 1;
    return prefix + num;
  }
}
  ());

export default () => {
  const state = {
    form: {
      error: '',
      processState: 'filling',
    },
    feeds: [],
    posts: [],
    uiState: {
      posts: [],
      modalPostId: '',
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

  const watchedState = watcher(state);

  const addListenersOnPosts = () => {
    const postContainerEl = document.querySelector('.posts');
    postContainerEl.addEventListener('click', (event) => {
      const postId = event.target.dataset.id;
      const postsUiState = watchedState.uiState.posts.map((post) => (post.id === postId ? { id: postId, status: 'read' } : post));
      watchedState.uiState.posts = postsUiState;
      if (event.target.dataset.bsToggle === 'modal') {
        watchedState.uiState.modalPostId = postId;
      }
    });
  };

  addListenersOnPosts();

  const addPostInState = (post, feedId) => {
    const postId = id();

    watchedState.posts.push({ ...post, id: postId, feedId });
    watchedState.uiState.posts.push({ id: postId, status: 'unread' });
  };

  const addNewPosts = (url) => axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      const { posts } = parse(response.data.contents, url);

      const feedId = watchedState
        .feeds
        .find((feed) => feed.url === url)
        .id;

      posts.forEach((post) => {
        if (!watchedState.posts.some((watchedPost) => watchedPost.url === post.url)) {
          addPostInState(post, feedId);
        }
      });
    });

  const formEl = document.querySelector('form');

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    watchedState.form.processState = 'validating';
    const formData = new FormData(e.target);
    const url = formData.get('url');

    const schema = yup
      .string()
      .url()
      .notOneOf(watchedState.feeds.map((feed) => feed.url));

    schema.validate(url)
      .then(() => {
        watchedState.form.processState = 'filling';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => {
        const { feed, posts } = parse(response.data.contents, url);

        const feedId = id();
        watchedState.feeds.push({ ...feed, id: feedId });

        posts.forEach((post) => {
          addPostInState(post, feedId);
        });

        watchedState.form.processState = 'filling';
        watchedState.form.error = '';

        const callTimeout = () => addNewPosts(url)
          .finally(() => setTimeout(callTimeout, 5000));

        setTimeout(callTimeout, 5000);
      })
      .catch((fail) => {
        if (fail.message === 'Network Error') {
          watchedState.form.error = 'networkError';
        } else if (fail.message === 'NotValidRss') {
          watchedState.form.error = 'notValidLink';
        } else if (fail.message === 'error 404') {
          watchedState.form.error = 'error404';
        } else if (fail.message === 'error 405') {
          watchedState.form.error = 'error405';
        } else if (fail.message === 'error 406') {
          watchedState.form.error = 'error406';
        } else if (fail.message === 'error 500') {
          watchedState.form.error = 'error500';
        } else {
          watchedState.form.error = fail.message;
        }
        watchedState.form.processState = 'error';
      });
  });
};
      