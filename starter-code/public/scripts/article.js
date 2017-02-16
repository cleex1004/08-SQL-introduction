'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of Article.loadAll():
 * - A method on each instance that sorts according to the publishedOn date and pushes each instance into an an array
 * - Inputs: rows and element
 * - Outputs: new instance of article pushed into array Article.all
 */
Article.loadAll = function(rows) {
  // TODO: sorts the articles by the publishedOn date and returns them in order from newest first
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // TODO: takes the sorted articles and pushes each instance into an array Articles.all
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of Article.fetchAll():
 * - A method that checks is article is in DB and executes Article.loadAll if it is, if not in DB gets rawData from hackerIpsum.json, creates article and inserts into DB then executes Article.loadAll
 * - Inputs: callback
 * - Outputs: if articles is in DB, loads from DB; if results not in DB, gets rawData from hackerIpsum.json and adds each article to DB and then loads from the DB
 */
Article.fetchAll = function(callback) {
  // TODO: jquery ajax call on /articles
  $.get('/articles')
  // TODO: when ajax call is successful and response returns the function is executed
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // TODO: runs Article.loadall on the results from DB
        Article.loadAll(results);
        callback();
      } else { // if NO records exist in the DB
        // TODO: jquery ajax call to get JSON from the rawData from hackerIpsum.json
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // TODO: when ajax call is successful and response returns, Article.fetchAll is called on the callback
        .then(function() {
          Article.fetchAll(callback);
        })
        // TODO: when ajax call is rejected error is on console
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of Article.truncateTable():
 * - A method that deletes /articles then logs data and executes callback
 * - Inputs: callback
 * - Outputs: deleted /articles
 */
Article.truncateTable = function(callback) {
  // TODO: jquery ajax call that deletes /articles
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // TODO: when response received from ajax call that logs data, if callback truthy, calls callback()
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of Article.prototype.insertRecord();
 * - A method that creates instance of article and puts it in DB
 * - Inputs: this instance of the properties of article
 * - Outputs: creates instance of article in DB
 */
Article.prototype.insertRecord = function(callback) {
  // TODO: jquery ajax call that creates an instance of an article in /articles
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // TODO: when response returned from ajax call log data and callback
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of Article.prototype.deleteRecord():
 * - Describe what the method does
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.deleteRecord = function(callback) {
  // TODO: jquery ajax call that delete this instance of article in /articles DB
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // TODO: when response returned from ajax call log data and callback
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of Article.prototype.updateRecord():
 * - A method that updates DB with this instance of article
 * - Inputs:
 * - Outputs:
 */
Article.prototype.updateRecord = function(callback) {
  // TODO: jquery ajax call that updates this instance of article
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // TODO: sets this instance of article as data object
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // TODO: when response returned from ajax call log data and callback
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
