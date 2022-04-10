/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

myApp.controllers = {

  //////////////////////////
  // Tabbar Page Controller //
  //////////////////////////
  tabbarPage: function(page) {
    // Set button functionality to open/close the menu.
    page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();
    };

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        document.querySelector('#myNavigator').pushPage('html/new_task.html');
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });

    // Change tabbar animation depending on platform.
    page.querySelector('#myTabbar').setAttribute('animation', ons.platform.isAndroid() ? 'slide' : 'none');
  },

  ////////////////////////
  // Menu Page Controller //
  ////////////////////////
  menuPage: function(page) {
    // Set functionality for 'No Category' and 'All' default categories respectively.
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item[category-id=""]'));
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item:not([category-id])'));

    // Change splitter animation depending on platform.
    document.querySelector('#mySplitter').left.setAttribute('animation', ons.platform.isAndroid() ? 'overlay' : 'reveal');
  },

  ////////////////////////////
  // New Task Page Controller //
  ////////////////////////////
  newTaskPage: function(page) {
    let tasks = JSON.parse(localStorage.getItem("tasks"))
    let categorys = []
    for (let task of tasks) {
      if(!categorys.includes(task.data.category)){
        categorys.push(task.data.category)
        let item = document.createElement('option')
        item.innerHTML = task.data.category
        page.querySelector('#category-select').appendChild(item)
      }
    }
    // Set button functionality to save a new task.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/save-task"]'), function(element) {
      element.onclick = function() {
        var newTitle = page.querySelector('#title-input').value;
        let category = null

        if (newTitle) {
          if(page.querySelector('#category-input').value === "" &&
              page.querySelector('#category-select').value === "Select a category"){
            category="";
          } else if(page.querySelector('#category-input').value !== "" &&
              page.querySelector('#category-select').value !== "Select a category"){
            ons.notification.alert('Write or chose a category');
          } else if(page.querySelector('#category-input').value !== "" &&
              page.querySelector('#category-select').value === "Select a category"){
            category = page.querySelector('#category-input').value;
          } else {
            category = page.querySelector('#category-select').value;
          }
          // If it's ok for the category create the task.
          if(category !== null) {
            myApp.services.tasks.create(
                {
                  title: newTitle,
                  category: category,
                  description: page.querySelector('#description-input').value,
                  highlight: page.querySelector('#highlight-input').checked,
                  urgent: page.querySelector('#urgent-input').checked,
                }
            );

            // Set selected category to 'All', refresh and pop page.
            document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
            document.querySelector('#default-category-list ons-list-item').updateCategoryView();
            document.querySelector('#myNavigator').popPage();
          }

        } else {
          // Show alert if the input title is empty.
          ons.notification.alert('You must provide a task title.');
        }
      };
    });
  },

  ////////////////////////////////
  // Details Task Page Controller //
  ///////////////////////////////
  detailsTaskPage: function(page) {
    // Get the element passed as argument to pushPage.
    var element = page.data.element;

    // Fill the view with the stored data.
    page.querySelector('#title-input').value = element.data.title;
    page.querySelector('#category-input').value = element.data.category;
    page.querySelector('#description-input').value = element.data.description;
    page.querySelector('#highlight-input').checked = element.data.highlight;
    page.querySelector('#urgent-input').checked = element.data.urgent;

    // Set button functionality to save an existing task.
    page.querySelector('[component="button/save-task"]').onclick = function() {
      var newTitle = page.querySelector('#title-input').value;

      if (newTitle) {
        // If input title is not empty, ask for confirmation before saving.
        ons.notification.confirm(
          {
            title: 'Save changes?',
            message: 'Previous data will be overwritten.',
            buttonLabels: ['Discard', 'Save']
          }
        ).then(function(buttonIndex) {
          if (buttonIndex === 1) {
            // If 'Save' button was pressed, overwrite the task.
            myApp.services.tasks.update(element,
              {
                title: newTitle,
                category: page.querySelector('#category-input').value,
                description: page.querySelector('#description-input').value,
                ugent: element.data.urgent,
                highlight: page.querySelector('#highlight-input').checked
              }
            );

            // Set selected category to 'All', refresh and pop page.
            document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
            document.querySelector('#default-category-list ons-list-item').updateCategoryView();
            document.querySelector('#myNavigator').popPage();
          }
        });

      } else {
        // Show alert if the input title is empty.
        ons.notification.alert('You must provide a task title.');
      }
    };
  }
};
