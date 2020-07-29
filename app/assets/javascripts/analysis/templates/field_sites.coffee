window.JST ||= {}

window.JST['field_sites'] = _.template("""
  <% if (!field_sites.length) { %>
    <p class="u-center"><%= polyglot.t('analysis.no_field_sites') %></p>
  <% } %>
  <% _.each(field_sites, function(field_site) { %>
    <% if(field_site.geometry.type == "MultiPolygon") { %>
      <a href="#" class="field-site" data-site-bounds="<%= JSON.stringify(field_site.geometry.coordinates[0][0]) %>"><%= field_site.properties.name %></a>
    <% } else { %>
      <a href="#" class="field-site" data-site-bounds="<%= JSON.stringify(field_site.geometry.coordinates[0]) %>"><%= field_site.properties.name %></a>
      <% } %>
  <% }) %>
""")

