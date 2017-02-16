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

// DONE
/**
 * OVERVIEW of Article.loadAll():
 * - A method on each instance that sorts according to the publishedOn date and pushes each instance into an an array
 * - Inputs: articles from /articles DB
 * - Outputs: new instance of article pushed into array Article.all
 */
Article.loadAll = function(rows) {
  // DONE: sorts the articles by the publishedOn date and returns them in order from newest first
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: takes the sorted articles and pushes each instance into an array Articles.all
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.fetchAll():
 * - A method that checks if article is in /article DB and executes Article.loadAll if it is, if not in DB gets rawData from hackerIpsum.json, creates articles and inserts into /articles DB then executes Article.loadAll
 * - Inputs: articles from /articles DB, rawData from hackerIpsum.json
 * - Outputs: if articles is in DB, initIndexPage(); if results not in DB, gets rawData from hackerIpsum.json and adds each article to DB and then loads from the DB
 */
Article.fetchAll = function(callback) {
  // DONE: jquery ajax call on /articles DB
  $.get('/articles')
  // DONE: when ajax call is completed the function is executed
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: runs Article.loadall on the results from /article DB
        Article.loadAll(results);
        callback(); //initIndexPage()
      } else { // if NO records exist in the DB
        // DONE: jquery ajax call to getJSON from the rawData from hackerIpsum.json and creates instance of article for each object and inserts it into /articles DB
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: when ajax call is completed, Article.fetchAll is called on the callback //initIndexPage()
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: when ajax call is rejected error is on console
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.truncateTable():
 * - A method that deletes /articles DB then logs what was deleted
 * - Inputs:
 * - Outputs: deleted /articles DB
 */
Article.truncateTable = function(callback) {
  // DONE: jquery ajax call that deletes /articles DB
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: when ajax call completed logs data which is response and runs callback function if there is one
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.prototype.insertRecord();
 * - A method that creates instance of article and puts it in /articles DB, logs what was inserted
 * - Inputs: this instance of article
 * - Outputs: creates instance of article in DB
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: jquery ajax call that creates an instance of an article in DB
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: when ajax call completed logs data which is response and runs callback function if there is one
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.prototype.deleteRecord():
 * - A method that deletes this article_id in /articles DB logs what was deleted
 * - Inputs: this instance of article
 * - Outputs: deleted instance of article in DB
 */
Article.prototype.deleteRecord = function(callback) {
  // DONE: jquery ajax call that deletes article with this id in articles DB
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // DONE: when ajax call completed logs data which is response and runs callback function if there is one
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.prototype.updateRecord():
 * - A method that updates the article_id in /articles DB with this instance of article_id, logs what was updated
 * - Inputs: this instance of article
 * - Outputs: updated instance of article in DB
 */
Article.prototype.updateRecord = function(callback) {
  // DONE: jquery ajax call that updates this instance of article in DB
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // DONE: sets this instance of article as data object
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // DONE: when ajax call completed logs data which is response and runs callback function if there is one
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
