
document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener('popstate', function(event){
    if(event.state){
      if(event.state.email){
        view_email(event.state.email);
      }
      else if(event.state.mailbox){
        load_mailbox(event.state.mailbox);
      }
    }
    else{
      load_mailbox('inbox');
    }
  })

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    history.pushState({mailbox: 'inbox'}, '', 'inbox');
    load_mailbox('inbox');
  });
  document.querySelector('#sent').addEventListener('click', () => {
    history.pushState({mailbox: 'sent'}, '', 'sent');
    load_mailbox('sent');
  });
  document.querySelector('#archived').addEventListener('click', () => {
    history.pushState({mailbox: 'archive'}, '', 'archive');
    load_mailbox('archive');
  });
  document.querySelector('#compose').addEventListener('click', () => {
    history.pushState({compose: 'compose'}, '', 'compose');
    compose_email();
  });
  

  // By default, load the inbox
  load_mailbox('inbox');
})
let current_mailbox = 'inbox';


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
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
  current_mailbox = mailbox;
  document.querySelector('#emails-view').innerHTML = '';
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  current_mailbox = mailbox;
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
           view_email(emails[i].id);
           console.log(emails[i].id);
          }
        })
      })
       // add class to the clicked email
      if( emails[i].read === true){
        element.className = 'read';
        // debug with console.log
        console.log("this element's class has been changed");
     }
      element.innerHTML = `<h6 class="sender">${emails[i].sender}</h6><p class="date">${emails[i].timestamp}</p><p>${emails[i].subject}</p><button data-email=${emails[i].id} class='btn archive'></button>`;
      document.querySelector('#emails-view').append(element);
      element.classList.add('email');
    console.log(`is archived ${emails[i].archived}`);
    console.log("emails has been loaded");
  }
  document.querySelectorAll('.archive').forEach(button =>{
    let email_Id = parseInt(button.dataset.email);
    button.onclick = archive;
    console.log(`Email id is ${email_Id} testing archive button`);
    console.log(button.dataset.emailId);
    fetch(`emails/${email_Id}`)
    .then(response => response.json())
    .then(email => {
      if(email.archived == false){
        button.innerHTML = "Archive";
        console.log(`this email is archived ${email.archived}`);
      }else{
        button.innerHTML = "Unarchive";
        console.log(`this email is archived ${email.archived}`);
      }
    })
  })
  })

}
function view_email(email_id){
  document.querySelector('#email-view').innerHTML = '';
  document.querySelector('#email-view').style.display = 'block';
  history.pushState({email: email_id, mailbox: current_mailbox}, '', `email${email_id}`);
  console.log(email_id);
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email.id);
    //hide emails-view pages
    document.querySelector('#emails-view').style.display = 'none'
    //view an email
    const element = document.createElement('div');
    element.innerHTML = `<h6>From:${email.sender}</6><h6>Subject:${email.subject}</6><p>${email.timestamp}</p><p>${email.body}</p>`;
    document.querySelector("#email-view").append(element);
    console.log("fetch complete");
  })
}

// archive function
function archive(event){
  let button = event.target;
  let email_id = button.dataset.email;
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    if(email.archived == false){
      fetch(`emails/${email_id}`, {
        method : 'PUT',
        body : JSON.stringify({
          archived : true,
        })
      })
    } else{
      fetch(`emails/${email.id}`, {
        method : 'PUT',
        body : JSON.stringify({
          archived : false,
        })
      })
    }
    button.parentElement.remove();
    
  })
  
}