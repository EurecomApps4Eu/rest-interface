// Example config file: replace with real values for production use

module.exports = {
  db: {
    productionDb: 'mongodb://localhost/apps4europe',
    testDb: 'mongodb://localhost/test',
  },
  test: {
    restURI: 'http://localhost:3001',
  },
  secret: "Iv~Fcpwdo-.g!77Ad60'}:2thx=+r*N*^dIFW]p",
  restURI: 'http://localhost:3000',
  fileUploadLimit: 1024 * 1024 * 8 // 8 MB
};
