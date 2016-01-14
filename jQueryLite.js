(function () {

  var jQueryLite = window.jQueryLite = {};
  var functionQueue = [];

  var onLoad = function () {
    while (functionQueue.length > 0) {
      functionQueue.shift()();
    }
  };

  var $l = window.$l = function (arg) {
    var arr;
    if (typeof arg === "string") {
      var nodeList = document.querySelectorAll(arg);
      arr = Array.prototype.slice.call(nodeList); //
      return new DOMNodeCollection(arr);
    } else if (arg instanceof HTMLElement) {
      arr = [arg];
      return new DOMNodeCollection(arr);
    } else if (typeof arg === "function") {
      functionQueue.push(arg);
      if(document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("DOMContentLoaded", onLoad);
      }
    }
  };

  var DOMNodeCollection = jQueryLite.DOMNodeCollection = function (htmlArray) {
    this.htmlArray = htmlArray;
  };


  DOMNodeCollection.prototype.html = function (innerHTMLString) {
    if (arguments.length > 0) {
      for(var i = 0; i < this.htmlArray.length; i++) {
        this.htmlArray[i].innerHTML = innerHTMLString;
      }
    } else {
      return this.htmlArray[0].innerHTML;
    }
  };


  DOMNodeCollection.prototype.empty = function () {
    for(var i = 0; i < this.htmlArray.length; i++) {
      this.htmlArray[i].innerHTML = "";
    }
  };

  DOMNodeCollection.prototype.append = function (input) {
    var i; var node; var clone;
    if(typeof input === "string") {
      for(i = 0; i < this.htmlArray.length; i++) {
        this.htmlArray[i].innerHTML += input;
      }
    } else if (input instanceof HTMLElement) {
      for(i = 0; i < this.htmlArray.length; i++) {
        var tagName = this.htmlArray[i].tagName;
        node = this.htmlArray[i];
        clone = input.cloneNode(true); //true specifies deep dup
        node.appendChild(clone);
      }
    } else if (input instanceof DOMNodeCollection) {
      for(i = 0; i < this.htmlArray.length; i++) {
        node = this.htmlArray[i];
        for(var j = 0; j < input.htmlArray.length; j++) {
          var el = input.htmlArray[j];
          clone = el.cloneNode(true);
          node.appendChild(clone);
        }
      }
    } else {
      throw "error!";
    }
  };

  DOMNodeCollection.prototype.attr = function(attribute, val) {
    var i;
    if (arguments.htmlArray.length === 1) {
      return this.htmlArray[0].getAttribute(attribute);
    } else {
      for(i = 0; i < this.htmlArray.length; i++) {
        this.htmlArray[i].setAttribute(attribute, val);
      }
    }
  };

  DOMNodeCollection.prototype.addClass = function () {
    var i;

    for(i = 0; i < this.htmlArray.length; i++) {
      var argArray = [].slice.call(arguments);
      var classList = this.htmlArray[i].classList;
      classList.add.apply(classList, argArray);
    }
  };

  DOMNodeCollection.prototype.removeClass = function (className) {
    var i;
    if (arguments.length === 0) {
      for (i = 0; i < this.htmlArray.length; i++) {
        var currentEl = this.htmlArray[i];
        while (currentEl.classList.length > 0) {
          var currentClass = currentEl.classList[0];
          currentEl.classList.remove(currentClass);
        }
      }
    }
    for(i = 0; i < this.htmlArray.length; i++) {
      var argArray = [].slice.call(arguments);
      var classList = this.htmlArray[i].classList;
      classList.remove.apply(classList, argArray);
    }
  };

  DOMNodeCollection.prototype.children = function () {
    var i;
    var result = [];
    for (i = 0; i < this.htmlArray.length; i++) {
      var currentCollection = this.htmlArray[i].children;
      var childrenArray = [].slice.call(currentCollection);
      result = result.concat(childrenArray);
    }
    return new DOMNodeCollection(result);
  };

  DOMNodeCollection.prototype.parent = function () {
    var i;
    var result = [];
    for (i = 0; i < this.htmlArray.length; i++) {
      var currentParent = this.htmlArray[i].parentNode;
      result.push(currentParent);
    }
    return new DOMNodeCollection(result); //returns repeats.
  };

  DOMNodeCollection.prototype.find = function (selector) {
    var i;
    var result = [];
    for (i = 0; i < this.htmlArray.length; i++) {
      var descendants = this.htmlArray[i].querySelectorAll(selector);
      var descArray = [].slice.call(descendants);
      result = result.concat(descArray);
    }
    return new DOMNodeCollection(result);
  };

  DOMNodeCollection.prototype.remove = function () {

    while (this.htmlArray.length > 0) {
      var currentEl = this.htmlArray[0];
      currentEl.parentElement.removeChild(currentEl);
      this.htmlArray.shift();
    }
  };

  DOMNodeCollection.prototype.on = function(action, callback) {
    var i;
    for (i = 0; i < this.htmlArray.length; i++) {
      this.htmlArray[i].addEventListener(action, callback);
    }
    // debugger
  };

  DOMNodeCollection.prototype.off = function (action, listener) {
    var i;
    for (i = 0; i < this.htmlArray.length; i++) {
      if (arguments.length === 0) {
        var clone = this.htmlArray[i].cloneNode(true);
        this.htmlArray[i].parentNode.replaceChild(clone, this.htmlArray[i]);
      } else {
        this.htmlArray[i].removeEventListener(action, listener);
      }
    }
  };

  $l.extend = function () {
    var argArray = [].slice.call(arguments);
    var resultObj = argArray.shift();

    while(argArray.length > 0) {
      var nextObj = argArray.shift();
      var nextKeys = Object.keys(nextObj);
      for(var i = 0; i < nextKeys.length; i++) {
        var key = nextKeys[i];
        resultObj[key] = nextObj[key];
      }
    }
    return resultObj;
  };
// url (default: The current page)
// contentType (default: 'application/x-www-form-urlencoded; charset=UTF-8')
// data: string or object default = ""

  $l.ajax = function (options) {
    var requestDefaults = {
      type: 'GET',
      url: window.location.href,
      success: function (data) { alert("SUCCESS!"); },
      error: function () { alert("ERROR."); },
      data: "",
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
    };

    options = this.extend(requestDefaults, options);
    var myRequest = new XMLHttpRequest();

    myRequest.onreadystatechange = function() {
      console.log(myRequest.readyState);
      if (myRequest.readyState == XMLHttpRequest.DONE ) {
         if(myRequest.status == 200){
             document.getElementById("footer").innerHTML = myRequest.responseText;
             options.success(JSON.parse(myRequest.responseText));
         }
         else if(myRequest.status == 400) {
            alert('There was an error 400');
            options.error();
         }
         else {
           alert('something else other than 200 was returned');
         }
      }
      console.log( "'ello'");
    };

    myRequest.open(options.type, options.url);
    myRequest.send(options.data);
    return "what";

  };



})();
