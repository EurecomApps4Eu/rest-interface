var expect = require('chai').expect;
var request = require('supertest');
var config = require('../config');

var extend = require('util')._extend;

var uri = config.test.restURI;

describe('REST', function(){

  describe('applications', function(){

    var testApp = {
      title: 'Test app',
      text: 'test content',
    };

    it('should add new app', function(done) {

      request(uri)
        .post('/applications')
        .send(testApp)
        .expect('Content-Type', /json/)
        .expect(201) // HTTP 201 created
        .end(function(err, res) {

          if ( err ) {
            throw err;
          }

          expect(res.body).to.have.property('_id');

          testApp._id = res.body._id;

          expect(res.body.title).to.equal(testApp.title);
          expect(res.body.text).to.equal(testApp.text);

          done();

        });

    });

    it('should modify existing app', function(done) {

      var modifiedTestApp = extend(testApp, {
        title:'ModifiedTitle',
        text: 'ModifiedText',
      });

      request(uri)
        .put('/applications/' + testApp._id)
        .send(modifiedTestApp)
        .expect('Content-Type', /json/)
        .expect(200) // HTTP 200
        .end(function(err, res) {

          if ( err ) {
            throw err;
          }

          expect(res.body._id).to.equal(modifiedTestApp._id);
          expect(res.body.title).to.equal(modifiedTestApp.title);
          expect(res.body.text).to.equal(modifiedTestApp.text);

          done();

        });

    });

    it ('should complain when adding non-existing fields', function(done) {

      var modifiedTestApp = extend(testApp, {
        title:'ModifiedTitle',
        text: 'ModifiedText',
        nonExistingField: 'test',
      });

      request(uri)
        .post('/applications')
        .send(modifiedTestApp)
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
