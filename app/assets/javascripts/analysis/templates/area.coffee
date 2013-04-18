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
    <% if (_.isEmpty(results.habitats)) { %>
      Your AOI doesn't intersect with any known habitats.
    <% } else { %>
      <table class="table total-stats">
        <thead>
          <tr>
            <th>Total Carbon Stock</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><%= roundToDecimals(results.sum.carbon, 2) %> <span>T</span></td>
          </tr>
        </tbody>
      </table>

      <table class="table total-stats">
        <thead>
          <tr>
            <th>Total Area</th>
          </tr>
        </thead>
        <tbody>
          <td><%= roundToDecimals(results.sum.area, 2) %> <span>km<sup>2</sup></span></td>
        </tbody>
      </table>

      <h4>Avg. Person CO<sup>2</sup> Emissions EQV.</h4>
      <table class="table human-stats">
        <tbody>
          <tr>
            <td>
              <%= results.sum.human_emissions %>
            </td>
          </tr>
        </tbody>
      </table>

      <h4>Polygons in this area</h4>
      <table class="table polygon-stats">
        <tbody>
          <tr>
            <td>Habitat</td>
            <td>Area <span>km<sup>2</sup></span></td>
            <td>Area <span>% of Tot.</span></td>
            <td title="Carbon Stock">C-Stock <span>kg</span></td>
          </tr>
          <% _.each(results.habitats, function(attributes, key) { %>
            <tr>
              <td><%= key %></td>
              <td><%= roundToDecimals(attributes.area, 2) %></td>
              <td><%= roundToDecimals(attributes.percentage, 2) %></td>
              <td><%= roundToDecimals(attributes.carbon, 2) %></td>
            </tr>
          <% }) %>
        </tbody>
      </table>

      <div class="footer">
        <a href="<%= window.pica.config.magpieUrl %>/areas_of_interest/<%= area.get('id') %>.csv" class="btn btn-primary export">Export your report</a>
      </div>
    <% } %>
  <% } %>
""")
