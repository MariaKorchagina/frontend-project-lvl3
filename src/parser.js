const parseContent = (xml, url) => {
  const data = new DOMParser().parseFromString(xml, 'application/xml');
  if (!data.querySelector('rss')) {
    throw new Error('NotValidRss');
  }
  const posts = [];
  data.querySelectorAll('item').forEach((postItem) => {
    const post = {
      url: postItem.querySelector('link').textContent,
      title: postItem.querySelector('title').textContent,
      description: postItem.querySelector('description').textContent,
    };
    posts.push(post);
  });
  const feed = {
    url,
    title: data.querySelector('channel > title').textContent,
    description: data.querySelector('channel > description').textContent,
  };
  return { feed, posts };
};
export default parseContent;
