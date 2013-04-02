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

  <table class="table total-stats">
    <thead>
      <tr>
        <th>Total Carbon Sequ.</th>
        <th>Total Area</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>11600 <span>T</span></td>
        <td>11600 <span>KM2</span></td>
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
        <td>Carbon Seq.</td>
      </tr>
      <tr>
        <td>Mangrove</td>
        <td>200 KM</td>
        <td>200 T</td>
      </tr>
      <tr>
        <td>Mangrove</td>
        <td>200 KM</td>
        <td>200 T</td>
      </tr>
      <tr>
        <td>Mangrove</td>
        <td>200 KM</td>
        <td>200 T</td>
      </tr>
      <tr>
        <td>Mangrove</td>
        <td>200 KM</td>
        <td>200 T</td>
      </tr>
    </tbody>
  </table>


  <% if (area.polygons.length > 0) { %>
    <a href="<%= window.pica.config.magpieUrl %>/areas_of_interest/<%= area.get('id') %>.csv" class="btn btn-primary export">Export your report</a>
  <% } %>
""")
