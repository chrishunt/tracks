(function () {
  'use strict';

  var feed = new Instafeed({
    get: 'user',
    userId: '296971',
    clientId: '2ed16aa6acdb47c18cc5225ad8d9c394',
    sortBy: 'most-recent',
    limit: 4,
    resolution: "standard_resolution",
    template: '<a href="{{link}}"><img src="{{image}}" /></a>'
  });
  feed.run();
})();
