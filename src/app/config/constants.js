const MAX_POST_TEXT = 20000;
const MAX_POST_TITLE = 300;
const MIN_POLL_ANSWERS_COUNT = 2;

const POLICY_URL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;

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

const EntityLimits = {
  pollAnswersMinCount: MIN_POLL_ANSWERS_COUNT,
  postText: MAX_POST_TEXT,
  postTitle: MAX_POST_TITLE,
};

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

const SortItemReplies = {
  label: 'replies',
  url: 'replies',
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

const SortComments = [
  SortItemPoints,
  SortItemReplies,
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
  EntityLimits,
  Filters: {
    Category,
    Flag,
    Point,
    SortBranch,
    SortComments,
    SortPost,
    SortVotes,
    Time,
  },
  Policy: {
    url: POLICY_URL,
  },
  PostTypeAudio,
  PostTypeImage,
  PostTypePage,
  PostTypePoll,
  PostTypeText,
  PostTypeVideo,
};
