const parseContent = (xml) => {
  const data = new DOMParser().parseFromString(xml, 'application/xml');
  if (!data.querySelector('rss')) {
    throw new Error('NotValidRss');
  }

  const posts = [];
  data.querySelectorAll('item').forEach((postItem) => {
    const postUrl = postItem.querySelector('link').textContent;
    const postTitle = postItem.querySelector('title').textContent;
    const postDescription = postItem.querySelector('description').textContent;

    const post = {
      url: postUrl,
      title: postTitle,
      description: postDescription,
    };

    posts.push(post);
  });

  return {
    feed: {
      title: data.querySelector('title').textContent,
      description: data.querySelector('description').textContent,
    },
    posts,
  };
};

export default parseContent;
