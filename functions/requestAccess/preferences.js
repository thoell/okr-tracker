const preferences = {
  view: 'compact',
  startPage: null,
  widgets: {
    itemHome: {
      progression: true,
      missionStatement: true,
      team: true,
      children: false,
    },
    objectiveHome: {
      progression: true,
      details: false,
      weights: false,
    },
    keyResultHome: {
      details: false,
      notes: true,
      weights: true,
    },
  },
};

exports.preferences = preferences;
