/*
 * Developer options
 */

// Run the setup for your mod.
var modDev = (function() {

	var _win = require( "nw.gui" ).Window.get();

	// Creates an entry in the Modules tab and creates a page based on the name you give it
	// If your module doesn't need a UI and only adds commands, you don't have to do this.
	var _myTab = apiAddTab("Developer");

	// Fills out the page via bootstrap. As you can see, ES6 Template Strings are allowed. You have a lot of freedom here.
	$(_myTab).html(`
		<div class="row-fluid">
			<div class="col-sm-12">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h2 class="panel-title">Developer Options</h2>
					</div>
					<ul class="list-group">
						<li class="list-group-item">
							<button class="btn btn-info btn-xs" id="modDevConsoleButton">
								Chrome Developer Console
							</button>
						</li>
						<li class="list-group-item">
							<strong>COMMANDS: </strong>
							&nbsp;
							<button class="btn btn-danger btn-xs" id="modDevCommandsButton">
								<span class="glyphicon glyphicon-off"></span>
							</button>
							&nbsp;
							<span id="modDevCommandStatus">
								ON
							</span>
						</li>
						<li class="list-group-item">
							<strong>RAW IRC MESSAGES: </strong>
							&nbsp;
							<button class="btn btn-danger btn-xs" id="modDevIRCButton">
								<span class="glyphicon glyphicon-off"></span>
							</button>
							&nbsp;
							<span id="modDevIrcStatus">
								OFF
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>`);

	$("#modDevCommandsButton").click(function() {
		if (!commandsOn) {
			commandsOn = true;
			$("#modDevCommandStatus").html("ON");
		} else {
			commandsOn = false;
			$("#modDevCommandStatus").html("OFF");
		}
	} );

	$("#modDevIRCButton").click(function() {
		if (!rawIrcOn) {
			rawIrcOn = true;
			$("#modDevIrcStatus").html("ON");
		} else {
			rawIrcOn = false;
			$("#modDevIrcStatus").html("OFF");
		}
	} );

	$("#modDevConsoleButton").click(function() {
		_win.showDevTools()
	} );

} )();
