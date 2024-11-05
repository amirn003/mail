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
  const email = get_emails(mailbox);
  console.log(`Email: ${email}`)

  // Display emails
  display_email(email)


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


// Get emails with function email(request, email_id) in views.py
function get_email(email_id) {
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
  });
}


// Display email when load_mailbox is called
function display_email(email) {
  const emailDiv = document.createElement('div');
  emailDiv.innerHTML = email;
  document.querySelector('#emails-view').appendChild(emailDiv);
}


// Request the email from a particular mailbox by making a GET request to /emails/<mailbox>
function get_emails(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => (event) =>{
    event.preventDefault();
    // Print emails
    console.log(emails);
    alert(emails)

  });
}

// Display email when load_mailbox is called
function display_email(email){
  const emailDiv = document.createElement('div');
  emailDiv.innerHTML = email;
  document.querySelector('#emails-view').appendChild(emailDiv);
}
