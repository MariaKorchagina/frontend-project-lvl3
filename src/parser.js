const parseContent = (xml) => {
  const data = new DOMParser().parseFromString(xml, 'application/xml');
  if (!data.querySelector('rss')) {
    throw new Error('NotValidRss');
  }
  const posts = Array.from(data.getElementsByTagName('item'))
    .map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));

  return {
    feed: {
      title: data.querySelector('title').textContent,
      description:  data.querySelector('description').textContent,
    },
    posts,
  };
};

export default parseContent;