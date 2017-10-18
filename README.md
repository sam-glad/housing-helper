## NOTE

This documentation is an extremely bare-bones placeholder pending proper API docs. It should get you to the point where you can use the API without too much trouble, but in the near future, full documentation will include full sample requests, full sample responses, and examples of how to use information retrieved from one request to make subsequent requests.

## Routes

### Auth

**Register a new account:**

```
curl -X POST \
  https://housinghelper.herokuapp.com/api/auth/register \
  -H 'content-type: application/json' \
  -d '{
  "emailAddress":"developer@example.com",
  "nameFirst":"John",
  "nameLast":"Smith",
  "password":"admin"
}'
```

* Returns the inserted user (without password)

**Login:**

```
curl -X POST \
  https://housinghelper.herokuapp.com/api/auth/login \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -H 'content-type: application/json' \
  -d '{
  "emailAddress":"developer@example.com",
  "password":"test"
}'
```

* Returns a token which must be used to authenticate most requests as the value for the *Authorization* header

### Groups

**Create:**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/groups \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -d '{
  "emailAddress":"developer@example.com",
  "password":"test"
}'
```

* Returns the inserted group
* Automatically assigns the authenticated user to that group

**Retrieve one group:**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/groups/:id \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>'
}'
```

* Returns `401 Unauthorized` if user is not in group specified by ID or if the authenticated (via token) user is not in that group
* Otherwise, returns the group specified by ID

**Retrieve one group with its users:**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/groups/:id \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>'
}'
```

* Returns `401 Unauthorized` if user is not in group specified by ID or if the authenticated (via token) user is not in that group
* Otherwise, returns the group specified by ID with its users

## Group Memberships

**Add a user to a group**:

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

## Posts

**Create a post:**

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
  "squareFootage":1500,
  "parking":"garage",
  "housingType":"house",
  "url":"foo.craigslist.org/apa/1",
  "craigslistPostId":1
}'
```

* Returns `401 Unauthorized` if a valid token is not provided
* Otherwise, returns the inserted post

**Retrieve all of the authenticated user's posts:**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/posts/:post_id \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -H 'content-type: application/json'
```

* Returns `401 Unauthorized` if a valid token is not provided
* Otherwise, returns an array of all posts inserted by the user authenticated via the token


**Retrieve one post:**

```
curl -X GET \
  https://housinghelper.herokuapp.com/api/posts/:post_id \
  -H 'authorization: Bearer <YOUR-TOKEN-HERE>' \
  -H 'content-type: application/json'
```

* Returns `401 Unauthorized` if the authenticated (via token) header did not insert the post specified by `post_id`
* Otherwise, returns the post in question