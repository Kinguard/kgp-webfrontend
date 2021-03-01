
function parseBool(value)
{
	if( value.toLowerCase() == 'false' )
	{
		return false;
	}

	if( value.toLowerCase() == 'true' )
	{
		return true;
	}

	return undefined;
}

function parseType(value)
{
	if( typeof(value) != "string")
	{
		return value;
	}

	var ret = parseBool(value);

	if(typeof(ret) == "boolean")
	{
		return ret;
	}

	ret = parseFloat(value);
	if( ret != NaN)
	{
		return ret;
	}

	// Assume string
	return value;
}


/*
 * Handles simple string, number, boolean  properties
 * with backing store to localStorage
 */
class SimpleProperty
{
	constructor(name, defval, type="boolean")
	{
		this.name = name;
		this.type = type;
		this.value = parseType(localStorage.getItem(this.name));
		if( this.value == null || Number.isNaN(this.value) )
		{
			this.set(defval);
		}
	}

	set(value)
	{
		this.value = value;
		localStorage.setItem(this.name, this.value);
	}

	get()
	{
		return this.value;
	}

}

/*

	Usage,
	<div id="element" class="opmenu">
		<div class="opmenu_content">
		</div>
		<div class="opmenu_togglebar">
			<"element" class="opmenu_grip"></"element">
		</div>
	</div>


	Menu can be positioned top (0), right(1), bottom(2) or left(3)

*/
class Menu
{
	constructor(element)
	{
		this.element = element;
		// Menu pinned or not. True - Pinned
		this.pinned = new SimpleProperty("opmenu_pinned", true);
		// Horizontal or vertical menu. True - horizontal.
		this.orientation = new SimpleProperty("opmenu_orientation", 0, "number");
		this.isopen = this.pinned.get()
		this.isfocused = false;
		this.defered_close = false;

		this.css_orientation = this.orientation.get()?"max-height":"max-width";
		this.max_shift = "200px";

		this.content = this.element.find(".opmenu_content");

		this.position = [
			{
				"css": $('link[id$="_menutop"]'),
				"orientation":"max-height"
			},
			{
				"css": $('link[id$="_menuright"]'),
				"orientation":"max-width"
			},
			{
				"css": $('link[id$="_menubottom"]'),
				"orientation":"max-height"
			},
			{
				"css": $('link[id$="_menuleft"]'),
				"orientation":"max-width"
			}
		];

		this.grip = this.element.find(".opmenu_grip");
		this.togglebar = this.element.find(".opmenu_togglebar");
		this.pin = this.element.find("#opmenu_pinned");
		this.check_horiz = this.element.find("#opmenu_horizontal");

		this.pin.attr("checked", this.pinned.get());
		if( this.pinned.get() )
		{
			this.togglebar.hide();
		}
		else
		{
			this.togglebar.show();
		}


		this.togglebar.on("click", this.toggle.bind(this) );
		this.pin.on("click", this._pinhandle.bind(this));
		this.element.mouseleave( this._handle_leave.bind(this));
		this.element.mouseenter( this._handle_enter.bind(this));

		$('input[type=radio][name=opmenu_orientation]').change( this._handle_orientation.bind(this) );
		$('input[type=radio][name="opmenu_orientation"]').filter('[value="'+this.orientation.get()+'"]').attr('checked', true);

		this.setorientation(this.orientation.get(), true);
		if( this.isopen )
		{
			this.open(true);
		}

	}

	_pinhandle()
	{
		var val = this.pin.prop("checked");
		this.pinned.set( val );
		if( !val )
		{
			this.togglebar.show();
			this.close();
		}
		else
		{
			this.togglebar.hide();
		}
	}

	_handle_leave()
	{
		this.isfocused = false;

		if( this.defered_close )
		{
			this.defered_close = false;
			this.close();
		}
	}


	_handle_enter()
	{
		this.isfocused = true;
	}


	_handle_orientation(el)
	{
			let val = parseInt(el.target.value)
			if( val >=0 && val < 4)
			{
				this.setorientation(val);
			}
			else
			{
				console.err("HandleOrientation: Value out of range");
			}
	}

	_setCSS(orientation)
	{

		if( orientation >= this.position.length)
		{
			console.error("Out of bounds");
			return;
		}
		// Start by disabling all sheets. Wont work otherwise
		for(let i in this.position)
		{
			for(let j=0; j < this.position[i].css.length; j++)
			{
				this.position[i].css[j].disabled=true;
			}

		}
		for(let j=0; j < this.position[orientation].css.length; j++)
		{
			this.position[orientation].css[j].disabled=false;
		}
	}


	setorientation(val, force = false)
	{

		let curo = this.orientation.get();
		if( curo == val && !force )
		{
			// Same orientation, do nothing
			return;
		}

		this._setCSS(val);

		let pix = this.content.css(this.position[curo].orientation);
		this.content[0].style.removeProperty(this.position[curo].orientation);

		if( pix == "none")
		{
			pix= this.isopen?this.max_shift:"0px";
		}
		this.content.css(this.position[val].orientation, pix);

		this.orientation.set(val);
	}

	hide()
	{
		this.element.hide();
	}

	show()
	{
		this.element.show();
	}

	open(force = false)
	{
		if( ! this.isopen || force )
		{
			let curo = this.orientation.get();
			this.content.css(this.position[curo].orientation, this.max_shift);
			this.isopen = true;
		}
	}

	close(force = false)
	{

		if( this.pinned.get() || !this.isopen )
		{
			return;
		}

		if( this.isfocused && !force)
		{
			this.defered_close = true;
			return;
		}

		let curo = this.orientation.get();
		this.content.css(this.position[curo].orientation, "0px");
		this.isopen = false;
	}

	toggle()
	{
		if( this.isopen )
		{
			this.close(true);
		}
		else
		{
			this.open(true);
		}
	}

}
