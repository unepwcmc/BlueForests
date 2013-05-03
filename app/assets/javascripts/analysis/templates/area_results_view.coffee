window.JST ||= {}

window.JST['area_results_view'] = _.template("""
  <% if (!area.get('_loading')) { %>
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

        <h4>Equivalent per capita CO<sup>2</sup> emissions</h4>
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
              <td title="Carbon Stock">C-Stock <span>T</span></td>
            </tr>
            <% _.each(results.habitats, function(attributes, key) { 
              if (""+key !== 'null'){ %>
                <tr>
                  <td><%= key %></td>
                  <td><%= roundToDecimals(attributes.area_km2, 2) %></td>
                  <td><%= roundToDecimals(attributes.habitat_percentage, 2) %></td>
                  <td><%= Math.ceil(attributes.carbon) %></td>
                </tr>
              <% }
              }) %>
          </tbody>
        </table>

        <div class="footer">
          <div class="permalink">
            <h5>Share your work with this link</h5>
            <input type="text" value="http://bluecarbon.unep-wcmc.org/#/analysis/<%= area.get('id') %>">
          </div>
          <a class="btn btn-primary share">Share your work</a>
          <a href="<%= window.pica.config.magpieUrl %>/areas_of_interest/<%= area.get('id') %>.csv" class="btn btn-primary export">Export your report</a>
        </div>
      <% } %>
    <% } %>
  <% } else { %>
    <img src="/assets/loading-spinner.gif" class="loading">
  <% } %>
""")
