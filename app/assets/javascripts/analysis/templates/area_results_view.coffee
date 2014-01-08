window.JST ||= {}

window.JST['area_results_view'] = _.template("""
  <% if (area.app.syncsInProgress == 1) { %>
    <img src="/assets/loading-spinner.gif" class="loading">
    <% } else { %>
    <% if (!_.isEmpty(results)) { %>
      <% if (_.isEmpty(results.habitats)) { %>
        <%= polyglot.t("analysis.empty_result") %>
      <% } else { %>
        <table class="table total-stats">
          <thead>
            <tr>
              <th class="<%= this.textDirection %>" ><%= polyglot.t("analysis.total_carbon_stock") %><sup class="tip" id="ca_stock_tip"></sup></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="<%= this.textDirection %>"><%= roundToDecimals(results.sum.carbon, 2) %> <span>T</span></td>
            </tr>
          </tbody>
        </table>

        <table class="table total-stats">
          <thead>
            <tr>
              <th class="<%= this.textDirection %>"><%= polyglot.t("analysis.total_area") %> <sup class="tip" id="tot_area_tip"></sup></th>
            </tr>
          </thead>
          <tbody>
            <td class="<%= this.textDirection %>"><%= roundToDecimals(results.sum.area, 2) %> <span>km<sup>2</sup></span></td>
          </tbody>
        </table>

        <h4 dir="<%= this.textDirection %>" ><%= polyglot.t("analysis.equivalent_per_capita_CO2_emissions") %> <sup class="tip" id="co2_pc_emis_tip"></sup></h4>
        <table class="table human-stats">
          <tbody>
            <tr>
              <td class="<%= this.textDirection %>">
                <%= results.sum.human_emissions %>
              </td>
            </tr>
          </tbody>
        </table>

        <h4 dir="<%= this.textDirection %>" ><%= polyglot.t("analysis.polygons_in_this_area") %> <sup class="tip" id="habitat_tip"></sup></h4>
        <table class="table polygon-stats">
          <tbody>
            <tr>
              <td><%= polyglot.t("analysis.ecosystem") %></td>
              <td dir="<%= this.textDirection %>"><%= polyglot.t("analysis.area_ha") %></td>
              <td dir="<%= this.textDirection %>"><%= polyglot.t("analysis.total_area") %></td>
              <td dir="<%= this.textDirection %>" title="Carbon Stock"><%= polyglot.t("analysis.c_stock") %></td>
            </tr>
            <% _.each(results.habitats, function(attributes, key) { %>
              <tr>
                <td dir="<%= this.textDirection %>" ><%= key %></td>
                <td><%= roundToDecimals(attributes.area_km2, 2) %></td>
                <td><%= roundToDecimals(attributes.habitat_percentage, 2) %></td>
                <td><%= Math.ceil(attributes.carbon) %></td>
              </tr>
            <% }) %>
          </tbody>
        </table>

        <div class="footer">
          <div class="permalink">
            <h5>Share your work with this link</h5>
            <input type="text" value="http://bluecarbon.unep-wcmc.org/<%= polyglot.locale() %>/layout/#/analysis/<%= area.get('id') %>">
          </div>
          <a dir="<%= this.textDirection %>" class="btn btn-primary share"><%= polyglot.t("analysis.share_your_work") %></a>
          <a dir="<%= this.textDirection %>" href="<%= window.pica.config.magpieUrl %>/areas_of_interest/<%= area.get('id') %>.csv" class="btn btn-primary export"><%= polyglot.t("analysis.export_your_report") %></a>
        </div>
      <% } %>
    <% } %>

  <% } %>
""")
