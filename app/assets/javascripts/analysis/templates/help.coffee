window.JST ||= {}

window.JST['help'] = _.template("""

<section class="help" id="help_top">

<ul>
<li><a href="#chapter1">Using the tool</a></li>
<li><a href="#chapter2">About the data</a></li>
<li><a href="#chapter3">How the calculations are made</a></li>
</ul>

<p>The Blue Carbon Assessment Tool enables users to explore the blue carbon stocks of Abu Dhabi by defining areas of interest</p>

<h3><a name="chapter1" href="#help_top" title="Back to top">Using the tool</a></h3>
<p>On launch, the tool shows a view of Abu Dhabi and all the blue carbon habitats including an ‘other’ classification. Users can zoom in to features using the standard zoom interface on the top left hand side of the map. </p>

<p>Habitat layers can be ‘toggled’ between visible and not visible via the layers icon on the top right hand side of the map. This feature also allows a user to switch between a satellite view and a map view which includes place names and roads. </p>

<p class="title">Defining an Area of Interest (AOI) </p>
<p>Active AOI’s are created by clicking on the map to define a polygon shape. Activate drawing by clicking on the green “draw a polygon” button. Move the cursor onto the map and it will change to a cross-hair with instructions to “click to start drawing shape”. Each click of the mouse will mark a corner point of your AOI. Clicking on the start point completes the polygon and returns data for your AOI.</p>

<p>Points can be undone by clicking the “undo” icon to the right of the “draw a polygon” button. </p>

<p class="title">Multiple Polygons and Areas</p>
<p>It is possible to draw multiple polygons or AOI’s by clicking the “Draw another polygon” button. The results panel will show the sum of all the polygons. These collections of polygons and the resulting information are known as “areas”. It is possible to create up to three areas for comparison purposes. </p>

<p>Along the top of the results panel you will see a tab labeled “Area #1” with a “plus” icon next to it. Click the plus icon and you will have a fresh area to start working on. You can jump back to your original area simply by clicking on the “Area #1” tab. All the data in the tabs will be kept for the duration of your session. </p>

<p class="title">Deleting an Area of Interest</p>
<p>Areas can be deleted by clicking the “delete this area” button on the top right hand side of the results panel.</p>

<p class="title">Exporting a report</p>
<p>It is possible to export a report of your results per area, in a .CSV file format by clicking on the green “Export your Report” button underneath the habitat breakdown table.</p> 

<p class="title">Sharing your work</p>
<p>You can share the outputs of your work with other users by selecting the “Share Your Work’’ button and then copying the link. When other users open this link, they will be able to view your AOI and the resulting carbon outputs.</p>

<h3><a name="chapter2" href="#help_top" title="Back to top">About the Data</a></h3>
<p>Baseline layers representing marine habitats (mangrove, salt marsh, seagrass and algal mats) around coastal Abu Dhabi were provided by the Abu Dhabi Environment Agency. They have been developed through a combination of comprehensive field based sampling, supported by Landsat and RapidEye satellite imagery analysis. Habitat layers have been enhanced further through input received from stakeholder consultation during the Abu Dhabi Local, National and Regional Biodiversity Assessment undertaken in 2011-13.</p>

<p>The habitat layers are continually updated to reflect the ongoing dynamics of Abu Dhabi’s coastal habitats.</p>


<h3><a name="chapter3" href="#help_top" title="Back to top">How the Calculations are made</a></h3>
<p class="title">Carbon stocks are based on the above- and below ground carbon stored within each habitat type, estimated from field-based measurements.</p>
 
<p>Further habitat parameters such as density, age and status (natural or planted) further help to improve the accuracy of these estimates. The quality of these estimates will further improve with time, as more accurate datasets become available.</p>
 
<p>Please note that although the outputs derived from the Blue Carbon Assessment tool are based on the best possible scientific information currently available, there will inevitably be margins of error within the outputs. These are due to the fact that assumptions are made for much of the area, based a limited amount of data collected in the field. Any information derived from the tool should therefore be treated with caution.</p>
 
<p>The carbon stock outputs provided include:</p>
 
<p><b><i>Total Carbon Stock</i></b>: Provides an estimate of the tonnes of carbon within the Area(s) of Interest of all blue carbon habitats combined.</p>
 
<p><b><i>Total Area</i></b>: Denotes the total area covered within the Area(s) of Interest in square kilometres.</p>
 
<p><b><i>The Equivalent Per Capita CO2 Emissions</i></b>: Provides an estimate of the average CO2 output of a UAE citizen. This can be expressed either in the number of days or years, depending on the size of the output. The CO2 output used here is 20.87 tons, as estimated for 2011 by the European Commission/Joint Research Centre <sup>1</sup>.</p>
 
<p><b><i>Blue Carbon Habitats in This Area</i></b>: Provides a breakdown of the contribution of each habitat to i) the total area (km2), ii) the % of habitat as part of the total coverage within Abu Dhabi, iii) the carbon stock (tonnes) within the AOI.</p>

<p><i><sup>1</sup> European Commission, Joint Research Centre (JRC)/PBL Netherlands Environmental Assessment Agency. Emission Database for Global Atmospheric Research (EDGAR), release version 4.2. http://edgar.jrc.ec.europe.eu, 2011. Accessed 28 April, 2013</i></p>



</section>


""")
