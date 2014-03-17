var expect = require('chai').expect;
var request = require('supertest');
var config = require('../config');

var extend = require('util')._extend;

var uri = config.test.restURI;

describe('REST', function(){

  describe('events', function(){

    var testEvent = {
      title: 'Test event',
      text: 'test content',
    };

    it('should add new event', function(done) {

      request(uri)
        .post('/events')
        .send(testEvent)
        .expect('Content-Type', /json/)
        .expect(201) // HTTP 201 created
        .end(function(err, res) {

          if ( err ) {
            throw err;
          }

          expect(res.body).to.have.property('_id');

          testEvent._id = res.body._id;

          expect(res.body.title).to.equal(testEvent.title);
          expect(res.body.text).to.equal(testEvent.text);

          done();

        });

    });

    it('should modify existing event', function(done) {

      var modifiedTestEvent = extend(testEvent, {
        title:'ModifiedTitle',
        text: 'ModifiedText',
      });

      request(uri)
        .put('/events/' + testEvent._id)
        .send(modifiedTestEvent)
        .expect('Content-Type', /json/)
        .expect(200) // HTTP 200
        .end(function(err, res) {

          if ( err ) {
            throw err;
          }

          expect(res.body._id).to.equal(modifiedTestEvent._id);
          expect(res.body.title).to.equal(modifiedTestEvent.title);
          expect(res.body.text).to.equal(modifiedTestEvent.text);

          done();

        });

    });

    it ('should complain when adding non-existing fields', function(done) {

      var modifiedTestEvent = extend(testEvent, {
        title:'ModifiedTitle',
        text: 'ModifiedText',
        nonExistingField: 'test',
      });

      request(uri)
        .post('/events')
        .send(modifiedTestEvent)
        .expect('Content-Type', /json/)
        .expect(400) // HTTP 400 bad request
        .end(function(err, res) {

          if ( err ) {
            throw err;
          }

          done();

        });

    });

  });

});
