window.JST ||= {}

window.JST['area_controls'] = _.template("""
  <% if (!(area.app.syncsInProgress == 1)) { %>

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
  <% } %>

  <div id="area_results">
  </div>
""")

# <div class="clearfix">
#   <a dir="<%= this.textDirection %>" href="#" id="delete-area">
#     <i class="fa fa-trash"></i>
#     <%= polyglot.t("analysis.delete_this_area") %>
#   </a>
# </div>