# Mail HarvardX Project 3

Mail est une application web de messagerie construite avec Django. Elle permet aux utilisateurs de s'inscrire, de se connecter, d'envoyer et de recevoir des emails.


## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/project3.git
    cd project3
    ```

2. Create and activate a virtual environment:
    ```sh
    python -m venv env
    source env/bin/activate  # On Windows, use `env\Scripts\activate`
    ```

3. Install the dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4. Apply the migrations:
    ```sh
    python manage.py migrate
    ```

5. Create a superuser to access the admin:
    ```sh
    python manage.py createsuperuser
    ```

6. Run the development server:
    ```sh
    python manage.py runserver
    ```

## Usage

- Access the application at `http://127.0.0.1:8000/`.
- Sign up, log in, and start sending emails.

## Models

### User

The `User` model inherits from `AbstractUser` and is defined in `mail/models.py`.

### Email

The `Email` model is defined in `mail/models.py` and contains the following fields:
- `user`: ForeignKey to `User`
- `sender`: ForeignKey to `User`
- `recipients`: ManyToManyField to `User`
- `subject`: CharField
- `body`: TextField
- `timestamp`: DateTimeField
- `read`: BooleanField
- `archived`: BooleanField

## Routes

The application routes are defined in `mail/urls.py`:
- `/`: Index view
- `/login`: Login view
- `/logout`: Logout view
- `/register`: Register view
- `/emails`: API to compose an email
- `/emails/<int:email_id>`: API to view an email
- `/emails/<str:mailbox>`: API to view a mailbox

## Configuration

The configuration settings are defined in `project3/settings.py`.

## Deployment

To deploy this project, follow the Django deployment instructions: [https://docs.djangoproject.com/en/3.0/howto/deployment/](https://docs.djangoproject.com/en/3.0/howto/deployment/)
