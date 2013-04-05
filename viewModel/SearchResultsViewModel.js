/*globals $, ko, TwitterSearchService, tweetViewModel*/

var searchResultsViewModel = kendo.observable({
  /// <summary>
  /// A view model that renders the results of a twitter search.
  /// </summary>

  // --- properties
  tweets : [],
  isSearching : false,
  pageNumber : 1,
  loadMoreText : "Load more ...",
  searchString : "",

  // --- public functions
  init : function (searchText, tweetViewModels) {
    this.set("tweets", tweetViewModels);
    this.set("pageNumber", 1);
    this.set("searchString", searchText);
  },

  loadMore : function () {
    this.set("pageNumber", this.pageNumber + 1);
    this.set("isSearching", true);
    this.set("loadMoreText", "Loading ...");

    var that = this;
    twitterSearchService.searchForKeyword(this.searchString, this.pageNumber, function (tweets) {
      that.set("isSearching", false);
      that.set("loadMoreText", "Load more ...");
      
      // add the new batch of tweets
      if (tweets.length > 0) {
        $.each(tweets, function (index, tweet) {
          that.tweets.push(tweet);
        });
      }
    });
  },

  tweetClicked : function (e) {
    // navigate to the tweet
    tweetViewModel.init(e.dataItem);
    app.navigate("#tweetView");
  }

});