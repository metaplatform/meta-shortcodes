/*
 * META Platform library
 * Shortcode parser
 *
 * @author META Platform <www.meta-platform.com>
 * @license See LICENSE file distributed with this source code
 */

var Tokenizer = require("./tokenizer.js");

/**
 * Parser constructor
 */
var ShortcodeParser = function(opts){

	if(!opts) opts = {};

	this.shortcodes = {};

	this.options = {
		openPattern: opts.openPattern || '\\[',
		closePattern: opts.closePattern || '\\]'
	};

};

/**
 * Add shortcode
 *
 * @param string shortcode
 * @param function handler
 */
ShortcodeParser.prototype.add = function(shortcode, handler){

	this.shortcodes[shortcode] = handler;

};

/**
 * Parse string and process shortcodes
 *
 * @param string input
 */
ShortcodeParser.prototype.parse = function(input){

	var self = this;

	var tokenizer = Tokenizer(input);

	tokenizer.tokenize(ShortcodeParser.parsers.tagOpen, this);

	return tokenizer.getOutput();

};

/**
 * Tokenizers
 */
ShortcodeParser.parsers = {};

ShortcodeParser.parsers.error = function(t, ctx){

	if(ctx && ctx.name){

		if(ctx.name)
			t.toBuffer(this.options.openPattern.replace(/\\/g, "") + "!" + ctx.name);
		
		if(ctx.content !== "")
			t.toBuffer("!" + this.options.closePattern.replace(/\\/g, "") + ctx.content + this.options.openPattern.replace(/\\/g, "") + "/!" + ctx.name + "!" + this.options.closePattern.replace(/\\/g, ""));
		else
			t.toBuffer("!/" + this.options.closePattern.replace(/\\/g, ""));

	} else {

		t.toBuffer(this.options.openPattern.replace(/\\/g, "") + "^!" + this.options.closePattern.replace(/\\/g, ""));

	}

	t.closeContext();

	if(ctx.parentParser){
		
		return ctx.parentParser;

	} else if(ctx.restoreOnError){

		t.flushBuffer();
		return ShortcodeParser.parsers.tagOpen;

	} else {

		t.flushBuffer();
		t.flushRest();

	}

	return false;

};

ShortcodeParser.parsers.tagOpen = function(t){

	if(!t.match(this.options.openPattern + "(?!\\/)", true)){
		t.flushRest();
		return false;
	}

	t.flushBuffer();

	t.openContext({
		name: null,
		args: [],
		content: ''
	});

	return ShortcodeParser.parsers.tagName;

};

ShortcodeParser.parsers.tagName = function(t, ctx){

	if(!t.match("[a-zA-Z0-9\\-_]+", false, true))
		return ShortcodeParser.parsers.error;

	ctx.name = t.clearBuffer().toLowerCase();

	return ShortcodeParser.parsers.tagBody;

};

ShortcodeParser.parsers.tagBody = function(t, ctx){

	t.clearBuffer();

	if(t.isEnd())
		return ShortcodeParser.parsers.error;

	//Attributes?
	if(t.match(".*?(?=(\\/)?" + this.options.closePattern + "|$)", false, false, false)){

		t.skip(1);
		t.clearBuffer();
		return ShortcodeParser.parsers.params;
		
	//Self closing?	
	} else if(t.match("^\\/" + this.options.closePattern, true)){
		
		return ShortcodeParser.parsers.process;

	//Pair closing
	} else if(t.match("^" + this.options.closePattern, true)){

		return ShortcodeParser.parsers.content;

	}

	return ShortcodeParser.parsers.error;

};

ShortcodeParser.parsers.params = function(t, ctx){

	var addParam = function(){

		if(ctx.argKey)
			ctx.args[ctx.argKey] = t.clearBuffer();
		else if(t.getBuffer().trim() !== "")
			ctx.args.push(t.clearBuffer());

		delete ctx.argKey;

	};

	if(!t.match("^\\/" + this.options.closePattern, false, false, false) && !t.match("^" + this.options.closePattern, false, false, false) && !t.isEnd()){

		//Escape
		if(t.match("^\\\\")){
			
			t.next(true, true);

		//Quotes?
		} else if(t.match("^(\"|')", false, true)){
			
			ctx.quoteType = t.clearBuffer();

			return ShortcodeParser.parsers.quote;

		//Space?
		} else if(t.match("^ ")){

			addParam();

		//key?
		} else if(t.match("^=")){

			if(ctx.argKey)
				t.toBuffer("=");
			else
				ctx.argKey = t.clearBuffer();

		} else {

			t.next(true, true);

		}

		return ShortcodeParser.parsers.params;
		
	}

	addParam();

	return ShortcodeParser.parsers.tagBody;

};

ShortcodeParser.parsers.quote = function(t, ctx){

	while(!t.match("^" + ctx.quoteType) && !t.isEnd()){

		t.match("^\\\\");
		t.next(true, true);

	}

	delete ctx.quoteType;

	return ShortcodeParser.parsers.params;

};

ShortcodeParser.parsers.content = function(t, ctx){

	//Subtag?
	if(t.match(this.options.openPattern, true)){

		//Close
		if(t.next(false, false) === "/"){

			t.skip(1);
			ctx.content+= t.getBuffer();

			return ShortcodeParser.parsers.close;

		//Open
		} else {

			ctx.content+= t.clearBuffer();

			t.openContext({
				name: null,
				args: [],
				content: '',
				parentParser: ShortcodeParser.parsers.content
			});


			return ShortcodeParser.parsers.tagName;

		}

		return ShortcodeParser.parsers.content;

	}

	return ShortcodeParser.parsers.error;

};

ShortcodeParser.parsers.close = function(t, ctx){

	t.clearBuffer();

	if(!t.match(this.options.closePattern, true))
		return ShortcodeParser.parsers.error;

	if(t.getBuffer() != ctx.name)
		return ShortcodeParser.parsers.error;

	return ShortcodeParser.parsers.process;

};

ShortcodeParser.parsers.process = function(t, ctx){

	//if not shortchode
	if(!ctx || !ctx.name || ctx.name === "")
		return false;

	t.clearBuffer();

	//if shortcode not registered
	if(this.shortcodes[ctx.name]){
		t.toBuffer(this.shortcodes[ctx.name].call(ctx, ctx.args, ctx.content));
	} else {
		ctx.restoreOnError = true;
		return ShortcodeParser.parsers.error;
	}

	t.closeContext();

	if(ctx.parentParser){
		
		return ctx.parentParser;

	} else {

		t.flushBuffer();
		return ShortcodeParser.parsers.tagOpen;

	}

};

//Export
module.exports = function(opts){
	return new ShortcodeParser(opts);
};