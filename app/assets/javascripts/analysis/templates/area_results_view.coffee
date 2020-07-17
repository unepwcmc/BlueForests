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

        <h4 class="<%= this.textDirection %>"><%= polyglot.t("analysis.total_area") %></h4>
        <p class="<%= this.textDirection %>">
        <% if (results.sum.area > 1) { %>
          <%= roundToDecimals(results.sum.area, 2) %>
        <% } else { %>
          <%= roundToDecimals(results.sum.area, 3) %>
        <% } %>
        <span>km<sup>2</sup></span></p>

        <table class="table polygon-stats">
          <tr>
            <th><%= polyglot.t("analysis.habitat") %></th>
            <th dir="<%= this.textDirection %>"><%= polyglot.t("analysis.area_ha") %></th>
            <th dir="<%= this.textDirection %>"><%= polyglot.t("analysis.area_percentage") %></th>
            <th dir="<%= this.textDirection %>" title="Carbon Stock"><%= polyglot.t("analysis.c_stock") %></th>
          </tr>
          <% _.each(results.habitats, function(attributes, key) { %>
            <tr>
              <td dir="<%= this.textDirection %>" ><%= key %></td>
              <td><%= roundToDecimals(attributes.area_km2, 2) %></td>
              <td><%= roundToDecimals(attributes.area_km2, 2) %></td>
              <td><%= Math.ceil(attributes.carbon).toLocaleString() %></td>
            </tr>
          <% }) %>
        </table>
        <p class="polygon-stats__disclaimer"><%= polyglot.t("analysis.disclaimer") %></p>
      <% } %>
    <% } %>

  <% } %>
""")

# Potentially to bring back at a later date
# <div class="footer">
#   <a href="/tool#/analysis/<%= area.get('id') %>" dir="<%= this.textDirection %>" class="btn btn-primary share"><%= polyglot.t("analysis.share_your_work") %></a>
#   <a dir="<%= this.textDirection %>" href="<%= window.pica.config.magpieUrl %>/areas_of_interest/<%= area.get('id') %>.csv" class="btn btn-primary export"><%= polyglot.t("analysis.export_your_report") %></a>
# </div>