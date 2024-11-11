document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send mail
  const form = document.querySelector('#compose-form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    send_email();
    load_mailbox('sent');
  });

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails from mailbox
  get_emails(mailbox)
    .then(emails => {
      // Display emails
      display_emails(mailbox, emails);
    });

}

// Display emails when load_mailbox is called
function display_emails(mailbox, emails){
  const emailsDiv = document.createElement('div');
  // Add id to emailsDiv
  emailsDiv.id = 'emails';
  //emailsDiv.innerHTML = `${mailbox.toUpperCase()}: ` + emails;

  // Loop through emails and create a counter for each email
  //emails.reverse();
  emails.forEach(function (email, i) {
    console.log(`EMAIL n°${i}: ${email.id} - ${email.sender} - ${email.subject}`);

    let emailDiv = document.createElement('div');
    // Add id to emailDiv
    emailDiv.id = `email-${i + 1}`;
    // Add border to emailDiv
    emailDiv.style.border = '1px solid black';
    // Add padding to emailDiv
    emailDiv.style.padding = '5px';

    // Add background color if email has been read
    if (email.read) {
      emailDiv.style.backgroundColor = 'lightgrey';
    }
    else {
      emailDiv.style.backgroundColor = 'white';
    }

    // Add content of email to emailDiv
    emailDiv.innerHTML = `<span>${email.sender}</span> - <span>${email.subject}</span> - <span>${email.timestamp}</span>`;
    emailDiv.addEventListener('click', () => {
      get_email_content(email.id).then(email_content => {
        if (email_content) {
          display_email_content(email_content);
        } else {
          console.error('Failed to load email content');
        }
      });

    });

    document.querySelector('#emails-view').appendChild(emailDiv);
  });
}

// Retrieve content of an email
function get_email_content(email_id) {
  console.log(`View email n°${email_id}`);
  return fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      return email;
    })
    .catch(error => {
      console.log('Error:', error);
      return null;
    })
    ;
}

// Display content of an email
function display_email_content(email) {
  document.querySelector('#emails-view').style.display = 'none';
  const emailDiv = document.createElement('div');
  emailDiv.innerHTML = `
    <h3>${email.subject}</h3>
    <p><strong>From:</strong> ${email.sender}</p>
    <p><strong>To:</strong> ${email.recipients.join(', ')}</p>
    <p><strong>Timestamp:</strong> ${email.timestamp}</p>
    <hr>
    <p>${email.body}</p>
  `;
  document.querySelector('#email-content').innerHTML = '';
  document.querySelector('#email-content').appendChild(emailDiv);
}


function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
  });

  return false;
}


function get_emails(mailbox) {
  console.log(`Mailbox: ${mailbox}`);
  return fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
      return emails;
    })
    .catch(error => {
      console.error('Error:', error);
      return [];
    });
}
