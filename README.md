<div align="center">
[![Build Status](https://travis-ci.org/sam-glad/housing-helper.svg?branch=master)](https://travis-ci.org/sam-glad/housing-helper)
[![Coverage Status](https://coveralls.io/repos/github/sam-glad/housing-helper/badge.svg?branch=master)](https://coveralls.io/github/sam-glad/housing-helper?branch=master)
</div>

## NOTE

This documentation is an extremely bare-bones placeholder pending proper API docs. It should get you to the point where you can use the API without too much trouble, but in the near future, full documentation will include full sample requests, full sample responses, and examples of how to use information retrieved from one request to make subsequent requests.

## Routes

### Auth

**Register a new account**

```
curl -X POST \
  https://housinghelper.herokuapp.com/api/auth/register \
  -H 'content-type: application/json' \
  -d '{
  "name_first":"Test",
  "name_last":"Test",
  "email_address":"foo@example.com",
  "password":"test"
}'
```

* Returns the inserted user (without password)
* Also inserts a related group named "Just Me" which cannot be deleted (default group for posts)

**Login**

```
curl -X POST \
  https://housinghelper.herokuapp.com/api/auth/login \
  -H 'content-type: application/json' \
  -d '{
  "email_address":"developer@example.com",
  "password":"test"
}'
```

* Credentials provided must be for a registered user (see above)
* Returns a token which must be used to authenticate most requests as the value for the *Authorization* header

### Groups

**Create**

```
curl -X POST \
  https://housinghelper.herokuapp.com/api/groups \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -d '{
  "name":"My Shockingly Exclusive Group"
}'
```

* Returns the inserted group
* Automatically assigns the authenticated user to that group

**Retrieve one group**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/groups/:id \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>'
}'
```

* Returns `401 Unauthorized` if user is not in group specified by ID or if the authenticated (via token) user is not in that group
* Otherwise, returns the group specified by ID

**Retrieve one group with its users**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/groups/:id/users \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>'
}'
```

* Returns `401 Unauthorized` if user is not in group specified by ID or if the authenticated (via token) user is not in that group
* Otherwise, returns the group specified by ID with its users

**Retrieve one group with its posts**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/groups/:id/posts \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>'
}'
```

* Returns `401 Unauthorized` if user is not in group specified by ID or if the authenticated (via token) user is not in that group
* Otherwise, returns group specified by ID with its posts

### Group Memberships

**Add a user to a group**

```
curl -X POST \
  https://housinghelper.herokuapp.com/api/groups-users \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -H 'content-type: application/json' \
  -d '{
  "group_id": <GROUP-ID-HERE>,
  "users":[ {"id": <USER-ID-HERE>} ]
}'
```

* Returns `401 Unauthorized` if user is not in group specified by `group_id` in payload
* Otherwise, returns the inserted *group-user* (membership - just a join table between groups and users) record

**Remove oneself from a group**

```
curl -X DELETE \
  https://housinghelper.herokuapp.com/api/groups-users/ \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -H 'content-type: application/json' \
  -d '{
  "group_id": <GROUP-ID-HERE>
}'
```

* Returns `400 Bad Request` if the authenticated (via token) user is not in the group specified by the payload's `group_id`
* Returns `400 Bad Request` if the group is a permanent ("Just Me") group, which is created upon user registration
* Otherwise, removes the user from the group specified by the payload's `group_id`
  * Also deletes the group in question (with its posts) if authenticated user was the only one in it

### Posts

**Create a post**

```
curl -X POST \
  https://housinghelper.herokuapp.com/api/posts \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -H 'content-type: application/json' \
  -d '{
  "title":"First post!",
  "body":"Body goes here",
  "bedrooms":3,
  "bathrooms":2,
  "price":1000,
  "address":"123 Fake St.",
  "square_footage":1500,
  "parking":"garage",
  "housing_type":"house",
  "url":"foo.craigslist.org/apa/1",
  "craigslist_post_id":1
}'
```

* Returns `401 Unauthorized` if a valid token is not provided
* Otherwise, returns the inserted post

**Retrieve all of the authenticated user's posts**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/posts \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -H 'content-type: application/json'
```

* Returns `401 Unauthorized` if a valid token is not provided
* Otherwise, returns an array of all posts belonging to the authenticated user's groups

**Retrieve one post**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/posts/:post_id \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -H 'content-type: application/json'
```

* Returns `401 Unauthorized` if the authenticated (via token) header did not insert the post specified by `post_id`
* Otherwise, returns the post in question