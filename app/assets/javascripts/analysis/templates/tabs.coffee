window.JST ||= {}

window.JST['tabs'] = _.template("""
  <ul class="tabs">
    <% _.each(workspace.areas, function(area, index) { %>
      <% current_class = (area == workspace.currentArea) ? 'active' : '' %>
      <li data-area-id="<%= index %>" class="<%= current_class %>"><%= area.get('name') %></li>
    <% }); %>

    <% if (workspace.areas.length < 3) { %>
      <li id="add-area"></li>
    <% } %>

  </ul>

  <div id="area">
  </div>
""")
