document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;
  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email(event){
  event.preventDefault();
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: `${document.querySelector('#compose-recipients').value}`,
        subject: `${document.querySelector('#compose-subject').value}`,
        body: `${document.querySelector('#compose-body').value}`
        
    }),
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
  
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-full-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-full-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(email => {
      const element = document.createElement('div');

      // Display relevant info according to mailbox
      if (mailbox == 'sent'){
        element.innerHTML = `<p>${email.recipients[0]} </p>` + `<p>${email.body} </p>` + `<p>${email.timestamp}</p>`;
      }
      else if (mailbox == 'inbox'){
        element.innerHTML = `<p>${email.sender} </p>` + `<p>${email.body} </p>` + `<p>${email.timestamp}</p>`;

      }
      else if (mailbox =='archive'){
        element.innerHTML = 'yolo';
      }

      element.setAttribute('id', `${email.id}`);
      element.classList.add('card');
      if (email.read){
        element.style.backgroundColor = '#d3d3d3';
      }
      element.addEventListener('click', () => show_email(email.id,mailbox));
      document.querySelector('#emails-view').append(element);
      

    });
  });
}

function show_email(id,mailbox){

  // Show the email in full view
  // Show the full view div, hide others
  // Create elements and append to full view div
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-full-view').innerHTML = '';
  document.querySelector('#email-full-view').style.display = 'block';
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    const mail = document.createElement('div');
    mail.innerHTML = `<h5 class='card-title' style='font-weight:bold;'>${email.subject}</h5>`;
    mail.innerHTML += `<h6 class='card-subtitle mb-2 text-muted'>From: ${email.sender}</h6>`;
    mail.innerHTML += `<h6 class='card-subtitle mb-2 text-muted'>To: ${email.recipients[0]}</h6>`;
    mail.innerHTML += `<h6 class='card-subtitle mb-2 text-muted'>${email.timestamp}</h6>`;
    if (mailbox=='inbox'){
    mail.innerHTML += `<button id="archive" value='archive'>Archive</button>`;
   
    }
    if (mailbox =='archive'){
      mail.innerHTML += `<button id="archive" value='unarchive'>Unarchive</button>`;
      
    }
    mail.innerHTML += `<p class='card-text'>${email.body}</p>`;
    mail.classList.add('card-body');
    document.querySelector('#email-full-view').append(mail);
    document.querySelectorAll('#archive').forEach(el => {
      el.addEventListener('click', () => archive_email(el,id));
    });    
});

}

function archive_email(el,id){
  if (el.value == 'archive'){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
      })
    });
  }
  else {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    });
  }

  load_mailbox('inbox');
  
}





