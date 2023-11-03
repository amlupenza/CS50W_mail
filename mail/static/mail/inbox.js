document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
})

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  // on submitting form
  document.querySelector('#compose-form').onsubmit = function(event){
    event.preventDefault()
    // call fetch function
    fetch('emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject : document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    }) 
    .then(response => response.json())
    .then(result => {
      load_mailbox('inbox');
      console.log(result);
    })
  }
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // get emails
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)
      // loop through emails
    for (let i = 0; i < emails.length; i++ ){
      // create a div for each email
      const element = document.createElement('div');
      // add an event listerner to each element(div)
      element.addEventListener('click', function(){
        console.log("element has been clicked")
        // change email to read
        console.log(`${emails[i].id}`)
        fetch(`emails/${emails[i].id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true,
          })
        })
        .then(response => {
          if (response.status === 204){
            //hide emails-view pages
            document.querySelector('#emails-view').style.display = 'none'
            //view an email
            const element = document.createElement('div');
            element.innerHTML = `<h6>From: ${emails[i].sender}</6><h6>Subject: ${emails[i].subject}</6><p id>${emails[i].timestamp}</p><p>${emails[i].body}</p>`
            document.querySelector("#email-view").append(element);
            console.log("fetch complete");
          }
        })
      })
       // add class to the clicked email
      if( emails[i].read === true){
        element.className = 'read';
        // debug with console.log
        console.log("this element's class has been changed");
     }
    element.innerHTML = `<h6 class="sender">${emails[i].sender}</h6><p class="date">${emails[i].timestamp}</p><p>${emails[i].subject}</p>`;
      document.querySelector('#emails-view').append(element);
      console.log("emails has been loaded");
  }
  });
}
