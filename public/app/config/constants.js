const PostTypeAudio = 'audio';
const PostTypeImage = 'image';
const PostTypePage = 'page';
const PostTypePoll = 'poll';
const PostTypeText = 'text';
const PostTypeVideo = 'video';

const PostTypes = [
  PostTypeText,
  PostTypePage,
  PostTypeImage,
  PostTypeVideo,
  PostTypeAudio,
  PostTypePoll,
];

const Category = [{
  label: 'all',
  url: 'all',
}, {
  label: `${PostTypeImage}s`,
  url: PostTypeImage,
}, {
  label: `${PostTypeVideo}s`,
  url: PostTypeVideo,
}, {
  label: PostTypeAudio,
  url: PostTypeAudio,
}, {
  label: PostTypeText,
  url: PostTypeText,
}, {
  label: `${PostTypePage}s`,
  url: PostTypePage,
}, {
  label: `${PostTypePoll}s`,
  url: PostTypePoll,
}];

const Flag = [{
  label: 'date',
  url: 'date',
}, {
  label: 'against branch rules',
  url: 'flag-branch-rules',
}, {
  label: 'against site rules',
  url: 'flag-site-rules',
}, {
  label: 'wrong post type',
  url: 'flag-wrong-type',
}, {
  label: 'nsfw flags',
  url: 'flag-nsfw',
}];

const Point = [{
  label: 'global',
  url: 'global',
}, {
  label: 'local',
  url: 'local',
}, {
  label: 'branch',
  url: 'branch',
}];

const SortItemComments = {
  label: 'comments',
  url: 'comments',
};

const SortItemDate = {
  label: 'date',
  url: 'date',
};

const SortItemPoints = {
  label: 'points',
  url: 'points',
};

const SortItemPosts = {
  label: 'posts',
  url: 'posts',
};

const SortItemVotes = {
  label: 'votes',
  url: 'votes',
};

const SortBranch = [
  SortItemPoints,
  SortItemPosts,
  SortItemComments,
  SortItemDate,
];

const SortPost = [
  SortItemPoints,
  SortItemComments,
  SortItemDate,
];

const SortVotes = [
  SortItemDate,
  SortItemVotes,
];

const Time = [{
  label: 'all time',
  url: 'all',
}, {
  label: 'last year',
  url: 'year',
}, {
  label: 'last month',
  url: 'month',
}, {
  label: 'last week',
  url: 'week',
}, {
  label: 'last 24 hrs',
  url: 'day',
}, {
  label: 'last hour',
  url: 'hour',
}];

export default {
  AllowedValues: {
    PostTypes,
  },
  Filters: {
    Category,
    Flag,
    Point,
    SortBranch,
    SortPost,
    SortVotes,
    Time,
  },
  PostTypeAudio,
  PostTypeImage,
  PostTypePage,
  PostTypePoll,
  PostTypeText,
  PostTypeVideo,
};
