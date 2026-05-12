export default function handler(req, res) {
  const dev = req.query.dev;
  const KEY = "time_db";
  
  let db = globalThis[KEY] || {};
  if(!db[dev]){
    db[dev] = Date.now();
    globalThis[KEY] = db;
  }

  const start = db[dev];
  const now = Date.now();
  const pass = 120 * 1000; // 2分钟
  const left = Math.max(0, Math.floor((pass - (now - start)) / 1000));

  res.status(200).json({
    expired: left <= 0,
    left: left
  });
}
