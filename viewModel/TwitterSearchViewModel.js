/*globals $, kendo */

var twitterSearchService = new TwitterSearchService();

var twitterSearchViewModel = kendo.observable({
  /// <summary>
  /// A view model for searching twitter for a given term
  /// </summary>

  // --- properties
  searchTerm: "#kendoui",
  isSearching: false,
  userMessage: "",
  searchEnabled: false,
  recentSearches: [],
  recentSearchTitleVisible: function () {
    return this.get("recentSearches").length > 0;
  },
  searchButtonDisabled: function () {
    return this.get("searchTerm").length === 0 && this.get("isSearching") === false;
  },
  
  // --- 'private' functions

  _saveState: function () {
    /// <summary>
    /// Saves the view model state to local storage
    /// </summary>
    var recentSearchStrings = this.recentSearches.toJSON().map(function (item) {
      return item.searchString;
    });
    localStorage.setItem("state", recentSearchStrings.toString());
  },

  _addSearchTermToRecentSearches: function () {
    /// <summary>
    /// Adds the current search term to the search history
    /// </summary>

    // check whether we already have this item in our recent searches list
    var that = this;
    var matches = $.grep(this.recentSearches, function (recentSearchTerm) {
      return recentSearchTerm.searchString === that.searchTerm;
    });

    // if there is no match, add this term
    if (matches.length === 0) {

      // add the new item
      this.recentSearches.unshift({ searchString: this.searchTerm });

      // limit to 5 recent search terms
      if (this.recentSearches.length > 5) {
        this.recentSearches.pop();
      }

      this._saveState();
    }
  },

  // --- functions
  executeSearch: function () {
    /// <summary>
    /// Searches twitter for the current search term.
    /// </summary>

    if ($.trim(this.searchTerm) === "") {
      return;
    }

    this.set("userMessage", "");
    this.set("isSearching", true);

    var that = this;
    twitterSearchService.searchForKeyword(this.searchTerm, 1, function (tweets) {
      if (tweets.length > 0) {
        // store this search
        that._addSearchTermToRecentSearches();

        // navigate to the results view model
        searchResultsViewModel.init(that.searchTerm, tweets);
        app.navigate("#searchResultsView");
      } else {
        that.set("userMessage", "There were no matches for the given search term");
      }

      that.set("isSearching", false);
    });
  },

  loadState: function () {
    /// <summary>
    /// Loads the persisted view model state from local storage
    /// </summary>

    var that = this,
        state = localStorage.getItem("state");

    if (typeof (state) === 'string') {
      $.each(state.split(","), function (index, item) {
        if (item.trim() !== "") {
          that.recentSearches.push({ searchString: item });
        }
      });
    }
  },

  recentSearchClicked: function (e) {
    /// <summary>
    /// Handles clicks on recent search terms.
    /// </summary>
    var selectedSearchTerm = e.dataItem.searchString;
    this.set("searchTerm", selectedSearchTerm);
    this.executeSearch();
  }
});

 