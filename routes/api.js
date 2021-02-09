/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const { ObjectId } = require("mongodb");
const { response } = require("../server");

module.exports = function (app, client) {

  app.route('/api/books')
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const collection = client.db('database').collection('books');

      const docs = await collection.find().toArray();
      res.json(docs);
    })

    .post(async function (req, res) {
      try {
        let title = req.body.title;
        //response will contain new book object including atleast _id and title
        if (title === undefined || title === "") {
          res.send('missing required field title')
        } else {
          const collection = client.db('database').collection('books');
          const doc = {
            title: title,
            comments: []
          };
          const result = await collection.insertOne(doc);
          //console.log(result.ops[0])
          res.json({
            _id: result.ops[0]['_id'],
            title: result.ops[0]['title']
          });
        }
      } catch (err) {
        throw err;
      }

    })

    .delete(async function (req, res) {
      try {
        //if successful response will be 'complete delete successful'
        const collection = client.db('database').collection('books');
        const result = await collection.deleteMany();
        res.send('complete delete successful');

      } catch (err) {
        res.send(err)
        throw err;
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res) {
      try {
        let bookid = req.params.id;
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        const collection = client.db('database').collection('books');
        const docs = await collection.findOne(new ObjectId(bookid));
        if (docs === null) {
          res.send('no book exists');
        } else {
          res.json(docs);
        }
      } catch (err) {
        res.send('no book exists');
        throw err;
      }
    })

    .post(async function (req, res) {
      try {
        let bookid = req.params.id;
        let comment = req.body.comment;
        //json res format same as .get
        if (comment === "" || comment === undefined) {
          res.send("missing required field comment");
        } else {
          const collection = client.db('database').collection('books');
          const result = await collection.findOneAndUpdate(
            { _id: ObjectId(bookid) },
            {
              $push: {
                comments: comment
              }
            },
            {
              upsert: false
            }
          );
          console.log(result.value);
          res.json(result.value);
        }
      } catch (err) {
        res.send('no book exists');
        throw err;
      }

    })

    .delete(async function (req, res) {
      try {
        let bookid = req.params.id;
        //if successful response will be 'delete successful'
        const collection = client.db('database').collection('books');
        const result = await collection.deleteOne(new ObjectId(bookid));
        if (result.deletedCount === 1) {
          res.send('delete successful');
        } else {
          res.send('no book exists');
        }
      } catch (err) {
        res.send('no book exists');
        throw err;
      }
    });

};
