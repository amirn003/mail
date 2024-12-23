document.addEventListener('DOMContentLoaded', function() {
  const BASE_URL = '/emails';
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_mailbox('inbox');
    // history.pushState({mailbox: 'inbox'}, 'emails/inbox', `${BASE_URL}/inbox`);
  });
  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent');
    // Clean history to avoid to 'emails' in the URL each time we click on the sent button
    history.pushState({mailbox: 'sent'}, '', `${BASE_URL}/sent`);
  });
  document.querySelector('#archived').addEventListener('click', () => {
    load_mailbox('archive');
    history.pushState({mailbox: 'archive'}, '', `${BASE_URL}/archive`);
  });
  document.querySelector('#compose').addEventListener('click', () => {
    compose_email();
    history.pushState({mailbox: 'compose'}, '', '/emails')
  });

  // By default, load the inbox
  load_mailbox('inbox');
  history.replaceState({mailbox: 'inbox}'}, '', `${BASE_URL}/inbox`);

});

window.onpopstate = function(event) {
  if (event.state && event.state.mailbox) {
    console.log(event.state.mailbox);
    if (event.state.mailbox === 'compose') {
      compose_email();
    } else {
      load_mailbox(event.state.mailbox);
    }
  } else {
    load_mailbox('inbox');
  }
}


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
  form.onsubmit = (event) => {
    event.preventDefault();
    send_email();
    load_mailbox('sent');
  };

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
    console.log(result);
  });

  return false;
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#email-content').innerHTML = '';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails from mailbox
  get_emails(mailbox)
    .then(emails => {
      // Display emails
      if (mailbox === 'inbox' || mailbox === 'archive') {
        display_emails(mailbox, emails, true);
      } else {
        display_emails(mailbox, emails);
      }
    });

}

// Display emails when load_mailbox is called
function display_emails(mailbox, emails, archive=false){
  console.log(`ARCHIVE: ${archive}`);
  const emailsDiv = document.createElement('div');
  emailsDiv.id = 'emails';

  // Loop through emails and create a counter for each email
  emails.forEach(function (email, i) {
    console.log(`EMAIL n°${i}: ${email.id} - ${email.sender} - ${email.subject}`);

    let emailDiv = document.createElement('div');
    // Add id to emailDiv
    emailDiv.id = `email-${i + 1}`;
    // Add border to emailDiv
    emailDiv.style.border = '1px solid black';
    // Add padding to emailDiv
    emailDiv.style.padding = '5px';
    // Add position relative to emailDiv
    emailDiv.style.position = 'relative';
    // Add height to emailDiv
    emailDiv.style.height = '55px';
    emailDiv.style.paddingTop = '15px';

    // Add cursor pointer to emailDiv
    emailDiv.style.cursor = 'pointer';


    // Add background color if email has been read
    if (email.read) {
      emailDiv.style.backgroundColor = 'lightgrey';
    }
    else {
      emailDiv.style.backgroundColor = 'white';
    }

    // Add content of email to emailDiv
    if (archive && mailbox === 'inbox') {

      emailDiv.innerHTML = `<span>${email.sender}</span> - <span>${email.subject}</span> - <span>${email.timestamp}</span> <button class="btn-white" id="archive">Archive</button>`;
      emailDiv.querySelector('#archive').addEventListener('click', () => {
        archive_email(email.id);
        load_mailbox('inbox');
      });
    } else if (archive && mailbox === 'archive') {
      emailDiv.innerHTML = `<span>${email.sender}</span> - <span>${email.subject}</span> - <span>${email.timestamp}</span> <button class="btn-white" id="unarchive">Unarchive</button>`;
      emailDiv.querySelector('#unarchive').addEventListener('click', () => {
        unarchive_email(email.id);
        load_mailbox('inbox');
      })
    } else {
      emailDiv.innerHTML = `<span>${email.sender}</span> - <span>${email.subject}</span> - <span>${email.timestamp}</span>`;
    }

    emailDiv.addEventListener('click', (event) => {
      if (event.target.tagName !== 'BUTTON') {
      mark_email_as_read(email.id);
      get_email_content(email.id).then(email_content => {
        if (email_content) {
        display_email_content(email_content);
        } else {
        console.error('Failed to load email content');
        }
      });
      }
    });

    document.querySelector('#emails-view').appendChild(emailDiv);
  });
}

// Archive email
function archive_email(email_id) {
  console.log(`Archive email n°${email_id}`);
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(response => {
    if (response.status === 204) {
      console.log('Email archived');
    } else {
      console.error('Failed to archive email');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// Unarchive email
function unarchive_email(email_id) {
  console.log(`Unarchive email n°${email_id}`);
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(response => {
    if (response.status === 204) {
      console.log('Email unarchived');
    } else {
      console.error('Failed to unarchive email');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}


// Mark email as read
function mark_email_as_read(email_id) {
  console.log(`Mark email n°${email_id} as read`);
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .then(response => {
    if (response.status === 204) {
      console.log('Email marked as read');
    } else {
      console.error('Failed to mark email as read');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// Mark email as unread
function mark_email_as_unread(email_id) {
  console.log(`Mark email n°${email_id} as read`);
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: false
    })
  })
  .then(response => {
    if (response.status === 204) {
      console.log('Email marked as unread');
    } else {
      console.error('Failed to mark email as unread');
    }
  })
  .catch(error => {
    console.error('Error:', error);
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

  // add content of email
  emailDiv.innerHTML = `
    <h3>${email.subject}</h3>
    <p><strong>From:</strong> ${email.sender}</p>
    <p><strong>To:</strong> ${email.recipients.join(', ')}</p>
    <p><strong>Timestamp:</strong> ${email.timestamp}</p>
    <hr>
    <p>${email.body}</p>
  `;

  // add checkbox to mark mail as unread
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      mark_email_as_unread(email.id);
    }
  }
  );

  // add checkbox to mark email as unread
  const label = document.createElement('label');
  label.htmlFor = 'mark-as-unread';
  label.innerHTML = '<strong>Mark as unread:</strong>';
  emailDiv.appendChild(label);
  emailDiv.appendChild(checkbox);
  // jump lines after checkbox
  emailDiv.appendChild(document.createElement('br'));


  // add reply button
  const replyButton = document.createElement('button');
  replyButton.innerHTML = 'Reply';
  replyButton.addEventListener('click', () => {
    compose_email();
    document.querySelector('#compose-recipients').value = email.sender;
    if (email.subject.slice(0, 4) === 'Re: ') {
      document.querySelector('#compose-subject').value = email.subject;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  }
  );
  emailDiv.appendChild(replyButton);
  document.querySelector('#email-content').innerHTML = '';
  document.querySelector('#email-content').appendChild(emailDiv);
}


function get_emails(mailbox) {
  console.log(`Mailbox: ${mailbox}`);
  return fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      return emails;
    })
    .catch(error => {
      console.error('Error:', error);
      return [];
    });
}
