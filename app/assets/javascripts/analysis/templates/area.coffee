window.JST ||= {}

window.JST['area'] = _.template("""
  <a href="#" id="delete-area">Delete this area</a>

  <div class="new-polygon-container">
    <% if (area.polygons.length > 0) { %>
      <a href="#" class="btn btn-primary" id="new-polygon">Draw another polygon</a>
    <% } else { %>
      <a href="#" class="btn btn-primary" id="new-polygon">Draw a polygon</a>
    <% } %>
  </div>

  <% if (!_.isEmpty(results)) { %>
    <table class="table total-stats">
      <thead>
        <tr>
          <th>Total Carbon Stock</th>
          <th>Total Area</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><%= roundToDecimals(results.sum.carbon, 2) %> <span>T</span></td>
          <td><%= roundToDecimals(results.sum.area, 2) %> <span>KM2</span></td>
        </tr>
      </tbody>
    </table>

    <table class="table polygon-stats">
      <thead>
        <tr>
          <th>Polygons in this area</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Habitat</td>
          <td>Area</td>
          <td>Carbon Stock</td>
        </tr>
        <% _.each(results.habitats, function(attributes, key) { %>
          <tr>
            <td><%= key %></td>
            <td><%= roundToDecimals(attributes.area, 2) %> KM<sup>2</sup></td>
            <td><%= roundToDecimals(attributes.carbon, 2) %> KG</td>
          </tr>
        <% }) %>
      </tbody>
    </table>

    <div class="footer">
      <a href="<%= window.pica.config.magpieUrl %>/areas_of_interest/<%= area.get('id') %>.csv" class="btn btn-primary export">Export your report</a>
    </div>
  <% } %>
""")
