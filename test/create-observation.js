var test = require("tape");
var osmdb = require("osm-p2p-mem");
var osmp2p = require("../app/lib/osm-p2p");
var obsp2p = require("osm-p2p-observations");
var memdb = require("memdb");

test("create an observation to a placeholder node, and check they are linked", function(
  t
) {
  t.plan(4);

  var obsDb = osmdb();
  var osm = osmp2p(obsDb, osmdb());

  var nodeId;

  var node = JSON.stringify({
    type: "node",
    lat: 5,
    lon: -5
  });
  osm.createNode(node, function(err, node) {
    t.error(err);
    var doc = node.value.v;
    nodeId = node.value.k;

    var obs = JSON.stringify({
      type: "observation",
      lat: 6,
      lon: -6
    });
    osm.createObservation(doc.tags["osm-p2p-id"], obs, function(
      err,
      obsDoc,
      linkDoc
    ) {
      t.error(err);
      t.equals(linkDoc.obs, obsDoc.id);
      t.equals(linkDoc.link, nodeId);
    });
  });
});

test("create an observation to a pre-existing OSM.org node, and check they are linked", function(
  t
) {
  t.plan(4);

  var obsDb = osmdb();
  var osmOrgDb = osmdb();
  var osm = osmp2p(obsDb, osmOrgDb);

  var doc = {
    type: "node",
    lat: 5,
    lon: -5
  };
  osmOrgDb.create(JSON.stringify(doc), function(err, nodeId) {
    t.error(err);

    var obs = JSON.stringify({
      type: "observation",
      lat: 6,
      lon: -6
    });
    osm.createObservation(nodeId, obs, function(err, obsDoc, linkDoc) {
      t.error(err);
      t.equals(linkDoc.obs, obsDoc.id);
      t.equals(linkDoc.link, nodeId);
    });
  });
});

test("simulate an observation created before & after a placeholder node becomes an OSM.org node, and check they are linked", function(
  t
) {
  t.plan(13);

  var obsDb = osmdb();
  var osmOrgDb = osmdb();
  var linkDb = obsp2p({ db: memdb(), log: obsDb.log });
  var osm = osmp2p(obsDb, osmOrgDb);

  var doc = {
    type: "node",
    lat: 5,
    lon: -5
  };
  var obs = {
    type: "observation",
    lat: 6,
    lon: -6
  };
  var p2pId;
  var linkDoc;
  var osmId;

  // step 1
  createPlaceholderNodeAndObservation(function() {
    // step 2
    createOsmOrgNode(function() {
      // step 3
      updateObservationLink(function() {
        // step 4
        checkLink();
      });
    });
  });

  // step 1
  function createPlaceholderNodeAndObservation(done) {
    var node = JSON.stringify(doc);
    osm.createNode(node, function(err, node) {
      t.error(err);
      var newDoc = node.value.v;
      p2pId = node.value.k;

      var observation = JSON.stringify(obs);
      osm.createObservation(newDoc.tags["osm-p2p-id"], observation, function(
        err,
        obsDoc,
        _linkDoc
      ) {
        t.error(err);
        linkDoc = _linkDoc;
        t.equals(linkDoc.obs, obsDoc.id);
        t.equals(linkDoc.link, p2pId);
        done();
      });
    });
  }

  // step 2
  function createOsmOrgNode(done) {
    var newDoc = Object.assign(doc, { tags: { "osm-p2p-id": p2pId } });
    osmOrgDb.create(JSON.stringify(newDoc), function(err, _osmId) {
      t.error(err);
      osmId = _osmId;
      done();
    });
  }

  // step 3
  function updateObservationLink(done) {
    var newLink = {
      type: "observation-link",
      obs: linkDoc.obs,
      link: osmId
    };
    obsDb.del(p2pId, function(err) {
      t.error(err);
      obsDb.put(linkDoc.id, newLink, function(err, link) {
        t.error(err);
        done();
      });
    });
  }

  // step 4
  function checkLink() {
    // Ensure p2pId no longer exists in obsDb
    obsDb.get(p2pId, function(err, docs) {
      t.error(err);
      t.equals(Object.keys(docs).length, 1);
      t.equals(docs[Object.keys(docs)[0]].deleted, true);
    });

    // Ensure new OSM node's ID links to the observation now
    linkDb.indexes.ref.dex.ready(function() {
      linkDb.links(osmId, function(err, links) {
        t.error(err);
        var expected = {
          type: "observation-link",
          obs: linkDoc.obs,
          link: osmId
        };
        t.equals(links.length, 1);
        t.deepEquals(links[0].value, expected);
      });
    });
  }
});
