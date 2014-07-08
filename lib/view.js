module.exports = (function() {

  var Handlebars = require('handlebars')

  function View(args) {
    this.el = args.el
    this.$el = $(this.el)

    if(args.template) {
      this.template = Handlebars.compile($(args.template).html())
    }

    if(args.initialize)
      args.initialize.call(this, Handlebars)
  }

  View.prototype.render = function(data) {
    if(!this.template) throw 'No template provided'

    this.$el.html(this.template(data))
    return this
  };

  View.prototype.customRender = function(func) {
    this.$el.html(func.call(this))
    return this
  };

  return View

})()
