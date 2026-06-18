module.exports = (req, res) => {
  const url = req.url || "";

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify({ status: "ok", url }));
};
