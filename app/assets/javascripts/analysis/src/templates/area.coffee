window.JST ||= {}

window.JST['area'] = _.template("""
  <a href="#" class="delete-area">Delete</a>

  <div class="new-polygon-container">
    <% if (area.polygons.length > 0) { %>
      <a href="#" class="btn btn-primary new-polygon">Draw another polygon</a>
    <% } else { %>
      <a href="#" class="btn btn-primary new-polygon">Draw a polygon</a>
    <% } %>
  </div>
""")
