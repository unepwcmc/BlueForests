window.JST ||= {}

window.JST['help'] = _.template("""

<section class="help" id="help_top">

<p>The Blue Carbon Assessment Tool enables users to explore the blue carbon stocks of Abu Dhabi by defining areas of interest</p>


<h3>Index</h3>
<ul>
<li><a href="#chapter1">Using the tool</a></li>
<li><a href="#chapter2">About the data</a></li>
<li><a href="#chapter3">How the calculations are made</a></li>
</ul>


<h3><a name="chapter1" href="#help_top" title="Back to top">Using the tool</a></h3>
<p>On launch, the tool shows a view of Abu Dhabi and all the blue carbon habitats including an ‘other’ classification. Users can zoom in to features using the standard zoom interface on the top left hand side of the map. </p>

<p>Habitat layers can be ‘toggled’ between visible and not visible via the layers icon on the top right hand side of the map. This feature also allows a user to switch between a satellite view and a map view which includes place names and roads. </p>

<h4>Defining an Area of Interest (AOI) </h4>
<p>AOI’s are created by clicking on the map to define a polygon shape. ivate drawing by clicking on the green “draw a polygon” button. Move the cursor onto the map and it will change to a cross-hair with instructions to “click to start drawing shape”. Each click of the mouse will mark a corner point of your AOI. Clicking on the start point completes the polygon and returns data for your AOI.</p>

<p>Points can be undone by clicking the “undo” icon to the right of the “draw a polygon” button. </p>

<h4>Multiple Polygons and Areas</h4>
<p>It is possible to draw multiple polygons or AOI’s by clicking the “Draw another polygon” button. The results panel will show the sum of all theygons. T drawnh se collections of polygons and the resulting information are known as “areas”. It is possible to create up to three areas for comparison purposes. </p>
<p>Along the top of the results panel you will see a tab labeled “Area #1” with a “plus” icon next to it. Click the plus icon and you will have a fresh area to start working on. You can jump back to your original area simply by clicking on the “Area #1” tab. All the data in the tabs will be kept for the duration of your session. </p>

<h4>Deleting an Area of Interest</h4>
<p>To delete an area of interest simply click on the polygon and a “delete polygon?” button will appear. </p>

<h4>Deleting Areas</h4>
<p>Areas can be deleted by clicking the “delete this area” button on the top right hand side of the results panel.</p>

<h4>Exporting a report</h4>
<p>It is possible to export a report of your results per area, in a CSV format by clicking on the green “Export your Report” button underneath the habitat breakdown table. </p>

<h3><a name="chapter2" href="#help_top" title="Back to top">About the Data</h3>



<h3><a name="chapter3" href="#help_top" title="Back to top">How the Calculations are made</h3>

<h4>Calculating the carbon stocks within an AOI</h4>


<h4>Calculating equivalent per capita CO2 emissions</h4>


</section>


""")
