
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
      const email = document.createElement('div');
      email.className = 'email';
      email.addEventListener('click', function(event){
        let element = event.target;
        // email is clicked
        if (!element.classList.contains('archive')){
          var element_id = emails[i].id
          console.log(`Email of id ${element_id} is clicked`)
            // change email to read
          fetch(`emails/${element_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true,
            })
          })
          .then(response => {
            if (response.status === 204){
              view_email(element_id);
              console.log(element_id);
            }
          })
        }
        
      })
      email.id = `${emails[i].id}`;
      if(mailbox === 'sent'){
        email.innerHTML = `<h6 class="sender">To: ${emails[i].recipients}</h6><p class="date">${emails[i].timestamp}</p><p>${emails[i].subject}</p>`;
      } else{
        email.innerHTML = `<h6 class="sender">From: ${emails[i].sender}</h6><p class="date">${emails[i].timestamp}</p><p>${emails[i].subject}</p>`;
      }
      
      console.log(`recipient is ${emails[i].recipients}`)
      console.log(`sender is ${emails[i].sender}`)
      if(mailbox != 'sent'){
        archive_btn = document.createElement('button');
        archive_btn.classList.add('btn', 'archive');
        archive_btn.dataset.email = `${emails[i].id}`;
        email.append(archive_btn);
      }
      document.querySelector('#emails-view').append(email); 
      console.log("emails has been loaded");
      // add class to the clicked email
      if( emails[i].read === true){
        email.classList.add('read');
        
     }
  }
 
  // if archive button is clicked
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
// view email function
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
    element.innerHTML = `<h6>From:${email.sender}</6><h6>Subject:${email.subject}</6><p>${email.timestamp}<hr></p><p>${email.body}</p><button class= 'btn reply' data-email=${email.id}>Reply</button>`;
    // add line breaks where there is a new line.
    element.innerHTML = element.innerHTML.replace(/\n/g, '<br>');
    document.querySelector("#email-view").append(element);
    // event listener for replay button
    document.querySelector('.reply').addEventListener('click', () =>{
    reply_email(email_id);
  })
    console.log("fetch complete");
  })
}

// archive function
function archive(event){
  let button = event.target;
  button.parentElement.style.animationPlayState = 'running';
  let element = button.parentElement;
  element.addEventListener('animationend', () => {
      button.parentElement.remove();
    })
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
  })
  
}
// reply email function
function reply_email(email_id){
  let button = document.querySelector('.reply');
  email_id = button.dataset.email;
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
     // populate the input fields
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `RE: ${email.subject}`;
  document.querySelector('#compose-body').innerHTML = `\n\n\n\n\n\n....................................................\n On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  // on submiting form
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
  })
}