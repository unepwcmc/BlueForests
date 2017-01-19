window.JST ||= {}

window.JST['area_results_view'] = _.template("""
  <% if (area.app.syncsInProgress == 1) { %>
    <div class="loading">
      <img src="/loading-spinner.gif">
    </div>
    <% } else { %>
    <% if (!_.isEmpty(results)) { %>
      <% if (_.isEmpty(results.habitats)) { %>
        <div class="u-center"><%= polyglot.t("analysis.empty_result") %></div>
      <% } else { %>
        <h4 class="<%= this.textDirection %>">
          <%= polyglot.t("analysis.total_carbon_stock") %><sup class="tip" id="ca_stock_tip"></sup>
        </h4>
        <p class="<%= this.textDirection %>">
          <%= roundToDecimals(results.sum.carbon, 2) %> <span>T</span>
        </p>

        <h4 class="<%= this.textDirection %>"><%= polyglot.t("analysis.total_area") %> <sup class="tip" id="tot_area_tip"></sup></h4>
        <p class="<%= this.textDirection %>">
        <% if (results.sum.area > 1) { %>
          <%= roundToDecimals(results.sum.area, 2) %>
        <% } else { %>
          <%= roundToDecimals(results.sum.area, 3) %>
        <% } %>
        <span>km<sup>2</sup></span></p>

        <h4 class="no-border" dir="<%= this.textDirection %>" ><%= polyglot.t("analysis.polygons_in_this_area") %> <sup class="tip" id="habitat_tip"></sup></h4>
        <table class="table polygon-stats">
          <tr>
            <th><%= polyglot.t("analysis.ecosystem") %></th>
            <th dir="<%= this.texthirection %>"><%= polyglot.t("analysis.area_ha") %></th>
            <th dir="<%= this.texthirection %>"><%= polyglot.t("analysis.area_percentage") %></th>
            <th dir="<%= this.texthirection %>" title="Carbon Stock"><%= polyglot.t("analysis.c_stock") %></th>
          </tr>
          <% _.each(results.habitats, function(attributes, key) { %>
            <tr>
              <td dir="<%= this.textDirection %>" ><%= key %></td>
              <td><%= roundToDecimals(attributes.area_km2, 2) %></td>
              <td><%= roundToDecimals(attributes.habitat_percentage, 2) %></td>
              <td><%= Math.ceil(attributes.carbon) %></td>
            </tr>
          <% }) %>
        </table>

        <div class="footer">
          <a href="/tool#/analysis/<%= area.get('id') %>" dir="<%= this.textDirection %>" class="btn btn-primary share"><%= polyglot.t("analysis.share_your_work") %></a>
          <a dir="<%= this.textDirection %>" href="<%= window.pica.config.magpieUrl %>/areas_of_interest/<%= area.get('id') %>.csv" class="btn btn-primary export"><%= polyglot.t("analysis.export_your_report") %></a>
        </div>
      <% } %>
    <% } %>

  <% } %>
""")
