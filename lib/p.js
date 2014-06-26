module.exports = {
  data: function(key) {
    return function(res) {
      return res[key]
    }
  }
}
