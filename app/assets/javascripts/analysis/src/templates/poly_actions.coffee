window.JST ||= {}

window.JST['poly_actions'] = _.template("""
  <div
    class="polyActions"
    style="position: absolute;
           left: <%= coords.x %>;
           top: <%= coords.y %>;
           height: 50px;
           width: 300px;">
    <input class="delete-polygon" type="submit" value="Delete polygon?"/>
  </div>
""")
