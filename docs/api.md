# API Reference - version 1.0

These are all the API calls that DetourApp will provide, after a user has successfully authenticated.

## Hostname

https://api.detourapp.com

## User

### Get your profile

Method: GET

Path

`/1.0/me`

Returns:

    {
        'data': {
            'id': 1,
            'email': 'you@detourapp.com',
            'avatar': 'https://gravatar.com/123'
        },
        'meta': {
            'code': 200,
            'message': 'profile retrieved successfully'
        }
    }

## Contacts

### Add a new contact

Method: POST

Parameters: email

Path

`/1.0/contact`

Returns:

    {
        'data': {
            'email': 'them@detourapp.com',
            'avatar': 'https://gravatar.com/321'
        },
        'meta': {
            'code': 200,
            'message': 'contact added successfully'
        }
    }

### Delete an existing contact

Method: DELETE

Parameters: email

Path

`/1.0/contact`

Returns:

    {
        'meta': {
            'code': 200,
            'message': 'contacted deleted successfully'
        }
    }

### Get contact list

Method: GET

Path

`/1.0/contacts

Returns:

    {
        'data': [
            {
                'email': 'them@detourapp.com',
                'avatar': 'https://gravatar.com/321'
            }
        ],
        'meta': {
            'code': 200,
            'message': 'contacts retrieved successfully'
        }
    }

## Messages

### Add a new message

Method: POST

Parameters: recipient email, text message or file upload

Path

`/1.0/message`

Returns:

    {
        'meta': {
            'code': 200,
            'message': 'message created successfully'
        }
    }

### Get message list (inbox)

Method: GET

Path

`/1.0/messages/unread`

Returns:

    {
        'data': [
            {
                'id': 1,
                'email': 'them@detourapp.com',
                'avatar': 'https://gravatar.com/321',
                'created': 12345
            }
        ],
        'meta': {
            'code': 200,
            'message': 'messages retrieved successfully'
        }
    }

### Get message

Method: GET

Path

`/1.0/message/<id>`

Returns:

    {
        'data': [
            {
                'id': 1,
                'email': 'them@detourapp.com',
                'avatar': 'https://gravatar.com/321',
                'message': 'some message',
                'photo': 'base64:12345',
                'ttl': 10,
                'created': 12345
            }
        ],
        'meta': {
            'code': 200,
            'message': 'message retrieved successfully'
        }
    }

Notes:

ttl is in seconds

### Get message list (delivery status)

Method: GET

Path

`/1.0/messages/sent`

Returns:

    {
        'data': [
            {
                'email': 'them@detourapp.com',
                'avatar': 'https://gravatar.com/321',
                'status': 'opened',
                'created': 12345
            }
        ],
        'meta': {
            'code': 200,
            'message': 'messages retrieved successfully'
        }
    }

## Errors

Same as above but the meta portion returns with an appropriate error code (e.g. 500 or 403) and an error message will follow

    'meta': {
        'code': 403,
        'message': 'Not allowed'
    }
