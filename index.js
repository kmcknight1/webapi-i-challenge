const express = require('express')

//local imports 
const Users = require('./data/db')

//create server
const server = express()

//parses data
server.use(express.json())

server.get('/', (req, res) => {
    res.send('YO WHADDUP ITS YA GURL KT')
})

const port = 5000;
server.listen(port, () => console.log(`\n*** running on port ${port} ***\n`))

server.get('/api/users', (req, res) => {
    Users.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(error => {
            res.status(500).json({ error: "The users information could not be retrieved." })
        })
})

server.get('/api/users/:id', (req, res) => {
    const { id } = req.params;

    Users.findById(id)
        .then(user => {
            if (user) {
                res.status(200).json(user)
            } else {
                res.status(404).json({ message: "The user with the specified ID does not exist." })
            }
        })
        .catch(error => {
            res.status(500).json({ error: "The user information could not be retrieved." })
        })
})

server.post('/api/users', (req, res) => {
    const user = req.body;

    if (!user.name || !user.bio) {
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." })
        return;
    }

    Users.insert(user)
        .then(created => {
            res.status(201).json(created)
        })
        .catch(error => {
            res.status(500).json({ error: "There was an error while saving the user to the database" })
        })
})

server.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    Users.remove(id)
        .then(deleted => {
            if (deleted) {
                res.status(204).end();
            } else {
                res.status(404).json({ message: "The user with the specified ID does not exist." })
            }
        })
        .catch(error => {
            res.status(500).json({ error: "The user could not be removed" })
        })
})

server.put('/api/users/:id', (req, res) => {
    const id = req.params.id;
    const changes = req.body;

    if (!changes.name || !changes.bio) {
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." })
        return;
    }

    Users.update(id, changes)
        .then(response => {
            if (response == 0) {
                res.status(404).json({ message: "The user with the specified ID does not exist." })
                return;
            }

            Users.findById(id)
                .then(user => {
                    if (user.length === 0) {
                        res.status(404).json({ message: "User with that id not found" })
                        return;
                    }
                    res.status(200).json(user)
                })
                .catch(error => {
                    res.status(500).json({ message: "Error looking up user" })
                })
        })
        .catch(error => {
            res.status(500).json({ error: "The user information could not be modified." })
        })
})

//- `find()`: calling find returns a promise that resolves to an array of all the users contained in the database.
//- `findById()`: this method expects an `id` as it's only parameter and returns the user corresponding to the `id` provided or an empty array if no user with that `id` is found.
//- `insert()`: calling insert passing it a user object will add it to the database and return an object with the `id` of the inserted user. The object looks like this: `{ id: 123 }`.
//- `update()`: accepts two arguments, the first is the `id` of the user to update and the second is an object with the `changes` to apply. It returns the count of updated records. If the count is 1 it means the record was updated correctly.
//- `remove()`: the remove method accepts an `id` as it's first parameter and upon successfully deleting the user from the database it returns the number of records deleted.

// {
//     name: "Jane Doe", // String, required
//     bio: "Not Tarzan's Wife, another Jane",  // String
//     created_at: Mon Aug 14 2017 12:50:16 GMT-0700 (PDT) // Date, defaults to current date
//     updated_at: Mon Aug 14 2017 12:50:16 GMT-0700 (PDT) // Date, defaults to current date
//   }

// | PUT    | /api/users/:id | Updates the user with the specified `id` using data from the `request body`. Returns the modified document, **NOT the original**. |

// `PUT` request to `/api/users/:id`:

// - If the _user_ with the specified `id` is not found:
//   - return HTTP status code `404` (Not Found).
//   - return the following JSON object: `{ message: "The user with the specified ID does not exist." }`.

//   - If the request body is missing the `name` or `bio` property:
//   - cancel the request.
//   - respond with HTTP status code `400` (Bad Request).
//   - return the following JSON response: `{ errorMessage: "Please provide name and bio for the user." }`.

// - If there's an error when updating the _user_:
//   - cancel the request.
//   - respond with HTTP status code `500`.
//   - return the following JSON object: `{ error: "The user information could not be modified." }`.

//   - If the user is found and the new information is valid:
//   - update the user document in the database using the new information sent in the `request body`.
//   - return HTTP status code `200` (OK).
//   - return the newly updated _user document_.
