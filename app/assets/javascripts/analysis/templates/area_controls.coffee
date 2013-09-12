window.JST ||= {}

window.JST['area_controls'] = _.template("""
  <a href="#" id="delete-area">Delete this area</a>

  <div class="new-polygon-container">
    <% if (area.polygons.length > 0) { %>
      <button type="button" class="btn btn-primary" id="new-polygon">
        <%= polyglot.t("analysis.buttons.draw_another_polygon") %>
      </button>
    <% } else { %>
      <button type="button" class="btn btn-primary" id="new-polygon">
        <%= polyglot.t("analysis.buttons.draw_polygon") %>
      </button>
    <% } %>
  </div>

  <div id="area_results">
  </div>
""")
