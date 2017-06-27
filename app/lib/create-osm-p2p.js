const levelup = require("levelup");
const asyncstorage = require("asyncstorage-down");
const hyperlog = require("hyperlog");
const osmdb = require("osm-p2p-db");

const createStore = require("./asyncstorage-chunk-store");

function createOsmDb(prefix) {
  const logdb = levelup(prefix + "-db", { db: asyncstorage });
  const log = hyperlog(logdb, { valueEncoding: "json" });

  return osmdb({
    log: log,
    db: levelup(prefix + "-index", { db: asyncstorage }),
    store: createStore(1024, prefix + "-chunks")
  });
}

module.exports = createOsmDb
